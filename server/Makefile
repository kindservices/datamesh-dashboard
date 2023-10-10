run: build
	. ./build.sh && run
build: buildLocally
	. ./build.sh && build
buildLocally: clean
	. ./build.sh && buildLocally
buildInDocker:
	. ./build.sh && buildInDocker
push: build
	. ./build.sh && push
pushOnly: 
	. ./build.sh && push
clean:
	. ./build.sh && clean
installArgo:
	. ./build.sh && installArgo