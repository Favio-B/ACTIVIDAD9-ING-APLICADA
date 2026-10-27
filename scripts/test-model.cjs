const fs=require('node:fs');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const model=require('../model.js');
const results=model.runTests();
// Compare against the committed pre-refactor engine, not a second implementation.
const html=execFileSync('git',['show','6e1c268:index.html'],{encoding:'utf8'});
const source=html.split('<script>')[1].split('function input()')[0];
const context={};vm.createContext(context);vm.runInContext(source+';this.legacy={estimate,decide,archs};',context);
let comparisons=0;
for(let i=0;i<100;i++){
 const x={rpm:1+(i*73)%1000,concurrency:1+(i*173)%2000,cores:1+i%32,ai:i%101,network:1+(i*37)%300};
 for(let j=0;j<3;j++){
  const before=context.legacy.estimate(x,context.legacy.archs[j]),after=model.estimate(x,model.archs[j]);
  for(const key of ['latency','cap','rho','availability','cost'])if(before[key]!==after[key])throw Error(`Engine regression ${i}/${j}/${key}`);
  comparisons++;
 }
 const legacyResults=context.legacy.archs.map(a=>context.legacy.estimate(x,a));
 for(const priority of Object.keys(model.priorities)){
  const l={budget:650,maxLatency:1200,minAvailability:99};
  const a=context.legacy.decide(legacyResults,l,priority).winner?.id||null,b=model.decide(model.archs.map(a=>model.estimate(x,a)),l,priority).winner?.id||null;
  if(a!==b)throw Error(`Decision regression ${i}/${priority}`);
 }
}
const report={timestamp:new Date().toISOString(),command:'npm test',tests:results,legacy:{commit:'6e1c268',vectors:100,architectureComparisons:comparisons,priorityDecisions:400,identical:true}};
fs.writeFileSync('docs/model-tests.json',JSON.stringify(report,null,2)+'\n');
console.log(`${results.filter(r=>r.pass).length}/${results.length} model tests passed; ${comparisons} identical legacy estimates and 400 identical decisions.`);
if(results.some(r=>!r.pass))process.exitCode=1;
