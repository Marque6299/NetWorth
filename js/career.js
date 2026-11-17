import {applyFinanceAction} from "./finance.js";

export const JOB_MARKET = Object.freeze([
 {id:"service-desk-associate",title:"Service Desk Associate",employer:"Northstar Services",industry:"Technology Services",level:"Entry",weeklyPayMinor:68000,hoursPerWeek:40,requiredEducation:1,requiredExperience:0,requiredSkills:{technical:35,operations:30,networking:30},skillGains:{technical:0.22,operations:0.12,communication:0}},
 {id:"operations-coordinator",title:"Operations Coordinator",employer:"Meridian Operations Group",industry:"Business Services",level:"Associate",weeklyPayMinor:92000,hoursPerWeek:40,requiredEducation:1,requiredExperience:2,requiredSkills:{operations:45,management:35,networking:35},skillGains:{operations:0.24,management:0.12,leadership:0.08}},
 {id:"junior-data-analyst",title:"Junior Data Analyst",employer:"Cobalt Insights",industry:"Analytics",level:"Entry",weeklyPayMinor:108000,hoursPerWeek:40,requiredEducation:2,requiredExperience:0,requiredSkills:{technical:45,research:40,financialLiteracy:35},skillGains:{technical:0.18,research:0.2,financialLiteracy:0.12}},
 {id:"sales-account-executive",title:"Sales Account Executive",employer:"Brightline Commerce",industry:"Commercial",level:"Associate",weeklyPayMinor:105000,hoursPerWeek:40,requiredEducation:1,requiredExperience:2,requiredSkills:{sales:48,negotiation:40,networking:35},skillGains:{sales:0.22,negotiation:0.16,networking:0.1}},
 {id:"business-analyst",title:"Business Analyst",employer:"Asteron Advisory",industry:"Consulting",level:"Professional",weeklyPayMinor:148000,hoursPerWeek:40,requiredEducation:3,requiredExperience:3,requiredSkills:{research:55,technical:50,operations:45,networking:45},skillGains:{research:0.18,technical:0.16,operations:0.12,management:0.08}},
 {id:"project-coordinator",title:"Project Coordinator",employer:"Summit Projects",industry:"Project Services",level:"Professional",weeklyPayMinor:138000,hoursPerWeek:40,requiredEducation:2,requiredExperience:4,requiredSkills:{management:50,operations:48,leadership:40,networking:42},skillGains:{management:0.18,operations:0.12,leadership:0.16,negotiation:0.06}}
]);

export const EDUCATION_PROGRAMS = Object.freeze([
 {id:"business-operations-certificate",title:"Business Operations Certificate",provider:"Networth Learning Institute",award:"Business Operations Certificate",tuitionMinor:45000,durationWeeks:4,studyHoursPerWeek:6,requiredEducation:1,educationLevel:2,prerequisite:null,skillGains:{operations:0.55,management:0.35,financialLiteracy:0.2}},
 {id:"applied-data-analytics-diploma",title:"Applied Data Analytics Diploma",provider:"Networth Learning Institute",award:"Applied Data Analytics Diploma",tuitionMinor:110000,durationWeeks:8,studyHoursPerWeek:8,requiredEducation:2,educationLevel:3,prerequisite:"business-operations-certificate",skillGains:{technical:0.55,research:0.55,financialLiteracy:0.3}},
 {id:"professional-management-diploma",title:"Professional Management Diploma",provider:"Meridian School of Management",award:"Professional Management Diploma",tuitionMinor:95000,durationWeeks:8,studyHoursPerWeek:8,requiredEducation:2,educationLevel:3,prerequisite:"business-operations-certificate",skillGains:{management:0.55,leadership:0.45,negotiation:0.25}}
]);

const clone=value=>typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));
const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,value));
const educationRank=education=>/bachelor|degree/i.test(education)?3:/vocational|professional|specialist|college/i.test(education)?2:1;
const jobById=id=>JOB_MARKET.find(job=>job.id===id);
const courseById=id=>EDUCATION_PROGRAMS.find(course=>course.id===id);

export function createCareerState(character){
 return {educationLevel:educationRank(character.education),credentials:[],activeCourse:null,completedCourses:[],currentJob:null,applications:[],employmentHistory:[],weeksEmployed:0,performance:70,promotions:0};
}

export function validateCareerAction(career,character,finance,action,turn){
 if(!career||!character)return {valid:false,reason:"Create a character before using employment and education."};
 if(action.type==="APPLY_FOR_JOB"){
  const job=jobById(action.jobId);if(!job)return {valid:false,reason:"Choose a valid job listing."};
  const previous=career.applications.find(item=>item.jobId===job.id);
  if(previous&&turn-previous.appliedAtTurn<4)return {valid:false,reason:"You can reapply for this position after four turns."};
  if(previous?.status==="offered")return {valid:false,reason:"You already have an open offer for this position."};
  return {valid:true};
 }
 if(action.type==="ACCEPT_JOB_OFFER"){
  const application=career.applications.find(item=>item.id===action.applicationId);
  if(!application||application.status!=="offered")return {valid:false,reason:"That job offer is no longer available."};
  return {valid:true};
 }
 if(action.type==="RESIGN_FROM_JOB")return career.currentJob?{valid:true}:{valid:false,reason:"You do not currently have an active job."};
 if(action.type==="ENROLL_COURSE"){
  const course=courseById(action.courseId);if(!course)return {valid:false,reason:"Choose a valid education program."};
  if(career.activeCourse)return {valid:false,reason:"Complete or leave your current program before enrolling in another."};
  if(career.completedCourses.includes(course.id))return {valid:false,reason:"You have already completed this program."};
  if(career.educationLevel<course.requiredEducation)return {valid:false,reason:"Your current education level does not meet this program's entry requirement."};
  if(course.prerequisite&&!career.completedCourses.includes(course.prerequisite))return {valid:false,reason:"Complete the required prerequisite program first."};
  const cash=finance?.accounts?.find(item=>item.id==="cash")?.balanceMinor??0;
  if(cash<course.tuitionMinor)return {valid:false,reason:"There is not enough available cash to pay this program's tuition."};
  return {valid:true};
 }
 return {valid:false,reason:`Unknown career action: ${action.type}`};
}

export function validateCareer(career){
 const errors=[];
 if(!career||!Number.isInteger(career.educationLevel)||career.educationLevel<1||career.educationLevel>3||!Array.isArray(career.credentials)||!Array.isArray(career.completedCourses)||!Array.isArray(career.applications)||!Array.isArray(career.employmentHistory)||!Number.isInteger(career.weeksEmployed)||career.weeksEmployed<0||!Number.isFinite(career.performance)||career.performance<0||career.performance>100||!Number.isInteger(career.promotions)||career.promotions<0)errors.push("Career and education data is invalid.");
 if(career?.currentJob&&(!jobById(career.currentJob.jobId)||!Number.isSafeInteger(career.currentJob.weeklyPayMinor)||career.currentJob.weeklyPayMinor<0||!Number.isInteger(career.currentJob.hoursPerWeek)||career.currentJob.hoursPerWeek<1||!Number.isInteger(career.currentJob.level)||career.currentJob.level<1))errors.push("The active employment contract is invalid.");
 if(career?.activeCourse){const course=courseById(career.activeCourse.courseId);if(!course||!Number.isFinite(career.activeCourse.progressWeeks)||career.activeCourse.progressWeeks<0||career.activeCourse.progressWeeks>course.durationWeeks)errors.push("The active education program is invalid.");}
 if(Array.isArray(career?.applications))for(const item of career.applications)if(!jobById(item.jobId)||!["offered","rejected","accepted","closed"].includes(item.status)||!Number.isInteger(item.appliedAtTurn))errors.push("A job application record is invalid.");
 return {valid:errors.length===0,errors};
}

function calculateOfferChance(job,character,career){
 const requirements=Object.entries(job.requiredSkills),skillFit=requirements.reduce((sum,[key,target])=>sum+Math.min(1.25,(character.skills[key]??0)/target),0)/requirements.length;
 const experienceFit=job.requiredExperience===0?1:Math.min(1,character.experienceYears/job.requiredExperience);
 const educationFit=career.educationLevel>=job.requiredEducation?1:0.25;
 return Math.round(clamp(20+skillFit*45+experienceFit*12+educationFit*15+character.reputation*0.08,5,95));
}

export function applyCareerAction(career,character,finance,action,{turn,roll=0,date,sequence}={}){
 const next=clone(career);let event;
 if(action.type==="APPLY_FOR_JOB"){
  const job=jobById(action.jobId),chance=calculateOfferChance(job,character,next),offered=roll<chance;
  const prior=next.applications.find(item=>item.jobId===job.id);
  const application={id:`application-${turn}-${job.id}`,jobId:job.id,status:offered?"offered":"rejected",appliedAtTurn:turn,offerChance:chance,roll};
  if(prior)Object.assign(prior,application);else next.applications.push(application);
  event={type:offered?"JOB_OFFER_RECEIVED":"JOB_APPLICATION_REJECTED",summary:offered?`An offer arrived from ${job.employer} for ${job.title}.`:`${job.employer} declined your application for ${job.title}.`,details:{jobId:job.id,applicationId:application.id,offerChance:chance,roll}};
 }else if(action.type==="ACCEPT_JOB_OFFER"){
  const application=next.applications.find(item=>item.id===action.applicationId),job=jobById(application.jobId);
  if(next.currentJob)next.employmentHistory.push({...clone(next.currentJob),endedAtTurn:turn,endReason:"Accepted another position"});
  next.currentJob={jobId:job.id,title:job.title,employer:job.employer,industry:job.industry,level:1,weeklyPayMinor:job.weeklyPayMinor,hoursPerWeek:job.hoursPerWeek,startedAtTurn:turn,baseTitle:job.title};
  next.weeksEmployed=0;next.performance=70;next.promotions=0;application.status="accepted";
  for(const item of next.applications)if(item.id!==application.id&&item.status==="offered")item.status="closed";
  event={type:"JOB_ACCEPTED",summary:`You joined ${job.employer} as ${job.title}.`,details:{jobId:job.id,weeklyPayMinor:job.weeklyPayMinor,hoursPerWeek:job.hoursPerWeek}};
 }else if(action.type==="RESIGN_FROM_JOB"){
  next.employmentHistory.push({...clone(next.currentJob),endedAtTurn:turn,endReason:"Resigned"});
  const previous=next.currentJob;next.currentJob=null;next.weeksEmployed=0;next.performance=70;next.promotions=0;
  event={type:"JOB_RESIGNED",summary:`You resigned from ${previous.employer}.`,details:{jobId:previous.jobId}};
 }else if(action.type==="ENROLL_COURSE"){
  const course=courseById(action.courseId);
  const updatedFinance=applyFinanceAction(finance,{type:"RECORD_EXPENSE",amountMinor:course.tuitionMinor,description:`Tuition — ${course.title}`,category:"education"},{date,turn,sequence});
  next.activeCourse={courseId:course.id,title:course.title,provider:course.provider,progressWeeks:0,enrolledAtTurn:turn,tuitionMinor:course.tuitionMinor};
  return {career:next,finance:updatedFinance,event:{type:"COURSE_ENROLLED",summary:`You enrolled in ${course.title}.`,details:{courseId:course.id,tuitionMinor:course.tuitionMinor}}};
 }
 return {career:next,finance,event};
}

export function advanceCareer(state){
 const career=state.career;if(!career)return [];
 const events=[],allocation=state.life.timeAllocation;
 if(career.currentJob){
  const job=jobById(career.currentJob.jobId),hours=allocation?.work??0,ratio=Math.min(1,hours/career.currentJob.hoursPerWeek);
  const paid=Math.round(career.currentJob.weeklyPayMinor*ratio);
  if(paid>0){
   state.finance=applyFinanceAction(state.finance,{type:"RECORD_INCOME",amountMinor:paid,description:`Weekly salary — ${career.currentJob.title}`,category:"employment"},{date:state.calendar.currentDate,turn:state.calendar.turn,sequence:`payroll-turn-${state.calendar.turn}`});
   events.push({type:"SALARY_PAID",summary:`Received ${(paid/100).toFixed(2)} Credits in weekly salary.`,details:{jobId:job.id,amountMinor:paid,workHours:hours,contractHours:career.currentJob.hoursPerWeek}});
  }
  const shortfall=Math.max(0,career.currentJob.hoursPerWeek-hours);
  career.performance=clamp(career.performance+(shortfall===0?2:shortfall>=16?-4:-2)+(state.life.character.wellbeing.energy<25?-2:0)+(state.life.character.wellbeing.stress>80?-2:0));
  if(hours>0){career.weeksEmployed++;state.life.character.experienceYears=Number((state.life.character.experienceYears+1/52).toFixed(3));}
  for(const [key,gain] of Object.entries(job.skillGains))if(gain>0)state.life.character.skills[key]=clamp((state.life.character.skills[key]??0)+gain*ratio,0,100);
  if(career.weeksEmployed>0&&career.weeksEmployed%12===0&&career.performance>=70){
   career.promotions++;career.currentJob.level++;career.currentJob.weeklyPayMinor=Math.round(career.currentJob.weeklyPayMinor*1.1);
   events.push({type:"PROMOTION",summary:`Your performance earned a promotion at ${career.currentJob.employer}.`,details:{jobId:job.id,level:career.currentJob.level,newWeeklyPayMinor:career.currentJob.weeklyPayMinor}});
  }
 }
 if(career.activeCourse){
  const course=courseById(career.activeCourse.courseId),studyHours=allocation?.study??0,progress=studyHours/course.studyHoursPerWeek;
  if(progress>0){
   career.activeCourse.progressWeeks=Math.min(course.durationWeeks,Number((career.activeCourse.progressWeeks+progress).toFixed(4)));
   for(const [key,gain] of Object.entries(course.skillGains))state.life.character.skills[key]=clamp((state.life.character.skills[key]??0)+gain*progress,0,100);
   if(career.activeCourse.progressWeeks>=course.durationWeeks){
    career.completedCourses.push(course.id);career.credentials.push(course.award);career.educationLevel=Math.max(career.educationLevel,course.educationLevel);state.life.character.education=course.award;
    events.push({type:"COURSE_COMPLETED",summary:`You completed ${course.title} and earned the ${course.award}.`,details:{courseId:course.id,award:course.award,educationLevel:career.educationLevel}});
    career.activeCourse=null;
   }
  }
 }
 for(const event of events)state.eventLog.push({id:`career-turn-${state.calendar.turn}-${event.type.toLowerCase()}`,turn:state.calendar.turn,date:state.calendar.currentDate,...event});
 return events;
}

export function getJobOfferChance(jobId,character,career){const job=jobById(jobId);return job?calculateOfferChance(job,character,career):0;}
export function getJob(jobId){return jobById(jobId);}
export function getCourse(courseId){return courseById(courseId);}
