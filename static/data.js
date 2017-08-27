const data = {
  "selection": {},
  "settings": undefined,
  "world": undefined,
  "map": undefined,
  "me": {
    pos: [0,0]
  }
}

export function init() {
  initSettings();
}

export function merge(input) {
  data.gameId=input.gameId;
  mergeWorld(input.world);
  mergeMap(input.map);
  mergeMe(input.me);
}

export function get() {
  return data;
}

function mergeWorld(got) {
  data.world=got;
}

function mergeMap(got) {
  if(!data.map) {
    data.map=got;
  } else {
    for (let x in got) {
      for (let y in got[x]) {
        if(!data.map[x]){
          data.map[x]=got[x];
        } else {
          data.map[x][y]=got[x][y];
        }
      }
    }
  }
}

function mergeMe(got) {
  Object.assign(data.me,got);
}

function initSettings(){
  let settings = loadSettings();
  if(!settings) {
    settings = {};
  }
  settings.scale=settings.scale?settings.scale:50;
  settings.drawdistance=settings.drawdistance?settings.drawdistance:50;
  settings.serverAddress=settings.serverAddress?settings.serverAddress:"ws://localhost:8080/client";
  data.settings = settings;
  saveSettings(settings);
}

function loadSettings(settings) {
  let got = localStorage.getItem("settings");
  if(got){
    return JSON.parse(got);
  }
}

function saveSettings(settings) {
  localStorage.setItem("settings",JSON.stringify(settings));
}
