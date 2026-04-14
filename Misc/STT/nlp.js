;(function(global) {
  'use strict';

  const FILLERS = new Set([
    'um','umm','ums','umms','uh','uhh','uhs','er','err','errs','ah','ahh','ahs',
    'hmm','hm','huh','eh','mhm','erm','erms','uhm','umhm','uhuh','mhmm',
    'like','you know','i mean','sort of','kind of','basically','literally',
    'actually','honestly','essentially','fundamentally','obviously','clearly',
    'so','well','okay','ok','right','alright','sure','anyway','anyways',
    'anyhow','whatever','regardless','nevertheless','nonetheless','notwithstanding',
    'i guess','i think','i feel like','i suppose','i believe','i reckon',
    'just','simply','merely','totally','absolutely','definitely','certainly',
    'surely','apparently','seemingly','supposedly','allegedly','presumably',
    'going forward','moving forward','at this point in time','at the end of the day',
    'when all is said and done','to be honest','to be fair','to be clear',
    'truth be told','long story short','the thing is','the fact is',
    'i mean like','as i was saying','as i said','like i said',
    'for what its worth','so to speak','does that make sense',
    'you know what i mean','you know what im saying',
    'and stuff','and things','and everything','or whatever','or something',
    'kind of like','sort of like','more or less','give or take',
    'first and foremost','last but not least',
    'needless to say','it goes without saying','as a matter of fact',
  ]);

  const STOP_WORDS = new Set([
    'a','an','the','and','or','but','if','in','on','at','to','for','of','with',
    'by','from','up','about','into','through','during','before','after','above',
    'below','between','each','few','more','most','other','some','such','no',
    'not','only','own','same','so','than','too','very','can','will','just',
    'don','should','now','is','are','was','were','be','been','being','have',
    'has','had','do','does','did','would','could','might','must','shall','may',
    'i','me','my','we','our','you','your','he','him','his','she','her','it',
    'its','they','them','their','what','which','who','this','that','these',
    'those','there','here','when','where','how','all','both','either','neither',
    'nor','yet','while','although','though','because','since','unless','until',
    'even','also','then','thus','hence','therefore','however','moreover',
    'furthermore','meanwhile','otherwise','instead','rather','quite','perhaps',
    'maybe','already','still','again','once','twice','always','never','often',
    'usually','sometimes','rarely','ever','soon','later','early','recently',
    'really','fairly','pretty','mostly','mainly','largely','generally','typically',
    'normally','back','away','down','off','out','over','under','around','among',
    'amid','across','along','behind','beside','beyond','near','past','via',
    'let','get','got','thing','things','way','ways','lot','lots','bit',
    'little','piece','part','point','place','time','times','year','years',
  ]);

  const ACTION_VERB_STEMS = new Map([
    ['need',1.0],['needs',1.0],['needed',0.9],['needing',0.9],
    ['must',1.0],['should',0.95],['shall',0.9],['ought',0.9],
    ['schedule',0.95],['schedules',0.95],['scheduled',0.9],['scheduling',0.9],
    ['call',0.85],['calls',0.85],['called',0.8],['calling',0.85],
    ['email',0.9],['emails',0.9],['emailed',0.85],['emailing',0.9],
    ['send',0.9],['sends',0.9],['sent',0.85],['sending',0.9],
    ['write',0.85],['writes',0.85],['wrote',0.8],['writing',0.85],
    ['build',0.9],['builds',0.9],['built',0.85],['building',0.9],
    ['create',0.9],['creates',0.9],['created',0.85],['creating',0.9],
    ['fix',0.95],['fixes',0.95],['fixed',0.9],['fixing',0.95],
    ['update',0.9],['updates',0.9],['updated',0.85],['updating',0.9],
    ['review',0.9],['reviews',0.9],['reviewed',0.85],['reviewing',0.9],
    ['check',0.85],['checks',0.85],['checked',0.8],['checking',0.85],
    ['finish',0.9],['finishes',0.9],['finished',0.85],['finishing',0.9],
    ['complete',0.9],['completes',0.9],['completed',0.85],['completing',0.9],
    ['start',0.85],['starts',0.85],['started',0.8],['starting',0.85],
    ['launch',0.9],['launches',0.9],['launched',0.85],['launching',0.9],
    ['submit',0.9],['submits',0.9],['submitted',0.85],['submitting',0.9],
    ['research',0.85],['prepare',0.9],['prepares',0.9],['prepared',0.85],
    ['discuss',0.85],['discusses',0.85],['discussed',0.8],['discussing',0.85],
    ['meet',0.85],['meets',0.85],['met',0.8],['meeting',0.85],
    ['contact',0.85],['contacts',0.85],['contacted',0.8],['contacting',0.85],
    ['remind',0.9],['reminds',0.9],['reminded',0.85],['reminding',0.9],
    ['implement',0.95],['implements',0.95],['implemented',0.9],['implementing',0.95],
    ['deploy',0.95],['deploys',0.95],['deployed',0.9],['deploying',0.95],
    ['test',0.85],['tests',0.85],['tested',0.8],['testing',0.85],
    ['buy',0.8],['buys',0.8],['buying',0.8],['purchase',0.85],['purchasing',0.85],
    ['ask',0.8],['asks',0.8],['asked',0.75],['asking',0.8],
    ['tell',0.8],['tells',0.8],['told',0.75],['telling',0.8],
    ['confirm',0.9],['confirms',0.9],['confirmed',0.85],['confirming',0.9],
    ['cancel',0.9],['cancels',0.9],['cancelled',0.85],['cancelling',0.9],
    ['move',0.8],['moves',0.8],['moved',0.75],['moving',0.8],
    ['order',0.85],['orders',0.85],['ordered',0.8],['ordering',0.85],
    ['arrange',0.85],['arranges',0.85],['arranged',0.8],['arranging',0.85],
    ['book',0.85],['books',0.85],['booked',0.8],['booking',0.85],
    ['assign',0.9],['assigns',0.9],['assigned',0.85],['assigning',0.9],
    ['delegate',0.9],['delegates',0.9],['delegated',0.85],['delegating',0.9],
    ['escalate',0.9],['escalates',0.9],['escalated',0.85],['escalating',0.9],
    ['prioritise',0.9],['prioritize',0.9],['prioritises',0.9],['prioritizes',0.9],
    ['followup',0.95],['handle',0.85],['handles',0.85],['handled',0.8],
    ['manage',0.85],['manages',0.85],['managed',0.8],['managing',0.85],
    ['coordinate',0.85],['coordinates',0.85],['coordinated',0.8],['coordinating',0.85],
    ['resolve',0.9],['resolves',0.9],['resolved',0.85],['resolving',0.9],
    ['address',0.85],['addresses',0.85],['addressed',0.8],['addressing',0.85],
    ['investigate',0.85],['investigates',0.85],['investigating',0.85],
    ['analyse',0.85],['analyze',0.85],['analyzes',0.85],['analyzing',0.85],
    ['evaluate',0.85],['evaluates',0.85],['evaluated',0.8],['evaluating',0.85],
    ['document',0.8],['documents',0.8],['documented',0.75],['documenting',0.8],
    ['track',0.85],['tracks',0.85],['tracked',0.8],['tracking',0.85],
    ['monitor',0.85],['monitors',0.85],['monitored',0.8],['monitoring',0.85],
    ['approve',0.9],['approves',0.9],['approved',0.85],['approving',0.9],
    ['reject',0.85],['rejects',0.85],['rejected',0.8],['rejecting',0.85],
    ['migrate',0.9],['migrates',0.9],['migrated',0.85],['migrating',0.9],
    ['refactor',0.9],['refactors',0.9],['refactored',0.85],['refactoring',0.9],
    ['redesign',0.9],['redesigns',0.9],['redesigned',0.85],['redesigning',0.9],
    ['optimise',0.9],['optimize',0.9],['optimizes',0.9],['optimising',0.9],
    ['upgrade',0.9],['upgrades',0.9],['upgraded',0.85],['upgrading',0.9],
    ['integrate',0.9],['integrates',0.9],['integrated',0.85],['integrating',0.9],
    ['configure',0.9],['configures',0.9],['configured',0.85],['configuring',0.9],
    ['install',0.85],['installs',0.85],['installed',0.8],['installing',0.85],
    ['initialise',0.85],['initialize',0.85],['set up',0.85],
    ['reach out',0.85],['circle back',0.8],['loop in',0.85],
    ['sign off',0.9],['sign-off',0.9],['get back',0.8],
    ['put together',0.85],['follow through',0.9],['wrap up',0.85],
    ['close out',0.85],['hand off',0.85],['hand-off',0.85],
    ['run through',0.8],['walk through',0.8],['talk through',0.8],
  ]);

  const NUMBER_WORDS = new Map([
    ['zero',0],['one',1],['two',2],['three',3],['four',4],['five',5],
    ['six',6],['seven',7],['eight',8],['nine',9],['ten',10],
    ['eleven',11],['twelve',12],['thirteen',13],['fourteen',14],['fifteen',15],
    ['sixteen',16],['seventeen',17],['eighteen',18],['nineteen',19],
    ['twenty',20],['thirty',30],['forty',40],['fifty',50],
    ['sixty',60],['seventy',70],['eighty',80],['ninety',90],
    ['hundred',100],['thousand',1000],['million',1000000],
    ['billion',1000000000],['trillion',1000000000000],
    ['first',1],['second',2],['third',3],['fourth',4],['fifth',5],
    ['sixth',6],['seventh',7],['eighth',8],['ninth',9],['tenth',10],
    ['eleventh',11],['twelfth',12],['double',2],['triple',3],['quadruple',4],
    ['half',0.5],['quarter',0.25],['dozen',12],['score',20],
  ]);

  const CONTRACTIONS = new Map([
    ["im",'i am'],["ive",'i have'],["ill",'i will'],["id",'i would'],
    ["youre",'you are'],["youve",'you have'],["youll",'you will'],["youd",'you would'],
    ["hes",'he is'],["hed",'he would'],["hell",'he will'],
    ["shes",'she is'],["shed",'she would'],["shell",'she will'],
    ["its",'it is'],["itd",'it would'],["itll",'it will'],
    ["were",'we are'],["weve",'we have'],["well",'we will'],["wed",'we would'],
    ["theyre",'they are'],["theyve",'they have'],["theyll",'they will'],
    ["thats",'that is'],["thatd",'that would'],["thatll",'that will'],
    ["theres",'there is'],["thereve",'there have'],
    ["dont",'do not'],["doesnt",'does not'],["didnt",'did not'],
    ["wont",'will not'],["wouldnt",'would not'],["shouldnt",'should not'],
    ["couldnt",'could not'],["cant",'cannot'],["isnt",'is not'],
    ["arent",'are not'],["wasnt",'was not'],["werent",'were not'],
    ["havent",'have not'],["hasnt",'has not'],["hadnt",'had not'],
    ["lets",'let us'],["whos",'who is'],["whats",'what is'],
    ["wheres",'where is'],["whens",'when is'],["hows",'how is'],
    ["gonna",'going to'],["wanna",'want to'],["gotta",'got to'],
    ["kinda",'kind of'],["sorta",'sort of'],["lotta",'lot of'],
    ["lotsa",'lots of'],["hafta",'have to'],["oughta",'ought to'],
    ["coulda",'could have'],["shoulda",'should have'],["woulda",'would have'],
    ["mighta",'might have'],["musta",'must have'],
    ["dunno",'do not know'],["lemme",'let me'],["gimme",'give me'],
    ["tryna",'trying to'],["finna",'fixing to'],
    ["cmon",'come on'],["yall",'you all'],
    ["dontcha",'do not you'],["didntcha",'did not you'],
    ["wassup",'what is up'],["whassup",'what is up'],
    ["nope",'no'],["yep",'yes'],["yup",'yes'],["nah",'no'],
    ["tbh",'to be honest'],["imo",'in my opinion'],["fyi",'for your information'],
    ["asap",'as soon as possible'],["eta",'estimated time of arrival'],
    ["iirc",'if i recall correctly'],["afaik",'as far as i know'],
  ]);

  const TOPIC_CLUSTERS = new Map([
    ['product', new Set(['product','feature','release','launch','roadmap','sprint','backlog','mvp','prototype','ux','ui','design','user','customer','feedback','bug','issue','ticket','pr','merge','deploy','staging','production','api','endpoint','integration','interface','workflow','requirement','specification','acceptance','criteria','story','epic','milestone'])],
    ['finance', new Set(['budget','cost','revenue','profit','loss','spend','spending','invoice','payment','contract','deal','pricing','rate','fee','salary','raise','bonus','investment','funding','cash','expense','roi','margin','quarter','fiscal','forecast','projection','burn','runway','valuation','equity','dilution','cap','table','arr','mrr','ltv','cac','payback'])],
    ['people', new Set(['team','hire','hiring','onboard','onboarding','interview','candidate','employee','manager','report','hr','performance','review','feedback','culture','diversity','inclusion','remote','office','hybrid','headcount','resource','staffing','organisation','org','structure','role','responsibility','accountability','leadership','management','morale','engagement','turnover','attrition','retention'])],
    ['meeting', new Set(['meeting','call','sync','standup','retro','retrospective','planning','grooming','kickoff','demo','presentation','agenda','minutes','action','followup','attendee','invite','calendar','zoom','teams','slack','schedule','dial','conference','video','chat','huddle','workshop','session','offsite','onsite'])],
    ['technical', new Set(['code','codebase','architecture','database','server','cloud','aws','gcp','azure','kubernetes','docker','microservice','monolith','latency','performance','scalability','security','auth','authentication','authorisation','authorization','encryption','vulnerability','patch','dependency','library','framework','stack','infrastructure','devops','cicd','pipeline','repo','repository','branch','commit','pull','request','lint','test','coverage','debug','log','error','exception','timeout','cache','queue','message','broker'])],
    ['strategy', new Set(['strategy','goal','objective','okr','kpi','metric','target','milestone','initiative','priority','mission','vision','values','competitive','market','opportunity','risk','assumption','hypothesis','experiment','pivot','growth','scale','north star','positioning','differentiation','advantage','moat','barrier','entry','exit','acquisition','partnership','ecosystem','platform','network','effect'])],
    ['marketing', new Set(['marketing','campaign','brand','content','seo','social','email','newsletter','ad','ads','conversion','funnel','acquisition','retention','churn','nps','engagement','reach','impression','ctr','cpc','creative','copy','landing','page','blog','podcast','webinar','event','community','ambassador','influencer','referral','viral','organic','paid','attribution','pixel','tracking','analytics','reporting'])],
    ['legal', new Set(['legal','contract','agreement','nda','ip','patent','trademark','copyright','compliance','gdpr','privacy','data','terms','liability','indemnity','clause','vendor','supplier','procurement','audit','regulation','policy','risk','governance','board','shareholder','equity','vesting','cliff','accelerate','termination','severance','arbitration','jurisdiction','intellectual','property'])],
  ]);

  const HEDGE_PHRASES = new Set([
    'maybe','perhaps','possibly','probably','might','could','i think',
    'i believe','i suppose','i guess','i reckon','not sure','unsure',
    'potentially','conceivably','arguably','seemingly','apparently',
    'in theory','theoretically','hypothetically','roughly',
    'approximately','around','about','somewhere around','give or take',
    'more or less','kind of','sort of','in a way','to some extent',
    'to a degree','somewhat','slightly','a bit','a little','fairly',
    'not entirely','not completely','partially','to some degree',
    'it seems','it appears','it looks like','it sounds like',
    'from what i understand','from what i can tell','as far as i know',
    'if i remember correctly','if i recall','if im not mistaken',
  ]);

  const INTENSITY_WORDS = new Set([
    'critical','crucial','urgent','important','essential','vital','key',
    'major','significant','serious','severe','high','top','priority',
    'asap','immediately','right away','as soon as possible',
    'must','have to','need to','required','mandatory','necessary',
    'blocking','blocked','blocker','showstopper','breaking','broken',
    'deadline','overdue','late','behind','risk','risky','danger',
    'never','always','every','all','none','zero','completely','entirely',
    'absolutely','definitely','certainly','undoubtedly','unquestionably',
  ]);

  const SENTENCE_ABBREVIATIONS = new Set([
    'mr','mrs','ms','dr','prof','sr','jr','vs','etc','approx','dept',
    'est','govt','inc','ltd','corp','co','assoc','univ','jan','feb',
    'mar','apr','jun','jul','aug','sep','oct','nov','dec','mon','tue',
    'wed','thu','fri','sat','sun','no','vol','fig','pp','ed','op',
    'st','ave','blvd','apt','ste','ph','ext','ref','acct','attn','dpt',
    'intl','natl','mgr','dir','vp','ceo','cto','cfo','coo','hr','it',
  ]);

  const MULTI_WORD_EXPRESSIONS = new Map([
    ['follow up','follow-up'],['check in','check-in'],
    ['kick off','kick-off'],['stand up','stand-up'],
    ['sign off','sign-off'],['wrap up','wrap-up'],
    ['sync up','sync-up'],['set up','setup'],
    ['clean up','cleanup'],['roll out','rollout'],
    ['roll-out','rollout'],['hand off','handoff'],
    ['hand-off','handoff'],['cut off','cutoff'],
    ['opt in','opt-in'],['opt out','opt-out'],
    ['log in','login'],['log out','logout'],
    ['break down','breakdown'],['run through','run-through'],
    ['walk through','walkthrough'],['write up','write-up'],
    ['sum up','summary'],['back up','backup'],
    ['burn down','burndown'],['burn-down','burndown'],
    ['build out','build-out'],['ramp up','ramp-up'],
    ['scale up','scale-up'],['scale down','scale-down'],
    ['close out','close-out'],['reach out','reach-out'],
  ]);

  const ENTITY_ORG_SUFFIXES = new Set([
    'inc','ltd','llc','corp','co','company','group','partners',
    'associates','foundation','institute','university','college',
    'school','hospital','clinic','department','division','team',
    'technologies','solutions','systems','services','labs','studio',
    'studios','ventures','capital','holdings','enterprises','industries',
    'consulting','agency','bureau','commission','authority','board',
  ]);

  const ENTITY_PLACE_TERMS = new Set([
    'street','avenue','road','boulevard','lane','drive','way','court',
    'place','square','park','building','tower','center','centre',
    'city','town','village','county','state','country','region',
    'district','zone','area','site','location','office','headquarters',
    'hq','campus','floor','suite','room','warehouse','factory','plant',
  ]);

  const PROPER_NAME_INDICATORS = new Set([
    'ceo','cto','cfo','coo','vp','svp','evp','director','manager',
    'engineer','developer','designer','analyst','consultant','specialist',
    'lead','head','chief','president','founder','co-founder',
    'team','department','division','group','squad','tribe','chapter',
    'officer','associate','partner','principal','advisor','coach',
  ]);

  const TEMPORAL_EXPRESSIONS = [
    [/\b(today|tonight|this morning|this afternoon|this evening)\b/i,'DATE'],
    [/\b(tomorrow|tomorrow morning|tomorrow afternoon|tomorrow evening)\b/i,'DATE'],
    [/\b(yesterday|last night|the other day)\b/i,'DATE'],
    [/\b(next|this|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|year|quarter|sprint)\b/i,'DATE'],
    [/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,'DATE'],
    [/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*(?:\d{4})?\b/i,'DATE'],
    [/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,'DATE'],
    [/\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/,'DATE'],
    [/\bin\s+(\d+)\s+(days?|weeks?|months?|years?|sprints?)\b/i,'DATE'],
    [/\b(by|before|after|until|since)\s+(?:the\s+)?(end of|start of|beginning of)?\s*(?:the\s+)?(week|month|year|quarter|day|sprint|release)\b/i,'DATE'],
    [/\b(by|before|deadline)\s+[A-Z][a-z]+\b/i,'DATE'],
    [/\b(q1|q2|q3|q4)(?:\s+\d{4})?\b/i,'DATE'],
    [/\b\d{1,2}:\d{2}\s*(?:am|pm|a\.m\.|p\.m\.)?\b/i,'TIME'],
    [/\b\d{1,2}\s*(?:am|pm|a\.m\.|p\.m\.)\b/i,'TIME'],
    [/\b(morning|afternoon|evening|night|midnight|noon|midday|eod|eow|eom|cob)\b/i,'TIME'],
    [/\b(sprint|iteration|release|version)\s+\d+(?:\.\d+)?\b/i,'DATE'],
    [/\bdue\s+(?:in\s+)?\d+\s*(days?|weeks?|hours?)\b/i,'DATE'],
  ];

  const METRIC_PATTERNS = [
    [/\$\s*[\d,]+(?:\.\d+)?\s*(?:million|billion|trillion|thousand|k|m|b)?\b/i,'MONEY'],
    [/\b[\d,]+(?:\.\d+)?\s*(?:dollars?|euros?|pounds?|gbp|usd|eur|cad|aud)\b/i,'MONEY'],
    [/\b[\d,]+(?:\.\d+)?\s*(?:percent|%|bps|basis points?)\b/i,'PERCENT'],
    [/\b[\d,]+(?:\.\d+)?\s*(?:million|billion|trillion|thousand)[+]?\b/i,'QUANTITY'],
    [/\b[\d]+(?:\.\d+)?\s*(?:x|times|fold|-fold)\b/i,'MULTIPLIER'],
    [/\bv(?:ersion)?\s*[\d.]+\b/i,'VERSION'],
    [/\b[\d]+(?:\.\d+)?\s*(?:ms|milliseconds?|seconds?|minutes?|hours?|days?|weeks?)\b/i,'DURATION'],
    [/\b[\d,]+(?:\.\d+)?\s*(?:kb|mb|gb|tb|pb|rps|qps|rpm)\b/i,'SIZE'],
    [/\b[\d,]+(?:\.\d+)?[kmb]\b(?!\w)/i,'QUANTITY'],
    [/\b[\d,]+(?:\.\d+)?\s*(?:users?|customers?|people|employees?|seats?|dau|mau|wau)\b/i,'COUNT'],
    [/\b(?:arr|mrr|ltv|cac|arpu|arppu)\s+(?:of\s+)?\$?[\d,]+/i,'MONEY'],
    [/\bnps\s+(?:score\s+)?(?:of\s+)?[-+]?\d+\b/i,'METRIC'],
    [/\b(?:p50|p90|p95|p99)\s+(?:of\s+)?[\d.]+\s*(?:ms)?\b/i,'METRIC'],
  ];

  const NEGATION_WORDS = new Set([
    'not','no','never','neither','nor','nothing','nobody','nowhere',
    'without','cant','cannot','wont','dont','doesnt','didnt','shouldnt',
    'couldnt','wouldnt','isnt','arent','wasnt','werent','havent',
    'hasnt','hadnt','barely','hardly','scarcely','rarely','seldom',
    'refuse','refuses','refused','deny','denies','denied',
    'stop','stops','stopped','avoid','avoids','avoided',
  ]);

  const BADGE_MAP = {
    action:   { label:'Action',   cls:'badge-action'   },
    fact:     { label:'Note',     cls:'badge-fact'     },
    question: { label:'Question', cls:'badge-question' },
    idea:     { label:'Idea',     cls:'badge-idea'     },
    date:     { label:'Date',     cls:'badge-date'     },
    number:   { label:'Metric',   cls:'badge-number'   },
  };

  const PASSIVE_PATTERNS = [
    /\b(?:is|are|was|were|been|being)\s+\w+ed\b/i,
    /\b(?:has|have|had)\s+been\s+\w+ed\b/i,
    /\bwill\s+be\s+\w+ed\b/i,
  ];

  const QUESTION_STARTERS = new Set([
    'what','when','where','why','how','who','which','whose','whom',
    'is there','are there','do we','does it','can we','should we',
    'have we','will it','would it','could it','shall we',
    'is it','are we','was it','were they',
  ]);

  const IDEA_SIGNALS = new Set([
    'idea','thought','consider','what if','imagine','suppose',
    'hypothesis','concept','interesting','wondering','wonder',
    'suggest','proposal','brainstorm','explore','experiment',
    'approach','vision','opportunity','possibility','potential',
    'alternative','innovative','innovation','new way','different way',
    'could try','might want to','worth exploring','worth considering',
    'food for thought','thinking about','been thinking','had a thought',
    'came to mind','just occurred','what about','how about',
    'why not','why dont we','why not try','what if we',
    'one option','another option','another approach','option would be',
  ]);

  function normaliseText(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let t = raw.normalize('NFC').replace(/[\x00-\x09\x0B-\x1F\x7F]/g,' ');
    t = expandContractions(t);
    t = normaliseNumberWords(t);
    t = normaliseMWE(t);
    t = repairSpeechArtefacts(t);
    return t.replace(/[ \t]+/g,' ')
            .replace(/\n+/g,' ')
            .replace(/\s*,\s*/g,', ')
            .replace(/([.!?])([A-Za-z])/g,'$1 $2')
            .replace(/\s*[—–]\s*/g,' — ')
            .trim();
  }

  function expandContractions(text) {
    return text.replace(/(\w+)[''\u2019](\w*)/gi, (full, pre, post) => {
      const key = (pre + post).toLowerCase();
      return CONTRACTIONS.get(key) || CONTRACTIONS.get(pre.toLowerCase() + "'" + post.toLowerCase()) || full;
    });
  }

  function normaliseNumberWords(text) {
    let r = text;
    r = r.replace(
      /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[-\s](one|two|three|four|five|six|seven|eight|nine)\b/gi,
      (_, tens, ones) => String((NUMBER_WORDS.get(tens.toLowerCase()) || 0) + (NUMBER_WORDS.get(ones.toLowerCase()) || 0))
    );
    r = r.replace(
      /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(hundred|thousand|million|billion|trillion)\b/gi,
      (_, n, mag) => {
        const base = NUMBER_WORDS.get(n.toLowerCase()) || 0;
        const mult = NUMBER_WORDS.get(mag.toLowerCase()) || 1;
        const val = base * mult;
        if (val >= 1000000000) return (val / 1000000000) + 'B';
        if (val >= 1000000)    return (val / 1000000) + 'M';
        if (val >= 1000)       return (val / 1000) + 'K';
        return String(val);
      }
    );
    r = r.replace(
      /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+percent\b/gi,
      (_, n) => (NUMBER_WORDS.get(n.toLowerCase()) || n) + '%'
    );
    r = r.replace(
      /\b(a|one)\s+(?:hundred|thousand|million|billion)\b/gi,
      (_, art, mag) => {
        const mult = NUMBER_WORDS.get(mag.toLowerCase()) || 1;
        if (mult >= 1000000000) return '1B';
        if (mult >= 1000000)    return '1M';
        if (mult >= 1000)       return '1K';
        return String(mult);
      }
    );
    return r;
  }

  function normaliseMWE(text) {
    let t = text;
    const sorted = [...MULTI_WORD_EXPRESSIONS.keys()].sort((a,b) => b.length - a.length);
    for (const mwe of sorted) {
      const escaped = mwe.replace(/[-]/g,'[\\s\\-]').replace(/[.*+?^${}()|[\]\\]/g, (c) => c === '[' || c === ']' || c === '\\' || c === '-' ? c : '\\' + c);
      try {
        t = t.replace(new RegExp('\\b' + escaped + '\\b','gi'), MULTI_WORD_EXPRESSIONS.get(mwe));
      } catch(e) {}
    }
    return t;
  }

  function repairSpeechArtefacts(text) {
    let t = text;
    t = t.replace(/\b(\w{2,})\s+[-–—]\s+(?:i mean\s+|i was going to say\s+)?(\w)/gi, '$2');
    t = t.replace(/\b(\w+)(?:\s+\1){1,3}\b/gi,'$1');
    t = t.replace(/\b(the|a|an|this|that)\s+\1\b/gi,'$1');
    t = t.replace(/\b(i)\s+\1\b/gi,'$1');
    t = t.replace(/\b(\w+)\s+i mean\s+/gi,'');
    t = t.replace(/\b(\w+)\s+er\s+(\w+)\b/gi,'$1 $2');
    return t;
  }

  function tokenise(text) {
    const tokens = [];
    const re = /(\$[\d,]+(?:\.\d+)?(?:[kmb]|%)?)|(\d+(?:[,\.\u00A7]\d+)*(?:[kmb]|%)?)|([a-zA-Z](?:[a-zA-Z'\-]*[a-zA-Z])?)|([.!?,;:—–])/gi;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[1])      tokens.push({ v:m[1], t:'money' });
      else if (m[2]) tokens.push({ v:m[2], t:'number' });
      else if (m[3]) tokens.push({ v:m[3], t:'word' });
      else if (m[4]) tokens.push({ v:m[4], t:'punct' });
    }
    return tokens;
  }

  function extractBigrams(tokens) {
    const bigrams = [];
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].t === 'word' && tokens[i+1].t === 'word') {
        const a = tokens[i].v.toLowerCase(), b = tokens[i+1].v.toLowerCase();
        if (!STOP_WORDS.has(a) && !STOP_WORDS.has(b) && a.length > 2 && b.length > 2) {
          bigrams.push(a + '\u00A4' + b);
        }
      }
    }
    return bigrams;
  }

  function extractTrigrams(tokens) {
    const trigrams = [];
    for (let i = 0; i < tokens.length - 2; i++) {
      const a = tokens[i], b = tokens[i+1], c = tokens[i+2];
      if (a.t === 'word' && b.t === 'word' && c.t === 'word') {
        const av = a.v.toLowerCase(), bv = b.v.toLowerCase(), cv = c.v.toLowerCase();
        if (!STOP_WORDS.has(av) && !STOP_WORDS.has(cv)) {
          trigrams.push(av + '\u00A4' + bv + '\u00A4' + cv);
        }
      }
    }
    return trigrams;
  }

  function segmentSentences(text) {
    if (!text) return [];
    let safe = text;
    for (const abbr of SENTENCE_ABBREVIATIONS) {
      safe = safe.replace(new RegExp('\\b(' + abbr + ')\\.',  'gi'), '$1\u00B7');
    }
    safe = safe.replace(/(\d)\.(\d)/g,'$1\u00A7$2');
    safe = safe.replace(/\.{2,}/g,'\u2026');
    safe = safe.replace(/([.!?])\s*([.!?])+/g,'$1');
    const segments = safe.split(/(?<=[.!?](?:["'\u201D]|\s|$))\s*/);
    return segments.map(s =>
      s.replace(/\u00B7/g,'.').replace(/\u00A7/g,'.').replace(/\u2026/g,'...').trim()
    ).filter(s => s.length > 3);
  }

  function splitRunons(text) {
    if (text.length < 50) return [text];
    const coordSplit = text.split(/(?<=[,;])\s+(?:and|but|or|so|yet|however|although|though|while|whereas|since)\s+/i);
    if (coordSplit.length > 1) return coordSplit.filter(p => p.trim().length > 8);
    const semicolonSplit = text.split(/;\s+/);
    if (semicolonSplit.length > 1) return semicolonSplit.filter(p => p.trim().length > 8);
    const commaGroups = text.split(/,\s+/);
    if (commaGroups.length > 3) {
      const mid = Math.ceil(commaGroups.length / 2);
      return [commaGroups.slice(0,mid).join(', '), commaGroups.slice(mid).join(', ')].filter(p => p.trim().length > 10);
    }
    if (text.length > 200) {
      const midSpace = text.indexOf(' ', Math.floor(text.length / 2));
      if (midSpace > 50) return [text.slice(0, midSpace), text.slice(midSpace+1)].filter(p => p.length > 10);
    }
    return [text];
  }

  function removeFillersFromText(text) {
    if (!text) return '';
    let t = text;
    const multiWordFillers = [...FILLERS].filter(f => f.includes(' ')).sort((a,b) => b.length - a.length);
    for (const f of multiWordFillers) {
      const escaped = f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      t = t.replace(new RegExp('\\b' + escaped + '\\b','gi'),'');
    }
    const singleFillers = [...FILLERS].filter(f => !f.includes(' '));
    for (const f of singleFillers) {
      t = t.replace(new RegExp('\\b' + f + '\\b','gi'),'');
    }
    t = t.replace(/,\s*,/g,',')
         .replace(/\s*,\s*([.!?])/g,'$1')
         .replace(/^[,;:.!?\s]+/,'')
         .replace(/[,;:\s]+$/,'')
         .replace(/\s{2,}/g,' ')
         .trim();
    return t;
  }

  function compressRedundantLanguage(text) {
    let t = text;
    t = t.replace(/\b(very|really|quite|rather|fairly|pretty|somewhat|slightly|truly|genuinely)\s+(very|really|quite|rather|fairly)\s+/gi,'');
    t = t.replace(/\bthe fact that\b/gi,'that');
    t = t.replace(/\bin order to\b/gi,'to');
    t = t.replace(/\bat this point in time\b/gi,'now');
    t = t.replace(/\bdue to the fact that\b/gi,'because');
    t = t.replace(/\bin the event that\b/gi,'if');
    t = t.replace(/\bwith regard to\b/gi,'regarding');
    t = t.replace(/\bwith respect to\b/gi,'regarding');
    t = t.replace(/\bfor the purpose of\b/gi,'to');
    t = t.replace(/\bhas the ability to\b/gi,'can');
    t = t.replace(/\bis able to\b/gi,'can');
    t = t.replace(/\bwas able to\b/gi,'could');
    t = t.replace(/\bmake a decision\b/gi,'decide');
    t = t.replace(/\bgive consideration to\b/gi,'consider');
    t = t.replace(/\btake action on\b/gi,'act on');
    t = t.replace(/\bcome to a conclusion\b/gi,'conclude');
    t = t.replace(/\bperform an analysis\b/gi,'analyse');
    t = t.replace(/\bconduct a review\b/gi,'review');
    t = t.replace(/\bdo a deep dive\b/gi,'investigate');
    t = t.replace(/\bexisting (?:current )?(\w+)/gi,'$1');
    t = t.replace(/\s{2,}/g,' ').trim();
    return t;
  }

  const POS_PRONOUNS = new Set(['i','me','my','mine','we','us','our','ours','you','your','he','him','his','she','her','hers','it','its','they','them','their','this','that','these','those','who','which','what','myself','yourself','himself','herself','itself','ourselves','themselves']);
  const POS_DETERMINERS = new Set(['a','an','the','some','any','each','every','both','either','neither','all','most','much','many','few','little','no','another','other','several','enough','whatever','whichever','whoever']);
  const POS_PREPOSITIONS = new Set(['in','on','at','by','for','with','about','against','between','through','during','before','after','above','below','under','over','to','from','into','onto','upon','within','without','along','across','behind','beside','beyond','near','off','out','past','since','until','via','around','among','amid','despite','except','regarding','concerning','including','excluding','per','unlike','plus','minus','toward','towards']);
  const POS_CONJUNCTIONS = new Set(['and','but','or','nor','for','yet','so','because','since','although','though','while','if','unless','until','when','where','whether','after','before','once','as','than','that','whereas','wherever','whenever','however','therefore','thus','hence','moreover','furthermore','meanwhile','otherwise','instead']);
  const POS_AUX = new Set(['be','is','are','was','were','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','need','dare','ought','used']);

  function tagPOS(tokens) {
    return tokens.map((tok, idx) => {
      const v = tok.v.toLowerCase();
      let pos;
      if (tok.t === 'number' || tok.t === 'money') {
        pos = 'CD';
      } else if (tok.t === 'punct') {
        pos = 'SYM';
      } else if (POS_PRONOUNS.has(v)) {
        pos = 'PRP';
      } else if (POS_DETERMINERS.has(v)) {
        pos = 'DT';
      } else if (POS_PREPOSITIONS.has(v)) {
        pos = 'IN';
      } else if (POS_CONJUNCTIONS.has(v)) {
        pos = 'CC';
      } else if (POS_AUX.has(v)) {
        pos = 'VB';
      } else if (ACTION_VERB_STEMS.has(v)) {
        pos = 'VB';
      } else {
        pos = inferPOSFromMorphology(v, tok.v, idx, tokens);
      }
      return { ...tok, pos };
    });
  }

  function inferPOSFromMorphology(lower, original, idx, tokens) {
    if (/^(ly)$/.test(lower)) return 'RB';
    if (/\bly$/.test(lower) && lower.length > 4 && !/^(only|early|daily|likely|monthly|weekly|yearly|friendly|lonely|holy|ugly|silly|lively)$/.test(lower)) return 'RB';
    if (/(ful|less|ous|ious|ive|able|ible|al|ical|ic|ish|ent|ant|ary|ory|some|ward|like|proof|free|aware|ready|prone|based|driven|focused|led|oriented)$/.test(lower) && lower.length > 5) return 'JJ';
    if (/(ise|ize|ify|ate)$/.test(lower) && lower.length > 4) return 'VB';
    if (/ing$/.test(lower) && lower.length > 5) {
      const prev = tokens[idx - 1];
      if (prev && (POS_AUX.has(prev.v.toLowerCase()) || prev.v.toLowerCase() === 'is' || prev.v.toLowerCase() === 'are')) return 'VB';
      return 'NN';
    }
    if (/ed$/.test(lower) && lower.length > 4) {
      const prev = tokens[idx - 1];
      if (prev && POS_AUX.has(prev.v.toLowerCase())) return 'VB';
      return 'JJ';
    }
    if (/(tion|sion|ness|ment|ity|age|ance|ence|ship|hood|dom|ism|ist|er|or|ee|ary|ory|ure|ure|th|cy|sy)$/.test(lower) && lower.length > 5) return 'NN';
    if (original.length > 0 && original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase() && idx > 0) return 'NNP';
    if (original.toUpperCase() === original && original.length > 1 && /^[A-Z]+$/.test(original)) return 'NNP';
    return 'NN';
  }

  function detectPassiveVoice(text) {
    return PASSIVE_PATTERNS.some(p => p.test(text));
  }

  function extractEntities(text, tokens) {
    const entities = [];
    for (const [pat, type] of TEMPORAL_EXPRESSIONS) {
      const matches = [...text.matchAll(new RegExp(pat.source, pat.flags + 'g'))];
      for (const m of matches.slice(0,3)) {
        if (m[0] && m[0].trim().length > 1) entities.push({ text: m[0].trim(), type });
      }
    }
    for (const [pat, type] of METRIC_PATTERNS) {
      const matches = [...text.matchAll(new RegExp(pat.source, pat.flags + 'g'))];
      for (const m of matches.slice(0,3)) {
        if (m[0] && m[0].trim().length > 1) entities.push({ text: m[0].trim(), type });
      }
    }
    let seq = [];
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const prevIsSentenceStart = i === 0 || (tokens[i-1] && tokens[i-1].t === 'punct' && /[.!?]/.test(tokens[i-1].v));
      if (tok.pos === 'NNP' && !prevIsSentenceStart) {
        seq.push(tok.v);
      } else {
        if (seq.length > 0) {
          const phrase = seq.join(' ');
          const lastWordLower = seq[seq.length-1].toLowerCase();
          if (ENTITY_ORG_SUFFIXES.has(lastWordLower)) {
            entities.push({ text: phrase, type: 'ORG' });
          } else if (ENTITY_PLACE_TERMS.has(lastWordLower)) {
            entities.push({ text: phrase, type: 'PLACE' });
          } else if (PROPER_NAME_INDICATORS.has(lastWordLower)) {
            entities.push({ text: phrase, type: 'PERSON' });
          } else if (seq.length >= 2) {
            entities.push({ text: phrase, type: 'PERSON' });
          }
          seq = [];
        }
      }
    }
    if (seq.length > 0) {
      const phrase = seq.join(' ');
      if (seq.length >= 2) entities.push({ text: phrase, type: 'PERSON' });
    }
    const seen = new Set();
    return entities.filter(e => {
      const k = e.type + ':' + e.text.toLowerCase().trim();
      if (seen.has(k) || e.text.length < 2) return false;
      seen.add(k); return true;
    });
  }

  function scoreNounChunkLength(chunk) {
    if (chunk.length === 1) return 1.0;
    if (chunk.length === 2) return 1.6;
    if (chunk.length === 3) return 2.0;
    return 2.2;
  }

  function extractKeyPhrases(text, taggedTokens, bigrams, trigrams) {
    const phrases = [];
    let chunk = [];
    for (const tok of taggedTokens) {
      if (['JJ','NN','NNP','CD'].includes(tok.pos) && tok.t !== 'punct') {
        if (tok.pos !== 'DT') chunk.push(tok.v);
      } else {
        if (chunk.length > 0) {
          const p = chunk.join(' ');
          if (p.length > 3 && !STOP_WORDS.has(p.toLowerCase())) {
            phrases.push({ text: p, score: scoreNounChunkLength(chunk) });
          }
          chunk = [];
        }
      }
    }
    if (chunk.length > 0) {
      const p = chunk.join(' ');
      if (p.length > 3) phrases.push({ text: p, score: scoreNounChunkLength(chunk) });
    }
    for (const bigram of bigrams) {
      const parts = bigram.split('\u00A4');
      if (parts.length === 2) phrases.push({ text: parts.join(' '), score: 1.3 });
    }
    for (const trigram of trigrams) {
      const parts = trigram.split('\u00A4');
      if (parts.length === 3) phrases.push({ text: parts.join(' '), score: 1.8 });
    }
    const seen = new Set();
    return phrases
      .filter(p => {
        const k = p.text.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k); return true;
      })
      .sort((a,b) => b.score - a.score)
      .slice(0,5)
      .map(p => p.text);
  }

  function detectTopicFromTokens(tokens) {
    const words = new Set(tokens.filter(t => t.t === 'word').map(t => t.v.toLowerCase()));
    let bestTopic = null, bestScore = 0;
    for (const [topic, keywords] of TOPIC_CLUSTERS) {
      let score = 0;
      for (const w of words) { if (keywords.has(w)) score++; }
      if (score > bestScore) { bestScore = score; bestTopic = topic; }
    }
    return bestScore > 0 ? bestTopic : null;
  }

  function detectNegationBeforeVerb(tokens, verbIdx) {
    const windowStart = Math.max(0, verbIdx - 5);
    for (let i = windowStart; i < verbIdx; i++) {
      if (tokens[i] && NEGATION_WORDS.has(tokens[i].v.toLowerCase())) return true;
    }
    return false;
  }

  function measureHedgingRatio(text) {
    const lower = text.toLowerCase();
    let count = 0;
    for (const hedge of HEDGE_PHRASES) {
      if (lower.includes(hedge)) count++;
    }
    return Math.min(count / Math.max(text.split(/\s+/).length / 4, 1), 1.0);
  }

  function measureIntensityScore(text) {
    const lower = text.toLowerCase();
    let score = 0;
    for (const word of INTENSITY_WORDS) {
      if (lower.includes(word)) score += 0.18;
    }
    score += (text.match(/\b[A-Z]{2,}\b/g) || []).length * 0.12;
    score += (text.match(/!+/g) || []).length * 0.08;
    return Math.min(score, 1.0);
  }

  function measureInformationDensity(tokens) {
    const total = tokens.filter(t => t.t === 'word').length;
    if (total === 0) return 0;
    const content = tokens.filter(t =>
      t.t === 'word' &&
      !STOP_WORDS.has(t.v.toLowerCase()) &&
      !FILLERS.has(t.v.toLowerCase()) &&
      t.v.length > 2
    ).length;
    return content / total;
  }

  function classifyIntent(text, tokens, entities) {
    const lower = text.toLowerCase().trim();
    const trimmed = text.trim();
    if (trimmed.endsWith('?')) return 'question';
    for (const qs of QUESTION_STARTERS) {
      if (lower.startsWith(qs + ' ') || lower.startsWith(qs + "'")) return 'question';
      if (lower.includes(', ' + qs + ' ') && lower.length < 80) return 'question';
    }
    if (lower.includes(' or ') && trimmed.endsWith('?')) return 'question';
    const hasDate = entities.some(e => e.type === 'DATE' || e.type === 'TIME') ||
                    TEMPORAL_EXPRESSIONS.some(([p]) => p.test(text));
    const hasMetric = entities.some(e => ['MONEY','PERCENT','QUANTITY','COUNT','MULTIPLIER','METRIC'].includes(e.type)) ||
                      METRIC_PATTERNS.some(([p]) => p.test(text));
    if (hasMetric && hasDate) return 'number';
    if (hasMetric) return 'number';
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.t === 'word' && ACTION_VERB_STEMS.has(tok.v.toLowerCase())) {
        if (!detectNegationBeforeVerb(tokens, i)) return 'action';
      }
    }
    const ideaLower = lower;
    for (const sig of IDEA_SIGNALS) {
      if (ideaLower.includes(sig)) return 'idea';
    }
    if (hasDate) return 'date';
    return 'fact';
  }

  function computeImportanceScore(text, tokens, entities, intent, hedgeRatio, intensityScore, densityRatio, idfState) {
    const intentBase = { action:0.78, question:0.68, date:0.73, number:0.76, idea:0.58, fact:0.46 };
    let score = intentBase[intent] || 0.46;
    score += Math.min(entities.length * 0.06, 0.24);
    const wordCount = tokens.filter(t => t.t === 'word').length;
    if (wordCount < 3)       score -= 0.35;
    else if (wordCount < 5)  score -= 0.18;
    else if (wordCount > 10) score += 0.05;
    else if (wordCount > 20) score += 0.08;
    score += Math.min(tokens.filter(t => t.pos === 'NNP').length * 0.05, 0.20);
    score += Math.min((tokens.filter(t => t.t === 'number' || t.t === 'money').length) * 0.05, 0.15);
    score -= hedgeRatio * 0.30;
    score += intensityScore * 0.22;
    score += (densityRatio - 0.45) * 0.18;
    const actionStrengths = tokens
      .filter(t => ACTION_VERB_STEMS.has(t.v.toLowerCase()))
      .map(t => Number(ACTION_VERB_STEMS.get(t.v.toLowerCase())) || 0);
    if (actionStrengths.length > 0) score += Math.max(...actionStrengths) * 0.12;
    if (detectPassiveVoice(text)) score -= 0.06;
    const contentWords = tokens.filter(t => t.t === 'word' && !STOP_WORDS.has(t.v.toLowerCase())).map(t => t.v.toLowerCase());
    let idfBoost = 0;
    for (const w of contentWords) {
      const df = idfState.df[w] || 1;
      idfBoost += Math.log((idfState.n + 1) / df);
    }
    if (contentWords.length > 0) score += Math.min((idfBoost / contentWords.length) / 8, 0.14);
    const bigrams = extractBigrams(tokens);
    for (const bg of bigrams) {
      const df = idfState.bigramDf[bg] || 1;
      score += Math.min(Math.log((idfState.n + 1) / df) / 18, 0.025);
    }
    return Math.max(0, Math.min(1, score));
  }

  function updateIDFState(state, tokens) {
    state.n += 1;
    const seenWords = new Set(), seenBigrams = new Set();
    for (const tok of tokens) {
      if (tok.t !== 'word') continue;
      const w = tok.v.toLowerCase();
      state.tf[w] = (state.tf[w] || 0) + 1;
      if (!STOP_WORDS.has(w) && !seenWords.has(w)) {
        state.df[w] = (state.df[w] || 0) + 1;
        seenWords.add(w);
      }
    }
    for (const bg of extractBigrams(tokens)) {
      if (!seenBigrams.has(bg)) {
        state.bigramDf[bg] = (state.bigramDf[bg] || 0) + 1;
        seenBigrams.add(bg);
      }
    }
  }

  function buildTermVector(text) {
    const words = text.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 2);
    const vec = new Map();
    for (const w of words) vec.set(w, (vec.get(w) || 0) + 1);
    return vec;
  }

  function cosineSimilarity(vecA, vecB) {
    let dot = 0, magA = 0, magB = 0;
    for (const [w, freq] of vecA) {
      dot += freq * (vecB.get(w) || 0);
      magA += freq * freq;
    }
    for (const [, freq] of vecB) magB += freq * freq;
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  function jaccardSimilarity(textA, textB) {
    const setA = new Set(textA.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w)));
    const setB = new Set(textB.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w)));
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = [...setA].filter(w => setB.has(w)).length;
    return intersection / (setA.size + setB.size - intersection);
  }

  function hybridSimilarity(textA, textB) {
    const cosine = cosineSimilarity(buildTermVector(textA), buildTermVector(textB));
    const jaccard = jaccardSimilarity(textA, textB);
    return (cosine * 0.6) + (jaccard * 0.4);
  }

  function isDuplicateNote(candidate, existingNotes, threshold = 0.58) {
    for (const note of existingNotes) {
      if (hybridSimilarity(candidate, note.text) >= threshold) return true;
    }
    return false;
  }

  function formatFinalNoteText(text, intent) {
    if (!text) return '';
    let t = text.trim();
    t = t.replace(/^(and|but|or|so|because|since|although|then|also|too|as|yet|however|therefore|thus|plus|additionally|furthermore|moreover),?\s+/i,'');
    t = t.replace(/^(well|now|so|okay|ok|right|alright|sure),?\s+/i,'');
    if (intent === 'action') {
      t = t.replace(/^(?:i|we|you|they|she|he)\s+(?:need to|should|must|have to|want to|plan to|am going to|are going to|is going to|was going to|going to|will|shall)\s+/i,'');
      t = t.replace(/^(?:we|they|i|she|he)\s+(?:will|shall)\s+/i,'');
      t = t.replace(/^(?:please|kindly)\s+/i,'');
    }
    t = t.charAt(0).toUpperCase() + t.slice(1);
    if (!/[.!?…]$/.test(t)) t += '.';
    if (t.length > 200) {
      const cut = t.lastIndexOf(' ', 197);
      t = (cut > 80 ? t.slice(0,cut) : t.slice(0,197)) + '…';
    }
    return t;
  }

  function newSession() {
    return {
      idf: { n:0, df:{}, bigramDf:{}, tf:{} },
      accepted: [],
      buffer: '',
      lastEntities: [],
      sessionTopics: new Map(),
    };
  }

  function updateSessionTopics(session, topic) {
    if (!topic) return;
    session.sessionTopics.set(topic, (session.sessionTopics.get(topic) || 0) + 1);
  }

  function processSentence(rawSentence, session) {
    const normalised = normaliseText(rawSentence);
    if (!normalised || normalised.length < 8) return null;
    const rawTokens = tokenise(normalised);
    if (rawTokens.filter(t => t.t === 'word').length < 3) return null;
    const noFillers = removeFillersFromText(normalised);
    if (!noFillers || noFillers.length < 8) return null;
    const compressed = compressRedundantLanguage(noFillers);
    if (!compressed || compressed.length < 6) return null;
    const tokens = tokenise(compressed);
    if (tokens.filter(t => t.t === 'word').length < 3) return null;
    const taggedTokens = tagPOS(tokens);
    const bigrams = extractBigrams(tokens);
    const trigrams = extractTrigrams(tokens);
    const entities = extractEntities(compressed, taggedTokens);
    if (entities.filter(e => e.type === 'PERSON' || e.type === 'ORG').length > 0) {
      session.lastEntities = entities.filter(e => e.type === 'PERSON' || e.type === 'ORG').slice(0,3);
    }
    const keywords = extractKeyPhrases(compressed, taggedTokens, bigrams, trigrams);
    const topic = detectTopicFromTokens(tokens);
    updateSessionTopics(session, topic);
    const intent = classifyIntent(compressed, taggedTokens, entities);
    const hedgeRatio = measureHedgingRatio(compressed);
    const intensityScore = measureIntensityScore(compressed);
    const densityRatio = measureInformationDensity(tokens);
    updateIDFState(session.idf, tokens);
    const importance = computeImportanceScore(compressed, taggedTokens, entities, intent, hedgeRatio, intensityScore, densityRatio, session.idf);
    if (importance < 0.28) return null;
    const noteText = formatFinalNoteText(compressed, intent);
    if (!noteText || noteText.length < 6) return null;
    if (isDuplicateNote(noteText, session.accepted)) return null;
    const badge = BADGE_MAP[intent] || BADGE_MAP.fact;
    const result = {
      type: intent,
      text: noteText,
      importance: Math.round(importance * 100),
      entities,
      keywords,
      badge,
      topic,
      hedgeRatio: Math.round(hedgeRatio * 100),
      intensityScore: Math.round(intensityScore * 100),
      densityRatio: Math.round(densityRatio * 100),
      isPassive: detectPassiveVoice(compressed),
    };
    session.accepted.push(result);
    return result;
  }

  function processChunk(rawText, session) {
    if (!rawText || !rawText.trim()) return [];
    session.buffer = (session.buffer + ' ' + rawText.trim()).trimStart();
    const results = [];
    const sentences = segmentSentences(session.buffer);
    if (sentences.length === 0) return results;
    for (let i = 0; i < sentences.length; i++) {
      const sent = sentences[i].trim();
      const isLast = i === sentences.length - 1;
      const isTerminated = /[.!?]$/.test(sent) || /[.!?]['"\u201D]$/.test(sent);
      if (isLast && !isTerminated && sentences.length > 1) { session.buffer = sent; break; }
      if (isLast && !isTerminated && session.buffer.length < 280) break;
      const subs = sent.length > 120 ? splitRunons(sent) : [sent];
      for (const sub of subs) {
        const note = processSentence(sub, session);
        if (note) results.push(note);
      }
      if (isLast) session.buffer = '';
    }
    if (sentences.length === 1 && session.buffer.length > 300) {
      const parts = splitRunons(session.buffer);
      if (parts.length > 1) {
        for (let j = 0; j < parts.length - 1; j++) {
          const note = processSentence(parts[j], session);
          if (note) results.push(note);
        }
        session.buffer = parts[parts.length - 1];
      }
    }
    return results;
  }

  function flushSession(session) {
    const buf = session.buffer.trim();
    if (!buf) return [];
    session.buffer = '';
    const note = processSentence(buf, session);
    return note ? [note] : [];
  }

  let _session = newSession();

  const VoiceNLP = {
    processChunk(rawText)  { return processChunk(rawText, _session); },
    flush()                { return flushSession(_session); },
    reset()                { _session = newSession(); },
    getSession() {
      const topTopics = [..._session.sessionTopics.entries()].sort((a,b) => b[1]-a[1]).slice(0,3).map(([t,c]) => ({topic:t,count:c}));
      return {
        docCount:      _session.idf.n,
        acceptedCount: _session.accepted.length,
        bufferLength:  _session.buffer.length,
        lastEntities:  _session.lastEntities,
        topTopics,
        topTerms:      Object.entries(_session.idf.tf).filter(([w]) => !STOP_WORDS.has(w)).sort((a,b) => b[1]-a[1]).slice(0,10).map(([w,f]) => ({word:w,freq:f})),
        topBigrams:    Object.entries(_session.idf.bigramDf).sort((a,b) => b[1]-a[1]).slice(0,5).map(([bg,f]) => ({bigram:bg.replace('\u00A4',' '),freq:f})),
      };
    },
    BADGE_MAP,
  };

  global.VoiceNLP = VoiceNLP;
  if (typeof module !== 'undefined' && module.exports) module.exports = VoiceNLP;

})(typeof window !== 'undefined' ? window : global);
