const firebaseConfig = {
  apiKey: "AIzaSyCp5RKmcqRChmUQwBPe6SDTJVOyxUcqvXA",
  authDomain: "sahi-cycle.firebaseapp.com",
  projectId: "sahi-cycle",
  storageBucket: "sahi-cycle.firebasestorage.app",
  messagingSenderId: "339406570822",
  appId: "1:339406570822:web:a1b8abdb3ad0024d9a5147"
};
// 2. Firebase Initialize 
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
function logoutUser() {
firebase.auth().signOut().then(() => {
window.location.reload(); 
}).catch((error) => {
alert("Error: " + error.message);
});
}
//Naya Account Banana (Personal Email ke liye)
function handleSignup() {
const email = document.getElementById('modal-email').value;
const password = document.getElementById('modal-password').value;
auth.createUserWithEmailAndPassword(email, password)
.then(() => {
document.getElementById('login-overlay').style.display = 'none';
})
.catch((error) => alert("Error: " + error.message));
}
function handleModalLogin() {
const email = document.getElementById('modal-email').value;
const password = document.getElementById('modal-password').value;
auth.signInWithEmailAndPassword(email, password)
.then(() => {
document.getElementById('login-overlay').style.display = 'none';
})
.catch((error) => alert("Check Email/Password: " + error.message));
}
firebase.auth().onAuthStateChanged((user) => {
const overlay = document.getElementById('login-overlay');
if (user) {
overlay.style.display = 'none';
} else {
overlay.style.display = 'flex';
}
});