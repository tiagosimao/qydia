import * as data from './data.js';
import * as client from './client.js';
import * as ui from './ui.js';
import * as input from './input.js';

function handleMessage(resp){
  data.merge(resp);
}

(function init() {

  data.init();

  client.init(data.get().settings, handleMessage).then(ok=>{
    client.request({"action": "login"});
  }, err=>{
    console.log("Error connecting to server: " + err);
  });

  ui.init(data.get());

  input.init(data.get(),client);

})();
