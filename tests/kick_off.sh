echo "Starting tests"

node bootstrap.js

node populate.js 

node consume.js &
node consume.js &
node consume.js &
node consume.js &
node consume.js
