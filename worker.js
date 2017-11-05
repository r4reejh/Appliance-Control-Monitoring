const {spawn} = require('child_process');
const {datastore} = require('nedb-promise');
const DateDiff = require('date-diff');

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
    console.log('log');
    let switches =await switch_act.find({});
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
           ob[i.switch]=i.total_consumption;
           room2.switches.push(ob);
        }
    }
    console.log('log');
    res.send([room1,room2]);
}

async function toggle(req,res,next){
    let room = parseInt(String(req.body.room));
    let switcha = parseInt(String(req.body.switch));
    let val = -1;
    let status ="";
    if(room==1){
        let doc = await switch_act.findOne({"room":room,"switch":switcha});
        console.log(room1_status[switcha-1])
        if(room1_status[switcha-1]==0){
            val = 1;
            try{
                ard_1.stdin.write('1\n');
                status="active"
            }
            catch(e){
                console.log(e)
            }            
        }
        else{
            val = 0;
            try{
                let now = new Date();
                let prev = new Date(doc.since);
                let Dif = new DateDiff(now,prev);
                let secs = Dif.seconds();
                let updated_consume = ((secs/3600)*doc.power_rating)+doc.total_consumption;
                switch_act.update({"room":room,"switch":switcha},{'$set':{"total_consumption":updated_consume}})
                ard_1.stdin.write('2\n');
                status="inactive"
            }
            catch(e){
                console.log(e)
            }
        }
        room1_status[switcha-1]=val;
    }
    else{
        let doc = await switch_act.findOne({"room":room,"switch":switcha});
        if(room2_status[switcha-1]==0){
            val = 1;
            ard_2.stdin.write(String(switcha+4)+"\n");
            status="active"
        }
        else{
            let now = new Date();
            let prev = new Date(doc.since);
            let Dif = new DateDiff(now,prev);
            let secs = Dif.seconds();
            let updated_consume = ((secs/3600)*doc.power_rating)+doc.total_consumption;
            switch_act.update({"room":room,"switch":switcha},{'$set':{"total_consumption":updated_consume}})
            val = 0;
            ard_2.stdin.write(String(switcha)+"\n");
            status="inactive"
        }
        room2_status[switcha-1]=val;
    }
    switch_act.update({"room":room,"switch":switcha},{'$set':{"status":status,"since":new Date().toUTCString()}})
    res.send("done")
}

async function init(req,res,next){
    let r = [[1],[1,2,3,4]];
    let index = 1;
    for(i of r){
        console.log(i);
        for(j of i){
            switch_act.insert({"room":index,"switch":j,"status":"inactive","since":new Date().toUTCString(),"total_uptime":0,"total_consumption":0,"power_rating":50 })
        }
        index += 1;
    }
    res.send('done');
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
exports.init = init;