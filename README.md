# Voice ID server
This server takes a sound file and transforms it into a wav that is suitable for the [voice id project](https://code.google.com/archive/p/voiceid/). The server response with a json containing information about the different speakers in the sound file, including gender.

## iOS Client
Check out [speaker-gender-detect--ios](https://github.com/doberman/speaker-gender-detect--ios) for a nice iOS client.

## Routes
The server has only two routes

/  - a simple form for uploading of sounds.

/upload - takes a POST with a sound file. See the / for info about param names


## Installation
Keep in mind this has only been tested running Ubuntu 15.10 on the Google Cloud platform. It might of course be possible on other systems, local or otherwise.

If you're on Google Cloud; create a Ubuntu 15.10 image and be aware that the micro instance is too slow to continously process uploads for event one user at the time. The faster/larger instance the better.

Update and install dependencies

    sudo apt-get update
    sudo apt-get install python2.7 python-wxgtk2.8 openjdk-7-jdk gstreamer0.10-plugins-base gstreamer0.10-plugins-good gstreamer0.10-plugins-bad gstreamer0.10-plugins-ugly gstreamer-tools sox mplayer python-setuptools subversion ffmpeg nodejs-legacy npm
    sudo easy_install MplayerCtrl

Redirect the node server at port 3000 to port 80.

    sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000

Install Voice id

    svn checkout http://voiceid.googlecode.com/svn/trunk voiceid
    cd voiceid
    sudo python setup.py install
    cd ..

Add the server ssh key to github

    ssh-keygen -t rsa -b 4096 -C "[username]@[ip]"
    cat ~/.ssh/id_rsa.pub    # add to github deploy keys

Install the project

    git clone git@github.com:doberman/dbrmn-voice-id-server.git voice-id-server
    cd voice-id-server
    npm install

Start the server

    node_modules/forever/bin/forever start app.js

## License

See [LICENSE](https://github.com/doberman/voice-id-server/blob/master/LICENSE).
