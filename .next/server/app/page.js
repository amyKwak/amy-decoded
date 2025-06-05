(()=>{var e={};e.id=974,e.ids=[974],e.modules={37:(e,r,t)=>{Promise.resolve().then(t.bind(t,8397))},309:(e,r,t)=>{Promise.resolve().then(t.bind(t,7791))},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},1085:(e,r,t)=>{"use strict";t.d(r,{A:()=>o});let o={colors:{blue:"#3371FF",white:"#FFFFFF",black:"#1A202C"},devices:{tablet:"(max-width: 991.98px)"},fonts:{primary:"'Manrope', sans-serif"}}},2107:(e,r,t)=>{"use strict";t.r(r),t.d(r,{Layout:()=>c});var o=t(687),s=t(3210),i=t(7955),a=t.n(i),n=t(4159),l=t(2391),d=t(1085);t(6823);let c=({children:e})=>{let{$darkMode:r}=(0,s.useContext)(l.A);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("link",{href:"https://fonts.googleapis.com/css?family=Catamaran:900&display=swap",rel:"stylesheet"}),(0,o.jsx)("link",{href:"https://fonts.googleapis.com/css?family=Roboto&display=swap",rel:"stylesheet"}),(0,o.jsx)(p,{$darkMode:r}),(0,o.jsx)("main",{children:e})]})};c.propTypes={children:a().node.isRequired};let p=(0,n.DU)`
  html {
    font-family: 'Catamaran', sans-serif;
    font-size: 10px;
  }
  html, body, #___gatsby, #gatsby-focus-wrapper, main {
    height: 100%;
    background: ${e=>e.$darkMode?d.A.colors.black:d.A.colors.white};
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  h1 {
    font-size: 12rem;
    font-weight: bold;
    line-height: 1;
    margin: 0 0 1rem;

    @media ${d.A.devices.tablet} {
      font-size: 10rem
    }
  }
  h2 {
    font-size: 3.8rem;
    margin: 0 0 2rem;
    line-height: 1.3;
    color: ${e=>e.$darkMode?d.A.colors.white:d.A.colors.black};
    
    @media ${d.A.devices.tablet} {
      font-size: 3rem
    }
    
    strong {
      color: ${d.A.colors.blue};
    }
  }
  h3 {
    font-size: 2.5rem;
    line-height: 1.2;

    @media ${d.A.devices.tablet} {
      font-size: 2rem
    }
  }
  a, p {
    font-family: 'Roboto', sans-serif;
    font-size: 1.3rem;
    line-height: 1.8;
    color: ${e=>e.$darkMode?d.A.colors.white:d.A.colors.black};
  }
  a {
    text-decoration: none;
  }
  main {
    display: flex;
    flex-direction: column;
  }
  ul {
    li {
      font-family: 'Roboto', sans-serif;
      font-size: 1.6rem;
      margin-bottom: 1rem;
      color: ${e=>e.$darkMode?d.A.colors.white:d.A.colors.black};
    }
  }
`},2391:(e,r,t)=>{"use strict";t.d(r,{A:()=>c,ThemeProvider:()=>d});var o=t(687),s=t(3210),i=t(7955),a=t.n(i);let n={$darkMode:!1,setDarkMode:()=>{}},l=(0,s.createContext)(n),d=({children:e})=>{let[r,t]=(0,s.useState)(n.$darkMode);return(0,s.useEffect)(()=>{let e=localStorage.getItem("dark");null!==e&&t(JSON.parse(e))},[]),(0,o.jsx)(l.Provider,{value:{$darkMode:r,setDarkMode:e=>{t(e),localStorage.setItem("dark",JSON.stringify(e))}},children:e})};d.propTypes={children:a().node.isRequired};let c=l},2648:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>l,metadata:()=>n});var o=t(7413),s=t(3124),i=t.n(s);t(2704);var a=t(6800);let n={title:"Amy Kwak - Software Engineer",description:"Frontend Software Engineer. Explore my work."};function l({children:e}){return(0,o.jsxs)("html",{lang:"en",children:[(0,o.jsx)(a.Analytics,{}),(0,o.jsx)("body",{className:i().className,children:e})]})}},2704:()=>{},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3162:(e,r,t)=>{Promise.resolve().then(t.bind(t,8633))},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3676:(e,r,t)=>{"use strict";t.r(r),t.d(r,{DarkModeToggle:()=>l});var o=t(687);t(3210);var s=t(7955),i=t.n(s),a=t(4159),n=t(1085);function l({$darkMode:e,onClick:r}){return(0,o.jsx)(d,{$darkMode:e,onClick:r,"aria-label":`Activate ${!e?"dark":"light"} mode`,title:`Activate ${!e?"dark":"light"} mode`,children:(0,o.jsx)(h,{$darkMode:e})})}l.propTypes={$darkMode:i().bool,onClick:()=>{}};let d=a.Ay.button`
  position: relative;
  align-items: center;
  background-color: transparent;
  border: 0;
  border-radius: 5px;
  display: inline-flex;
  cursor: pointer;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  width: 40px;
  height: 40px;
  transform: scale(0.8);
  outline: 0;
  padding: 0;
  margin: 0;
`,c=()=>(0,a.AH)`
  background-color: ${n.A.colors.white};
  transform: scale(0.55);
  overflow: visible;

  &:before {
    background-color: ${n.A.colors.black};
    opacity: 0;
    transform: translate(14px, -14px);
    border-image: initial;
    transition: transform 0.45s ease 0s;
  }

  &:after {
    box-shadow: rgb(255, 255, 255) 0px -23px 0px,
      rgb(255, 255, 255) 0px 23px 0px, rgb(255, 255, 255) 23px 0px 0px,
      rgb(255, 255, 255) -23px 0px 0px, rgb(255, 255, 255) 15px 15px 0px,
      rgb(255, 255, 255) -15px 15px 0px, rgb(255, 255, 255) 15px -15px 0px,
      rgb(255, 255, 255) -15px -15px 0px;
    transform: scale(1);
    transition: all 0.35s ease 0s;
  }
`,p=()=>(0,a.AH)`
  background-color: ${n.A.colors.black};
  overflow: hidden;
  transform: scale(1);

  &:before {
    background-color: ${n.A.colors.white};
    border-color: ${n.A.colors.white};
    opacity: 1;
    transform: translate(0, 0);
    transition: transform 0.45s ease;
  }

  &:after {
    box-shadow: 0 -23px 0 #1a202c, 0 23px 0 #1a202c, 23px 0 0 #1a202c,
      -23px 0 0 #1a202c, 15px 15px 0 #1a202c, -15px 15px 0 #1a202c,
      15px -15px 0 #1a202c, -15px -15px 0 #1a202c;
    transform: scale(0);
    transition: all 0.35s ease;
  }
`,h=a.Ay.div`
  position: relative;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  transition: all 0.45s ease 0s;

  &:before {
    content: "";
    border: 2px solid;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    position: absolute;
    right: -12px;
    top: -12px;
  }

  &:after {
    content: "";
    width: 8px;
    height: 8px;
    left: 50%;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    margin: -4px 0px 0px -4px;
  }

  ${e=>e.$darkMode&&c(e)};
  ${e=>!e.$darkMode&&p(e)};
`},3842:(e,r,t)=>{"use strict";t.r(r),t.d(r,{Nav:()=>c});var o=t(687),s=t(3210),i=t(4159),a=t(7955),n=t.n(a),l=t(2391),d=t(1085);let c=({to:e,children:r})=>{let{$darkMode:t}=(0,s.useContext)(l.A);return(0,o.jsx)(p,{$darkMode:t,href:e,children:r})};c.propTypes={to:n().string.isRequired,children:n().node.isRequired};let p=i.Ay.a`
  position: relative;
  margin: 0 auto 3.6em;
  padding: 0 0.6rem;
  span {
    color: ${e=>e.$darkMode?d.A.colors.white:d.A.colors.black};
    z-index: 1;
    font-size: 1.6rem;
    line-height: 1.5;
    border-bottom: 1px dotted
      ${e=>e.$darkMode?d.A.colors.white:d.A.colors.black};
    position: relative;
    transition: all 0.25s ease-in-out;
  }
  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    height: 0;
    width: 100%;
    transition: height 0.25s ease-in-out;
    will-change: transform;
    background-color: ${d.A.colors.blue};
    z-index: 0;
  }
  &:hover {
    span {
      color: ${d.A.colors.white};
      border-color: ${d.A.colors.white};
    }
    &:after {
      height: 24px;
    }
  }
`},3873:e=>{"use strict";e.exports=require("path")},4994:(e,r,t)=>{"use strict";t.r(r),t.d(r,{Header:()=>d});var o=t(687),s=t(3210),i=t(4159),a=t(2391),n=t(1085),l=t(9143);let d=()=>{let{$darkMode:e,setDarkMode:r}=(0,s.useContext)(a.A);return(0,o.jsxs)(c,{children:[(0,o.jsxs)(p,{href:"/",$darkMode:e,children:["A",(0,o.jsx)("span",{children:"/"}),"K"]}),(0,o.jsx)(h,{children:(0,o.jsx)(l.Yk,{$darkMode:e,onClick:()=>{r(!e)}})})]})},c=i.Ay.header`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 3rem;
`,p=i.Ay.a`
  font-family: "Catamaran", sans-serif;
  font-size: 2.7rem;
  color: ${e=>e.$darkMode?n.A.colors.white:n.A.colors.black};
  transition: color 0.25s ease-in-out;
  will-change: opacity;

  span {
    color: ${n.A.colors.blue};
    transition: color 0.25s ease-in-out;
    will-change: opacity;
  }

  &:hover {
    color: ${n.A.colors.blue};

    span {
      color: ${e=>e.$darkMode?n.A.colors.white:n.A.colors.black};
    }
  }
`,h=i.Ay.div`
  padding-top: 0.2rem;
`},5010:(e,r,t)=>{Promise.resolve().then(t.bind(t,6800))},6055:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>s});var o=t(1658);let s=async e=>[{type:"image/x-icon",sizes:"16x16",url:(0,o.fillMetadataSegment)(".",await e.params,"favicon.ico")+""}]},7791:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>l});var o=t(687);t(3210);var s=t(4159),i=t(1085),a=t(9143),n=t(2391);let l=()=>(0,o.jsx)(n.ThemeProvider,{children:(0,o.jsxs)(a.PE,{children:[(0,o.jsx)(a.Y9,{}),(0,o.jsxs)(d,{children:[(0,o.jsx)(a.so,{to:"/about",children:(0,o.jsx)("span",{children:"Who am I?"})}),(0,o.jsx)("h1",{children:"Amy Kwak"}),(0,o.jsxs)("h2",{children:["Software Engineer who likes building stuff with",(0,o.jsx)("br",{}),(0,o.jsx)(a.yt,{})]})]})]})}),d=s.Ay.section`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  text-align: center;
  padding: 1.5rem 3rem;
  h1 {
    color: ${i.A.colors.blue};
  }
  h2 {
    span {
      color: white;
    }
    .Cursor {
      visibility: hidden;
    }
  }
`;s.Ay.footer`
  padding-top: 2rem;
  a {
    color: ${i.A.colors.blue};
    text-decoration-line: underline;
    text-decoration-style: dotted;
  }
`},7910:e=>{"use strict";e.exports=require("stream")},8192:(e,r,t)=>{Promise.resolve().then(t.t.bind(t,6346,23)),Promise.resolve().then(t.t.bind(t,7924,23)),Promise.resolve().then(t.t.bind(t,5656,23)),Promise.resolve().then(t.t.bind(t,99,23)),Promise.resolve().then(t.t.bind(t,8243,23)),Promise.resolve().then(t.t.bind(t,8827,23)),Promise.resolve().then(t.t.bind(t,2763,23)),Promise.resolve().then(t.t.bind(t,7173,23))},8226:(e,r,t)=>{"use strict";t.r(r),t.d(r,{GlobalError:()=>a.a,__next_app__:()=>p,pages:()=>c,routeModule:()=>h,tree:()=>d});var o=t(5239),s=t(8088),i=t(8170),a=t.n(i),n=t(893),l={};for(let e in n)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>n[e]);t.d(r,l);let d={children:["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,8397)),"/Users/amy/amy-decoded/app/page.js"],metadata:{icon:[async e=>(await Promise.resolve().then(t.bind(t,6055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(t.bind(t,2648)),"/Users/amy/amy-decoded/app/layout.js"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,7398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(t.t.bind(t,9999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(t.t.bind(t,5284,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async e=>(await Promise.resolve().then(t.bind(t,6055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]}.children,c=["/Users/amy/amy-decoded/app/page.js"],p={require:t,loadChunk:()=>Promise.resolve()},h=new o.AppPageRouteModule({definition:{kind:s.RouteKind.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},8397:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>o});let o=(0,t(2907).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/amy/amy-decoded/app/page.js\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/page.js","default")},8464:(e,r,t)=>{Promise.resolve().then(t.t.bind(t,6444,23)),Promise.resolve().then(t.t.bind(t,6042,23)),Promise.resolve().then(t.t.bind(t,8170,23)),Promise.resolve().then(t.t.bind(t,9477,23)),Promise.resolve().then(t.t.bind(t,9345,23)),Promise.resolve().then(t.t.bind(t,2089,23)),Promise.resolve().then(t.t.bind(t,6577,23)),Promise.resolve().then(t.t.bind(t,1307,23))},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9143:(e,r,t)=>{"use strict";t.d(r,{Yk:()=>c.DarkModeToggle,Y9:()=>o.Header,PE:()=>s.Layout,so:()=>i.Nav,yt:()=>d});var o=t(4994),s=t(2107),i=t(3842),a=t(687);t(3210);var n=t(8776);let l=["React","Next.js","MySQL","Node.js","Swift","Javascript."],d=()=>{let e=[];return l.forEach(r=>{e.push(r),e.push(1e3)}),(0,a.jsx)(n.d,{sequence:e,wrapper:"strong",speed:30,deletionSpeed:30,style:{fontSize:"2em",display:"inline-block"}})};var c=t(3676)},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9551:e=>{"use strict";e.exports=require("url")}};var r=require("../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[447,785,658,684],()=>t(8226));module.exports=o})();