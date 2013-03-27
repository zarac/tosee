# ToSee
Helps you with what to watch next.


## Prerequisites
* [git][]
* [mongoDB][]
* [Node.js][]
* [npm][]


## Install & Run
```
git clone https://github.com/zarac/tosee.git
cd tosee
npm install
pushd static/views; sh symlinkall.sh; popd
npm start
```
_**NOTE**: The `.. sh symlinkall.sh ..` step is only a temporary work-around
for the issue described below._


## Issues
* Seems there's a bug in either dust.js or perhaps express. Template names for
  partials are not resolving paths correctly. I've specified my template
  endings to foo.dust.html, and it works for rendering through javascript, but
  for partials they resolve to foo.dust. This only happens on server side,
  suggesting it's actually a express bug (or even misconfiguration).  Possible
  "solutions" include: use mere .dust endings, create symbolic links for all
  templates from *.dust.html to *.dust, fix bug / misconfiguration.


## Author
Hannes Landstedt a.k.a. zarac


## Source
https://github.com/zarac/tosee.git


## Thanks
* TVRage.com for data
* http://findicons.com/icon/267827/eye
* http://findicons.com/icon/267836/eye_inv
* All those forgotten...


## License
[NULL (No Unnecessary License - License)][NULL]

[dustjs-linkedin]: https://github.com/linkedin/dustjs
[express]: http://expressjs.com
[git]: http://git-scm.com
[jQuery]: http://jquery.com
[mongoDB]: http://www.mongodb.org
[node-mongodb-native]: http://mongodb.github.com/node-mongodb-native
[Node.js]: http://nodejs.org
[npm]: https://npmjs.org
[NULL]: https://github.com/zarac/NULL.git
