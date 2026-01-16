const now = Date.now();

// Current timestamps from your quiz (November 11-14, 2025)
const currentStartTime = 1762853264608;
const currentEndTime = 1763112464608;

// Future timestamps for December 12-15, 2025 (for testing blocking)
const futureStartTime = new Date('2025-12-12T13:17:44').getTime();
const futureEndTime = new Date('2025-12-15T13:17:44').getTime();

// Past timestamps (already expired)
const pastStartTime = new Date('2025-11-01T10:00:00').getTime();
const pastEndTime = new Date('2025-11-05T10:00:00').getTime();

console.log('=== CURRENT QUIZ (Nov 11-14) ===');
console.log('Start time:', currentStartTime, '→', new Date(currentStartTime).toLocaleString());
console.log('End time:', currentEndTime, '→', new Date(currentEndTime).toLocaleString());
console.log('now < startTime:', now < currentStartTime);
console.log('now > endTime:', now > currentEndTime);
console.log('Accessible:', !(now < currentStartTime || now > currentEndTime));
console.log('');

console.log('=== FUTURE QUIZ (Dec 12-15) ===');
console.log('Start time:', futureStartTime, '→', new Date(futureStartTime).toLocaleString());
console.log('End time:', futureEndTime, '→', new Date(futureEndTime).toLocaleString());
console.log('now < startTime:', now < futureStartTime, '← Should be TRUE (blocks access)');
console.log('now > endTime:', now > futureEndTime);
console.log('Accessible:', !(now < futureStartTime || now > futureEndTime), '← Should be FALSE');
console.log('');

console.log('=== PAST QUIZ (Nov 1-5) ===');
console.log('Start time:', pastStartTime, '→', new Date(pastStartTime).toLocaleString());
console.log('End time:', pastEndTime, '→', new Date(pastEndTime).toLocaleString());
console.log('now < startTime:', now < pastStartTime);
console.log('now > endTime:', now > pastEndTime, '← Should be TRUE (blocks access)');
console.log('Accessible:', !(now < pastStartTime || now > pastEndTime), '← Should be FALSE');
console.log('');

console.log('Current time:', new Date(now).toLocaleString());
