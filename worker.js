const {spawn} = require('child_process');
const {datastore} = require('nedb-promise');

const ard_1 = spawn("python",['/home/pi/Documents/CSI_final/pro_one.py']);
const ard_2 = spawn("python",['/home/pi/Documents/CSI_final/pro_two.py']);


const room1_status =[0]
const room2_status =[0,0,0,0]

switch_act = new datastore({ filename: '/home/pi/Documents/CSI_final/data/switch_act.db', autoload: true });

async function rooms(req,res,next) {
    let switches =await switch_act.find({});
    let ib = [];
    let room1 = {room:"1",switches:[]};
    let room2 = {room:"2",switches:[]};
    for(i of switches){
        if(i.room=="1"){
            var ob={};
            ob[i.switch]=i.status;
            room1.switches.push(ob);
        }
        else{
            var ob={};
            ob[i.switch]=i.status;
            room2.switches.push(ob);
        }
    }
    res.send([room1,room2]);
}

async function consumption(req,res,next){
    let switches =await switch_act.find();
    let ib = [];
    let room1 = {switches:[]};
    let room2 = {switches:[]};
    for(i of switches){
        if(i.room=="1"){
           var ob={};
           ob[i.switch]=i.total_consumption;
           room1.switches.push(ob);
        }
        else{
           var ob={};
           ob[i.switch]=i.status;
           room2.switches.push(ob);
        }
    }
    res.send([room1,room2]);
}

async function toggle(req,res,next){
    let room = req.body.room;
    let switcha = parseInt(String(req.body.switch));
    let val = -1;
    if(room==1){
        console.log(room1_status[switcha-1])
        if(room1_status[switcha-1]==0){
            val = 1;
            console.log("walal")
            try{
                ard_1.stdin.write('1\n');
            }
            catch(e){
                console.log(e)
            }            
        }
        else{
            val = 0;
            try{
                ard_1.stdin.write('2\n');
            }
            catch(e){
                console.log(e)
            }
        }
        room1_status[switcha-1]=val;
    }
    else{
        if(room2_status[switcha-1]==0){
            val = 1;
            ard_2.stdin.write(String(switcha+4)+"\n");
        }
        else{
            val = 0;
            ard_2.stdin.write(String(switcha)+"\n");
        }
        room2_status[switcha-1]=val;
    }
    res.send("done")
}

async function init(){
    let r = [[1],[1,2,3,4]];
    let index = 1;
    for(i of r){
        console.log(i);
        for(j of i){
            switch_act.insert({"room":index,"switch":j,"status":"inactive","since":new Date().getUTCDate,"total_uptime":0,"total_consumption":0})
        }
        index += 1;
    }
}

async function initdb(){
    let switches =await switch_act.find();
    for(i of switches){
        if(i.room==1){
            room1_status[i.switch-1]=0
        }
        else{
            room2_status[i.switch-1]=0
        }
    }
    console.log(room1_status);
}


//init();
initdb();
exports.rooms = rooms;
exports.consumption = consumption;
exports.toggle = toggle;