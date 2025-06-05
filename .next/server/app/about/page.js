(()=>{var e={};e.id=220,e.ids=[220],e.modules={438:(e,t,r)=>{"use strict";r.r(t),r.d(t,{DarkModeToggle:()=>o});let o=(0,r(2907).registerClientReference)(function(){throw Error("Attempted to call DarkModeToggle() from the server but DarkModeToggle is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/components/darkModeToggle.js","DarkModeToggle")},766:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Sticky:()=>l});var o=r(687),n=r(3210),i=r(4159),s=r(2391),a=r(1085);let l=()=>{let{$darkMode:e}=(0,n.useContext)(s.A);return(0,o.jsx)(c,{$darkMode:e,children:(0,o.jsxs)("div",{children:[(0,o.jsx)("h3",{children:"Where to find me"}),(0,o.jsx)(d,{href:"https://www.linkedin.com/in/amykwak/",target:"_blank",color:"#0073b1",children:"LinkedIn"}),(0,o.jsx)(d,{href:"https://github.com/amyKwak",target:"_blank",color:"#24292e",children:"GitHub"}),(0,o.jsx)(d,{href:"mailto:yoomikwak@gmail.com",color:"#d93025",children:"Mail"})]})})};l.propTypes={};let c=i.Ay.section`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  padding: 1.5rem 3rem 1.6rem;
  background-color: ${e=>e.$darkMode?a.A.colors.black:a.A.colors.white};

  div {
    display: flex;
    flex-direction: row;
    align-items: center;

    h3 {
      color: ${e=>e.$darkMode?a.A.colors.white:a.A.colors.black};
      margin: 0;
      line-height: 1;
      margin-right: 1rem;
    }
  }
`,d=i.Ay.a`
  display: inline-block;
  padding: 0.7rem;
  line-height: 1;
  margin: 5px;
  color: ${a.A.colors.white};
  background: ${e=>e.color};
  font-size: 1.6rem;
  border-radius: 5px;
`},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},941:(e,t,r)=>{"use strict";r.d(t,{ThemeProvider:()=>n});var o=r(2907);(0,o.registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/amy/amy-decoded/app/contexts/ThemeContext.js\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/contexts/ThemeContext.js","default");let n=(0,o.registerClientReference)(function(){throw Error("Attempted to call ThemeProvider() from the server but ThemeProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/contexts/ThemeContext.js","ThemeProvider")},1026:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Content:()=>o});let o=(0,r(2907).registerClientReference)(function(){throw Error("Attempted to call Content() from the server but Content is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/about/components/Content.jsx","Content")},1085:(e,t,r)=>{"use strict";r.d(t,{A:()=>o});let o={colors:{blue:"#3371FF",white:"#FFFFFF",black:"#1A202C"},devices:{tablet:"(max-width: 991.98px)"},fonts:{primary:"'Manrope', sans-serif"}}},2107:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Layout:()=>d});var o=r(687),n=r(3210),i=r(7955),s=r.n(i),a=r(4159),l=r(2391),c=r(1085);r(6823);let d=({children:e})=>{let{$darkMode:t}=(0,n.useContext)(l.A);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("link",{href:"https://fonts.googleapis.com/css?family=Catamaran:900&display=swap",rel:"stylesheet"}),(0,o.jsx)("link",{href:"https://fonts.googleapis.com/css?family=Roboto&display=swap",rel:"stylesheet"}),(0,o.jsx)(u,{$darkMode:t}),(0,o.jsx)("main",{children:e})]})};d.propTypes={children:s().node.isRequired};let u=(0,a.DU)`
  html {
    font-family: 'Catamaran', sans-serif;
    font-size: 10px;
  }
  html, body, #___gatsby, #gatsby-focus-wrapper, main {
    height: 100%;
    background: ${e=>e.$darkMode?c.A.colors.black:c.A.colors.white};
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  h1 {
    font-size: 12rem;
    font-weight: bold;
    line-height: 1;
    margin: 0 0 1rem;

    @media ${c.A.devices.tablet} {
      font-size: 10rem
    }
  }
  h2 {
    font-size: 3.8rem;
    margin: 0 0 2rem;
    line-height: 1.3;
    color: ${e=>e.$darkMode?c.A.colors.white:c.A.colors.black};
    
    @media ${c.A.devices.tablet} {
      font-size: 3rem
    }
    
    strong {
      color: ${c.A.colors.blue};
    }
  }
  h3 {
    font-size: 2.5rem;
    line-height: 1.2;

    @media ${c.A.devices.tablet} {
      font-size: 2rem
    }
  }
  a, p {
    font-family: 'Roboto', sans-serif;
    font-size: 1.3rem;
    line-height: 1.8;
    color: ${e=>e.$darkMode?c.A.colors.white:c.A.colors.black};
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
      color: ${e=>e.$darkMode?c.A.colors.white:c.A.colors.black};
    }
  }
`},2391:(e,t,r)=>{"use strict";r.d(t,{A:()=>d,ThemeProvider:()=>c});var o=r(687),n=r(3210),i=r(7955),s=r.n(i);let a={$darkMode:!1,setDarkMode:()=>{}},l=(0,n.createContext)(a),c=({children:e})=>{let[t,r]=(0,n.useState)(a.$darkMode);return(0,n.useEffect)(()=>{let e=localStorage.getItem("dark");null!==e&&r(JSON.parse(e))},[]),(0,o.jsx)(l.Provider,{value:{$darkMode:t,setDarkMode:e=>{r(e),localStorage.setItem("dark",JSON.stringify(e))}},children:e})};c.propTypes={children:s().node.isRequired};let d=l},2648:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>l,metadata:()=>a});var o=r(7413),n=r(3124),i=r.n(n);r(2704);var s=r(6800);let a={title:"Amy Kwak - Software Engineer",description:"Frontend Software Engineer. Explore my work."};function l({children:e}){return(0,o.jsxs)("html",{lang:"en",children:[(0,o.jsx)(s.Analytics,{}),(0,o.jsx)("body",{className:i().className,children:e})]})}},2704:()=>{},2804:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Content:()=>d});var o=r(687),n=r(3210),i=r(4159),s=r(7955),a=r.n(s),l=r(1085),c=r(2391);function d({children:e}){let{$darkMode:t}=(0,n.useContext)(c.A);return(0,o.jsx)(u,{$darkMode:t,children:e})}d.propTypes={children:a().node};let u=i.Ay.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 3rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: end;
  padding-bottom: 15vh;
  h1 {
    width: 100%;
    font-size: 8rem;
    color: ${e=>e.$darkMode?l.A.colors.white:l.A.colors.black};

    @media ${l.A.devices.tablet} {
      font-size: 5rem;
    }

    span {
      color: ${l.A.colors.blue};
    }
  }
  h3 {
    color: ${e=>e.$darkMode?l.A.colors.white:l.A.colors.black};
    font-size: 2.5rem;

    @media ${l.A.devices.tablet} {
      font-size: 1.8rem;
    }

    span {
      color: ${l.A.colors.blue};
    }
  }
`},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3162:(e,t,r)=>{Promise.resolve().then(r.bind(r,8633))},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3676:(e,t,r)=>{"use strict";r.r(t),r.d(t,{DarkModeToggle:()=>l});var o=r(687);r(3210);var n=r(7955),i=r.n(n),s=r(4159),a=r(1085);function l({$darkMode:e,onClick:t}){return(0,o.jsx)(c,{$darkMode:e,onClick:t,"aria-label":`Activate ${!e?"dark":"light"} mode`,title:`Activate ${!e?"dark":"light"} mode`,children:(0,o.jsx)(p,{$darkMode:e})})}l.propTypes={$darkMode:i().bool,onClick:()=>{}};let c=s.Ay.button`
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
`,d=()=>(0,s.AH)`
  background-color: ${a.A.colors.white};
  transform: scale(0.55);
  overflow: visible;

  &:before {
    background-color: ${a.A.colors.black};
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
`,u=()=>(0,s.AH)`
  background-color: ${a.A.colors.black};
  overflow: hidden;
  transform: scale(1);

  &:before {
    background-color: ${a.A.colors.white};
    border-color: ${a.A.colors.white};
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
`,p=s.Ay.div`
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

  ${e=>e.$darkMode&&d(e)};
  ${e=>!e.$darkMode&&u(e)};
`},3842:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Nav:()=>d});var o=r(687),n=r(3210),i=r(4159),s=r(7955),a=r.n(s),l=r(2391),c=r(1085);let d=({to:e,children:t})=>{let{$darkMode:r}=(0,n.useContext)(l.A);return(0,o.jsx)(u,{$darkMode:r,href:e,children:t})};d.propTypes={to:a().string.isRequired,children:a().node.isRequired};let u=i.Ay.a`
  position: relative;
  margin: 0 auto 3.6em;
  padding: 0 0.6rem;
  span {
    color: ${e=>e.$darkMode?c.A.colors.white:c.A.colors.black};
    z-index: 1;
    font-size: 1.6rem;
    line-height: 1.5;
    border-bottom: 1px dotted
      ${e=>e.$darkMode?c.A.colors.white:c.A.colors.black};
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
    background-color: ${c.A.colors.blue};
    z-index: 0;
  }
  &:hover {
    span {
      color: ${c.A.colors.white};
      border-color: ${c.A.colors.white};
    }
    &:after {
      height: 24px;
    }
  }
`},3873:e=>{"use strict";e.exports=require("path")},4090:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>s.a,__next_app__:()=>u,pages:()=>d,routeModule:()=>p,tree:()=>c});var o=r(5239),n=r(8088),i=r(8170),s=r.n(i),a=r(893),l={};for(let e in a)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>a[e]);r.d(t,l);let c={children:["",{children:["about",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,8157)),"/Users/amy/amy-decoded/app/about/page.js"]}]},{metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,6055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,2648)),"/Users/amy/amy-decoded/app/layout.js"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,7398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,9999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,5284,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,6055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]}.children,d=["/Users/amy/amy-decoded/app/about/page.js"],u={require:r,loadChunk:()=>Promise.resolve()},p=new o.AppPageRouteModule({definition:{kind:n.RouteKind.APP_PAGE,page:"/about/page",pathname:"/about",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},4994:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Header:()=>c});var o=r(687),n=r(3210),i=r(4159),s=r(2391),a=r(1085),l=r(9143);let c=()=>{let{$darkMode:e,setDarkMode:t}=(0,n.useContext)(s.A);return(0,o.jsxs)(d,{children:[(0,o.jsxs)(u,{href:"/",$darkMode:e,children:["A",(0,o.jsx)("span",{children:"/"}),"K"]}),(0,o.jsx)(p,{children:(0,o.jsx)(l.Yk,{$darkMode:e,onClick:()=>{t(!e)}})})]})},d=i.Ay.header`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 3rem;
`,u=i.Ay.a`
  font-family: "Catamaran", sans-serif;
  font-size: 2.7rem;
  color: ${e=>e.$darkMode?a.A.colors.white:a.A.colors.black};
  transition: color 0.25s ease-in-out;
  will-change: opacity;

  span {
    color: ${a.A.colors.blue};
    transition: color 0.25s ease-in-out;
    will-change: opacity;
  }

  &:hover {
    color: ${a.A.colors.blue};

    span {
      color: ${e=>e.$darkMode?a.A.colors.white:a.A.colors.black};
    }
  }
`,p=i.Ay.div`
  padding-top: 0.2rem;
`},5010:(e,t,r)=>{Promise.resolve().then(r.bind(r,6800))},6055:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>n});var o=r(1658);let n=async e=>[{type:"image/x-icon",sizes:"16x16",url:(0,o.fillMetadataSegment)(".",await e.params,"favicon.ico")+""}]},6170:(e,t,r)=>{Promise.resolve().then(r.bind(r,2804)),Promise.resolve().then(r.bind(r,766)),Promise.resolve().then(r.bind(r,3676)),Promise.resolve().then(r.bind(r,4994)),Promise.resolve().then(r.bind(r,2107)),Promise.resolve().then(r.bind(r,3842)),Promise.resolve().then(r.bind(r,2391))},6428:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Sticky:()=>o});let o=(0,r(2907).registerClientReference)(function(){throw Error("Attempted to call Sticky() from the server but Sticky is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/about/components/Sticky.jsx","Sticky")},7620:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Header:()=>o});let o=(0,r(2907).registerClientReference)(function(){throw Error("Attempted to call Header() from the server but Header is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/components/Header.jsx","Header")},7762:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Layout:()=>o});let o=(0,r(2907).registerClientReference)(function(){throw Error("Attempted to call Layout() from the server but Layout is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/components/Layout.jsx","Layout")},7910:e=>{"use strict";e.exports=require("stream")},8157:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>x});var o=r(7413),n=r(1120),i=r.n(n),s=r(7620),a=r(7762);function l(e,t,r,o){return new(r||(r=Promise))(function(n,i){function s(e){try{l(o.next(e))}catch(e){i(e)}}function a(e){try{l(o.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?n(e.value):((t=e.value)instanceof r?t:new r(function(e){e(t)})).then(s,a)}l((o=o.apply(e,t||[])).next())})}function c(e,t){var r,o,n,i,s={label:0,sent:function(){if(1&n[0])throw n[1];return n[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){var l=[i,a];if(r)throw TypeError("Generator is already executing.");for(;s;)try{if(r=1,o&&(n=2&l[0]?o.return:l[0]?o.throw||((n=o.return)&&n.call(o),0):o.next)&&!(n=n.call(o,l[1])).done)return n;switch(o=0,n&&(l=[2&l[0],n.value]),l[0]){case 0:case 1:n=l;break;case 4:return s.label++,{value:l[1],done:!1};case 5:s.label++,o=l[1],l=[0];continue;case 7:l=s.ops.pop(),s.trys.pop();continue;default:if(!(n=(n=s.trys).length>0&&n[n.length-1])&&(6===l[0]||2===l[0])){s=0;continue}if(3===l[0]&&(!n||l[1]>n[0]&&l[1]<n[3])){s.label=l[1];break}if(6===l[0]&&s.label<n[1]){s.label=n[1],n=l;break}if(n&&s.label<n[2]){s.label=n[2],s.ops.push(l);break}n[2]&&s.ops.pop(),s.trys.pop();continue}l=t.call(e,s)}catch(e){l=[6,e],o=0}finally{r=n=0}if(5&l[0])throw l[1];return{value:l[0]?l[1]:void 0,done:!0}}}}function d(e){var t="function"==typeof Symbol&&Symbol.iterator,r=t&&e[t],o=0;if(r)return r.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&o>=e.length&&(e=void 0),{value:e&&e[o++],done:!e}}};throw TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function u(e,t){var r="function"==typeof Symbol&&e[Symbol.iterator];if(!r)return e;var o,n,i=r.call(e),s=[];try{for(;(void 0===t||t-- >0)&&!(o=i.next()).done;)s.push(o.value)}catch(e){n={error:e}}finally{try{o&&!o.done&&(r=i.return)&&r.call(i)}finally{if(n)throw n.error}}return s}function p(e,t,r){if(r||2==arguments.length)for(var o,n=0,i=t.length;n<i;n++)!o&&n in t||(o||(o=Array.prototype.slice.call(t,0,n)),o[n]=t[n]);return e.concat(o||Array.prototype.slice.call(t))}function h(e,t,r,o,n){for(var i=[],s=5;s<arguments.length;s++)i[s-5]=arguments[s];return l(this,void 0,void 0,function(){var s,a,h,m,b;return c(this,function(v){switch(v.label){case 0:v.trys.push([0,12,13,14]),a=(s=d(i)).next(),v.label=1;case 1:if(a.done)return[3,11];switch(typeof(h=a.value)){case"string":return[3,2];case"number":return[3,4];case"function":return[3,6]}return[3,8];case 2:return[4,function(e,t,r,o,n,i){return l(this,void 0,void 0,function(){var s,a;return c(this,function(h){switch(h.label){case 0:var m,b;return m=s=e.textContent||"",b=u(r).slice(0),a=p(p([],u(m),!1),[NaN],!1).findIndex(function(e,t){return b[t]!==e}),[4,function(e,t,r,o,n){return l(this,void 0,void 0,function(){var i,s,a,l,p,h,m,b,v,x,y,g;return c(this,function(k){switch(k.label){case 0:if(i=t,n){for(s=0,a=1;a<t.length;a++)if(p=(l=u([t[a-1],t[a]],2))[0],(h=l[1]).length>p.length||""===h){s=a;break}i=t.slice(s,t.length)}k.label=1;case 1:k.trys.push([1,6,7,8]),b=(m=d(function(e){var t,r,o,n,i,s;return c(this,function(a){switch(a.label){case 0:t=function(e){return c(this,function(t){switch(t.label){case 0:return[4,{op:function(t){return requestAnimationFrame(function(){return t.textContent=e})},opCode:function(t){var r=t.textContent||"";return""===e||r.length>e.length?"DELETE":"WRITING"}}];case 1:return t.sent(),[2]}})},a.label=1;case 1:a.trys.push([1,6,7,8]),o=(r=d(e)).next(),a.label=2;case 2:return o.done?[3,5]:(n=o.value,[5,t(n)]);case 3:a.sent(),a.label=4;case 4:return o=r.next(),[3,2];case 5:return[3,8];case 6:return i={error:a.sent()},[3,8];case 7:try{o&&!o.done&&(s=r.return)&&s.call(r)}finally{if(i)throw i.error}return[7];case 8:return[2]}})}(i))).next(),k.label=2;case 2:return b.done?[3,5]:(x="WRITING"===(v=b.value).opCode(e)?r+r*(Math.random()-.5):o+o*(Math.random()-.5),v.op(e),[4,f(x)]);case 3:k.sent(),k.label=4;case 4:return b=m.next(),[3,2];case 5:return[3,8];case 6:return y={error:k.sent()},[3,8];case 7:try{b&&!b.done&&(g=m.return)&&g.call(m)}finally{if(y)throw y.error}return[7];case 8:return[2]}})})}(e,p(p([],u(function(e,t,r){var o,n;return void 0===r&&(r=0),c(this,function(i){switch(i.label){case 0:n=(o=t(e)).length,i.label=1;case 1:return n>r?[4,o.slice(0,--n).join("")]:[3,3];case 2:return i.sent(),[3,1];case 3:return[2]}})}(s,t,a)),!1),u(function(e,t,r){var o,n;return void 0===r&&(r=0),c(this,function(i){switch(i.label){case 0:n=(o=t(e)).length,i.label=1;case 1:return r<n?[4,o.slice(0,++r).join("")]:[3,3];case 2:return i.sent(),[3,1];case 3:return[2]}})}(r,t,a)),!1),o,n,i)];case 1:return h.sent(),[2]}})})}(e,t,h,r,o,n)];case 3:case 5:case 7:return v.sent(),[3,10];case 4:return[4,f(h)];case 6:return[4,h.apply(void 0,p([e,t,r,o,n],u(i),!1))];case 8:return[4,h];case 9:v.sent(),v.label=10;case 10:return a=s.next(),[3,1];case 11:return[3,14];case 12:return m={error:v.sent()},[3,14];case 13:try{a&&!a.done&&(b=s.return)&&b.call(s)}finally{if(m)throw m.error}return[7];case 14:return[2]}})})}function f(e){return l(this,void 0,void 0,function(){return c(this,function(t){switch(t.label){case 0:return[4,new Promise(function(t){return setTimeout(t,e)})];case 1:return t.sent(),[2]}})})}r(9060),!function(e,t){void 0===t&&(t={});var r=t.insertAt;if(e&&"undefined"!=typeof document){var o=document.head||document.getElementsByTagName("head")[0],n=document.createElement("style");n.type="text/css","top"===r&&o.firstChild?o.insertBefore(n,o.firstChild):o.appendChild(n),n.styleSheet?n.styleSheet.cssText=e:n.appendChild(document.createTextNode(e))}}(".index-module_type__E-SaG::after {\n  content: '|';\n  animation: index-module_cursor__PQg0P 1.1s infinite step-start;\n}\n\n@keyframes index-module_cursor__PQg0P {\n  50% {\n    opacity: 0;\n  }\n}\n"),(0,n.memo)((0,n.forwardRef)(function(e,t){var r=e.sequence,o=e.repeat,s=e.className,a=e.speed,l=void 0===a?40:a,c=e.deletionSpeed,d=e.omitDeletionAnimation,f=void 0!==d&&d,m=e.preRenderFirstString,b=e.wrapper,v=e.splitter,x=void 0===v?function(e){return p([],u(e),!1)}:v,y=e.cursor,g=void 0===y||y,k=e.style,w=function(e,t){var r={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&0>t.indexOf(o)&&(r[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(o=Object.getOwnPropertySymbols(e);n<o.length;n++)0>t.indexOf(o[n])&&Object.prototype.propertyIsEnumerable.call(e,o[n])&&(r[o[n]]=e[o[n]])}return r}(e,["sequence","repeat","className","speed","deletionSpeed","omitDeletionAnimation","preRenderFirstString","wrapper","splitter","cursor","style"]),A=w["aria-label"],j=w["aria-hidden"],C=w.role;c||(c=l);var P=[,,].fill(40);[l,c].forEach(function(e,t){switch(typeof e){case"number":P[t]=Math.abs(e-100);break;case"object":var r=e.type,o=e.value;if("number"!=typeof o)break;"keyStrokeDelayInMs"===r&&(P[t]=o)}});var $,M,S,E,T,_,R,z,N=P[0],I=P[1],q=(void 0===$&&($=null),M=(0,n.useRef)($),(0,n.useEffect)(function(){t&&("function"==typeof t?t(M.current):t.current=M.current)},[t]),M),D="index-module_type__E-SaG";S=s?"".concat(g?D+" ":"").concat(s):g?D:"",E=(0,n.useRef)(function(){var e,t=r;o===1/0?e=h:"number"==typeof o&&(t=Array(1+o).fill(r).flat());var n=e?p(p([],u(t),!1),[e],!1):p([],u(t),!1);return h.apply(void 0,p([q.current,x,N,I,f],u(n),!1)),function(){q.current}}),T=(0,n.useRef)(),_=(0,n.useRef)(!1),R=(0,n.useRef)(!1),z=u((0,n.useState)(0),2)[1],_.current&&(R.current=!0),(0,n.useEffect)(function(){return _.current||(T.current=E.current(),_.current=!0),z(function(e){return e+1}),function(){R.current&&T.current&&T.current()}},[]);var F=void 0!==m&&m?r.find(function(e){return"string"==typeof e})||"":null;return i().createElement(void 0===b?"span":b,{"aria-hidden":j,"aria-label":A,role:C,style:k,className:S,children:A?i().createElement("span",{"aria-hidden":"true",ref:q,children:F}):F,ref:A?void 0:q})}),function(e,t){return!0}),r(438);var m=r(1026),b=r(6428),v=r(941);let x=()=>(0,o.jsx)(v.ThemeProvider,{children:(0,o.jsxs)(a.Layout,{children:[(0,o.jsx)(s.Header,{}),(0,o.jsxs)(m.Content,{children:[(0,o.jsxs)("h1",{children:[(0,o.jsx)("span",{children:"Software Engineer"}),(0,o.jsx)("br",{}),"Based in Seattle,",(0,o.jsx)("br",{})]}),(0,o.jsxs)("h3",{children:["I’m passionate about creating ",(0,o.jsx)("span",{children:"user-centered interfaces"})," ","that blend thoughtful design with delightful interactions. With 2 years of experience developing ",(0,o.jsx)("span",{children:"frontend solutions"}),", I thrive on crafting experiences that connect people to technology in meaningful ways."]})]}),(0,o.jsx)(b.Sticky,{})]})})},8192:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,6346,23)),Promise.resolve().then(r.t.bind(r,7924,23)),Promise.resolve().then(r.t.bind(r,5656,23)),Promise.resolve().then(r.t.bind(r,99,23)),Promise.resolve().then(r.t.bind(r,8243,23)),Promise.resolve().then(r.t.bind(r,8827,23)),Promise.resolve().then(r.t.bind(r,2763,23)),Promise.resolve().then(r.t.bind(r,7173,23))},8464:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,6444,23)),Promise.resolve().then(r.t.bind(r,6042,23)),Promise.resolve().then(r.t.bind(r,8170,23)),Promise.resolve().then(r.t.bind(r,9477,23)),Promise.resolve().then(r.t.bind(r,9345,23)),Promise.resolve().then(r.t.bind(r,2089,23)),Promise.resolve().then(r.t.bind(r,6577,23)),Promise.resolve().then(r.t.bind(r,1307,23))},9060:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Nav:()=>o});let o=(0,r(2907).registerClientReference)(function(){throw Error("Attempted to call Nav() from the server but Nav is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/amy/amy-decoded/app/components/Nav.jsx","Nav")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9143:(e,t,r)=>{"use strict";r.d(t,{Yk:()=>d.DarkModeToggle,Y9:()=>o.Header,PE:()=>n.Layout,so:()=>i.Nav,yt:()=>c});var o=r(4994),n=r(2107),i=r(3842),s=r(687);r(3210);var a=r(8776);let l=["React","Next.js","MySQL","Node.js","Swift","Javascript."],c=()=>{let e=[];return l.forEach(t=>{e.push(t),e.push(1e3)}),(0,s.jsx)(a.d,{sequence:e,wrapper:"strong",speed:30,deletionSpeed:30,style:{fontSize:"2em",display:"inline-block"}})};var d=r(3676)},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9314:(e,t,r)=>{Promise.resolve().then(r.bind(r,1026)),Promise.resolve().then(r.bind(r,6428)),Promise.resolve().then(r.bind(r,438)),Promise.resolve().then(r.bind(r,7620)),Promise.resolve().then(r.bind(r,7762)),Promise.resolve().then(r.bind(r,9060)),Promise.resolve().then(r.bind(r,941))},9551:e=>{"use strict";e.exports=require("url")}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[447,785,658,684],()=>r(4090));module.exports=o})();