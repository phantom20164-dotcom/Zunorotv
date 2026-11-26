import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut,updateProfile,GoogleAuthProvider,signInWithPopup} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app=initializeApp({
  apiKey:"AIzaSyBoeB3kwT8GbbE1bnJgSbJF9QunbjnwXaU",
  authDomain:"phantom-6f606.firebaseapp.com",
  projectId:"phantom-6f606",
  storageBucket:"phantom-6f606.firebasestorage.app",
  messagingSenderId:"503794896029",
  appId:"1:503794896029:web:e67ca91f2fa8c777b71874"
});
const auth=getAuth(app);

const css=document.createElement("style");
css.textContent=`
#zA{position:fixed;inset:0;z-index:2147483000;background:#000;color:#f4efe3;font-family:system-ui,-apple-system,Roboto,sans-serif;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top) + 40px) 24px 30px}
#zA.zh{display:none}
#zA .zl{width:64px;height:64px;border-radius:16px;border:2px solid #d4a843;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;color:#d4a843;margin-bottom:10px}
#zA h1{font-size:26px;letter-spacing:6px;color:#d4a843;margin:0 0 26px}
#zA .zb{width:100%;max-width:380px}
#zA h2{font-size:20px;margin:0 0 14px}
#zA input{width:100%;box-sizing:border-box;background:#141210;border:1px solid #2a2418;border-radius:12px;padding:14px;margin-bottom:12px;color:#f4efe3;font-size:16px;outline:none}
#zA input:focus{border-color:#d4a843}
#zA button{width:100%;padding:14px;border-radius:12px;border:0;background:linear-gradient(135deg,#f3d98b,#d4a843);color:#000;font-weight:700;font-size:16px;margin-bottom:12px}
#zA button.zg{background:#141210;color:#f4efe3;border:1px solid #2a2418;font-weight:600}
#zA a{display:block;color:#d4a843;text-align:center;font-size:14px;padding:8px}
#zA .zm{min-height:20px;font-size:13px;text-align:center;margin-bottom:8px;color:#ff8a7a}
#zA .zm.ok{color:#8be28b}
#zA .zn{display:none}
#zS{position:fixed;inset:0;z-index:2147483600;background:#000;display:flex;align-items:center;justify-content:center;transition:opacity .6s}
#zS svg{width:140px;height:140px}
#zS path{fill:none;stroke:#d4a843;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:420;stroke-dashoffset:420;animation:zd 1.4s ease forwards,zg 1s 1.2s ease forwards}
@keyframes zd{to{stroke-dashoffset:0}}
@keyframes zg{to{filter:drop-shadow(0 0 12px #f3d98b);stroke:#f3d98b}}
#zS.o{opacity:0;pointer-events:none}
#zO{position:fixed;right:10px;bottom:calc(env(safe-area-inset-bottom) + 70px);z-index:2147482000;background:#141210;color:#d4a843;border:1px solid #d4a843;border-radius:20px;padding:7px 12px;font-size:12px;display:none}
`;
document.head.appendChild(css);

const splash=document.createElement("div");
splash.id="zS";
splash.innerHTML='<svg viewBox="0 0 100 100"><path d="M24 22H76L24 78H76"/></svg>';
document.body.appendChild(splash);

const box=document.createElement("div");
box.id="zA";box.className="zh";
box.innerHTML=`<div class="zl">Z</div><h1>ZUNORO</h1><div class="zb">
<h2 id="zt"></h2>
<input id="znm" class="zn" placeholder="आपका नाम" autocomplete="name">
<input id="zem" type="email" placeholder="Email" autocomplete="email">
<input id="zpw" type="password" placeholder="Password (कम से कम 6 अक्षर)" autocomplete="current-password">
<div class="zm" id="zm"></div>
<button id="zgo"></button>
<button id="zgg" class="zg">Google से जारी रखें</button>
<a id="zl1"></a><a id="zl2"></a></div>`;
document.body.appendChild(box);

const out=document.createElement("button");
out.id="zO";out.textContent="Logout";
out.onclick=()=>signOut(auth);
document.body.appendChild(out);

const $=id=>document.getElementById(id);
const errs={"auth/invalid-credential":"Email या Password गलत है।","auth/invalid-email":"Email सही नहीं है।","auth/email-already-in-use":"यह Email पहले से रजिस्टर है। Login करें।","auth/weak-password":"Password कम से कम 6 अक्षर का रखें।","auth/user-not-found":"इस Email का अकाउंट नहीं मिला।","auth/network-request-failed":"इंटरनेट चेक करें।","auth/popup-closed-by-user":"Google login बंद कर दिया गया।","auth/too-many-requests":"बहुत कोशिशें हो गईं, थोड़ी देर बाद करें।"};
const say=(m,ok)=>{$("zm").textContent=m;$("zm").className="zm"+(ok?" ok":"")};
let mode="login";

function setMode(m){
  mode=m;say("");
  $("znm").style.display=m==="signup"?"block":"none";
  $("zpw").style.display=m==="forgot"?"none":"block";
  $("zgg").style.display=m==="forgot"?"none":"block";
  const T={login:["Login","Login करें","अकाउंट बनाएँ","signup","Password भूल गए?","forgot"],
           signup:["Create Account","अकाउंट बनाएँ","पहले से अकाउंट है? Login","login","",""],
           forgot:["Password रीसेट","रीसेट लिंक भेजें","वापस Login पर जाएँ","login","",""]}[m];
  $("zt").textContent=T[0];$("zgo").textContent=T[1];
  $("zl1").textContent=T[2];$("zl1").onclick=()=>setMode(T[3]);
  $("zl2").textContent=T[4];$("zl2").onclick=()=>T[5]&&setMode(T[5]);
}
$("zgo").onclick=async()=>{
  const e=$("zem").value.trim(),p=$("zpw").value;
  if(!e)return say("Email डालें।");
  $("zgo").disabled=true;
  try{
    if(mode==="login")await signInWithEmailAndPassword(auth,e,p);
    else if(mode==="signup"){
      const n=$("znm").value.trim();
      const c=await createUserWithEmailAndPassword(auth,e,p);
      if(n)await updateProfile(c.user,{displayName:n});
    }else{
      await sendPasswordResetEmail(auth,e);
      say("रीसेट लिंक आपके Email पर भेज दिया गया है।",true);
    }
  }catch(x){say(errs[x.code]||"कुछ गड़बड़ हुई: "+x.code)}
  $("zgo").disabled=false;
};
$("zgg").onclick=async()=>{
  try{await signInWithPopup(auth,new GoogleAuthProvider())}
  catch(x){say(errs[x.code]||"Google login नहीं हो सका: "+x.code)}
};

setMode("login");
onAuthStateChanged(auth,u=>{
  box.classList.toggle("zh",!!u);
  out.style.display=u?"block":"none";
  window.zunoroUser=u;
  setTimeout(()=>{splash.classList.add("o");setTimeout(()=>splash.remove(),700)},1800);
});
