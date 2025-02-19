'use strict';

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t="lit-localize-status",e=(t,e,i)=>{let s=t[0];for(let o=1;o<t.length;o++)s+=e[i?i[o-1]:o-1],s+=t[o];return s},i=t=>{return "string"!=typeof(i=t)&&"strTag"in i?e(t.strings,t.values):t;var i;};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let s=i,o=false;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class r{constructor(t){this.C=t=>{"ready"===t.detail.status&&this.host.requestUpdate();},this.host=t;}hostConnected(){window.addEventListener(t,this.C);}hostDisconnected(){window.removeEventListener(t,this.C);}}const n=t=>t.addController(new r(t)),h=()=>(t,e)=>(t.addInitializer(n),t)
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;class c{constructor(){this.settled=false,this.promise=new Promise(((t,e)=>{this._resolve=t,this._reject=e;}));}resolve(t){this.settled=true,this._resolve(t);}reject(t){this.settled=true,this._reject(t);}}
/**
 * @license
 * Copyright 2014 Travis Webb
 * SPDX-License-Identifier: MIT
 */const a=[];for(let t=0;t<256;t++)a[t]=(t>>4&15).toString(16)+(15&t).toString(16);function l(t,e){return (e?"h":"s")+function(t){let e=0,i=8997,s=0,o=33826,r=0,n=40164,h=0,c=52210;for(let a=0;a<t.length;a++)i^=t.charCodeAt(a),e=435*i,s=435*o,r=435*n,h=435*c,r+=i<<8,h+=o<<8,s+=e>>>16,i=65535&e,r+=s>>>16,o=65535&s,c=h+(r>>>16)&65535,n=65535&r;return a[c>>8]+a[255&c]+a[n>>8]+a[255&n]+a[o>>8]+a[255&o]+a[i>>8]+a[255&i]}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */("string"==typeof t?t:t.join(""))}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const u=new WeakMap,d=new Map;function f(t,s,o){if(t){const i=o?.id??function(t){const e="string"==typeof t?t:t.strings;let i=d.get(e);void 0===i&&(i=l(e,"string"!=typeof t&&!("strTag"in t)),d.set(e,i));return i}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */(s),r=t[i];if(r){if("string"==typeof r)return r;if("strTag"in r)return e(r.strings,s.values,r.values);{let t=u.get(r);return void 0===t&&(t=r.values,u.set(r,t)),{...r,values:t.map((t=>s.values[t]))}}}}return i(s)}function p(e){window.dispatchEvent(new CustomEvent(t,{detail:e}));}let w,v,g,b,m,y="",k=new c;k.resolve();let S=0;const $=()=>y,C=t=>{if(t===(w??y))return k.promise;if(!g||!b)throw new Error("Internal error");if(!g.has(t))throw new Error("Invalid locale code");S++;const e=S;w=t,k.settled&&(k=new c),p({status:"loading",loadingLocale:t});return (t===v?Promise.resolve({templates:void 0}):b(t)).then((i=>{S===e&&(y=t,w=void 0,m=i.templates,p({status:"ready",readyLocale:t}),k.resolve());}),(i=>{S===e&&(p({status:"error",errorLocale:t,errorMessage:i.toString()}),k.reject(i));})),k.promise},x=["af","am","ar","ay","az","be","bg","bi","bn","bs","ca","ch","cs","cy","da","de","dv","dz","el","es","et","eu","fa","fi","fj","fr","ga","gd","gl","gn","gv","he","hi","ho","hr","ht","hu","hy","id","is","it","ja","ka","kk","kl","km","ko","ku","ky","la","lb","lo","lt","lv","mg","mh","mi","mk","mn","ms","mt","my","na","nb","nd","ne","nl","nr","ny","pap","pl","prs","ps","pt","qu","rn","ro","ru","rw","sg","si","sk","sl","sm","sn","so","sq","sr","ss","st","sv","sw","ta","tg","th","ti","tk","tl","tn","to","tr","ts","uk","ur","uz","ve","vi","xh","zh","zu"],{getLocale:E,setLocale:T}=(M={sourceLocale:"en",targetLocales:x,loadLocale:t=>import(`./localization/locales/${t}.js`)},function(t){if(o)throw new Error("lit-localize can only be configured once");s=t,o=true;}(((t,e)=>f(m,t,e))),y=v=M.sourceLocale,g=new Set(M.targetLocales),g.add(M.sourceLocale),b=M.loadLocale,{getLocale:$,setLocale:C});var M;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function j(t,e,i,s){for(var o,r=arguments.length,n=r<3?e:s,h=t.length-1;h>=0;h--)(o=t[h])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}(async()=>{try{await T((navigator.language||navigator.languages[0]).split("-")[0]);}catch(t){console.error(`Error loading locale: ${t.message}`);}})();const _=globalThis,z=_.ShadowRoot&&(void 0===_.ShadyCSS||_.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,A=Symbol(),O=new WeakMap;let U=class{constructor(t,e,i){if(this._$cssResult$=true,i!==A)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const e=this.t;if(z&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=O.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&O.set(e,t));}return t}toString(){return this.cssText}};const P=t=>new U("string"==typeof t?t:t+"",void 0,A),q=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new U(i,t,A)},W=z?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return P(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,{is:L,defineProperty:R,getOwnPropertyDescriptor:I,getOwnPropertyNames:N,getOwnPropertySymbols:D,getPrototypeOf:B}=Object,V=globalThis,Z=V.trustedTypes,H=Z?Z.emptyScript:"",F=V.reactiveElementPolyfillSupport,G=(t,e)=>t,J={toAttribute(t,e){switch(e){case Boolean:t=t?H:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},K=(t,e)=>!L(t,e),Q={attribute:true,type:String,converter:J,reflect:false,hasChanged:K};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;class Y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Q){if(e.state&&(e.attribute=false),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&R(this.prototype,t,s);}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=I(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t;}};return {get(){return s?.call(this)},set(e){const r=s?.call(this);o.call(this,e),this.requestUpdate(t,r,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??Q}static _$Ei(){if(this.hasOwnProperty(G("elementProperties")))return;const t=B(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(G("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(G("properties"))){const t=this.properties,e=[...N(t),...D(t)];for(const i of e)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(W(t));}else void 0!==t&&e.push(W(t));return e}static _$Eu(t,e){const i=e.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ((t,e)=>{if(z)t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const i of e){const e=document.createElement("style"),s=_.litNonce;void 0!==s&&e.setAttribute("nonce",s),e.textContent=i.cssText,t.appendChild(e);}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,e,i){this._$AK(t,i);}_$EC(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&true===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:J).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null;}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:J;this._$Em=s,this[s]=o.fromAttribute(e,t.type),this._$Em=null;}}requestUpdate(t,e,i){if(void 0!==t){if(i??=this.constructor.getPropertyOptions(t),!(i.hasChanged??K)(this[t],e))return;this.P(t,e,i);} false===this.isUpdatePending&&(this._$ES=this._$ET());}P(t,e,i){this._$AL.has(t)||this._$AL.set(t,e),true===i.reflect&&this._$Em!==t&&(this._$Ej??=new Set).add(t);}async _$ET(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t) true!==i.wrapped||this._$AL.has(e)||void 0===this[e]||this.P(e,this[e],i);}let t=false;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(e)):this._$EU();}catch(e){throw t=false,this._$EU(),e}t&&this._$AE(e);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EU(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Ej&&=this._$Ej.forEach((t=>this._$EC(t,this[t]))),this._$EU();}updated(t){}firstUpdated(t){}}Y.elementStyles=[],Y.shadowRootOptions={mode:"open"},Y[G("elementProperties")]=new Map,Y[G("finalized")]=new Map,F?.({ReactiveElement:Y}),(V.reactiveElementVersions??=[]).push("2.0.4");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X=globalThis,tt=X.trustedTypes,et=tt?tt.createPolicy("lit-html",{createHTML:t=>t}):void 0,it="$lit$",st=`lit$${Math.random().toFixed(9).slice(2)}$`,ot="?"+st,rt=`<${ot}>`,nt=document,ht=()=>nt.createComment(""),ct=t=>null===t||"object"!=typeof t&&"function"!=typeof t,at=Array.isArray,lt="[ \t\n\f\r]",ut=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,dt=/-->/g,ft=/>/g,pt=RegExp(`>|${lt}(?:([^\\s"'>=/]+)(${lt}*=${lt}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),wt=/'/g,vt=/"/g,gt=/^(?:script|style|textarea|title)$/i,bt=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),mt=Symbol.for("lit-noChange"),yt=Symbol.for("lit-nothing"),kt=new WeakMap,St=nt.createTreeWalker(nt,129);function $t(t,e){if(!at(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==et?et.createHTML(e):e}const Ct=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":3===e?"<math>":"",n=ut;for(let e=0;e<i;e++){const i=t[e];let h,c,a=-1,l=0;for(;l<i.length&&(n.lastIndex=l,c=n.exec(i),null!==c);)l=n.lastIndex,n===ut?"!--"===c[1]?n=dt:void 0!==c[1]?n=ft:void 0!==c[2]?(gt.test(c[2])&&(o=RegExp("</"+c[2],"g")),n=pt):void 0!==c[3]&&(n=pt):n===pt?">"===c[0]?(n=o??ut,a=-1):void 0===c[1]?a=-2:(a=n.lastIndex-c[2].length,h=c[1],n=void 0===c[3]?pt:'"'===c[3]?vt:wt):n===vt||n===wt?n=pt:n===dt||n===ft?n=ut:(n=pt,o=void 0);const u=n===pt&&t[e+1].startsWith("/>")?" ":"";r+=n===ut?i+rt:a>=0?(s.push(h),i.slice(0,a)+it+i.slice(a)+st+u):i+st+(-2===a?e:u);}return [$t(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class xt{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,h=this.parts,[c,a]=Ct(t,e);if(this.el=xt.createElement(c,i),St.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(s=St.nextNode())&&h.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(it)){const e=a[r++],i=s.getAttribute(t).split(st),n=/([.?@])?(.*)/.exec(e);h.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?_t:"?"===n[1]?zt:"@"===n[1]?At:jt}),s.removeAttribute(t);}else t.startsWith(st)&&(h.push({type:6,index:o}),s.removeAttribute(t));if(gt.test(s.tagName)){const t=s.textContent.split(st),e=t.length-1;if(e>0){s.textContent=tt?tt.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],ht()),St.nextNode(),h.push({type:2,index:++o});s.append(t[e],ht());}}}else if(8===s.nodeType)if(s.data===ot)h.push({type:2,index:o});else {let t=-1;for(;-1!==(t=s.data.indexOf(st,t+1));)h.push({type:7,index:o}),t+=st.length-1;}o++;}}static createElement(t,e){const i=nt.createElement("template");return i.innerHTML=t,i}}function Et(t,e,i=t,s){if(e===mt)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=ct(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(false),void 0===r?o=void 0:(o=new r(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=Et(t,o._$AS(t,e.values),o,s)),e}class Tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??nt).importNode(e,true);St.currentNode=s;let o=St.nextNode(),r=0,n=0,h=i[0];for(;void 0!==h;){if(r===h.index){let e;2===h.type?e=new Mt(o,o.nextSibling,this,t):1===h.type?e=new h.ctor(o,h.name,h.strings,this,t):6===h.type&&(e=new Ot(o,this,t)),this._$AV.push(e),h=i[++n];}r!==h?.index&&(o=St.nextNode(),r++);}return St.currentNode=nt,s}p(t){let e=0;for(const i of this._$AV) void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++;}}class Mt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=yt,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Et(this,t,e),ct(t)?t===yt||null==t||""===t?(this._$AH!==yt&&this._$AR(),this._$AH=yt):t!==this._$AH&&t!==mt&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>at(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==yt&&ct(this._$AH)?this._$AA.nextSibling.data=t:this.T(nt.createTextNode(t)),this._$AH=t;}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=xt.createElement($t(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else {const t=new Tt(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t;}}_$AC(t){let e=kt.get(t.strings);return void 0===e&&kt.set(t.strings,e=new xt(t)),e}k(t){at(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new Mt(this.O(ht()),this.O(ht()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s);}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(false,true,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class jt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=yt,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=yt;}_$AI(t,e=this,i,s){const o=this.strings;let r=false;if(void 0===o)t=Et(this,t,e,0),r=!ct(t)||t!==this._$AH&&t!==mt,r&&(this._$AH=t);else {const s=t;let n,h;for(t=o[0],n=0;n<o.length-1;n++)h=Et(this,s[i+n],e,n),h===mt&&(h=this._$AH[n]),r||=!ct(h)||h!==this._$AH[n],h===yt?t=yt:t!==yt&&(t+=(h??"")+o[n+1]),this._$AH[n]=h;}r&&!s&&this.j(t);}j(t){t===yt?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class _t extends jt{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===yt?void 0:t;}}class zt extends jt{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==yt);}}class At extends jt{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5;}_$AI(t,e=this){if((t=Et(this,t,e,0)??yt)===mt)return;const i=this._$AH,s=t===yt&&i!==yt||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==yt&&(i===yt||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i;}get _$AU(){return this._$AM._$AU}_$AI(t){Et(this,t);}}const Ut=X.litHtmlPolyfillSupport;Ut?.(xt,Mt),(X.litHtmlVersions??=[]).push("3.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let Pt=class extends Y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new Mt(e.insertBefore(ht(),t),t,void 0,i??{});}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return mt}};Pt._$litElement$=true,Pt.finalized=true,globalThis.litElementHydrateSupport?.({LitElement:Pt});const qt=globalThis.litElementPolyfillSupport;qt?.({LitElement:Pt}),(globalThis.litElementVersions??=[]).push("4.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt=t=>(e,i)=>{ void 0!==i?i.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,Lt={attribute:true,type:String,converter:J,reflect:false,hasChanged:K},Rt=(t=Lt,e,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),r.set(i.name,t),"accessor"===s){const{name:s}=i;return {set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t);},init(e){return void 0!==e&&this.P(s,void 0,t),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t);}}throw Error("Unsupported decorator location: "+s)};function It(t){return (e,i)=>"object"==typeof i?Rt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,s?{...t,wrapped:true}:t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function Nt(t){return It({...t,state:true,attribute:false})}var Dt=Object.defineProperty,Bt=(t,e,i)=>(((t,e,i)=>{e in t?Dt(t,e,{enumerable:true,configurable:true,writable:true,value:i}):t[e]=i;})(t,"symbol"!=typeof e?e+"":e,i),i),Vt=(t,e)=>{if(Object(e)!==e)throw TypeError('Cannot use the "in" operator on this value');return t.has(e)},Zt=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i);},Ht=(t,e,i)=>(((t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)})(t,e,"access private method"),i);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function Ft(t,e){return Object.is(t,e)}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */let Gt=null,Jt=false,Kt=1;const Qt=Symbol("SIGNAL");function Yt(t){const e=Gt;return Gt=t,e}const Xt={version:0,lastCleanEpoch:0,dirty:false,producerNode:void 0,producerLastReadVersion:void 0,producerIndexOfThis:void 0,nextProducerIndex:0,liveConsumerNode:void 0,liveConsumerIndexOfThis:void 0,consumerAllowSignalWrites:false,consumerIsAlwaysLive:false,producerMustRecompute:()=>false,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function te(t){if(Jt)throw new Error("undefined"!=typeof ngDevMode&&ngDevMode?"Assertion error: signal read during notification phase":"");if(null===Gt)return;Gt.consumerOnSignalRead(t);const e=Gt.nextProducerIndex++;if(he(Gt),e<Gt.producerNode.length&&Gt.producerNode[e]!==t&&ne(Gt)){re(Gt.producerNode[e],Gt.producerIndexOfThis[e]);}Gt.producerNode[e]!==t&&(Gt.producerNode[e]=t,Gt.producerIndexOfThis[e]=ne(Gt)?oe(t,Gt,e):0),Gt.producerLastReadVersion[e]=t.version;}function ee(t){if(t.dirty||t.lastCleanEpoch!==Kt){if(!t.producerMustRecompute(t)&&!function(t){he(t);for(let e=0;e<t.producerNode.length;e++){const i=t.producerNode[e],s=t.producerLastReadVersion[e];if(s!==i.version)return  true;if(ee(i),s!==i.version)return  true}return  false}(t))return t.dirty=false,void(t.lastCleanEpoch=Kt);t.producerRecomputeValue(t),t.dirty=false,t.lastCleanEpoch=Kt;}}function ie(t){if(void 0===t.liveConsumerNode)return;const e=Jt;Jt=true;try{for(const e of t.liveConsumerNode)e.dirty||se(e);}finally{Jt=e;}}function se(t){var e;t.dirty=true,ie(t),null==(e=t.consumerMarkedDirty)||e.call(t.wrapper??t);}function oe(t,e,i){var s;if(ce(t),he(t),0===t.liveConsumerNode.length){null==(s=t.watched)||s.call(t.wrapper);for(let e=0;e<t.producerNode.length;e++)t.producerIndexOfThis[e]=oe(t.producerNode[e],t,e);}return t.liveConsumerIndexOfThis.push(i),t.liveConsumerNode.push(e)-1}function re(t,e){var i;if(ce(t),he(t),"undefined"!=typeof ngDevMode&&ngDevMode&&e>=t.liveConsumerNode.length)throw new Error(`Assertion error: active consumer index ${e} is out of bounds of ${t.liveConsumerNode.length} consumers)`);if(1===t.liveConsumerNode.length){null==(i=t.unwatched)||i.call(t.wrapper);for(let e=0;e<t.producerNode.length;e++)re(t.producerNode[e],t.producerIndexOfThis[e]);}const s=t.liveConsumerNode.length-1;if(t.liveConsumerNode[e]=t.liveConsumerNode[s],t.liveConsumerIndexOfThis[e]=t.liveConsumerIndexOfThis[s],t.liveConsumerNode.length--,t.liveConsumerIndexOfThis.length--,e<t.liveConsumerNode.length){const i=t.liveConsumerIndexOfThis[e],s=t.liveConsumerNode[e];he(s),s.producerIndexOfThis[i]=e;}}function ne(t){var e;return t.consumerIsAlwaysLive||((null==(e=null==t?void 0:t.liveConsumerNode)?void 0:e.length)??0)>0}function he(t){t.producerNode??(t.producerNode=[]),t.producerIndexOfThis??(t.producerIndexOfThis=[]),t.producerLastReadVersion??(t.producerLastReadVersion=[]);}function ce(t){t.liveConsumerNode??(t.liveConsumerNode=[]),t.liveConsumerIndexOfThis??(t.liveConsumerIndexOfThis=[]);}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */function ae(t){if(ee(t),te(t),t.value===de)throw t.error;return t.value}const le=Symbol("UNSET"),ue=Symbol("COMPUTING"),de=Symbol("ERRORED"),fe=(()=>({...Xt,value:le,dirty:true,error:null,equal:Ft,producerMustRecompute:t=>t.value===le||t.value===ue,producerRecomputeValue(t){if(t.value===ue)throw new Error("Detected cycle in computations.");const e=t.value;t.value=ue;const i=function(t){return t&&(t.nextProducerIndex=0),Yt(t)}(t);let s,o=false;try{s=t.computation.call(t.wrapper);o=e!==le&&e!==de&&t.equal.call(t.wrapper,e,s);}catch(e){s=de,t.error=e;}finally{!function(t,e){if(Yt(e),t&&void 0!==t.producerNode&&void 0!==t.producerIndexOfThis&&void 0!==t.producerLastReadVersion){if(ne(t))for(let e=t.nextProducerIndex;e<t.producerNode.length;e++)re(t.producerNode[e],t.producerIndexOfThis[e]);for(;t.producerNode.length>t.nextProducerIndex;)t.producerNode.pop(),t.producerLastReadVersion.pop(),t.producerIndexOfThis.pop();}}(t,i);}o?t.value=e:(t.value=s,t.version++);}}))();let pe=
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function(){throw new Error};function we(){return te(this),this.value}function ve(t,e){ false===(null==Gt?void 0:Gt.consumerAllowSignalWrites)&&pe(),t.equal.call(t.wrapper,t.value,e)||(t.value=e,function(t){t.version++,Kt++,ie(t);}
/**
 * @license
 * Copyright 2024 Bloomberg Finance L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(t));}const ge=(()=>({...Xt,equal:Ft,value:void 0}))();const be=Symbol("node");var me;(t=>{var e,i,s,o;e=be,i=new WeakSet,t.isState=t=>"object"==typeof t&&Vt(i,t),t.State=class{constructor(s,o={}){Zt(this,i),Bt(this,e);const r=
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function(t){const e=Object.create(ge);e.value=t;const i=()=>(te(e),e.value);return i[Qt]=e,i}(s),n=r[Qt];if(this[be]=n,n.wrapper=this,o){const e=o.equals;e&&(n.equal=e),n.watched=o[t.subtle.watched],n.unwatched=o[t.subtle.unwatched];}}get(){if(!(0, t.isState)(this))throw new TypeError("Wrong receiver type for Signal.State.prototype.get");return we.call(this[be])}set(e){if(!(0, t.isState)(this))throw new TypeError("Wrong receiver type for Signal.State.prototype.set");if(Jt)throw new Error("Writes to signals not permitted during Watcher callback");ve(this[be],e);}};s=be,o=new WeakSet,t.isComputed=t=>"object"==typeof t&&Vt(o,t),t.Computed=class{constructor(e,i){Zt(this,o),Bt(this,s);const r=function(t){const e=Object.create(fe);e.computation=t;const i=()=>ae(e);return i[Qt]=e,i}(e),n=r[Qt];if(n.consumerAllowSignalWrites=true,this[be]=n,n.wrapper=this,i){const e=i.equals;e&&(n.equal=e),n.watched=i[t.subtle.watched],n.unwatched=i[t.subtle.unwatched];}}get(){if(!(0, t.isComputed)(this))throw new TypeError("Wrong receiver type for Signal.Computed.prototype.get");return ae(this[be])}},(e=>{var i,s,o,r;e.untrack=function(t){let e,i=null;try{i=Yt(null),e=t();}finally{Yt(i);}return e},e.introspectSources=function(e){var i;if(!(0, t.isComputed)(e)&&!(0, t.isWatcher)(e))throw new TypeError("Called introspectSources without a Computed or Watcher argument");return (null==(i=e[be].producerNode)?void 0:i.map((t=>t.wrapper)))??[]},e.introspectSinks=function(e){var i;if(!(0, t.isComputed)(e)&&!(0, t.isState)(e))throw new TypeError("Called introspectSinks without a Signal argument");return (null==(i=e[be].liveConsumerNode)?void 0:i.map((t=>t.wrapper)))??[]},e.hasSinks=function(e){if(!(0, t.isComputed)(e)&&!(0, t.isState)(e))throw new TypeError("Called hasSinks without a Signal argument");const i=e[be].liveConsumerNode;return !!i&&i.length>0},e.hasSources=function(e){if(!(0, t.isComputed)(e)&&!(0, t.isWatcher)(e))throw new TypeError("Called hasSources without a Computed or Watcher argument");const i=e[be].producerNode;return !!i&&i.length>0};i=be,s=new WeakSet,o=new WeakSet,r=function(e){for(const i of e)if(!(0, t.isComputed)(i)&&!(0, t.isState)(i))throw new TypeError("Called watch/unwatch without a Computed or State argument")},t.isWatcher=t=>Vt(s,t),e.Watcher=class{constructor(t){Zt(this,s),Zt(this,o),Bt(this,i);let e=Object.create(Xt);e.wrapper=this,e.consumerMarkedDirty=t,e.consumerIsAlwaysLive=true,e.consumerAllowSignalWrites=false,e.producerNode=[],this[be]=e;}watch(...e){if(!(0, t.isWatcher)(this))throw new TypeError("Called unwatch without Watcher receiver");Ht(this,o,r).call(this,e);const i=this[be];i.dirty=false;const s=Yt(i);for(const t of e)te(t[be]);Yt(s);}unwatch(...e){if(!(0, t.isWatcher)(this))throw new TypeError("Called unwatch without Watcher receiver");Ht(this,o,r).call(this,e);const i=this[be];he(i);for(let t=i.producerNode.length-1;t>=0;t--)if(e.includes(i.producerNode[t].wrapper)){re(i.producerNode[t],i.producerIndexOfThis[t]);const e=i.producerNode.length-1;if(i.producerNode[t]=i.producerNode[e],i.producerIndexOfThis[t]=i.producerIndexOfThis[e],i.producerNode.length--,i.producerIndexOfThis.length--,i.nextProducerIndex--,t<i.producerNode.length){const e=i.producerIndexOfThis[t],s=i.producerNode[t];ce(s),s.liveConsumerIndexOfThis[e]=t;}}}getPending(){if(!(0, t.isWatcher)(this))throw new TypeError("Called getPending without Watcher receiver");return this[be].producerNode.filter((t=>t.dirty)).map((t=>t.wrapper))}},e.currentComputed=function(){var t;return null==(t=Gt)?void 0:t.wrapper},e.watched=Symbol("watched"),e.unwatched=Symbol("unwatched");})(t.subtle||(t.subtle={}));})(me||(me={}));
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye=Symbol("SignalWatcherBrand"),ke=new FinalizationRegistry((({watcher:t,signal:e})=>{t.unwatch(e);})),Se=new WeakMap;function $e(t){return  true===t[ye]?(console.warn("SignalWatcher should not be applied to the same class more than once."),t):class extends t{constructor(){super(...arguments),this._$St=new me.State(0),this._$Si=false,this._$So=true,this._$Sh=new Set;}_$Sl(){if(void 0!==this._$Su)return;this._$Sv=new me.Computed((()=>{this._$St.get(),super.performUpdate();}));const t=this._$Su=new me.subtle.Watcher((function(){const t=Se.get(this);void 0!==t&&(false===t._$Si&&t.requestUpdate(),this.watch());}));Se.set(t,this),ke.register(this,{watcher:t,signal:this._$Sv}),t.watch(this._$Sv);}_$Sp(){ void 0!==this._$Su&&(this._$Su.unwatch(this._$Sv),this._$Sv=void 0,this._$Su=void 0);}performUpdate(){this.isUpdatePending&&(this._$Sl(),this._$Si=true,this._$St.set(this._$St.get()+1),this._$Si=false,this._$Sv.get());}update(t){try{this._$So?(this._$So=!1,super.update(t)):this._$Sh.forEach((t=>t.commit()));}finally{this.isUpdatePending=false,this._$Sh.clear();}}requestUpdate(t,e,i){this._$So=true,super.requestUpdate(t,e,i);}connectedCallback(){super.connectedCallback(),this.requestUpdate();}disconnectedCallback(){super.disconnectedCallback(),queueMicrotask((()=>{ false===this.isConnected&&this._$Sp();}));}_(t){this._$Sh.add(t);const e=this._$So;this.requestUpdate(),this._$So=e;}m(t){this._$Sh.delete(t);}}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ce=1;let xe=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ee=me.State,Te=me.Computed,Me="https://robotoff.openfoodfacts.org/api/v1";var je;!function(t){t.SUBMIT="submit",t.QUESTION_STATE="question-state";}(je||(je={}));const _e=t=>new URLSearchParams(t).toString(),ze={annotate(t,e){const i=new URLSearchParams({insight_id:t,annotation:e}).toString();return fetch(`${Me}/insights/annotate`,{method:"POST",body:i,headers:{"Content-Type":"application/x-www-form-urlencoded"},credentials:"include"})},async questionsByProductCode(t,e={}){e.lang||(e.lang=E());const i=((t,e)=>t.includes("?")?`${t}&${_e(e)}`:`${t}?${_e(e)}`)(`${Me}/questions/${t}`,e),s=await fetch(i);return await s.json()}};class Ae extends Ee{constructor(t,e={}){super(t,e);}getItem(t){return super.get()[t]}setItem(t,e){super.set({...super.get(),[t]:e});}}const Oe=new Ae({}),Ue=new Ae({}),Pe=new Ae({}),qe=new Ae({}),We=t=>new Te((()=>Pe.getItem(t)??0)),Le=t=>new Te((()=>Ue.getItem(t).length??0)),Re=t=>new Te((()=>qe.getItem(t)??false)),Ie=t=>{const e=We(t).get();return Pe.setItem(t,e+1),!(t=>We(t).get()===Le(t).get()&&(qe.setItem(t,true),true))(t)},Ne=Symbol();class De{get taskComplete(){return this.t||(1===this.i?this.t=new Promise(((t,e)=>{this.o=t,this.h=e;})):3===this.i?this.t=Promise.reject(this.l):this.t=Promise.resolve(this.u)),this.t}constructor(t,e,i){this.p=0,this.i=0,(this._=t).addController(this);const s="object"==typeof e?e:{task:e,args:i};this.v=s.task,this.j=s.args,this.m=s.argsEqual??Be,this.k=s.onComplete,this.A=s.onError,this.autoRun=s.autoRun??true,"initialValue"in s&&(this.u=s.initialValue,this.i=2,this.O=this.T?.());}hostUpdate(){ true===this.autoRun&&this.S();}hostUpdated(){"afterUpdate"===this.autoRun&&this.S();}T(){if(void 0===this.j)return;const t=this.j();if(!Array.isArray(t))throw Error("The args function must return an array");return t}async S(){const t=this.T(),e=this.O;this.O=t,t===e||void 0===t||void 0!==e&&this.m(e,t)||await this.run(t);}async run(t){let e,i;t??=this.T(),this.O=t,1===this.i?this.q?.abort():(this.t=void 0,this.o=void 0,this.h=void 0),this.i=1,"afterUpdate"===this.autoRun?queueMicrotask((()=>this._.requestUpdate())):this._.requestUpdate();const s=++this.p;this.q=new AbortController;let o=false;try{e=await this.v(t,{signal:this.q.signal});}catch(t){o=true,i=t;}if(this.p===s){if(e===Ne)this.i=0;else {if(false===o){try{this.k?.(e);}catch{}this.i=2,this.o?.(e);}else {try{this.A?.(i);}catch{}this.i=3,this.h?.(i);}this.u=e,this.l=i;}this._.requestUpdate();}}abort(t){1===this.i&&this.q?.abort(t);}get value(){return this.u}get error(){return this.l}get status(){return this.i}render(t){switch(this.i){case 0:return t.initial?.();case 1:return t.pending?.();case 2:return t.complete?.(this.value);case 3:return t.error?.(this.error);default:throw Error("Unexpected status: "+this.i)}}}const Be=(t,e)=>t===e||t.length===e.length&&t.every(((t,i)=>!K(t,e[i])));exports.RobotoffQuestion=class Ve extends($e(Pt)){constructor(){super(...arguments),this.options={},this.productId="",this.insightTypes="",this.hasAnswered=false,this._questionsTask=new De(this,{task:async([t,e],{})=>{if(this.hasAnswered=false,!t)return [];const i=e?{insight_types:e}:{};return await(async(t,e={})=>{qe.setItem(t,false),Pe.setItem(t,0),Ue.setItem(t,[]);const i=await ze.questionsByProductCode(t,e);Ue.setItem(t,i.questions?.map((t=>t.insight_id))??[]),i.questions?.forEach((t=>{Oe.setItem(t.insight_id,t);}));})(t,i),this._emitQuestionStateEvent(),(s=t,new Te((()=>Ue.get()[s].map((t=>Oe.getItem(t)))))).get();var s;},args:()=>[this.productId,this.insightTypes]}),this._emitQuestionStateEvent=()=>{const t={index:We(this.productId).get(),numberOfQuestions:Le(this.productId).get()};this.dispatchEvent(new CustomEvent(je.QUESTION_STATE,{detail:t,bubbles:true,composed:true}));},this.onQuestionAnswered=()=>{this.hasAnswered=true,Ie(this.productId),this.requestUpdate(),this._emitQuestionStateEvent();};}renderMessage(){const t=t=>bt`<div class="message">${t}</div>`;return Re(this.productId).get()?t(s("Thank you for your assistance!")):this.options?.showMessage?this.hasAnswered?bt`<div>${s("Thanks for your help! Can you assist with another question?")}</div>`:t(s("Open Food Facts needs your help with this product.")):yt}render(){return this._questionsTask.render({pending:()=>this.options?.showLoading?bt`<div>${s("Loading...")}</div>`:yt,complete:t=>{const e=t[We(this.productId).get()??0];return (i=this.productId,new Te((()=>Ue.getItem(i)?.length>0))).get()?bt`
          <div class="question-wrapper">
            ${Re(this.productId).get()?yt:bt`
                  ${this.renderMessage()}
                  <robotoff-question-form
                    .question=${e}
                    @submit=${this.onQuestionAnswered}
                  ></robotoff-question-form>
                `}
          </div>
        `:bt``;var i;},error:t=>this.options.showError?bt`<div>Error: ${t}</div>`:yt})}};exports.RobotoffQuestion.styles=q`
    :host {
      display: block;
    }
    .question-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .message {
      font-style: italic;
    }
  `,j([It({type:Object,reflect:true})],exports.RobotoffQuestion.prototype,"options",void 0),j([It({type:String,attribute:"product-id"})],exports.RobotoffQuestion.prototype,"productId",void 0),j([It({type:String,attribute:"insight-types"})],exports.RobotoffQuestion.prototype,"insightTypes",void 0),j([Nt()],exports.RobotoffQuestion.prototype,"hasAnswered",void 0),exports.RobotoffQuestion=j([Wt("robotoff-question"),h()],exports.RobotoffQuestion);const Ze=P("#ede0db"),He=P("#341100"),Fe=P("#f0f0f0");var Ge;!function(t){t.Chocolate="chocolate",t.Cappucino="cappucino",t.ChocolateOutline="chocolate-outline",t.White="white",t.LINK="link";}(Ge||(Ge={}));const Je={[Ge.Chocolate]:q`
    .chocolate-button {
      background-color: ${He};
      border-color: ${He};
      color: white;
    }

    .chocolate-button:hover {
      background-color: white;
      color: ${He};
    }
  `,[Ge.Cappucino]:q`
    .cappucino-button {
      background-color: ${Ze};
      border-color: ${Ze};
      color: black;
    }

    .cappucino-button:hover {
      background-color: white;
    }
  `,[Ge.ChocolateOutline]:q`
    .chocolate-button-outline {
      background-color: transparent;
      border-color: ${He};
      color: ${He};
    }

    .chocolate-button-outline:hover {
      background-color: ${He};
      color: white;
    }
  `,[Ge.White]:q`
    .white-button {
      background-color: white;
      border-color: white;
      color: black;
    }

    .white-button:hover {
      border-color: black;
      background-color: black;
      color: white;
    }
  `,[Ge.LINK]:q`
    .link-button {
      text-decoration: none;
      background-color: transparent;
      border-color: transparent;
      cursor: pointer;
      color: black;
    }

    .link-button:hover {
      text-decoration: underline;
    }
  `},Ke=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends xe{constructor(t){if(super(t),t.type!==Ce||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return " "+Object.keys(t).filter((e=>t[e])).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)));}return mt}});let Qe=class extends Pt{connectedCallback(){super.connectedCallback();}render(){return bt`
      <svg
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.9992 21L14.9492 14.95"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6 10H14"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 6V14"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `}};Qe.styles=q`
    :host {
      display: inline-block;
      width: 24px;
      height: 24px;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,Qe=j([Wt("zoom-icon")],Qe);let Ye=class extends Pt{render(){return bt`
      <svg
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.9992 21L14.9492 14.95"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6 10H14"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `}};Ye.styles=q`
    :host {
      display: inline-block;
      width: 24px;
      height: 24px;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,Ye=j([Wt("unzoom-icon")],Ye);let Xe=class extends Pt{constructor(){super(...arguments),this.zoomed=false;}render(){return bt`
      <button title=${this.zoomed?s("Unzoom"):s("Zoom")}>
        ${this.zoomed?bt`<unzoom-icon></unzoom-icon>`:bt`<zoom-icon></zoom-icon>`}
      </button>
    `}};Xe.styles=q`
    :host {
      display: inline-block;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border: none;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      cursor: pointer;
    }
    button:hover {
      background-color: ${Fe};
    }
  `,j([It({type:Boolean})],Xe.prototype,"zoomed",void 0),Xe=j([Wt("zoom-unzoom-button"),h()],Xe);exports.RobotoffQuestionForm=class ti extends($e(Pt)){constructor(){super(...arguments),this._zoomed=false,this.emitEventClick=(t,e)=>{t.stopPropagation();const i=new CustomEvent(je.SUBMIT,{detail:{value:e},bubbles:true,composed:true});this.dispatchEvent(i);},this._annotateProduct=async(t,e)=>{((t,e)=>{ze.annotate(t,e);})(this.question?.insight_id,e),this.emitEventClick(t,e);};}_toggleImageSize(){this._zoomed=!this._zoomed;}_renderImage(){return this.question?.source_image_url?bt`<div>
      <div
        class=${Ke({"question-img-wrapper":true,enlarged:this._zoomed})}
      >
        <div>
          <img .src=${this.question?.source_image_url} alt="Product image" />
        </div>

        <div class="img-button-wrapper">
          <zoom-unzoom-button
            .zoomed=${this._zoomed}
            @click=${this._toggleImageSize}
          ></zoom-unzoom-button>
        </div>
      </div>
    </div> `:yt}render(){return this.question?bt`
      <div class="question-form">
        <p>${this.question.question} <strong> ${this.question.value} </strong></p>
        <div>${this._renderImage()}</div>
        <div>
          <p></p>
          <button
            class="button cappucino-button"
            @click="${t=>this._annotateProduct(t,"1")}"
          >
            Yes
          </button>
          <button
            class="button cappucino-button"
            @click="${t=>this._annotateProduct(t,"0")}"
          >
            No
          </button>
          <button
            class="button white-button"
            @click="${t=>this._annotateProduct(t,"-1")}"
          >
            Skip
          </button>
        </div>
      </div>
    `:bt`<div>No question</div>`}};exports.RobotoffQuestionForm.styles=[...(t=>{let e=[q`
    .button {
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-size: 1rem;
      border-width: 1px;
      border-style: solid;
      cursor: pointer;
    }
    .button.rounded {
      border-radius: 50%;
    }
  `];return t.forEach((t=>{e.push(Je[t]);})),e})([Ge.Cappucino,Ge.White,Ge.LINK]),q`
      :host {
        display: block;
        max-width: 800px;
      }

      .question-form {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
      }

      .question-img-wrapper {
        position: relative;
        justify-content: center;
        width: 100px;
      }

      .question-img-wrapper.enlarged {
        width: 100%;
        max-width: 400px;
      }

      .question-img-wrapper img {
        width: 100%;
      }

      .img-button-wrapper {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        display: flex;
        justify-content: center;
      }
    `],j([It({type:Object,reflect:true})],exports.RobotoffQuestionForm.prototype,"question",void 0),j([Nt()],exports.RobotoffQuestionForm.prototype,"_zoomed",void 0),exports.RobotoffQuestionForm=j([Wt("robotoff-question-form")],exports.RobotoffQuestionForm);

exports.getLocale = E;
exports.setLocale = T;
