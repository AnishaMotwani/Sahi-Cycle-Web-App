//for rate limit
let messageCount = 0;
let lastResetTime = Date.now();
const API_KEY = "AIzaSyC4zPcp-CFZ9E1QuoephAvgWkwuafnJvtE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
google.charts.load('current', {'packages':['corechart']});
//chatbox
const btnSend = document.getElementById('btn-send'); // Send button
const chatDisplay = document.getElementById('chat-display'); // Chat screen
const userQuery = document.getElementById('user-query'); // Input box
//main function
async function askSahiDidi(){
const question = userQuery.value.trim(); //real value inside question box.
if (!question) return;
//rate limit logic
const now = Date.now();
if (now - lastResetTime > 60000) { 
messageCount = 0;
lastResetTime = now;}
if (messageCount >= 5){
chatDisplay.innerHTML += `<div style="color:orange; margin:10px 0;">System is busy!<br> Please wait 1 minute before your next question.</div>`;
chatDisplay.scrollTop = chatDisplay.scrollHeight;
return;}
messageCount++;
 //for displaying question on screen.
chatDisplay.innerHTML+=`<div><b>You:</b> ${question}</div>`;
userQuery.value = ""; //for making the input box empty.
chatDisplay.innerHTML += `<div id="loading" style="color:gray; font-style:italic;">Didi is typing... ✍️</div>`;
chatDisplay.scrollTop = chatDisplay.scrollHeight;
try{
// Fetch Request
const response = await fetch(GEMINI_URL,{
method:"POST",
headers:{ "Content-Type": "application/json"},
body: JSON.stringify({
contents:[{
parts:[{ text:`You are Sahi Didi.Keep it friendly but very concise(30-40 words max).Use emojis only where necessary.Answer fast and to the point in the user's language.Question:${question}` }]
}]})});
const data = await response.json(); //for opening reply from response box.
const loadingElement =document.getElementById('loading');
if (loadingElement) loadingElement.remove();
const answer = data.candidates[0].content.parts[0].text; //real answer 
//to display reply on screen
chatDisplay.innerHTML += `<div style="color:#d81b60;"><b>Sahi Didi🌸 :</b> ${answer}</div>`;
//for making chat screen scroll
chatDisplay.scrollTop = chatDisplay.scrollHeight;
}
catch (error){
const loadingElement = document.getElementById('loading');
if(loadingElement) loadingElement.remove();
chatDisplay.innerHTML += `<div>Something went wrong! ⏳ Please wait a minute and try again.</div>`;}}
//for starting the main function when send button is clicked.
btnSend.addEventListener('click', askSahiDidi);
// for sending messages through enter key
userQuery.addEventListener('keypress', function(e)
{
if (e.key === 'Enter') {
askSahiDidi();
}
});
//date tracker
const btnSave = document.getElementById('btn-save');
btnSave.addEventListener('click', () => {
const lastDateVal = document.getElementById('last-period').value;
const cycleLen = parseInt(document.getElementById('cycle-len').value);
const bleedDays = parseInt(document.getElementById('bleeding-days').value);
const mood = document.getElementById('user-mood').value;
const status = document.getElementById('save-status');
if (!lastDateVal || isNaN(cycleLen) || isNaN(bleedDays)) {
status.innerText = "Please fill in all details correctly!";
status.style.color = "red";
return;}
let lastDate = new Date(lastDateVal);
let nextDate = new Date(lastDate);
nextDate.setDate(lastDate.getDate() + cycleLen);
const options = { day: 'numeric', month: 'long', year: 'numeric' };
status.innerHTML = `Your next cycle is predicted to start around <strong>${nextDate.toLocaleDateString('en-IN', options)}</strong>`;
status.style.color = "#d81b60";
 // SAVE TO LOCAL STORAGE 
const entry ={
month: new Date().toLocaleString('default', { month: 'short' }),
cycle: cycleLen,
bleed: bleedDays,
mood: mood};
let history = JSON.parse(localStorage.getItem('sahiHistory')) || [];
history.push(entry);
localStorage.setItem('sahiHistory', JSON.stringify(history));
//charts
document.getElementById('chart-placeholder').classList.add('hidden');
document.getElementById('charts-container').classList.remove('hidden');
drawSahiCharts(cycleLen, bleedDays, mood);
});
//main function
function drawSahiCharts(){
let history = JSON.parse(localStorage.getItem('sahiHistory')) || [];
const textStyle = { color: '#4a148c', fontSize: 12 };
const titleStyle = { color: '#d81b60', fontSize: 14, bold: true };
// 1. Cycle regularity chart
let cycleTable = [['Month', 'Your Cycle', 'Ideal']];
history.slice(-6).forEach(h => cycleTable.push([h.month, h.cycle, 28]));
if(history.length === 0) cycleTable.push(['- ', 0, 28]);
const chart1 = new google.visualization.LineChart(document.getElementById('cycle_length_chart'));
chart1.draw(google.visualization.arrayToDataTable(cycleTable),{
title: 'Cycle Regularity Pattern',
titleTextStyle: titleStyle,
curveType: 'function',
pointSize: 8, 
colors: ['#d81b60', '#ab47bc'],
backgroundColor: 'transparent', 
legend:{ position:'bottom'},
series:{
0:{ color:'#d81b60'},//user cycle
1:{ color:'#ab47bc',
lineDashStyle:[4, 4],
pointSize:0, 
lineWidth: 2} 
}});
// 2. Bleeding History
let bleedTable = [['Month', 'Days']];
history.slice(-6).forEach(h => bleedTable.push([h.month, h.bleed]));
const chart2 = new google.visualization.ColumnChart(document.getElementById('bleeding_duration_chart'));
chart2.draw(google.visualization.arrayToDataTable(bleedTable),{
title: 'Bleeding Duration History',
titleTextStyle: titleStyle, 
colors: ['#ec407a'],
backgroundColor: 'transparent',
legend: 'none', 
animation: { startup: true, duration: 800}
});
// 3.mood chart
let lastMood = history.length > 0 ? history[history.length-1].mood : "Neutral";
let phaseData = [['Phase', 'Intensity'], ['Period', 10], ['Follicular', 10], ['Ovulation', 10], ['PMS(Pre-Menstrual Syndrome)', 10]];
// Mapping mood to phase
if (['Cramps', 'Headache', 'Bloated'].includes(lastMood)) phaseData[1][1] = 50;
else if (['Happy', 'Productive'].includes(lastMood)) phaseData[2][1] = 50;
else if (['Calm'].includes(lastMood)) phaseData[3][1] = 50;
else phaseData[4][1] = 50;
const chart3 = new google.visualization.PieChart(document.getElementById('mood_distribution_chart'));
chart3.draw(google.visualization.arrayToDataTable(phaseData),{
title:`Hormonal Compass: ${lastMood} Vibes`, // Dynamic title ,
selectionMode:'none', // Flicker rokne ke liye 
tooltip:{ showColorCode: true, trigger: 'focus' },
titleTextStyle: titleStyle,
pieHole: 0.5,
backgroundColor: 'transparent', 
colors: ['#f48fb1', '#ab47bc', '#d81b60', '#880e4f'],
chartArea: { width: '90%', height: '80%'},
legend:{position:'right',textStyle:{ fontSize: 10}}
});}
// Load charts 
window.onload = () => { if(localStorage.getItem('sahiHistory')) drawSahiCharts(); };
//map
document.getElementById('btn-find-clinics').addEventListener('click', function(){
const mapFrame=document.getElementById('map-frame');
const statusText=document.getElementById('location-status');
const btn=this;
if (navigator.geolocation){
statusText.innerText="Finding specialized care centers... 📍";
btn.innerText="Searching... ⏳";
btn.disabled=true;
navigator.geolocation.getCurrentPosition((position) =>{
const lat=position.coords.latitude;
const lng=position.coords.longitude;
const searchQuery="Best gynecologist clinic near me";;
// Embed URL with search query and user's live location
const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&ll=${lat},${lng}&z=14&output=embed`;
mapFrame.style.border="none";
mapFrame.style.background="white";
mapFrame.innerHTML=`<iframe src="${mapUrl}" width="100%" height="100%" style="border-radius:20px; border:none;" allowfullscreen></iframe>`;
statusText.innerText="Care centers found near you 🌸";
},(error) => {
statusText.innerText="Location blocked. Showing clinics in Jaipur.";
const defaultUrl=`https://maps.google.com/maps?q=${encodeURIComponent("Gynecologist in Jaipur")}&z=14&output=embed`;
mapFrame.innerHTML=`<iframe src="${defaultUrl}" width="100%" height="100%" style="border-radius:20px; border:none;"></iframe>`;
});}
});
//tip box
const sahiDidiDatabase ={
period:[
"Drink ginger tea to soothe cramps naturally. ☕",
"Iron Hack: Pair spinach with lemon for better absorption! 🥗",
"A warm water bag is your best friend today. Rest well! 🌸",
"Avoid heavy lifting; your body is delicate right now. 🛑",
"Magnesium in dark chocolate can help your mood today. 🍫",
"Stay hydrated! Water helps reduce bloating during flow. 💧",
"Try the 'Child's Pose' yoga stretch for lower back relief. 🧘‍♀️",
"Light movement like a short walk can help circulation. 🚶‍♀️",
"Ensure you're getting enough sleep; 8 hours is ideal! 😴",
"Warm honey water can help with that heavy feeling. 🫚"],
follicular:[
"Your energy is rising! Great time to start new habits. 🚀",
"Skin is starting to glow—time for a little self-care. ✨",
"Focus is high; perfect for tackling tough assignments! 💻",
"Social battery is charging up; say yes to that outing! 👯‍♀️",
"Try a higher intensity workout; your body is ready. 💪",
"Eat fresh fruits and veggies to match your rising energy. 🍎",
"You might feel more adventurous today; try a new hobby or a new route. 🗺️",
"Confidence is peaking; great day for presentations. 🎤",
"Your metabolism is steady; maintain a balanced diet. 🥗",
"Explore new places; you have the stamina today! 🗺️"],
ovulation:[
"You are at your most energetic today! Shine bright. ✨",
"High libido and confidence are normal now—embrace it! 💖",
"Perfect time for social gatherings and networking. 🤝",
"Your communication skills are at their best today. 🗣️",
"Keep yourself hydrated as your body temp might rise. 🌡️",
"Strength training is very effective during this phase. 🏋️‍♀️",
"You might feel more attractive—it's nature's glow! 🌸",
"Great time for team-building or collaborative work. 👩‍💻",
"Enjoy fiber-rich foods to keep digestion smooth. 🥦",
"Capture your glow! Today is a good day for photos. 📸"],
luteal:[
"PMS might start; be extra kind to your mind and body. 💖",
"Reduce caffeine to keep anxiety and bloating away. ☕❌",
"Start prioritizing rest as your energy begins to dip. 😴",
"Check your bag for your period kit; better safe! 🎒",
"Switch to gentle exercises like walking or stretching. 🚶‍♀️",
"Avoid salty foods to minimize water retention. 🥨❌",
"It's okay to feel emotional; let your feelings flow. 🥺",
"Complex carbs like oats can help stabilize your mood. 🥣",
"A warm bath can help relax your muscles tonight. 🛁",
"Listen to calming music if you feel overwhelmed. 🎵"]
};
document.getElementById('btn-save').addEventListener('click', () => {
const lastDateVal = document.getElementById('last-period').value;
const cycleLen = parseInt(document.getElementById('cycle-len').value) || 28;
if (lastDateVal){
// Calculation logic
const lastDate = new Date(lastDateVal);
const nextDate = new Date(lastDate);
nextDate.setDate(lastDate.getDate() + cycleLen);
const today = new Date();
today.setHours(0,0,0,0);
nextDate.setHours(0,0,0,0);
const diffInMs = nextDate - today;
const daysRemaining = Math.round(diffInMs / (1000 * 60 * 60 * 24));
let currentPhaseArray;
if (daysRemaining <= 0) {
currentPhaseArray = sahiDidiDatabase.period;}
else if (daysRemaining >= 1 && daysRemaining <= 13) {
currentPhaseArray = sahiDidiDatabase.luteal; 
} else if (daysRemaining > 13 && daysRemaining <= 17) {
currentPhaseArray = sahiDidiDatabase.ovulation;}
else {currentPhaseArray = sahiDidiDatabase.follicular;}
const randomIdx = Math.floor(Math.random() * 10);
document.getElementById('daily-tip').innerText = currentPhaseArray[randomIdx];
}
});
// language translator
function googleTranslateElementInit() {
new google.translate.TranslateElement({
pageLanguage:'auto', 
includedLanguages:'en,hi,pa,gu,mr,bn,ta,te,kn,ml', 
layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
autoDisplay: false
}, 'google_translate_element');
}
