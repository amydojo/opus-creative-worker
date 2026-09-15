export type ThursdayRunItem = {
  id: string;
  file: string;
  format: 'LONG-FORM ANCHOR' | 'REEL / SHORT' | 'TAMARA' | 'STORY / GBP B-ROLL' | 'TECHNICAL HOLD' | 'BLOCKED MASTER';
  duration?: number;
  orientation?: 'vertical' | 'horizontal';
  visualScore?: number;
  focus?: number;
  audioUse?: string;
  note: string;
  status: 'REVIEW' | 'BLOCKED' | 'READY';
  reason: string;
};

export const thursdayRun = {
  label: 'Thursday shoot · Drive worker run',
  sourceCount: 23,
  analyzedCount: 18,
  blockedCount: 5,
  transcriptStatus: 'SUPERSEDED_BY_CLOUD_V2',
  finalRankingStatus: 'CLOUD_V2_AVAILABLE',
  items: [
    { id:'img-8006', file:'IMG_8006.MOV', format:'LONG-FORM ANCHOR', duration:133.5117, orientation:'vertical', visualScore:.889, focus:795.9, audioUse:'GOOD_CLEAN_BUT_NORMALIZE', note:'Frew seated card Q&A; 2:13 take; DJI transmitter visible; strong portrait framing.', status:'REVIEW', reason:'Primary anchor candidate from the first-pass media audit.' },
    { id:'mvi-8501', file:'MVI_8501.MOV', format:'LONG-FORM ANCHOR', duration:83.1831, orientation:'horizontal', visualScore:.865, focus:899.2, audioUse:'GOOD_CLEAN_BUT_NORMALIZE', note:'Frew seated card Q&A; strong DSLR wide/medium framing; likely external receiver audio.', status:'REVIEW', reason:'Primary anchor candidate from the first-pass media audit.' },
    { id:'img-6862', file:'IMG_6862.MOV', format:'REEL / SHORT', duration:8.12, orientation:'vertical', visualScore:.89, focus:1011.9, audioUse:'USABLE_WITH_GAIN_REVIEW', note:'Centered Frew vertical talking-head; short take.', status:'REVIEW', reason:'Short-form candidate.' },
    { id:'img-6863', file:'IMG_6863.MOV', format:'REEL / SHORT', duration:9.553333, orientation:'vertical', visualScore:.879, focus:1005, audioUse:'USABLE_WITH_GAIN_REVIEW', note:'Centered Frew vertical talking-head; short take with visible gesture.', status:'REVIEW', reason:'Short-form candidate.' },
    { id:'img-6864', file:'IMG_6864.MOV', format:'REEL / SHORT', duration:6.485, orientation:'vertical', visualScore:.914, focus:1000.1, audioUse:'WEAK_DISTANT_OR_LOW_LEVEL', note:'Centered Frew vertical talking-head; strong frame.', status:'REVIEW', reason:'Strong visual; audio needs review.' },
    { id:'img-6865', file:'IMG_6865.MOV', format:'REEL / SHORT', duration:15.0717, orientation:'vertical', visualScore:.911, focus:1010.2, audioUse:'USABLE_WITH_GAIN_REVIEW', note:'Centered Frew vertical talking-head; short take.', status:'REVIEW', reason:'Short-form candidate.' },
    { id:'img-6868', file:'IMG_6868.MOV', format:'REEL / SHORT', duration:6.803333, orientation:'vertical', visualScore:.853, focus:326.7, audioUse:'WEAK_DISTANT_OR_LOW_LEVEL', note:'Frew standing inside construction space; short on-camera/transition.', status:'REVIEW', reason:'Short-form/transition candidate; audio is weak.' },
    { id:'img-6870', file:'IMG_6870.MOV', format:'TAMARA', duration:42.668333, orientation:'vertical', visualScore:.88, focus:443.5, audioUse:'USABLE_TO_GOOD', note:'Tamara exterior on-camera/walk; useful vertical speaking take.', status:'REVIEW', reason:'Strong Tamara candidate.' },
    { id:'img-6872', file:'IMG_6872.MOV', format:'TAMARA', duration:45.636667, orientation:'vertical', visualScore:.81, focus:132.7, audioUse:'USABLE_TO_GOOD', note:'Tamara interior walkthrough / room-rating movement.', status:'REVIEW', reason:'Useful Tamara candidate.' },
    { id:'mvi-8498', file:'MVI_8498.MOV', format:'TAMARA', duration:46.980267, orientation:'horizontal', visualScore:.741, focus:148, audioUse:'ambient_not_decisive', note:'Tamara exterior horizontal movement/walk; secondary B-roll take.', status:'REVIEW', reason:'Secondary Tamara/B-roll candidate.' },
    { id:'img-6874', file:'IMG_6874.MOV', format:'STORY / GBP B-ROLL', duration:17.133333, orientation:'vertical', visualScore:.757, focus:118.8, audioUse:'ambient_not_decisive', note:'Construction room reveal pan.', status:'REVIEW', reason:'Story / Google Business Profile progress B-roll.' },
    { id:'img-6875', file:'IMG_6875.MOV', format:'STORY / GBP B-ROLL', duration:34.793333, orientation:'vertical', visualScore:.674, focus:80.4, audioUse:'ambient_not_decisive', note:'Construction room context; darker/softer.', status:'REVIEW', reason:'Lower-priority progress B-roll.' },
    { id:'img-6876', file:'IMG_6876.MOV', format:'STORY / GBP B-ROLL', duration:21.238333, orientation:'vertical', visualScore:.796, focus:180, audioUse:'ambient_not_decisive', note:'Construction B-roll with windows/ladder/debris.', status:'REVIEW', reason:'Useful progress context.' },
    { id:'img-6877', file:'IMG_6877.MOV', format:'STORY / GBP B-ROLL', duration:16.6567, orientation:'vertical', visualScore:.828, focus:242.2, audioUse:'ambient_not_decisive', note:'Construction debris/detail B-roll.', status:'REVIEW', reason:'Tactile progress detail.' },
    { id:'img-6878', file:'IMG_6878.MOV', format:'STORY / GBP B-ROLL', duration:8.335, orientation:'vertical', visualScore:.763, focus:148.6, audioUse:'ambient_not_decisive', note:'Construction debris/detail short pass.', status:'REVIEW', reason:'Short progress detail.' },
    { id:'mvi-8497', file:'MVI_8497.MOV', format:'TECHNICAL HOLD', duration:4.971633, orientation:'horizontal', visualScore:.597, focus:65.4, audioUse:'ambient_not_decisive', note:'Very short exterior Tamara/setup fragment; soft/incomplete framing.', status:'BLOCKED', reason:'Technical reject / low priority.' },
    { id:'mvi-8500', file:'MVI_8500.MOV', format:'TECHNICAL HOLD', duration:44.010633, orientation:'horizontal', visualScore:.499, focus:11.7, audioUse:'ambient_not_decisive', note:'Tamara interior movement; materially soft/out of focus.', status:'BLOCKED', reason:'Technical reject / low priority.' },
  ] satisfies ThursdayRunItem[],
};
