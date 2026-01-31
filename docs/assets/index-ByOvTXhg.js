function qp(a,u){for(var i=0;i<u.length;i++){const d=u[i];if(typeof d!="string"&&!Array.isArray(d)){for(const f in d)if(f!=="default"&&!(f in a)){const y=Object.getOwnPropertyDescriptor(d,f);y&&Object.defineProperty(a,f,y.get?y:{enumerable:!0,get:()=>d[f]})}}}return Object.freeze(Object.defineProperty(a,Symbol.toStringTag,{value:"Module"}))}(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const f of document.querySelectorAll('link[rel="modulepreload"]'))d(f);new MutationObserver(f=>{for(const y of f)if(y.type==="childList")for(const g of y.addedNodes)g.tagName==="LINK"&&g.rel==="modulepreload"&&d(g)}).observe(document,{childList:!0,subtree:!0});function i(f){const y={};return f.integrity&&(y.integrity=f.integrity),f.referrerPolicy&&(y.referrerPolicy=f.referrerPolicy),f.crossOrigin==="use-credentials"?y.credentials="include":f.crossOrigin==="anonymous"?y.credentials="omit":y.credentials="same-origin",y}function d(f){if(f.ep)return;f.ep=!0;const y=i(f);fetch(f.href,y)}})();function _c(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a.default:a}var Ga={exports:{}},Pr={},qa={exports:{}},se={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var nc;function Qp(){if(nc)return se;nc=1;var a=Symbol.for("react.element"),u=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),d=Symbol.for("react.strict_mode"),f=Symbol.for("react.profiler"),y=Symbol.for("react.provider"),g=Symbol.for("react.context"),_=Symbol.for("react.forward_ref"),v=Symbol.for("react.suspense"),C=Symbol.for("react.memo"),R=Symbol.for("react.lazy"),N=Symbol.iterator;function z(x){return x===null||typeof x!="object"?null:(x=N&&x[N]||x["@@iterator"],typeof x=="function"?x:null)}var q={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},j=Object.assign,b={};function w(x,P,ne){this.props=x,this.context=P,this.refs=b,this.updater=ne||q}w.prototype.isReactComponent={},w.prototype.setState=function(x,P){if(typeof x!="object"&&typeof x!="function"&&x!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,x,P,"setState")},w.prototype.forceUpdate=function(x){this.updater.enqueueForceUpdate(this,x,"forceUpdate")};function I(){}I.prototype=w.prototype;function L(x,P,ne){this.props=x,this.context=P,this.refs=b,this.updater=ne||q}var F=L.prototype=new I;F.constructor=L,j(F,w.prototype),F.isPureReactComponent=!0;var Q=Array.isArray,ee=Object.prototype.hasOwnProperty,ue={current:null},ae={key:!0,ref:!0,__self:!0,__source:!0};function me(x,P,ne){var re,oe={},le=null,de=null;if(P!=null)for(re in P.ref!==void 0&&(de=P.ref),P.key!==void 0&&(le=""+P.key),P)ee.call(P,re)&&!ae.hasOwnProperty(re)&&(oe[re]=P[re]);var pe=arguments.length-2;if(pe===1)oe.children=ne;else if(1<pe){for(var ge=Array(pe),nt=0;nt<pe;nt++)ge[nt]=arguments[nt+2];oe.children=ge}if(x&&x.defaultProps)for(re in pe=x.defaultProps,pe)oe[re]===void 0&&(oe[re]=pe[re]);return{$$typeof:a,type:x,key:le,ref:de,props:oe,_owner:ue.current}}function ke(x,P){return{$$typeof:a,type:x.type,key:P,ref:x.ref,props:x.props,_owner:x._owner}}function Fe(x){return typeof x=="object"&&x!==null&&x.$$typeof===a}function Be(x){var P={"=":"=0",":":"=2"};return"$"+x.replace(/[=:]/g,function(ne){return P[ne]})}var Ee=/\/+/g;function Ve(x,P){return typeof x=="object"&&x!==null&&x.key!=null?Be(""+x.key):P.toString(36)}function he(x,P,ne,re,oe){var le=typeof x;(le==="undefined"||le==="boolean")&&(x=null);var de=!1;if(x===null)de=!0;else switch(le){case"string":case"number":de=!0;break;case"object":switch(x.$$typeof){case a:case u:de=!0}}if(de)return de=x,oe=oe(de),x=re===""?"."+Ve(de,0):re,Q(oe)?(ne="",x!=null&&(ne=x.replace(Ee,"$&/")+"/"),he(oe,P,ne,"",function(nt){return nt})):oe!=null&&(Fe(oe)&&(oe=ke(oe,ne+(!oe.key||de&&de.key===oe.key?"":(""+oe.key).replace(Ee,"$&/")+"/")+x)),P.push(oe)),1;if(de=0,re=re===""?".":re+":",Q(x))for(var pe=0;pe<x.length;pe++){le=x[pe];var ge=re+Ve(le,pe);de+=he(le,P,ne,ge,oe)}else if(ge=z(x),typeof ge=="function")for(x=ge.call(x),pe=0;!(le=x.next()).done;)le=le.value,ge=re+Ve(le,pe++),de+=he(le,P,ne,ge,oe);else if(le==="object")throw P=String(x),Error("Objects are not valid as a React child (found: "+(P==="[object Object]"?"object with keys {"+Object.keys(x).join(", ")+"}":P)+"). If you meant to render a collection of children, use an array instead.");return de}function Ce(x,P,ne){if(x==null)return x;var re=[],oe=0;return he(x,re,"","",function(le){return P.call(ne,le,oe++)}),re}function _e(x){if(x._status===-1){var P=x._result;P=P(),P.then(function(ne){(x._status===0||x._status===-1)&&(x._status=1,x._result=ne)},function(ne){(x._status===0||x._status===-1)&&(x._status=2,x._result=ne)}),x._status===-1&&(x._status=0,x._result=P)}if(x._status===1)return x._result.default;throw x._result}var ye={current:null},B={transition:null},J={ReactCurrentDispatcher:ye,ReactCurrentBatchConfig:B,ReactCurrentOwner:ue};function $(){throw Error("act(...) is not supported in production builds of React.")}return se.Children={map:Ce,forEach:function(x,P,ne){Ce(x,function(){P.apply(this,arguments)},ne)},count:function(x){var P=0;return Ce(x,function(){P++}),P},toArray:function(x){return Ce(x,function(P){return P})||[]},only:function(x){if(!Fe(x))throw Error("React.Children.only expected to receive a single React element child.");return x}},se.Component=w,se.Fragment=i,se.Profiler=f,se.PureComponent=L,se.StrictMode=d,se.Suspense=v,se.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=J,se.act=$,se.cloneElement=function(x,P,ne){if(x==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+x+".");var re=j({},x.props),oe=x.key,le=x.ref,de=x._owner;if(P!=null){if(P.ref!==void 0&&(le=P.ref,de=ue.current),P.key!==void 0&&(oe=""+P.key),x.type&&x.type.defaultProps)var pe=x.type.defaultProps;for(ge in P)ee.call(P,ge)&&!ae.hasOwnProperty(ge)&&(re[ge]=P[ge]===void 0&&pe!==void 0?pe[ge]:P[ge])}var ge=arguments.length-2;if(ge===1)re.children=ne;else if(1<ge){pe=Array(ge);for(var nt=0;nt<ge;nt++)pe[nt]=arguments[nt+2];re.children=pe}return{$$typeof:a,type:x.type,key:oe,ref:le,props:re,_owner:de}},se.createContext=function(x){return x={$$typeof:g,_currentValue:x,_currentValue2:x,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},x.Provider={$$typeof:y,_context:x},x.Consumer=x},se.createElement=me,se.createFactory=function(x){var P=me.bind(null,x);return P.type=x,P},se.createRef=function(){return{current:null}},se.forwardRef=function(x){return{$$typeof:_,render:x}},se.isValidElement=Fe,se.lazy=function(x){return{$$typeof:R,_payload:{_status:-1,_result:x},_init:_e}},se.memo=function(x,P){return{$$typeof:C,type:x,compare:P===void 0?null:P}},se.startTransition=function(x){var P=B.transition;B.transition={};try{x()}finally{B.transition=P}},se.unstable_act=$,se.useCallback=function(x,P){return ye.current.useCallback(x,P)},se.useContext=function(x){return ye.current.useContext(x)},se.useDebugValue=function(){},se.useDeferredValue=function(x){return ye.current.useDeferredValue(x)},se.useEffect=function(x,P){return ye.current.useEffect(x,P)},se.useId=function(){return ye.current.useId()},se.useImperativeHandle=function(x,P,ne){return ye.current.useImperativeHandle(x,P,ne)},se.useInsertionEffect=function(x,P){return ye.current.useInsertionEffect(x,P)},se.useLayoutEffect=function(x,P){return ye.current.useLayoutEffect(x,P)},se.useMemo=function(x,P){return ye.current.useMemo(x,P)},se.useReducer=function(x,P,ne){return ye.current.useReducer(x,P,ne)},se.useRef=function(x){return ye.current.useRef(x)},se.useState=function(x){return ye.current.useState(x)},se.useSyncExternalStore=function(x,P,ne){return ye.current.useSyncExternalStore(x,P,ne)},se.useTransition=function(){return ye.current.useTransition()},se.version="18.3.1",se}var rc;function no(){return rc||(rc=1,qa.exports=Qp()),qa.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var sc;function Kp(){if(sc)return Pr;sc=1;var a=no(),u=Symbol.for("react.element"),i=Symbol.for("react.fragment"),d=Object.prototype.hasOwnProperty,f=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,y={key:!0,ref:!0,__self:!0,__source:!0};function g(_,v,C){var R,N={},z=null,q=null;C!==void 0&&(z=""+C),v.key!==void 0&&(z=""+v.key),v.ref!==void 0&&(q=v.ref);for(R in v)d.call(v,R)&&!y.hasOwnProperty(R)&&(N[R]=v[R]);if(_&&_.defaultProps)for(R in v=_.defaultProps,v)N[R]===void 0&&(N[R]=v[R]);return{$$typeof:u,type:_,key:z,ref:q,props:N,_owner:f.current}}return Pr.Fragment=i,Pr.jsx=g,Pr.jsxs=g,Pr}var lc;function Yp(){return lc||(lc=1,Ga.exports=Kp()),Ga.exports}var l=Yp(),U=no();const Rc=_c(U),Zp=qp({__proto__:null,default:Rc},[U]);var qs={},Qa={exports:{}},tt={},Ka={exports:{}},Ya={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ac;function Xp(){return ac||(ac=1,(function(a){function u(B,J){var $=B.length;B.push(J);e:for(;0<$;){var x=$-1>>>1,P=B[x];if(0<f(P,J))B[x]=J,B[$]=P,$=x;else break e}}function i(B){return B.length===0?null:B[0]}function d(B){if(B.length===0)return null;var J=B[0],$=B.pop();if($!==J){B[0]=$;e:for(var x=0,P=B.length,ne=P>>>1;x<ne;){var re=2*(x+1)-1,oe=B[re],le=re+1,de=B[le];if(0>f(oe,$))le<P&&0>f(de,oe)?(B[x]=de,B[le]=$,x=le):(B[x]=oe,B[re]=$,x=re);else if(le<P&&0>f(de,$))B[x]=de,B[le]=$,x=le;else break e}}return J}function f(B,J){var $=B.sortIndex-J.sortIndex;return $!==0?$:B.id-J.id}if(typeof performance=="object"&&typeof performance.now=="function"){var y=performance;a.unstable_now=function(){return y.now()}}else{var g=Date,_=g.now();a.unstable_now=function(){return g.now()-_}}var v=[],C=[],R=1,N=null,z=3,q=!1,j=!1,b=!1,w=typeof setTimeout=="function"?setTimeout:null,I=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function F(B){for(var J=i(C);J!==null;){if(J.callback===null)d(C);else if(J.startTime<=B)d(C),J.sortIndex=J.expirationTime,u(v,J);else break;J=i(C)}}function Q(B){if(b=!1,F(B),!j)if(i(v)!==null)j=!0,_e(ee);else{var J=i(C);J!==null&&ye(Q,J.startTime-B)}}function ee(B,J){j=!1,b&&(b=!1,I(me),me=-1),q=!0;var $=z;try{for(F(J),N=i(v);N!==null&&(!(N.expirationTime>J)||B&&!Be());){var x=N.callback;if(typeof x=="function"){N.callback=null,z=N.priorityLevel;var P=x(N.expirationTime<=J);J=a.unstable_now(),typeof P=="function"?N.callback=P:N===i(v)&&d(v),F(J)}else d(v);N=i(v)}if(N!==null)var ne=!0;else{var re=i(C);re!==null&&ye(Q,re.startTime-J),ne=!1}return ne}finally{N=null,z=$,q=!1}}var ue=!1,ae=null,me=-1,ke=5,Fe=-1;function Be(){return!(a.unstable_now()-Fe<ke)}function Ee(){if(ae!==null){var B=a.unstable_now();Fe=B;var J=!0;try{J=ae(!0,B)}finally{J?Ve():(ue=!1,ae=null)}}else ue=!1}var Ve;if(typeof L=="function")Ve=function(){L(Ee)};else if(typeof MessageChannel<"u"){var he=new MessageChannel,Ce=he.port2;he.port1.onmessage=Ee,Ve=function(){Ce.postMessage(null)}}else Ve=function(){w(Ee,0)};function _e(B){ae=B,ue||(ue=!0,Ve())}function ye(B,J){me=w(function(){B(a.unstable_now())},J)}a.unstable_IdlePriority=5,a.unstable_ImmediatePriority=1,a.unstable_LowPriority=4,a.unstable_NormalPriority=3,a.unstable_Profiling=null,a.unstable_UserBlockingPriority=2,a.unstable_cancelCallback=function(B){B.callback=null},a.unstable_continueExecution=function(){j||q||(j=!0,_e(ee))},a.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):ke=0<B?Math.floor(1e3/B):5},a.unstable_getCurrentPriorityLevel=function(){return z},a.unstable_getFirstCallbackNode=function(){return i(v)},a.unstable_next=function(B){switch(z){case 1:case 2:case 3:var J=3;break;default:J=z}var $=z;z=J;try{return B()}finally{z=$}},a.unstable_pauseExecution=function(){},a.unstable_requestPaint=function(){},a.unstable_runWithPriority=function(B,J){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var $=z;z=B;try{return J()}finally{z=$}},a.unstable_scheduleCallback=function(B,J,$){var x=a.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?x+$:x):$=x,B){case 1:var P=-1;break;case 2:P=250;break;case 5:P=1073741823;break;case 4:P=1e4;break;default:P=5e3}return P=$+P,B={id:R++,callback:J,priorityLevel:B,startTime:$,expirationTime:P,sortIndex:-1},$>x?(B.sortIndex=$,u(C,B),i(v)===null&&B===i(C)&&(b?(I(me),me=-1):b=!0,ye(Q,$-x))):(B.sortIndex=P,u(v,B),j||q||(j=!0,_e(ee))),B},a.unstable_shouldYield=Be,a.unstable_wrapCallback=function(B){var J=z;return function(){var $=z;z=J;try{return B.apply(this,arguments)}finally{z=$}}}})(Ya)),Ya}var oc;function Jp(){return oc||(oc=1,Ka.exports=Xp()),Ka.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ic;function ef(){if(ic)return tt;ic=1;var a=no(),u=Jp();function i(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var d=new Set,f={};function y(e,t){g(e,t),g(e+"Capture",t)}function g(e,t){for(f[e]=t,e=0;e<t.length;e++)d.add(t[e])}var _=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),v=Object.prototype.hasOwnProperty,C=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,R={},N={};function z(e){return v.call(N,e)?!0:v.call(R,e)?!1:C.test(e)?N[e]=!0:(R[e]=!0,!1)}function q(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function j(e,t,n,r){if(t===null||typeof t>"u"||q(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function b(e,t,n,r,s,o,c){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=s,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=o,this.removeEmptyString=c}var w={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){w[e]=new b(e,0,!1,e,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];w[t]=new b(t,1,!1,e[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(e){w[e]=new b(e,2,!1,e.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){w[e]=new b(e,2,!1,e,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){w[e]=new b(e,3,!1,e.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(e){w[e]=new b(e,3,!0,e,null,!1,!1)}),["capture","download"].forEach(function(e){w[e]=new b(e,4,!1,e,null,!1,!1)}),["cols","rows","size","span"].forEach(function(e){w[e]=new b(e,6,!1,e,null,!1,!1)}),["rowSpan","start"].forEach(function(e){w[e]=new b(e,5,!1,e.toLowerCase(),null,!1,!1)});var I=/[\-:]([a-z])/g;function L(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(I,L);w[t]=new b(t,1,!1,e,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(I,L);w[t]=new b(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(I,L);w[t]=new b(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(e){w[e]=new b(e,1,!1,e.toLowerCase(),null,!1,!1)}),w.xlinkHref=new b("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(e){w[e]=new b(e,1,!1,e.toLowerCase(),null,!0,!0)});function F(e,t,n,r){var s=w.hasOwnProperty(t)?w[t]:null;(s!==null?s.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(j(t,n,s,r)&&(n=null),r||s===null?z(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):s.mustUseProperty?e[s.propertyName]=n===null?s.type===3?!1:"":n:(t=s.attributeName,r=s.attributeNamespace,n===null?e.removeAttribute(t):(s=s.type,n=s===3||s===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var Q=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ee=Symbol.for("react.element"),ue=Symbol.for("react.portal"),ae=Symbol.for("react.fragment"),me=Symbol.for("react.strict_mode"),ke=Symbol.for("react.profiler"),Fe=Symbol.for("react.provider"),Be=Symbol.for("react.context"),Ee=Symbol.for("react.forward_ref"),Ve=Symbol.for("react.suspense"),he=Symbol.for("react.suspense_list"),Ce=Symbol.for("react.memo"),_e=Symbol.for("react.lazy"),ye=Symbol.for("react.offscreen"),B=Symbol.iterator;function J(e){return e===null||typeof e!="object"?null:(e=B&&e[B]||e["@@iterator"],typeof e=="function"?e:null)}var $=Object.assign,x;function P(e){if(x===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);x=t&&t[1]||""}return`
`+x+e}var ne=!1;function re(e,t){if(!e||ne)return"";ne=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(E){var r=E}Reflect.construct(e,[],t)}else{try{t.call()}catch(E){r=E}e.call(t.prototype)}else{try{throw Error()}catch(E){r=E}e()}}catch(E){if(E&&r&&typeof E.stack=="string"){for(var s=E.stack.split(`
`),o=r.stack.split(`
`),c=s.length-1,p=o.length-1;1<=c&&0<=p&&s[c]!==o[p];)p--;for(;1<=c&&0<=p;c--,p--)if(s[c]!==o[p]){if(c!==1||p!==1)do if(c--,p--,0>p||s[c]!==o[p]){var m=`
`+s[c].replace(" at new "," at ");return e.displayName&&m.includes("<anonymous>")&&(m=m.replace("<anonymous>",e.displayName)),m}while(1<=c&&0<=p);break}}}finally{ne=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?P(e):""}function oe(e){switch(e.tag){case 5:return P(e.type);case 16:return P("Lazy");case 13:return P("Suspense");case 19:return P("SuspenseList");case 0:case 2:case 15:return e=re(e.type,!1),e;case 11:return e=re(e.type.render,!1),e;case 1:return e=re(e.type,!0),e;default:return""}}function le(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case ae:return"Fragment";case ue:return"Portal";case ke:return"Profiler";case me:return"StrictMode";case Ve:return"Suspense";case he:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Be:return(e.displayName||"Context")+".Consumer";case Fe:return(e._context.displayName||"Context")+".Provider";case Ee:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ce:return t=e.displayName||null,t!==null?t:le(e.type)||"Memo";case _e:t=e._payload,e=e._init;try{return le(e(t))}catch{}}return null}function de(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return le(t);case 8:return t===me?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function pe(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ge(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function nt(e){var t=ge(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var s=n.get,o=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(c){r=""+c,o.call(this,c)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(c){r=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Dr(e){e._valueTracker||(e._valueTracker=nt(e))}function oo(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=ge(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function zr(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Js(e,t){var n=t.checked;return $({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function io(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=pe(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function uo(e,t){t=t.checked,t!=null&&F(e,"checked",t,!1)}function el(e,t){uo(e,t);var n=pe(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?tl(e,t.type,n):t.hasOwnProperty("defaultValue")&&tl(e,t.type,pe(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function co(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function tl(e,t,n){(t!=="number"||zr(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var qn=Array.isArray;function bn(e,t,n,r){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&r&&(e[n].defaultSelected=!0)}else{for(n=""+pe(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,r&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function nl(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(i(91));return $({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function po(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(i(92));if(qn(n)){if(1<n.length)throw Error(i(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:pe(n)}}function fo(e,t){var n=pe(t.value),r=pe(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function mo(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function ho(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function rl(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?ho(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var Mr,go=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,s){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,s)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(Mr=Mr||document.createElement("div"),Mr.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=Mr.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Qn(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Kn={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Zc=["Webkit","ms","Moz","O"];Object.keys(Kn).forEach(function(e){Zc.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Kn[t]=Kn[e]})});function yo(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Kn.hasOwnProperty(e)&&Kn[e]?(""+t).trim():t+"px"}function xo(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,s=yo(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,s):e[n]=s}}var Xc=$({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function sl(e,t){if(t){if(Xc[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(i(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(i(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(i(61))}if(t.style!=null&&typeof t.style!="object")throw Error(i(62))}}function ll(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var al=null;function ol(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var il=null,kn=null,Sn=null;function vo(e){if(e=yr(e)){if(typeof il!="function")throw Error(i(280));var t=e.stateNode;t&&(t=is(t),il(e.stateNode,e.type,t))}}function wo(e){kn?Sn?Sn.push(e):Sn=[e]:kn=e}function bo(){if(kn){var e=kn,t=Sn;if(Sn=kn=null,vo(e),t)for(e=0;e<t.length;e++)vo(t[e])}}function ko(e,t){return e(t)}function So(){}var ul=!1;function jo(e,t,n){if(ul)return e(t,n);ul=!0;try{return ko(e,t,n)}finally{ul=!1,(kn!==null||Sn!==null)&&(So(),bo())}}function Yn(e,t){var n=e.stateNode;if(n===null)return null;var r=is(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(i(231,t,typeof n));return n}var cl=!1;if(_)try{var Zn={};Object.defineProperty(Zn,"passive",{get:function(){cl=!0}}),window.addEventListener("test",Zn,Zn),window.removeEventListener("test",Zn,Zn)}catch{cl=!1}function Jc(e,t,n,r,s,o,c,p,m){var E=Array.prototype.slice.call(arguments,3);try{t.apply(n,E)}catch(O){this.onError(O)}}var Xn=!1,Br=null,Ur=!1,dl=null,ed={onError:function(e){Xn=!0,Br=e}};function td(e,t,n,r,s,o,c,p,m){Xn=!1,Br=null,Jc.apply(ed,arguments)}function nd(e,t,n,r,s,o,c,p,m){if(td.apply(this,arguments),Xn){if(Xn){var E=Br;Xn=!1,Br=null}else throw Error(i(198));Ur||(Ur=!0,dl=E)}}function ln(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function No(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Eo(e){if(ln(e)!==e)throw Error(i(188))}function rd(e){var t=e.alternate;if(!t){if(t=ln(e),t===null)throw Error(i(188));return t!==e?null:e}for(var n=e,r=t;;){var s=n.return;if(s===null)break;var o=s.alternate;if(o===null){if(r=s.return,r!==null){n=r;continue}break}if(s.child===o.child){for(o=s.child;o;){if(o===n)return Eo(s),e;if(o===r)return Eo(s),t;o=o.sibling}throw Error(i(188))}if(n.return!==r.return)n=s,r=o;else{for(var c=!1,p=s.child;p;){if(p===n){c=!0,n=s,r=o;break}if(p===r){c=!0,r=s,n=o;break}p=p.sibling}if(!c){for(p=o.child;p;){if(p===n){c=!0,n=o,r=s;break}if(p===r){c=!0,r=o,n=s;break}p=p.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function Co(e){return e=rd(e),e!==null?_o(e):null}function _o(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=_o(e);if(t!==null)return t;e=e.sibling}return null}var Ro=u.unstable_scheduleCallback,To=u.unstable_cancelCallback,sd=u.unstable_shouldYield,ld=u.unstable_requestPaint,Re=u.unstable_now,ad=u.unstable_getCurrentPriorityLevel,pl=u.unstable_ImmediatePriority,Lo=u.unstable_UserBlockingPriority,$r=u.unstable_NormalPriority,od=u.unstable_LowPriority,Po=u.unstable_IdlePriority,Vr=null,bt=null;function id(e){if(bt&&typeof bt.onCommitFiberRoot=="function")try{bt.onCommitFiberRoot(Vr,e,void 0,(e.current.flags&128)===128)}catch{}}var mt=Math.clz32?Math.clz32:dd,ud=Math.log,cd=Math.LN2;function dd(e){return e>>>=0,e===0?32:31-(ud(e)/cd|0)|0}var Wr=64,Hr=4194304;function Jn(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Gr(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,s=e.suspendedLanes,o=e.pingedLanes,c=n&268435455;if(c!==0){var p=c&~s;p!==0?r=Jn(p):(o&=c,o!==0&&(r=Jn(o)))}else c=n&~s,c!==0?r=Jn(c):o!==0&&(r=Jn(o));if(r===0)return 0;if(t!==0&&t!==r&&(t&s)===0&&(s=r&-r,o=t&-t,s>=o||s===16&&(o&4194240)!==0))return t;if((r&4)!==0&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-mt(t),s=1<<n,r|=e[n],t&=~s;return r}function pd(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function fd(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,s=e.expirationTimes,o=e.pendingLanes;0<o;){var c=31-mt(o),p=1<<c,m=s[c];m===-1?((p&n)===0||(p&r)!==0)&&(s[c]=pd(p,t)):m<=t&&(e.expiredLanes|=p),o&=~p}}function fl(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Ao(){var e=Wr;return Wr<<=1,(Wr&4194240)===0&&(Wr=64),e}function ml(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function er(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-mt(t),e[t]=n}function md(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var s=31-mt(n),o=1<<s;t[s]=0,r[s]=-1,e[s]=-1,n&=~o}}function hl(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-mt(n),s=1<<r;s&t|e[r]&t&&(e[r]|=t),n&=~s}}var fe=0;function Oo(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Io,gl,Fo,Do,zo,yl=!1,qr=[],Dt=null,zt=null,Mt=null,tr=new Map,nr=new Map,Bt=[],hd="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Mo(e,t){switch(e){case"focusin":case"focusout":Dt=null;break;case"dragenter":case"dragleave":zt=null;break;case"mouseover":case"mouseout":Mt=null;break;case"pointerover":case"pointerout":tr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":nr.delete(t.pointerId)}}function rr(e,t,n,r,s,o){return e===null||e.nativeEvent!==o?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:o,targetContainers:[s]},t!==null&&(t=yr(t),t!==null&&gl(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function gd(e,t,n,r,s){switch(t){case"focusin":return Dt=rr(Dt,e,t,n,r,s),!0;case"dragenter":return zt=rr(zt,e,t,n,r,s),!0;case"mouseover":return Mt=rr(Mt,e,t,n,r,s),!0;case"pointerover":var o=s.pointerId;return tr.set(o,rr(tr.get(o)||null,e,t,n,r,s)),!0;case"gotpointercapture":return o=s.pointerId,nr.set(o,rr(nr.get(o)||null,e,t,n,r,s)),!0}return!1}function Bo(e){var t=an(e.target);if(t!==null){var n=ln(t);if(n!==null){if(t=n.tag,t===13){if(t=No(n),t!==null){e.blockedOn=t,zo(e.priority,function(){Fo(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Qr(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=vl(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);al=r,n.target.dispatchEvent(r),al=null}else return t=yr(n),t!==null&&gl(t),e.blockedOn=n,!1;t.shift()}return!0}function Uo(e,t,n){Qr(e)&&n.delete(t)}function yd(){yl=!1,Dt!==null&&Qr(Dt)&&(Dt=null),zt!==null&&Qr(zt)&&(zt=null),Mt!==null&&Qr(Mt)&&(Mt=null),tr.forEach(Uo),nr.forEach(Uo)}function sr(e,t){e.blockedOn===t&&(e.blockedOn=null,yl||(yl=!0,u.unstable_scheduleCallback(u.unstable_NormalPriority,yd)))}function lr(e){function t(s){return sr(s,e)}if(0<qr.length){sr(qr[0],e);for(var n=1;n<qr.length;n++){var r=qr[n];r.blockedOn===e&&(r.blockedOn=null)}}for(Dt!==null&&sr(Dt,e),zt!==null&&sr(zt,e),Mt!==null&&sr(Mt,e),tr.forEach(t),nr.forEach(t),n=0;n<Bt.length;n++)r=Bt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Bt.length&&(n=Bt[0],n.blockedOn===null);)Bo(n),n.blockedOn===null&&Bt.shift()}var jn=Q.ReactCurrentBatchConfig,Kr=!0;function xd(e,t,n,r){var s=fe,o=jn.transition;jn.transition=null;try{fe=1,xl(e,t,n,r)}finally{fe=s,jn.transition=o}}function vd(e,t,n,r){var s=fe,o=jn.transition;jn.transition=null;try{fe=4,xl(e,t,n,r)}finally{fe=s,jn.transition=o}}function xl(e,t,n,r){if(Kr){var s=vl(e,t,n,r);if(s===null)Fl(e,t,r,Yr,n),Mo(e,r);else if(gd(s,e,t,n,r))r.stopPropagation();else if(Mo(e,r),t&4&&-1<hd.indexOf(e)){for(;s!==null;){var o=yr(s);if(o!==null&&Io(o),o=vl(e,t,n,r),o===null&&Fl(e,t,r,Yr,n),o===s)break;s=o}s!==null&&r.stopPropagation()}else Fl(e,t,r,null,n)}}var Yr=null;function vl(e,t,n,r){if(Yr=null,e=ol(r),e=an(e),e!==null)if(t=ln(e),t===null)e=null;else if(n=t.tag,n===13){if(e=No(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return Yr=e,null}function $o(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(ad()){case pl:return 1;case Lo:return 4;case $r:case od:return 16;case Po:return 536870912;default:return 16}default:return 16}}var Ut=null,wl=null,Zr=null;function Vo(){if(Zr)return Zr;var e,t=wl,n=t.length,r,s="value"in Ut?Ut.value:Ut.textContent,o=s.length;for(e=0;e<n&&t[e]===s[e];e++);var c=n-e;for(r=1;r<=c&&t[n-r]===s[o-r];r++);return Zr=s.slice(e,1<r?1-r:void 0)}function Xr(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Jr(){return!0}function Wo(){return!1}function rt(e){function t(n,r,s,o,c){this._reactName=n,this._targetInst=s,this.type=r,this.nativeEvent=o,this.target=c,this.currentTarget=null;for(var p in e)e.hasOwnProperty(p)&&(n=e[p],this[p]=n?n(o):o[p]);return this.isDefaultPrevented=(o.defaultPrevented!=null?o.defaultPrevented:o.returnValue===!1)?Jr:Wo,this.isPropagationStopped=Wo,this}return $(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Jr)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Jr)},persist:function(){},isPersistent:Jr}),t}var Nn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},bl=rt(Nn),ar=$({},Nn,{view:0,detail:0}),wd=rt(ar),kl,Sl,or,es=$({},ar,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Nl,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==or&&(or&&e.type==="mousemove"?(kl=e.screenX-or.screenX,Sl=e.screenY-or.screenY):Sl=kl=0,or=e),kl)},movementY:function(e){return"movementY"in e?e.movementY:Sl}}),Ho=rt(es),bd=$({},es,{dataTransfer:0}),kd=rt(bd),Sd=$({},ar,{relatedTarget:0}),jl=rt(Sd),jd=$({},Nn,{animationName:0,elapsedTime:0,pseudoElement:0}),Nd=rt(jd),Ed=$({},Nn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Cd=rt(Ed),_d=$({},Nn,{data:0}),Go=rt(_d),Rd={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Td={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ld={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Pd(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Ld[e])?!!t[e]:!1}function Nl(){return Pd}var Ad=$({},ar,{key:function(e){if(e.key){var t=Rd[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Xr(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Td[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Nl,charCode:function(e){return e.type==="keypress"?Xr(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Xr(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Od=rt(Ad),Id=$({},es,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),qo=rt(Id),Fd=$({},ar,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Nl}),Dd=rt(Fd),zd=$({},Nn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Md=rt(zd),Bd=$({},es,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Ud=rt(Bd),$d=[9,13,27,32],El=_&&"CompositionEvent"in window,ir=null;_&&"documentMode"in document&&(ir=document.documentMode);var Vd=_&&"TextEvent"in window&&!ir,Qo=_&&(!El||ir&&8<ir&&11>=ir),Ko=" ",Yo=!1;function Zo(e,t){switch(e){case"keyup":return $d.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Xo(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var En=!1;function Wd(e,t){switch(e){case"compositionend":return Xo(t);case"keypress":return t.which!==32?null:(Yo=!0,Ko);case"textInput":return e=t.data,e===Ko&&Yo?null:e;default:return null}}function Hd(e,t){if(En)return e==="compositionend"||!El&&Zo(e,t)?(e=Vo(),Zr=wl=Ut=null,En=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Qo&&t.locale!=="ko"?null:t.data;default:return null}}var Gd={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Jo(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Gd[e.type]:t==="textarea"}function ei(e,t,n,r){wo(r),t=ls(t,"onChange"),0<t.length&&(n=new bl("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var ur=null,cr=null;function qd(e){xi(e,0)}function ts(e){var t=Ln(e);if(oo(t))return e}function Qd(e,t){if(e==="change")return t}var ti=!1;if(_){var Cl;if(_){var _l="oninput"in document;if(!_l){var ni=document.createElement("div");ni.setAttribute("oninput","return;"),_l=typeof ni.oninput=="function"}Cl=_l}else Cl=!1;ti=Cl&&(!document.documentMode||9<document.documentMode)}function ri(){ur&&(ur.detachEvent("onpropertychange",si),cr=ur=null)}function si(e){if(e.propertyName==="value"&&ts(cr)){var t=[];ei(t,cr,e,ol(e)),jo(qd,t)}}function Kd(e,t,n){e==="focusin"?(ri(),ur=t,cr=n,ur.attachEvent("onpropertychange",si)):e==="focusout"&&ri()}function Yd(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ts(cr)}function Zd(e,t){if(e==="click")return ts(t)}function Xd(e,t){if(e==="input"||e==="change")return ts(t)}function Jd(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ht=typeof Object.is=="function"?Object.is:Jd;function dr(e,t){if(ht(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var s=n[r];if(!v.call(t,s)||!ht(e[s],t[s]))return!1}return!0}function li(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ai(e,t){var n=li(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=li(n)}}function oi(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?oi(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function ii(){for(var e=window,t=zr();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=zr(e.document)}return t}function Rl(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function ep(e){var t=ii(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&oi(n.ownerDocument.documentElement,n)){if(r!==null&&Rl(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var s=n.textContent.length,o=Math.min(r.start,s);r=r.end===void 0?o:Math.min(r.end,s),!e.extend&&o>r&&(s=r,r=o,o=s),s=ai(n,o);var c=ai(n,r);s&&c&&(e.rangeCount!==1||e.anchorNode!==s.node||e.anchorOffset!==s.offset||e.focusNode!==c.node||e.focusOffset!==c.offset)&&(t=t.createRange(),t.setStart(s.node,s.offset),e.removeAllRanges(),o>r?(e.addRange(t),e.extend(c.node,c.offset)):(t.setEnd(c.node,c.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var tp=_&&"documentMode"in document&&11>=document.documentMode,Cn=null,Tl=null,pr=null,Ll=!1;function ui(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Ll||Cn==null||Cn!==zr(r)||(r=Cn,"selectionStart"in r&&Rl(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),pr&&dr(pr,r)||(pr=r,r=ls(Tl,"onSelect"),0<r.length&&(t=new bl("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Cn)))}function ns(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var _n={animationend:ns("Animation","AnimationEnd"),animationiteration:ns("Animation","AnimationIteration"),animationstart:ns("Animation","AnimationStart"),transitionend:ns("Transition","TransitionEnd")},Pl={},ci={};_&&(ci=document.createElement("div").style,"AnimationEvent"in window||(delete _n.animationend.animation,delete _n.animationiteration.animation,delete _n.animationstart.animation),"TransitionEvent"in window||delete _n.transitionend.transition);function rs(e){if(Pl[e])return Pl[e];if(!_n[e])return e;var t=_n[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in ci)return Pl[e]=t[n];return e}var di=rs("animationend"),pi=rs("animationiteration"),fi=rs("animationstart"),mi=rs("transitionend"),hi=new Map,gi="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function $t(e,t){hi.set(e,t),y(t,[e])}for(var Al=0;Al<gi.length;Al++){var Ol=gi[Al],np=Ol.toLowerCase(),rp=Ol[0].toUpperCase()+Ol.slice(1);$t(np,"on"+rp)}$t(di,"onAnimationEnd"),$t(pi,"onAnimationIteration"),$t(fi,"onAnimationStart"),$t("dblclick","onDoubleClick"),$t("focusin","onFocus"),$t("focusout","onBlur"),$t(mi,"onTransitionEnd"),g("onMouseEnter",["mouseout","mouseover"]),g("onMouseLeave",["mouseout","mouseover"]),g("onPointerEnter",["pointerout","pointerover"]),g("onPointerLeave",["pointerout","pointerover"]),y("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),y("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),y("onBeforeInput",["compositionend","keypress","textInput","paste"]),y("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),y("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),y("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var fr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),sp=new Set("cancel close invalid load scroll toggle".split(" ").concat(fr));function yi(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,nd(r,t,void 0,e),e.currentTarget=null}function xi(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],s=r.event;r=r.listeners;e:{var o=void 0;if(t)for(var c=r.length-1;0<=c;c--){var p=r[c],m=p.instance,E=p.currentTarget;if(p=p.listener,m!==o&&s.isPropagationStopped())break e;yi(s,p,E),o=m}else for(c=0;c<r.length;c++){if(p=r[c],m=p.instance,E=p.currentTarget,p=p.listener,m!==o&&s.isPropagationStopped())break e;yi(s,p,E),o=m}}}if(Ur)throw e=dl,Ur=!1,dl=null,e}function ve(e,t){var n=t[$l];n===void 0&&(n=t[$l]=new Set);var r=e+"__bubble";n.has(r)||(vi(t,e,2,!1),n.add(r))}function Il(e,t,n){var r=0;t&&(r|=4),vi(n,e,r,t)}var ss="_reactListening"+Math.random().toString(36).slice(2);function mr(e){if(!e[ss]){e[ss]=!0,d.forEach(function(n){n!=="selectionchange"&&(sp.has(n)||Il(n,!1,e),Il(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[ss]||(t[ss]=!0,Il("selectionchange",!1,t))}}function vi(e,t,n,r){switch($o(t)){case 1:var s=xd;break;case 4:s=vd;break;default:s=xl}n=s.bind(null,t,n,e),s=void 0,!cl||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),r?s!==void 0?e.addEventListener(t,n,{capture:!0,passive:s}):e.addEventListener(t,n,!0):s!==void 0?e.addEventListener(t,n,{passive:s}):e.addEventListener(t,n,!1)}function Fl(e,t,n,r,s){var o=r;if((t&1)===0&&(t&2)===0&&r!==null)e:for(;;){if(r===null)return;var c=r.tag;if(c===3||c===4){var p=r.stateNode.containerInfo;if(p===s||p.nodeType===8&&p.parentNode===s)break;if(c===4)for(c=r.return;c!==null;){var m=c.tag;if((m===3||m===4)&&(m=c.stateNode.containerInfo,m===s||m.nodeType===8&&m.parentNode===s))return;c=c.return}for(;p!==null;){if(c=an(p),c===null)return;if(m=c.tag,m===5||m===6){r=o=c;continue e}p=p.parentNode}}r=r.return}jo(function(){var E=o,O=ol(n),D=[];e:{var A=hi.get(e);if(A!==void 0){var V=bl,H=e;switch(e){case"keypress":if(Xr(n)===0)break e;case"keydown":case"keyup":V=Od;break;case"focusin":H="focus",V=jl;break;case"focusout":H="blur",V=jl;break;case"beforeblur":case"afterblur":V=jl;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":V=Ho;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":V=kd;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":V=Dd;break;case di:case pi:case fi:V=Nd;break;case mi:V=Md;break;case"scroll":V=wd;break;case"wheel":V=Ud;break;case"copy":case"cut":case"paste":V=Cd;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":V=qo}var G=(t&4)!==0,Te=!G&&e==="scroll",k=G?A!==null?A+"Capture":null:A;G=[];for(var h=E,S;h!==null;){S=h;var M=S.stateNode;if(S.tag===5&&M!==null&&(S=M,k!==null&&(M=Yn(h,k),M!=null&&G.push(hr(h,M,S)))),Te)break;h=h.return}0<G.length&&(A=new V(A,H,null,n,O),D.push({event:A,listeners:G}))}}if((t&7)===0){e:{if(A=e==="mouseover"||e==="pointerover",V=e==="mouseout"||e==="pointerout",A&&n!==al&&(H=n.relatedTarget||n.fromElement)&&(an(H)||H[_t]))break e;if((V||A)&&(A=O.window===O?O:(A=O.ownerDocument)?A.defaultView||A.parentWindow:window,V?(H=n.relatedTarget||n.toElement,V=E,H=H?an(H):null,H!==null&&(Te=ln(H),H!==Te||H.tag!==5&&H.tag!==6)&&(H=null)):(V=null,H=E),V!==H)){if(G=Ho,M="onMouseLeave",k="onMouseEnter",h="mouse",(e==="pointerout"||e==="pointerover")&&(G=qo,M="onPointerLeave",k="onPointerEnter",h="pointer"),Te=V==null?A:Ln(V),S=H==null?A:Ln(H),A=new G(M,h+"leave",V,n,O),A.target=Te,A.relatedTarget=S,M=null,an(O)===E&&(G=new G(k,h+"enter",H,n,O),G.target=S,G.relatedTarget=Te,M=G),Te=M,V&&H)t:{for(G=V,k=H,h=0,S=G;S;S=Rn(S))h++;for(S=0,M=k;M;M=Rn(M))S++;for(;0<h-S;)G=Rn(G),h--;for(;0<S-h;)k=Rn(k),S--;for(;h--;){if(G===k||k!==null&&G===k.alternate)break t;G=Rn(G),k=Rn(k)}G=null}else G=null;V!==null&&wi(D,A,V,G,!1),H!==null&&Te!==null&&wi(D,Te,H,G,!0)}}e:{if(A=E?Ln(E):window,V=A.nodeName&&A.nodeName.toLowerCase(),V==="select"||V==="input"&&A.type==="file")var K=Qd;else if(Jo(A))if(ti)K=Xd;else{K=Yd;var Z=Kd}else(V=A.nodeName)&&V.toLowerCase()==="input"&&(A.type==="checkbox"||A.type==="radio")&&(K=Zd);if(K&&(K=K(e,E))){ei(D,K,n,O);break e}Z&&Z(e,A,E),e==="focusout"&&(Z=A._wrapperState)&&Z.controlled&&A.type==="number"&&tl(A,"number",A.value)}switch(Z=E?Ln(E):window,e){case"focusin":(Jo(Z)||Z.contentEditable==="true")&&(Cn=Z,Tl=E,pr=null);break;case"focusout":pr=Tl=Cn=null;break;case"mousedown":Ll=!0;break;case"contextmenu":case"mouseup":case"dragend":Ll=!1,ui(D,n,O);break;case"selectionchange":if(tp)break;case"keydown":case"keyup":ui(D,n,O)}var X;if(El)e:{switch(e){case"compositionstart":var te="onCompositionStart";break e;case"compositionend":te="onCompositionEnd";break e;case"compositionupdate":te="onCompositionUpdate";break e}te=void 0}else En?Zo(e,n)&&(te="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(te="onCompositionStart");te&&(Qo&&n.locale!=="ko"&&(En||te!=="onCompositionStart"?te==="onCompositionEnd"&&En&&(X=Vo()):(Ut=O,wl="value"in Ut?Ut.value:Ut.textContent,En=!0)),Z=ls(E,te),0<Z.length&&(te=new Go(te,e,null,n,O),D.push({event:te,listeners:Z}),X?te.data=X:(X=Xo(n),X!==null&&(te.data=X)))),(X=Vd?Wd(e,n):Hd(e,n))&&(E=ls(E,"onBeforeInput"),0<E.length&&(O=new Go("onBeforeInput","beforeinput",null,n,O),D.push({event:O,listeners:E}),O.data=X))}xi(D,t)})}function hr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function ls(e,t){for(var n=t+"Capture",r=[];e!==null;){var s=e,o=s.stateNode;s.tag===5&&o!==null&&(s=o,o=Yn(e,n),o!=null&&r.unshift(hr(e,o,s)),o=Yn(e,t),o!=null&&r.push(hr(e,o,s))),e=e.return}return r}function Rn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function wi(e,t,n,r,s){for(var o=t._reactName,c=[];n!==null&&n!==r;){var p=n,m=p.alternate,E=p.stateNode;if(m!==null&&m===r)break;p.tag===5&&E!==null&&(p=E,s?(m=Yn(n,o),m!=null&&c.unshift(hr(n,m,p))):s||(m=Yn(n,o),m!=null&&c.push(hr(n,m,p)))),n=n.return}c.length!==0&&e.push({event:t,listeners:c})}var lp=/\r\n?/g,ap=/\u0000|\uFFFD/g;function bi(e){return(typeof e=="string"?e:""+e).replace(lp,`
`).replace(ap,"")}function as(e,t,n){if(t=bi(t),bi(e)!==t&&n)throw Error(i(425))}function os(){}var Dl=null,zl=null;function Ml(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Bl=typeof setTimeout=="function"?setTimeout:void 0,op=typeof clearTimeout=="function"?clearTimeout:void 0,ki=typeof Promise=="function"?Promise:void 0,ip=typeof queueMicrotask=="function"?queueMicrotask:typeof ki<"u"?function(e){return ki.resolve(null).then(e).catch(up)}:Bl;function up(e){setTimeout(function(){throw e})}function Ul(e,t){var n=t,r=0;do{var s=n.nextSibling;if(e.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"){if(r===0){e.removeChild(s),lr(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=s}while(n);lr(t)}function Vt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function Si(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Tn=Math.random().toString(36).slice(2),kt="__reactFiber$"+Tn,gr="__reactProps$"+Tn,_t="__reactContainer$"+Tn,$l="__reactEvents$"+Tn,cp="__reactListeners$"+Tn,dp="__reactHandles$"+Tn;function an(e){var t=e[kt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[_t]||n[kt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Si(e);e!==null;){if(n=e[kt])return n;e=Si(e)}return t}e=n,n=e.parentNode}return null}function yr(e){return e=e[kt]||e[_t],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Ln(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(i(33))}function is(e){return e[gr]||null}var Vl=[],Pn=-1;function Wt(e){return{current:e}}function we(e){0>Pn||(e.current=Vl[Pn],Vl[Pn]=null,Pn--)}function xe(e,t){Pn++,Vl[Pn]=e.current,e.current=t}var Ht={},We=Wt(Ht),Ye=Wt(!1),on=Ht;function An(e,t){var n=e.type.contextTypes;if(!n)return Ht;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var s={},o;for(o in n)s[o]=t[o];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=s),s}function Ze(e){return e=e.childContextTypes,e!=null}function us(){we(Ye),we(We)}function ji(e,t,n){if(We.current!==Ht)throw Error(i(168));xe(We,t),xe(Ye,n)}function Ni(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var s in r)if(!(s in t))throw Error(i(108,de(e)||"Unknown",s));return $({},n,r)}function cs(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Ht,on=We.current,xe(We,e),xe(Ye,Ye.current),!0}function Ei(e,t,n){var r=e.stateNode;if(!r)throw Error(i(169));n?(e=Ni(e,t,on),r.__reactInternalMemoizedMergedChildContext=e,we(Ye),we(We),xe(We,e)):we(Ye),xe(Ye,n)}var Rt=null,ds=!1,Wl=!1;function Ci(e){Rt===null?Rt=[e]:Rt.push(e)}function pp(e){ds=!0,Ci(e)}function Gt(){if(!Wl&&Rt!==null){Wl=!0;var e=0,t=fe;try{var n=Rt;for(fe=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}Rt=null,ds=!1}catch(s){throw Rt!==null&&(Rt=Rt.slice(e+1)),Ro(pl,Gt),s}finally{fe=t,Wl=!1}}return null}var On=[],In=0,ps=null,fs=0,it=[],ut=0,un=null,Tt=1,Lt="";function cn(e,t){On[In++]=fs,On[In++]=ps,ps=e,fs=t}function _i(e,t,n){it[ut++]=Tt,it[ut++]=Lt,it[ut++]=un,un=e;var r=Tt;e=Lt;var s=32-mt(r)-1;r&=~(1<<s),n+=1;var o=32-mt(t)+s;if(30<o){var c=s-s%5;o=(r&(1<<c)-1).toString(32),r>>=c,s-=c,Tt=1<<32-mt(t)+s|n<<s|r,Lt=o+e}else Tt=1<<o|n<<s|r,Lt=e}function Hl(e){e.return!==null&&(cn(e,1),_i(e,1,0))}function Gl(e){for(;e===ps;)ps=On[--In],On[In]=null,fs=On[--In],On[In]=null;for(;e===un;)un=it[--ut],it[ut]=null,Lt=it[--ut],it[ut]=null,Tt=it[--ut],it[ut]=null}var st=null,lt=null,be=!1,gt=null;function Ri(e,t){var n=ft(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function Ti(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,st=e,lt=Vt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,st=e,lt=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=un!==null?{id:Tt,overflow:Lt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=ft(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,st=e,lt=null,!0):!1;default:return!1}}function ql(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Ql(e){if(be){var t=lt;if(t){var n=t;if(!Ti(e,t)){if(ql(e))throw Error(i(418));t=Vt(n.nextSibling);var r=st;t&&Ti(e,t)?Ri(r,n):(e.flags=e.flags&-4097|2,be=!1,st=e)}}else{if(ql(e))throw Error(i(418));e.flags=e.flags&-4097|2,be=!1,st=e}}}function Li(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;st=e}function ms(e){if(e!==st)return!1;if(!be)return Li(e),be=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!Ml(e.type,e.memoizedProps)),t&&(t=lt)){if(ql(e))throw Pi(),Error(i(418));for(;t;)Ri(e,t),t=Vt(t.nextSibling)}if(Li(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(i(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){lt=Vt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}lt=null}}else lt=st?Vt(e.stateNode.nextSibling):null;return!0}function Pi(){for(var e=lt;e;)e=Vt(e.nextSibling)}function Fn(){lt=st=null,be=!1}function Kl(e){gt===null?gt=[e]:gt.push(e)}var fp=Q.ReactCurrentBatchConfig;function xr(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(i(309));var r=n.stateNode}if(!r)throw Error(i(147,e));var s=r,o=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===o?t.ref:(t=function(c){var p=s.refs;c===null?delete p[o]:p[o]=c},t._stringRef=o,t)}if(typeof e!="string")throw Error(i(284));if(!n._owner)throw Error(i(290,e))}return e}function hs(e,t){throw e=Object.prototype.toString.call(t),Error(i(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Ai(e){var t=e._init;return t(e._payload)}function Oi(e){function t(k,h){if(e){var S=k.deletions;S===null?(k.deletions=[h],k.flags|=16):S.push(h)}}function n(k,h){if(!e)return null;for(;h!==null;)t(k,h),h=h.sibling;return null}function r(k,h){for(k=new Map;h!==null;)h.key!==null?k.set(h.key,h):k.set(h.index,h),h=h.sibling;return k}function s(k,h){return k=en(k,h),k.index=0,k.sibling=null,k}function o(k,h,S){return k.index=S,e?(S=k.alternate,S!==null?(S=S.index,S<h?(k.flags|=2,h):S):(k.flags|=2,h)):(k.flags|=1048576,h)}function c(k){return e&&k.alternate===null&&(k.flags|=2),k}function p(k,h,S,M){return h===null||h.tag!==6?(h=Ba(S,k.mode,M),h.return=k,h):(h=s(h,S),h.return=k,h)}function m(k,h,S,M){var K=S.type;return K===ae?O(k,h,S.props.children,M,S.key):h!==null&&(h.elementType===K||typeof K=="object"&&K!==null&&K.$$typeof===_e&&Ai(K)===h.type)?(M=s(h,S.props),M.ref=xr(k,h,S),M.return=k,M):(M=Ms(S.type,S.key,S.props,null,k.mode,M),M.ref=xr(k,h,S),M.return=k,M)}function E(k,h,S,M){return h===null||h.tag!==4||h.stateNode.containerInfo!==S.containerInfo||h.stateNode.implementation!==S.implementation?(h=Ua(S,k.mode,M),h.return=k,h):(h=s(h,S.children||[]),h.return=k,h)}function O(k,h,S,M,K){return h===null||h.tag!==7?(h=xn(S,k.mode,M,K),h.return=k,h):(h=s(h,S),h.return=k,h)}function D(k,h,S){if(typeof h=="string"&&h!==""||typeof h=="number")return h=Ba(""+h,k.mode,S),h.return=k,h;if(typeof h=="object"&&h!==null){switch(h.$$typeof){case ee:return S=Ms(h.type,h.key,h.props,null,k.mode,S),S.ref=xr(k,null,h),S.return=k,S;case ue:return h=Ua(h,k.mode,S),h.return=k,h;case _e:var M=h._init;return D(k,M(h._payload),S)}if(qn(h)||J(h))return h=xn(h,k.mode,S,null),h.return=k,h;hs(k,h)}return null}function A(k,h,S,M){var K=h!==null?h.key:null;if(typeof S=="string"&&S!==""||typeof S=="number")return K!==null?null:p(k,h,""+S,M);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case ee:return S.key===K?m(k,h,S,M):null;case ue:return S.key===K?E(k,h,S,M):null;case _e:return K=S._init,A(k,h,K(S._payload),M)}if(qn(S)||J(S))return K!==null?null:O(k,h,S,M,null);hs(k,S)}return null}function V(k,h,S,M,K){if(typeof M=="string"&&M!==""||typeof M=="number")return k=k.get(S)||null,p(h,k,""+M,K);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case ee:return k=k.get(M.key===null?S:M.key)||null,m(h,k,M,K);case ue:return k=k.get(M.key===null?S:M.key)||null,E(h,k,M,K);case _e:var Z=M._init;return V(k,h,S,Z(M._payload),K)}if(qn(M)||J(M))return k=k.get(S)||null,O(h,k,M,K,null);hs(h,M)}return null}function H(k,h,S,M){for(var K=null,Z=null,X=h,te=h=0,Me=null;X!==null&&te<S.length;te++){X.index>te?(Me=X,X=null):Me=X.sibling;var ce=A(k,X,S[te],M);if(ce===null){X===null&&(X=Me);break}e&&X&&ce.alternate===null&&t(k,X),h=o(ce,h,te),Z===null?K=ce:Z.sibling=ce,Z=ce,X=Me}if(te===S.length)return n(k,X),be&&cn(k,te),K;if(X===null){for(;te<S.length;te++)X=D(k,S[te],M),X!==null&&(h=o(X,h,te),Z===null?K=X:Z.sibling=X,Z=X);return be&&cn(k,te),K}for(X=r(k,X);te<S.length;te++)Me=V(X,k,te,S[te],M),Me!==null&&(e&&Me.alternate!==null&&X.delete(Me.key===null?te:Me.key),h=o(Me,h,te),Z===null?K=Me:Z.sibling=Me,Z=Me);return e&&X.forEach(function(tn){return t(k,tn)}),be&&cn(k,te),K}function G(k,h,S,M){var K=J(S);if(typeof K!="function")throw Error(i(150));if(S=K.call(S),S==null)throw Error(i(151));for(var Z=K=null,X=h,te=h=0,Me=null,ce=S.next();X!==null&&!ce.done;te++,ce=S.next()){X.index>te?(Me=X,X=null):Me=X.sibling;var tn=A(k,X,ce.value,M);if(tn===null){X===null&&(X=Me);break}e&&X&&tn.alternate===null&&t(k,X),h=o(tn,h,te),Z===null?K=tn:Z.sibling=tn,Z=tn,X=Me}if(ce.done)return n(k,X),be&&cn(k,te),K;if(X===null){for(;!ce.done;te++,ce=S.next())ce=D(k,ce.value,M),ce!==null&&(h=o(ce,h,te),Z===null?K=ce:Z.sibling=ce,Z=ce);return be&&cn(k,te),K}for(X=r(k,X);!ce.done;te++,ce=S.next())ce=V(X,k,te,ce.value,M),ce!==null&&(e&&ce.alternate!==null&&X.delete(ce.key===null?te:ce.key),h=o(ce,h,te),Z===null?K=ce:Z.sibling=ce,Z=ce);return e&&X.forEach(function(Gp){return t(k,Gp)}),be&&cn(k,te),K}function Te(k,h,S,M){if(typeof S=="object"&&S!==null&&S.type===ae&&S.key===null&&(S=S.props.children),typeof S=="object"&&S!==null){switch(S.$$typeof){case ee:e:{for(var K=S.key,Z=h;Z!==null;){if(Z.key===K){if(K=S.type,K===ae){if(Z.tag===7){n(k,Z.sibling),h=s(Z,S.props.children),h.return=k,k=h;break e}}else if(Z.elementType===K||typeof K=="object"&&K!==null&&K.$$typeof===_e&&Ai(K)===Z.type){n(k,Z.sibling),h=s(Z,S.props),h.ref=xr(k,Z,S),h.return=k,k=h;break e}n(k,Z);break}else t(k,Z);Z=Z.sibling}S.type===ae?(h=xn(S.props.children,k.mode,M,S.key),h.return=k,k=h):(M=Ms(S.type,S.key,S.props,null,k.mode,M),M.ref=xr(k,h,S),M.return=k,k=M)}return c(k);case ue:e:{for(Z=S.key;h!==null;){if(h.key===Z)if(h.tag===4&&h.stateNode.containerInfo===S.containerInfo&&h.stateNode.implementation===S.implementation){n(k,h.sibling),h=s(h,S.children||[]),h.return=k,k=h;break e}else{n(k,h);break}else t(k,h);h=h.sibling}h=Ua(S,k.mode,M),h.return=k,k=h}return c(k);case _e:return Z=S._init,Te(k,h,Z(S._payload),M)}if(qn(S))return H(k,h,S,M);if(J(S))return G(k,h,S,M);hs(k,S)}return typeof S=="string"&&S!==""||typeof S=="number"?(S=""+S,h!==null&&h.tag===6?(n(k,h.sibling),h=s(h,S),h.return=k,k=h):(n(k,h),h=Ba(S,k.mode,M),h.return=k,k=h),c(k)):n(k,h)}return Te}var Dn=Oi(!0),Ii=Oi(!1),gs=Wt(null),ys=null,zn=null,Yl=null;function Zl(){Yl=zn=ys=null}function Xl(e){var t=gs.current;we(gs),e._currentValue=t}function Jl(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function Mn(e,t){ys=e,Yl=zn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(Xe=!0),e.firstContext=null)}function ct(e){var t=e._currentValue;if(Yl!==e)if(e={context:e,memoizedValue:t,next:null},zn===null){if(ys===null)throw Error(i(308));zn=e,ys.dependencies={lanes:0,firstContext:e}}else zn=zn.next=e;return t}var dn=null;function ea(e){dn===null?dn=[e]:dn.push(e)}function Fi(e,t,n,r){var s=t.interleaved;return s===null?(n.next=n,ea(t)):(n.next=s.next,s.next=n),t.interleaved=n,Pt(e,r)}function Pt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var qt=!1;function ta(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Di(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function At(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function Qt(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(ie&2)!==0){var s=r.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),r.pending=t,Pt(e,n)}return s=r.interleaved,s===null?(t.next=t,ea(r)):(t.next=s.next,s.next=t),r.interleaved=t,Pt(e,n)}function xs(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,hl(e,n)}}function zi(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var s=null,o=null;if(n=n.firstBaseUpdate,n!==null){do{var c={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};o===null?s=o=c:o=o.next=c,n=n.next}while(n!==null);o===null?s=o=t:o=o.next=t}else s=o=t;n={baseState:r.baseState,firstBaseUpdate:s,lastBaseUpdate:o,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function vs(e,t,n,r){var s=e.updateQueue;qt=!1;var o=s.firstBaseUpdate,c=s.lastBaseUpdate,p=s.shared.pending;if(p!==null){s.shared.pending=null;var m=p,E=m.next;m.next=null,c===null?o=E:c.next=E,c=m;var O=e.alternate;O!==null&&(O=O.updateQueue,p=O.lastBaseUpdate,p!==c&&(p===null?O.firstBaseUpdate=E:p.next=E,O.lastBaseUpdate=m))}if(o!==null){var D=s.baseState;c=0,O=E=m=null,p=o;do{var A=p.lane,V=p.eventTime;if((r&A)===A){O!==null&&(O=O.next={eventTime:V,lane:0,tag:p.tag,payload:p.payload,callback:p.callback,next:null});e:{var H=e,G=p;switch(A=t,V=n,G.tag){case 1:if(H=G.payload,typeof H=="function"){D=H.call(V,D,A);break e}D=H;break e;case 3:H.flags=H.flags&-65537|128;case 0:if(H=G.payload,A=typeof H=="function"?H.call(V,D,A):H,A==null)break e;D=$({},D,A);break e;case 2:qt=!0}}p.callback!==null&&p.lane!==0&&(e.flags|=64,A=s.effects,A===null?s.effects=[p]:A.push(p))}else V={eventTime:V,lane:A,tag:p.tag,payload:p.payload,callback:p.callback,next:null},O===null?(E=O=V,m=D):O=O.next=V,c|=A;if(p=p.next,p===null){if(p=s.shared.pending,p===null)break;A=p,p=A.next,A.next=null,s.lastBaseUpdate=A,s.shared.pending=null}}while(!0);if(O===null&&(m=D),s.baseState=m,s.firstBaseUpdate=E,s.lastBaseUpdate=O,t=s.shared.interleaved,t!==null){s=t;do c|=s.lane,s=s.next;while(s!==t)}else o===null&&(s.shared.lanes=0);mn|=c,e.lanes=c,e.memoizedState=D}}function Mi(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],s=r.callback;if(s!==null){if(r.callback=null,r=n,typeof s!="function")throw Error(i(191,s));s.call(r)}}}var vr={},St=Wt(vr),wr=Wt(vr),br=Wt(vr);function pn(e){if(e===vr)throw Error(i(174));return e}function na(e,t){switch(xe(br,t),xe(wr,e),xe(St,vr),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:rl(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=rl(t,e)}we(St),xe(St,t)}function Bn(){we(St),we(wr),we(br)}function Bi(e){pn(br.current);var t=pn(St.current),n=rl(t,e.type);t!==n&&(xe(wr,e),xe(St,n))}function ra(e){wr.current===e&&(we(St),we(wr))}var Se=Wt(0);function ws(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var sa=[];function la(){for(var e=0;e<sa.length;e++)sa[e]._workInProgressVersionPrimary=null;sa.length=0}var bs=Q.ReactCurrentDispatcher,aa=Q.ReactCurrentBatchConfig,fn=0,je=null,Ae=null,De=null,ks=!1,kr=!1,Sr=0,mp=0;function He(){throw Error(i(321))}function oa(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!ht(e[n],t[n]))return!1;return!0}function ia(e,t,n,r,s,o){if(fn=o,je=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,bs.current=e===null||e.memoizedState===null?xp:vp,e=n(r,s),kr){o=0;do{if(kr=!1,Sr=0,25<=o)throw Error(i(301));o+=1,De=Ae=null,t.updateQueue=null,bs.current=wp,e=n(r,s)}while(kr)}if(bs.current=Ns,t=Ae!==null&&Ae.next!==null,fn=0,De=Ae=je=null,ks=!1,t)throw Error(i(300));return e}function ua(){var e=Sr!==0;return Sr=0,e}function jt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return De===null?je.memoizedState=De=e:De=De.next=e,De}function dt(){if(Ae===null){var e=je.alternate;e=e!==null?e.memoizedState:null}else e=Ae.next;var t=De===null?je.memoizedState:De.next;if(t!==null)De=t,Ae=e;else{if(e===null)throw Error(i(310));Ae=e,e={memoizedState:Ae.memoizedState,baseState:Ae.baseState,baseQueue:Ae.baseQueue,queue:Ae.queue,next:null},De===null?je.memoizedState=De=e:De=De.next=e}return De}function jr(e,t){return typeof t=="function"?t(e):t}function ca(e){var t=dt(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=Ae,s=r.baseQueue,o=n.pending;if(o!==null){if(s!==null){var c=s.next;s.next=o.next,o.next=c}r.baseQueue=s=o,n.pending=null}if(s!==null){o=s.next,r=r.baseState;var p=c=null,m=null,E=o;do{var O=E.lane;if((fn&O)===O)m!==null&&(m=m.next={lane:0,action:E.action,hasEagerState:E.hasEagerState,eagerState:E.eagerState,next:null}),r=E.hasEagerState?E.eagerState:e(r,E.action);else{var D={lane:O,action:E.action,hasEagerState:E.hasEagerState,eagerState:E.eagerState,next:null};m===null?(p=m=D,c=r):m=m.next=D,je.lanes|=O,mn|=O}E=E.next}while(E!==null&&E!==o);m===null?c=r:m.next=p,ht(r,t.memoizedState)||(Xe=!0),t.memoizedState=r,t.baseState=c,t.baseQueue=m,n.lastRenderedState=r}if(e=n.interleaved,e!==null){s=e;do o=s.lane,je.lanes|=o,mn|=o,s=s.next;while(s!==e)}else s===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function da(e){var t=dt(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,s=n.pending,o=t.memoizedState;if(s!==null){n.pending=null;var c=s=s.next;do o=e(o,c.action),c=c.next;while(c!==s);ht(o,t.memoizedState)||(Xe=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Ui(){}function $i(e,t){var n=je,r=dt(),s=t(),o=!ht(r.memoizedState,s);if(o&&(r.memoizedState=s,Xe=!0),r=r.queue,pa(Hi.bind(null,n,r,e),[e]),r.getSnapshot!==t||o||De!==null&&De.memoizedState.tag&1){if(n.flags|=2048,Nr(9,Wi.bind(null,n,r,s,t),void 0,null),ze===null)throw Error(i(349));(fn&30)!==0||Vi(n,t,s)}return s}function Vi(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=je.updateQueue,t===null?(t={lastEffect:null,stores:null},je.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Wi(e,t,n,r){t.value=n,t.getSnapshot=r,Gi(t)&&qi(e)}function Hi(e,t,n){return n(function(){Gi(t)&&qi(e)})}function Gi(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!ht(e,n)}catch{return!0}}function qi(e){var t=Pt(e,1);t!==null&&wt(t,e,1,-1)}function Qi(e){var t=jt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:jr,lastRenderedState:e},t.queue=e,e=e.dispatch=yp.bind(null,je,e),[t.memoizedState,e]}function Nr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=je.updateQueue,t===null?(t={lastEffect:null,stores:null},je.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Ki(){return dt().memoizedState}function Ss(e,t,n,r){var s=jt();je.flags|=e,s.memoizedState=Nr(1|t,n,void 0,r===void 0?null:r)}function js(e,t,n,r){var s=dt();r=r===void 0?null:r;var o=void 0;if(Ae!==null){var c=Ae.memoizedState;if(o=c.destroy,r!==null&&oa(r,c.deps)){s.memoizedState=Nr(t,n,o,r);return}}je.flags|=e,s.memoizedState=Nr(1|t,n,o,r)}function Yi(e,t){return Ss(8390656,8,e,t)}function pa(e,t){return js(2048,8,e,t)}function Zi(e,t){return js(4,2,e,t)}function Xi(e,t){return js(4,4,e,t)}function Ji(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function eu(e,t,n){return n=n!=null?n.concat([e]):null,js(4,4,Ji.bind(null,t,e),n)}function fa(){}function tu(e,t){var n=dt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&oa(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function nu(e,t){var n=dt();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&oa(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function ru(e,t,n){return(fn&21)===0?(e.baseState&&(e.baseState=!1,Xe=!0),e.memoizedState=n):(ht(n,t)||(n=Ao(),je.lanes|=n,mn|=n,e.baseState=!0),t)}function hp(e,t){var n=fe;fe=n!==0&&4>n?n:4,e(!0);var r=aa.transition;aa.transition={};try{e(!1),t()}finally{fe=n,aa.transition=r}}function su(){return dt().memoizedState}function gp(e,t,n){var r=Xt(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},lu(e))au(t,n);else if(n=Fi(e,t,n,r),n!==null){var s=Ke();wt(n,e,r,s),ou(n,t,r)}}function yp(e,t,n){var r=Xt(e),s={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(lu(e))au(t,s);else{var o=e.alternate;if(e.lanes===0&&(o===null||o.lanes===0)&&(o=t.lastRenderedReducer,o!==null))try{var c=t.lastRenderedState,p=o(c,n);if(s.hasEagerState=!0,s.eagerState=p,ht(p,c)){var m=t.interleaved;m===null?(s.next=s,ea(t)):(s.next=m.next,m.next=s),t.interleaved=s;return}}catch{}finally{}n=Fi(e,t,s,r),n!==null&&(s=Ke(),wt(n,e,r,s),ou(n,t,r))}}function lu(e){var t=e.alternate;return e===je||t!==null&&t===je}function au(e,t){kr=ks=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function ou(e,t,n){if((n&4194240)!==0){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,hl(e,n)}}var Ns={readContext:ct,useCallback:He,useContext:He,useEffect:He,useImperativeHandle:He,useInsertionEffect:He,useLayoutEffect:He,useMemo:He,useReducer:He,useRef:He,useState:He,useDebugValue:He,useDeferredValue:He,useTransition:He,useMutableSource:He,useSyncExternalStore:He,useId:He,unstable_isNewReconciler:!1},xp={readContext:ct,useCallback:function(e,t){return jt().memoizedState=[e,t===void 0?null:t],e},useContext:ct,useEffect:Yi,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Ss(4194308,4,Ji.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Ss(4194308,4,e,t)},useInsertionEffect:function(e,t){return Ss(4,2,e,t)},useMemo:function(e,t){var n=jt();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=jt();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=gp.bind(null,je,e),[r.memoizedState,e]},useRef:function(e){var t=jt();return e={current:e},t.memoizedState=e},useState:Qi,useDebugValue:fa,useDeferredValue:function(e){return jt().memoizedState=e},useTransition:function(){var e=Qi(!1),t=e[0];return e=hp.bind(null,e[1]),jt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=je,s=jt();if(be){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),ze===null)throw Error(i(349));(fn&30)!==0||Vi(r,t,n)}s.memoizedState=n;var o={value:n,getSnapshot:t};return s.queue=o,Yi(Hi.bind(null,r,o,e),[e]),r.flags|=2048,Nr(9,Wi.bind(null,r,o,n,t),void 0,null),n},useId:function(){var e=jt(),t=ze.identifierPrefix;if(be){var n=Lt,r=Tt;n=(r&~(1<<32-mt(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Sr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=mp++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},vp={readContext:ct,useCallback:tu,useContext:ct,useEffect:pa,useImperativeHandle:eu,useInsertionEffect:Zi,useLayoutEffect:Xi,useMemo:nu,useReducer:ca,useRef:Ki,useState:function(){return ca(jr)},useDebugValue:fa,useDeferredValue:function(e){var t=dt();return ru(t,Ae.memoizedState,e)},useTransition:function(){var e=ca(jr)[0],t=dt().memoizedState;return[e,t]},useMutableSource:Ui,useSyncExternalStore:$i,useId:su,unstable_isNewReconciler:!1},wp={readContext:ct,useCallback:tu,useContext:ct,useEffect:pa,useImperativeHandle:eu,useInsertionEffect:Zi,useLayoutEffect:Xi,useMemo:nu,useReducer:da,useRef:Ki,useState:function(){return da(jr)},useDebugValue:fa,useDeferredValue:function(e){var t=dt();return Ae===null?t.memoizedState=e:ru(t,Ae.memoizedState,e)},useTransition:function(){var e=da(jr)[0],t=dt().memoizedState;return[e,t]},useMutableSource:Ui,useSyncExternalStore:$i,useId:su,unstable_isNewReconciler:!1};function yt(e,t){if(e&&e.defaultProps){t=$({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function ma(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:$({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Es={isMounted:function(e){return(e=e._reactInternals)?ln(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=Ke(),s=Xt(e),o=At(r,s);o.payload=t,n!=null&&(o.callback=n),t=Qt(e,o,s),t!==null&&(wt(t,e,s,r),xs(t,e,s))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=Ke(),s=Xt(e),o=At(r,s);o.tag=1,o.payload=t,n!=null&&(o.callback=n),t=Qt(e,o,s),t!==null&&(wt(t,e,s,r),xs(t,e,s))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Ke(),r=Xt(e),s=At(n,r);s.tag=2,t!=null&&(s.callback=t),t=Qt(e,s,r),t!==null&&(wt(t,e,r,n),xs(t,e,r))}};function iu(e,t,n,r,s,o,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,o,c):t.prototype&&t.prototype.isPureReactComponent?!dr(n,r)||!dr(s,o):!0}function uu(e,t,n){var r=!1,s=Ht,o=t.contextType;return typeof o=="object"&&o!==null?o=ct(o):(s=Ze(t)?on:We.current,r=t.contextTypes,o=(r=r!=null)?An(e,s):Ht),t=new t(n,o),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Es,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=s,e.__reactInternalMemoizedMaskedChildContext=o),t}function cu(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Es.enqueueReplaceState(t,t.state,null)}function ha(e,t,n,r){var s=e.stateNode;s.props=n,s.state=e.memoizedState,s.refs={},ta(e);var o=t.contextType;typeof o=="object"&&o!==null?s.context=ct(o):(o=Ze(t)?on:We.current,s.context=An(e,o)),s.state=e.memoizedState,o=t.getDerivedStateFromProps,typeof o=="function"&&(ma(e,t,o,n),s.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(t=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),t!==s.state&&Es.enqueueReplaceState(s,s.state,null),vs(e,n,s,r),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308)}function Un(e,t){try{var n="",r=t;do n+=oe(r),r=r.return;while(r);var s=n}catch(o){s=`
Error generating stack: `+o.message+`
`+o.stack}return{value:e,source:t,stack:s,digest:null}}function ga(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function ya(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var bp=typeof WeakMap=="function"?WeakMap:Map;function du(e,t,n){n=At(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){As||(As=!0,Pa=r),ya(e,t)},n}function pu(e,t,n){n=At(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var s=t.value;n.payload=function(){return r(s)},n.callback=function(){ya(e,t)}}var o=e.stateNode;return o!==null&&typeof o.componentDidCatch=="function"&&(n.callback=function(){ya(e,t),typeof r!="function"&&(Yt===null?Yt=new Set([this]):Yt.add(this));var c=t.stack;this.componentDidCatch(t.value,{componentStack:c!==null?c:""})}),n}function fu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new bp;var s=new Set;r.set(t,s)}else s=r.get(t),s===void 0&&(s=new Set,r.set(t,s));s.has(n)||(s.add(n),e=Ip.bind(null,e,t,n),t.then(e,e))}function mu(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function hu(e,t,n,r,s){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=At(-1,1),t.tag=2,Qt(n,t,1))),n.lanes|=1),e):(e.flags|=65536,e.lanes=s,e)}var kp=Q.ReactCurrentOwner,Xe=!1;function Qe(e,t,n,r){t.child=e===null?Ii(t,null,n,r):Dn(t,e.child,n,r)}function gu(e,t,n,r,s){n=n.render;var o=t.ref;return Mn(t,s),r=ia(e,t,n,r,o,s),n=ua(),e!==null&&!Xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~s,Ot(e,t,s)):(be&&n&&Hl(t),t.flags|=1,Qe(e,t,r,s),t.child)}function yu(e,t,n,r,s){if(e===null){var o=n.type;return typeof o=="function"&&!Ma(o)&&o.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=o,xu(e,t,o,r,s)):(e=Ms(n.type,null,r,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(o=e.child,(e.lanes&s)===0){var c=o.memoizedProps;if(n=n.compare,n=n!==null?n:dr,n(c,r)&&e.ref===t.ref)return Ot(e,t,s)}return t.flags|=1,e=en(o,r),e.ref=t.ref,e.return=t,t.child=e}function xu(e,t,n,r,s){if(e!==null){var o=e.memoizedProps;if(dr(o,r)&&e.ref===t.ref)if(Xe=!1,t.pendingProps=r=o,(e.lanes&s)!==0)(e.flags&131072)!==0&&(Xe=!0);else return t.lanes=e.lanes,Ot(e,t,s)}return xa(e,t,n,r,s)}function vu(e,t,n){var r=t.pendingProps,s=r.children,o=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},xe(Vn,at),at|=n;else{if((n&1073741824)===0)return e=o!==null?o.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,xe(Vn,at),at|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=o!==null?o.baseLanes:n,xe(Vn,at),at|=r}else o!==null?(r=o.baseLanes|n,t.memoizedState=null):r=n,xe(Vn,at),at|=r;return Qe(e,t,s,n),t.child}function wu(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function xa(e,t,n,r,s){var o=Ze(n)?on:We.current;return o=An(t,o),Mn(t,s),n=ia(e,t,n,r,o,s),r=ua(),e!==null&&!Xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~s,Ot(e,t,s)):(be&&r&&Hl(t),t.flags|=1,Qe(e,t,n,s),t.child)}function bu(e,t,n,r,s){if(Ze(n)){var o=!0;cs(t)}else o=!1;if(Mn(t,s),t.stateNode===null)_s(e,t),uu(t,n,r),ha(t,n,r,s),r=!0;else if(e===null){var c=t.stateNode,p=t.memoizedProps;c.props=p;var m=c.context,E=n.contextType;typeof E=="object"&&E!==null?E=ct(E):(E=Ze(n)?on:We.current,E=An(t,E));var O=n.getDerivedStateFromProps,D=typeof O=="function"||typeof c.getSnapshotBeforeUpdate=="function";D||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(p!==r||m!==E)&&cu(t,c,r,E),qt=!1;var A=t.memoizedState;c.state=A,vs(t,r,c,s),m=t.memoizedState,p!==r||A!==m||Ye.current||qt?(typeof O=="function"&&(ma(t,n,O,r),m=t.memoizedState),(p=qt||iu(t,n,p,r,A,m,E))?(D||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount()),typeof c.componentDidMount=="function"&&(t.flags|=4194308)):(typeof c.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=m),c.props=r,c.state=m,c.context=E,r=p):(typeof c.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{c=t.stateNode,Di(e,t),p=t.memoizedProps,E=t.type===t.elementType?p:yt(t.type,p),c.props=E,D=t.pendingProps,A=c.context,m=n.contextType,typeof m=="object"&&m!==null?m=ct(m):(m=Ze(n)?on:We.current,m=An(t,m));var V=n.getDerivedStateFromProps;(O=typeof V=="function"||typeof c.getSnapshotBeforeUpdate=="function")||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(p!==D||A!==m)&&cu(t,c,r,m),qt=!1,A=t.memoizedState,c.state=A,vs(t,r,c,s);var H=t.memoizedState;p!==D||A!==H||Ye.current||qt?(typeof V=="function"&&(ma(t,n,V,r),H=t.memoizedState),(E=qt||iu(t,n,E,r,A,H,m)||!1)?(O||typeof c.UNSAFE_componentWillUpdate!="function"&&typeof c.componentWillUpdate!="function"||(typeof c.componentWillUpdate=="function"&&c.componentWillUpdate(r,H,m),typeof c.UNSAFE_componentWillUpdate=="function"&&c.UNSAFE_componentWillUpdate(r,H,m)),typeof c.componentDidUpdate=="function"&&(t.flags|=4),typeof c.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof c.componentDidUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=H),c.props=r,c.state=H,c.context=m,r=E):(typeof c.componentDidUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=1024),r=!1)}return va(e,t,n,r,o,s)}function va(e,t,n,r,s,o){wu(e,t);var c=(t.flags&128)!==0;if(!r&&!c)return s&&Ei(t,n,!1),Ot(e,t,o);r=t.stateNode,kp.current=t;var p=c&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&c?(t.child=Dn(t,e.child,null,o),t.child=Dn(t,null,p,o)):Qe(e,t,p,o),t.memoizedState=r.state,s&&Ei(t,n,!0),t.child}function ku(e){var t=e.stateNode;t.pendingContext?ji(e,t.pendingContext,t.pendingContext!==t.context):t.context&&ji(e,t.context,!1),na(e,t.containerInfo)}function Su(e,t,n,r,s){return Fn(),Kl(s),t.flags|=256,Qe(e,t,n,r),t.child}var wa={dehydrated:null,treeContext:null,retryLane:0};function ba(e){return{baseLanes:e,cachePool:null,transitions:null}}function ju(e,t,n){var r=t.pendingProps,s=Se.current,o=!1,c=(t.flags&128)!==0,p;if((p=c)||(p=e!==null&&e.memoizedState===null?!1:(s&2)!==0),p?(o=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(s|=1),xe(Se,s&1),e===null)return Ql(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(c=r.children,e=r.fallback,o?(r=t.mode,o=t.child,c={mode:"hidden",children:c},(r&1)===0&&o!==null?(o.childLanes=0,o.pendingProps=c):o=Bs(c,r,0,null),e=xn(e,r,n,null),o.return=t,e.return=t,o.sibling=e,t.child=o,t.child.memoizedState=ba(n),t.memoizedState=wa,e):ka(t,c));if(s=e.memoizedState,s!==null&&(p=s.dehydrated,p!==null))return Sp(e,t,c,r,p,s,n);if(o){o=r.fallback,c=t.mode,s=e.child,p=s.sibling;var m={mode:"hidden",children:r.children};return(c&1)===0&&t.child!==s?(r=t.child,r.childLanes=0,r.pendingProps=m,t.deletions=null):(r=en(s,m),r.subtreeFlags=s.subtreeFlags&14680064),p!==null?o=en(p,o):(o=xn(o,c,n,null),o.flags|=2),o.return=t,r.return=t,r.sibling=o,t.child=r,r=o,o=t.child,c=e.child.memoizedState,c=c===null?ba(n):{baseLanes:c.baseLanes|n,cachePool:null,transitions:c.transitions},o.memoizedState=c,o.childLanes=e.childLanes&~n,t.memoizedState=wa,r}return o=e.child,e=o.sibling,r=en(o,{mode:"visible",children:r.children}),(t.mode&1)===0&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function ka(e,t){return t=Bs({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Cs(e,t,n,r){return r!==null&&Kl(r),Dn(t,e.child,null,n),e=ka(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Sp(e,t,n,r,s,o,c){if(n)return t.flags&256?(t.flags&=-257,r=ga(Error(i(422))),Cs(e,t,c,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(o=r.fallback,s=t.mode,r=Bs({mode:"visible",children:r.children},s,0,null),o=xn(o,s,c,null),o.flags|=2,r.return=t,o.return=t,r.sibling=o,t.child=r,(t.mode&1)!==0&&Dn(t,e.child,null,c),t.child.memoizedState=ba(c),t.memoizedState=wa,o);if((t.mode&1)===0)return Cs(e,t,c,null);if(s.data==="$!"){if(r=s.nextSibling&&s.nextSibling.dataset,r)var p=r.dgst;return r=p,o=Error(i(419)),r=ga(o,r,void 0),Cs(e,t,c,r)}if(p=(c&e.childLanes)!==0,Xe||p){if(r=ze,r!==null){switch(c&-c){case 4:s=2;break;case 16:s=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:s=32;break;case 536870912:s=268435456;break;default:s=0}s=(s&(r.suspendedLanes|c))!==0?0:s,s!==0&&s!==o.retryLane&&(o.retryLane=s,Pt(e,s),wt(r,e,s,-1))}return za(),r=ga(Error(i(421))),Cs(e,t,c,r)}return s.data==="$?"?(t.flags|=128,t.child=e.child,t=Fp.bind(null,e),s._reactRetry=t,null):(e=o.treeContext,lt=Vt(s.nextSibling),st=t,be=!0,gt=null,e!==null&&(it[ut++]=Tt,it[ut++]=Lt,it[ut++]=un,Tt=e.id,Lt=e.overflow,un=t),t=ka(t,r.children),t.flags|=4096,t)}function Nu(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Jl(e.return,t,n)}function Sa(e,t,n,r,s){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:s}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=s)}function Eu(e,t,n){var r=t.pendingProps,s=r.revealOrder,o=r.tail;if(Qe(e,t,r.children,n),r=Se.current,(r&2)!==0)r=r&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Nu(e,n,t);else if(e.tag===19)Nu(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(xe(Se,r),(t.mode&1)===0)t.memoizedState=null;else switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&ws(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),Sa(t,!1,s,n,o);break;case"backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&ws(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}Sa(t,!0,n,null,o);break;case"together":Sa(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function _s(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Ot(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),mn|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=en(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=en(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function jp(e,t,n){switch(t.tag){case 3:ku(t),Fn();break;case 5:Bi(t);break;case 1:Ze(t.type)&&cs(t);break;case 4:na(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,s=t.memoizedProps.value;xe(gs,r._currentValue),r._currentValue=s;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(xe(Se,Se.current&1),t.flags|=128,null):(n&t.child.childLanes)!==0?ju(e,t,n):(xe(Se,Se.current&1),e=Ot(e,t,n),e!==null?e.sibling:null);xe(Se,Se.current&1);break;case 19:if(r=(n&t.childLanes)!==0,(e.flags&128)!==0){if(r)return Eu(e,t,n);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),xe(Se,Se.current),r)break;return null;case 22:case 23:return t.lanes=0,vu(e,t,n)}return Ot(e,t,n)}var Cu,ja,_u,Ru;Cu=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}},ja=function(){},_u=function(e,t,n,r){var s=e.memoizedProps;if(s!==r){e=t.stateNode,pn(St.current);var o=null;switch(n){case"input":s=Js(e,s),r=Js(e,r),o=[];break;case"select":s=$({},s,{value:void 0}),r=$({},r,{value:void 0}),o=[];break;case"textarea":s=nl(e,s),r=nl(e,r),o=[];break;default:typeof s.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=os)}sl(n,r);var c;n=null;for(E in s)if(!r.hasOwnProperty(E)&&s.hasOwnProperty(E)&&s[E]!=null)if(E==="style"){var p=s[E];for(c in p)p.hasOwnProperty(c)&&(n||(n={}),n[c]="")}else E!=="dangerouslySetInnerHTML"&&E!=="children"&&E!=="suppressContentEditableWarning"&&E!=="suppressHydrationWarning"&&E!=="autoFocus"&&(f.hasOwnProperty(E)?o||(o=[]):(o=o||[]).push(E,null));for(E in r){var m=r[E];if(p=s!=null?s[E]:void 0,r.hasOwnProperty(E)&&m!==p&&(m!=null||p!=null))if(E==="style")if(p){for(c in p)!p.hasOwnProperty(c)||m&&m.hasOwnProperty(c)||(n||(n={}),n[c]="");for(c in m)m.hasOwnProperty(c)&&p[c]!==m[c]&&(n||(n={}),n[c]=m[c])}else n||(o||(o=[]),o.push(E,n)),n=m;else E==="dangerouslySetInnerHTML"?(m=m?m.__html:void 0,p=p?p.__html:void 0,m!=null&&p!==m&&(o=o||[]).push(E,m)):E==="children"?typeof m!="string"&&typeof m!="number"||(o=o||[]).push(E,""+m):E!=="suppressContentEditableWarning"&&E!=="suppressHydrationWarning"&&(f.hasOwnProperty(E)?(m!=null&&E==="onScroll"&&ve("scroll",e),o||p===m||(o=[])):(o=o||[]).push(E,m))}n&&(o=o||[]).push("style",n);var E=o;(t.updateQueue=E)&&(t.flags|=4)}},Ru=function(e,t,n,r){n!==r&&(t.flags|=4)};function Er(e,t){if(!be)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function Ge(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var s=e.child;s!==null;)n|=s.lanes|s.childLanes,r|=s.subtreeFlags&14680064,r|=s.flags&14680064,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)n|=s.lanes|s.childLanes,r|=s.subtreeFlags,r|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Np(e,t,n){var r=t.pendingProps;switch(Gl(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ge(t),null;case 1:return Ze(t.type)&&us(),Ge(t),null;case 3:return r=t.stateNode,Bn(),we(Ye),we(We),la(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(ms(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,gt!==null&&(Ia(gt),gt=null))),ja(e,t),Ge(t),null;case 5:ra(t);var s=pn(br.current);if(n=t.type,e!==null&&t.stateNode!=null)_u(e,t,n,r,s),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(i(166));return Ge(t),null}if(e=pn(St.current),ms(t)){r=t.stateNode,n=t.type;var o=t.memoizedProps;switch(r[kt]=t,r[gr]=o,e=(t.mode&1)!==0,n){case"dialog":ve("cancel",r),ve("close",r);break;case"iframe":case"object":case"embed":ve("load",r);break;case"video":case"audio":for(s=0;s<fr.length;s++)ve(fr[s],r);break;case"source":ve("error",r);break;case"img":case"image":case"link":ve("error",r),ve("load",r);break;case"details":ve("toggle",r);break;case"input":io(r,o),ve("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!o.multiple},ve("invalid",r);break;case"textarea":po(r,o),ve("invalid",r)}sl(n,o),s=null;for(var c in o)if(o.hasOwnProperty(c)){var p=o[c];c==="children"?typeof p=="string"?r.textContent!==p&&(o.suppressHydrationWarning!==!0&&as(r.textContent,p,e),s=["children",p]):typeof p=="number"&&r.textContent!==""+p&&(o.suppressHydrationWarning!==!0&&as(r.textContent,p,e),s=["children",""+p]):f.hasOwnProperty(c)&&p!=null&&c==="onScroll"&&ve("scroll",r)}switch(n){case"input":Dr(r),co(r,o,!0);break;case"textarea":Dr(r),mo(r);break;case"select":case"option":break;default:typeof o.onClick=="function"&&(r.onclick=os)}r=s,t.updateQueue=r,r!==null&&(t.flags|=4)}else{c=s.nodeType===9?s:s.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=ho(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=c.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=c.createElement(n,{is:r.is}):(e=c.createElement(n),n==="select"&&(c=e,r.multiple?c.multiple=!0:r.size&&(c.size=r.size))):e=c.createElementNS(e,n),e[kt]=t,e[gr]=r,Cu(e,t,!1,!1),t.stateNode=e;e:{switch(c=ll(n,r),n){case"dialog":ve("cancel",e),ve("close",e),s=r;break;case"iframe":case"object":case"embed":ve("load",e),s=r;break;case"video":case"audio":for(s=0;s<fr.length;s++)ve(fr[s],e);s=r;break;case"source":ve("error",e),s=r;break;case"img":case"image":case"link":ve("error",e),ve("load",e),s=r;break;case"details":ve("toggle",e),s=r;break;case"input":io(e,r),s=Js(e,r),ve("invalid",e);break;case"option":s=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},s=$({},r,{value:void 0}),ve("invalid",e);break;case"textarea":po(e,r),s=nl(e,r),ve("invalid",e);break;default:s=r}sl(n,s),p=s;for(o in p)if(p.hasOwnProperty(o)){var m=p[o];o==="style"?xo(e,m):o==="dangerouslySetInnerHTML"?(m=m?m.__html:void 0,m!=null&&go(e,m)):o==="children"?typeof m=="string"?(n!=="textarea"||m!=="")&&Qn(e,m):typeof m=="number"&&Qn(e,""+m):o!=="suppressContentEditableWarning"&&o!=="suppressHydrationWarning"&&o!=="autoFocus"&&(f.hasOwnProperty(o)?m!=null&&o==="onScroll"&&ve("scroll",e):m!=null&&F(e,o,m,c))}switch(n){case"input":Dr(e),co(e,r,!1);break;case"textarea":Dr(e),mo(e);break;case"option":r.value!=null&&e.setAttribute("value",""+pe(r.value));break;case"select":e.multiple=!!r.multiple,o=r.value,o!=null?bn(e,!!r.multiple,o,!1):r.defaultValue!=null&&bn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof s.onClick=="function"&&(e.onclick=os)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return Ge(t),null;case 6:if(e&&t.stateNode!=null)Ru(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(i(166));if(n=pn(br.current),pn(St.current),ms(t)){if(r=t.stateNode,n=t.memoizedProps,r[kt]=t,(o=r.nodeValue!==n)&&(e=st,e!==null))switch(e.tag){case 3:as(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&as(r.nodeValue,n,(e.mode&1)!==0)}o&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[kt]=t,t.stateNode=r}return Ge(t),null;case 13:if(we(Se),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(be&&lt!==null&&(t.mode&1)!==0&&(t.flags&128)===0)Pi(),Fn(),t.flags|=98560,o=!1;else if(o=ms(t),r!==null&&r.dehydrated!==null){if(e===null){if(!o)throw Error(i(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(i(317));o[kt]=t}else Fn(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ge(t),o=!1}else gt!==null&&(Ia(gt),gt=null),o=!0;if(!o)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Se.current&1)!==0?Oe===0&&(Oe=3):za())),t.updateQueue!==null&&(t.flags|=4),Ge(t),null);case 4:return Bn(),ja(e,t),e===null&&mr(t.stateNode.containerInfo),Ge(t),null;case 10:return Xl(t.type._context),Ge(t),null;case 17:return Ze(t.type)&&us(),Ge(t),null;case 19:if(we(Se),o=t.memoizedState,o===null)return Ge(t),null;if(r=(t.flags&128)!==0,c=o.rendering,c===null)if(r)Er(o,!1);else{if(Oe!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(c=ws(e),c!==null){for(t.flags|=128,Er(o,!1),r=c.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)o=n,e=r,o.flags&=14680066,c=o.alternate,c===null?(o.childLanes=0,o.lanes=e,o.child=null,o.subtreeFlags=0,o.memoizedProps=null,o.memoizedState=null,o.updateQueue=null,o.dependencies=null,o.stateNode=null):(o.childLanes=c.childLanes,o.lanes=c.lanes,o.child=c.child,o.subtreeFlags=0,o.deletions=null,o.memoizedProps=c.memoizedProps,o.memoizedState=c.memoizedState,o.updateQueue=c.updateQueue,o.type=c.type,e=c.dependencies,o.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return xe(Se,Se.current&1|2),t.child}e=e.sibling}o.tail!==null&&Re()>Wn&&(t.flags|=128,r=!0,Er(o,!1),t.lanes=4194304)}else{if(!r)if(e=ws(c),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),Er(o,!0),o.tail===null&&o.tailMode==="hidden"&&!c.alternate&&!be)return Ge(t),null}else 2*Re()-o.renderingStartTime>Wn&&n!==1073741824&&(t.flags|=128,r=!0,Er(o,!1),t.lanes=4194304);o.isBackwards?(c.sibling=t.child,t.child=c):(n=o.last,n!==null?n.sibling=c:t.child=c,o.last=c)}return o.tail!==null?(t=o.tail,o.rendering=t,o.tail=t.sibling,o.renderingStartTime=Re(),t.sibling=null,n=Se.current,xe(Se,r?n&1|2:n&1),t):(Ge(t),null);case 22:case 23:return Da(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&(t.mode&1)!==0?(at&1073741824)!==0&&(Ge(t),t.subtreeFlags&6&&(t.flags|=8192)):Ge(t),null;case 24:return null;case 25:return null}throw Error(i(156,t.tag))}function Ep(e,t){switch(Gl(t),t.tag){case 1:return Ze(t.type)&&us(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Bn(),we(Ye),we(We),la(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return ra(t),null;case 13:if(we(Se),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Fn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return we(Se),null;case 4:return Bn(),null;case 10:return Xl(t.type._context),null;case 22:case 23:return Da(),null;case 24:return null;default:return null}}var Rs=!1,qe=!1,Cp=typeof WeakSet=="function"?WeakSet:Set,W=null;function $n(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Ne(e,t,r)}else n.current=null}function Na(e,t,n){try{n()}catch(r){Ne(e,t,r)}}var Tu=!1;function _p(e,t){if(Dl=Kr,e=ii(),Rl(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var s=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break e}var c=0,p=-1,m=-1,E=0,O=0,D=e,A=null;t:for(;;){for(var V;D!==n||s!==0&&D.nodeType!==3||(p=c+s),D!==o||r!==0&&D.nodeType!==3||(m=c+r),D.nodeType===3&&(c+=D.nodeValue.length),(V=D.firstChild)!==null;)A=D,D=V;for(;;){if(D===e)break t;if(A===n&&++E===s&&(p=c),A===o&&++O===r&&(m=c),(V=D.nextSibling)!==null)break;D=A,A=D.parentNode}D=V}n=p===-1||m===-1?null:{start:p,end:m}}else n=null}n=n||{start:0,end:0}}else n=null;for(zl={focusedElem:e,selectionRange:n},Kr=!1,W=t;W!==null;)if(t=W,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,W=e;else for(;W!==null;){t=W;try{var H=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(H!==null){var G=H.memoizedProps,Te=H.memoizedState,k=t.stateNode,h=k.getSnapshotBeforeUpdate(t.elementType===t.type?G:yt(t.type,G),Te);k.__reactInternalSnapshotBeforeUpdate=h}break;case 3:var S=t.stateNode.containerInfo;S.nodeType===1?S.textContent="":S.nodeType===9&&S.documentElement&&S.removeChild(S.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(i(163))}}catch(M){Ne(t,t.return,M)}if(e=t.sibling,e!==null){e.return=t.return,W=e;break}W=t.return}return H=Tu,Tu=!1,H}function Cr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var s=r=r.next;do{if((s.tag&e)===e){var o=s.destroy;s.destroy=void 0,o!==void 0&&Na(t,n,o)}s=s.next}while(s!==r)}}function Ts(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function Ea(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function Lu(e){var t=e.alternate;t!==null&&(e.alternate=null,Lu(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[kt],delete t[gr],delete t[$l],delete t[cp],delete t[dp])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Pu(e){return e.tag===5||e.tag===3||e.tag===4}function Au(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Pu(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Ca(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=os));else if(r!==4&&(e=e.child,e!==null))for(Ca(e,t,n),e=e.sibling;e!==null;)Ca(e,t,n),e=e.sibling}function _a(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(_a(e,t,n),e=e.sibling;e!==null;)_a(e,t,n),e=e.sibling}var Ue=null,xt=!1;function Kt(e,t,n){for(n=n.child;n!==null;)Ou(e,t,n),n=n.sibling}function Ou(e,t,n){if(bt&&typeof bt.onCommitFiberUnmount=="function")try{bt.onCommitFiberUnmount(Vr,n)}catch{}switch(n.tag){case 5:qe||$n(n,t);case 6:var r=Ue,s=xt;Ue=null,Kt(e,t,n),Ue=r,xt=s,Ue!==null&&(xt?(e=Ue,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):Ue.removeChild(n.stateNode));break;case 18:Ue!==null&&(xt?(e=Ue,n=n.stateNode,e.nodeType===8?Ul(e.parentNode,n):e.nodeType===1&&Ul(e,n),lr(e)):Ul(Ue,n.stateNode));break;case 4:r=Ue,s=xt,Ue=n.stateNode.containerInfo,xt=!0,Kt(e,t,n),Ue=r,xt=s;break;case 0:case 11:case 14:case 15:if(!qe&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){s=r=r.next;do{var o=s,c=o.destroy;o=o.tag,c!==void 0&&((o&2)!==0||(o&4)!==0)&&Na(n,t,c),s=s.next}while(s!==r)}Kt(e,t,n);break;case 1:if(!qe&&($n(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(p){Ne(n,t,p)}Kt(e,t,n);break;case 21:Kt(e,t,n);break;case 22:n.mode&1?(qe=(r=qe)||n.memoizedState!==null,Kt(e,t,n),qe=r):Kt(e,t,n);break;default:Kt(e,t,n)}}function Iu(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Cp),t.forEach(function(r){var s=Dp.bind(null,e,r);n.has(r)||(n.add(r),r.then(s,s))})}}function vt(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var s=n[r];try{var o=e,c=t,p=c;e:for(;p!==null;){switch(p.tag){case 5:Ue=p.stateNode,xt=!1;break e;case 3:Ue=p.stateNode.containerInfo,xt=!0;break e;case 4:Ue=p.stateNode.containerInfo,xt=!0;break e}p=p.return}if(Ue===null)throw Error(i(160));Ou(o,c,s),Ue=null,xt=!1;var m=s.alternate;m!==null&&(m.return=null),s.return=null}catch(E){Ne(s,t,E)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Fu(t,e),t=t.sibling}function Fu(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(vt(t,e),Nt(e),r&4){try{Cr(3,e,e.return),Ts(3,e)}catch(G){Ne(e,e.return,G)}try{Cr(5,e,e.return)}catch(G){Ne(e,e.return,G)}}break;case 1:vt(t,e),Nt(e),r&512&&n!==null&&$n(n,n.return);break;case 5:if(vt(t,e),Nt(e),r&512&&n!==null&&$n(n,n.return),e.flags&32){var s=e.stateNode;try{Qn(s,"")}catch(G){Ne(e,e.return,G)}}if(r&4&&(s=e.stateNode,s!=null)){var o=e.memoizedProps,c=n!==null?n.memoizedProps:o,p=e.type,m=e.updateQueue;if(e.updateQueue=null,m!==null)try{p==="input"&&o.type==="radio"&&o.name!=null&&uo(s,o),ll(p,c);var E=ll(p,o);for(c=0;c<m.length;c+=2){var O=m[c],D=m[c+1];O==="style"?xo(s,D):O==="dangerouslySetInnerHTML"?go(s,D):O==="children"?Qn(s,D):F(s,O,D,E)}switch(p){case"input":el(s,o);break;case"textarea":fo(s,o);break;case"select":var A=s._wrapperState.wasMultiple;s._wrapperState.wasMultiple=!!o.multiple;var V=o.value;V!=null?bn(s,!!o.multiple,V,!1):A!==!!o.multiple&&(o.defaultValue!=null?bn(s,!!o.multiple,o.defaultValue,!0):bn(s,!!o.multiple,o.multiple?[]:"",!1))}s[gr]=o}catch(G){Ne(e,e.return,G)}}break;case 6:if(vt(t,e),Nt(e),r&4){if(e.stateNode===null)throw Error(i(162));s=e.stateNode,o=e.memoizedProps;try{s.nodeValue=o}catch(G){Ne(e,e.return,G)}}break;case 3:if(vt(t,e),Nt(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{lr(t.containerInfo)}catch(G){Ne(e,e.return,G)}break;case 4:vt(t,e),Nt(e);break;case 13:vt(t,e),Nt(e),s=e.child,s.flags&8192&&(o=s.memoizedState!==null,s.stateNode.isHidden=o,!o||s.alternate!==null&&s.alternate.memoizedState!==null||(La=Re())),r&4&&Iu(e);break;case 22:if(O=n!==null&&n.memoizedState!==null,e.mode&1?(qe=(E=qe)||O,vt(t,e),qe=E):vt(t,e),Nt(e),r&8192){if(E=e.memoizedState!==null,(e.stateNode.isHidden=E)&&!O&&(e.mode&1)!==0)for(W=e,O=e.child;O!==null;){for(D=W=O;W!==null;){switch(A=W,V=A.child,A.tag){case 0:case 11:case 14:case 15:Cr(4,A,A.return);break;case 1:$n(A,A.return);var H=A.stateNode;if(typeof H.componentWillUnmount=="function"){r=A,n=A.return;try{t=r,H.props=t.memoizedProps,H.state=t.memoizedState,H.componentWillUnmount()}catch(G){Ne(r,n,G)}}break;case 5:$n(A,A.return);break;case 22:if(A.memoizedState!==null){Mu(D);continue}}V!==null?(V.return=A,W=V):Mu(D)}O=O.sibling}e:for(O=null,D=e;;){if(D.tag===5){if(O===null){O=D;try{s=D.stateNode,E?(o=s.style,typeof o.setProperty=="function"?o.setProperty("display","none","important"):o.display="none"):(p=D.stateNode,m=D.memoizedProps.style,c=m!=null&&m.hasOwnProperty("display")?m.display:null,p.style.display=yo("display",c))}catch(G){Ne(e,e.return,G)}}}else if(D.tag===6){if(O===null)try{D.stateNode.nodeValue=E?"":D.memoizedProps}catch(G){Ne(e,e.return,G)}}else if((D.tag!==22&&D.tag!==23||D.memoizedState===null||D===e)&&D.child!==null){D.child.return=D,D=D.child;continue}if(D===e)break e;for(;D.sibling===null;){if(D.return===null||D.return===e)break e;O===D&&(O=null),D=D.return}O===D&&(O=null),D.sibling.return=D.return,D=D.sibling}}break;case 19:vt(t,e),Nt(e),r&4&&Iu(e);break;case 21:break;default:vt(t,e),Nt(e)}}function Nt(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Pu(n)){var r=n;break e}n=n.return}throw Error(i(160))}switch(r.tag){case 5:var s=r.stateNode;r.flags&32&&(Qn(s,""),r.flags&=-33);var o=Au(e);_a(e,o,s);break;case 3:case 4:var c=r.stateNode.containerInfo,p=Au(e);Ca(e,p,c);break;default:throw Error(i(161))}}catch(m){Ne(e,e.return,m)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Rp(e,t,n){W=e,Du(e)}function Du(e,t,n){for(var r=(e.mode&1)!==0;W!==null;){var s=W,o=s.child;if(s.tag===22&&r){var c=s.memoizedState!==null||Rs;if(!c){var p=s.alternate,m=p!==null&&p.memoizedState!==null||qe;p=Rs;var E=qe;if(Rs=c,(qe=m)&&!E)for(W=s;W!==null;)c=W,m=c.child,c.tag===22&&c.memoizedState!==null?Bu(s):m!==null?(m.return=c,W=m):Bu(s);for(;o!==null;)W=o,Du(o),o=o.sibling;W=s,Rs=p,qe=E}zu(e)}else(s.subtreeFlags&8772)!==0&&o!==null?(o.return=s,W=o):zu(e)}}function zu(e){for(;W!==null;){var t=W;if((t.flags&8772)!==0){var n=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:qe||Ts(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!qe)if(n===null)r.componentDidMount();else{var s=t.elementType===t.type?n.memoizedProps:yt(t.type,n.memoizedProps);r.componentDidUpdate(s,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var o=t.updateQueue;o!==null&&Mi(t,o,r);break;case 3:var c=t.updateQueue;if(c!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Mi(t,c,n)}break;case 5:var p=t.stateNode;if(n===null&&t.flags&4){n=p;var m=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":m.autoFocus&&n.focus();break;case"img":m.src&&(n.src=m.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var E=t.alternate;if(E!==null){var O=E.memoizedState;if(O!==null){var D=O.dehydrated;D!==null&&lr(D)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(i(163))}qe||t.flags&512&&Ea(t)}catch(A){Ne(t,t.return,A)}}if(t===e){W=null;break}if(n=t.sibling,n!==null){n.return=t.return,W=n;break}W=t.return}}function Mu(e){for(;W!==null;){var t=W;if(t===e){W=null;break}var n=t.sibling;if(n!==null){n.return=t.return,W=n;break}W=t.return}}function Bu(e){for(;W!==null;){var t=W;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Ts(4,t)}catch(m){Ne(t,n,m)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var s=t.return;try{r.componentDidMount()}catch(m){Ne(t,s,m)}}var o=t.return;try{Ea(t)}catch(m){Ne(t,o,m)}break;case 5:var c=t.return;try{Ea(t)}catch(m){Ne(t,c,m)}}}catch(m){Ne(t,t.return,m)}if(t===e){W=null;break}var p=t.sibling;if(p!==null){p.return=t.return,W=p;break}W=t.return}}var Tp=Math.ceil,Ls=Q.ReactCurrentDispatcher,Ra=Q.ReactCurrentOwner,pt=Q.ReactCurrentBatchConfig,ie=0,ze=null,Le=null,$e=0,at=0,Vn=Wt(0),Oe=0,_r=null,mn=0,Ps=0,Ta=0,Rr=null,Je=null,La=0,Wn=1/0,It=null,As=!1,Pa=null,Yt=null,Os=!1,Zt=null,Is=0,Tr=0,Aa=null,Fs=-1,Ds=0;function Ke(){return(ie&6)!==0?Re():Fs!==-1?Fs:Fs=Re()}function Xt(e){return(e.mode&1)===0?1:(ie&2)!==0&&$e!==0?$e&-$e:fp.transition!==null?(Ds===0&&(Ds=Ao()),Ds):(e=fe,e!==0||(e=window.event,e=e===void 0?16:$o(e.type)),e)}function wt(e,t,n,r){if(50<Tr)throw Tr=0,Aa=null,Error(i(185));er(e,n,r),((ie&2)===0||e!==ze)&&(e===ze&&((ie&2)===0&&(Ps|=n),Oe===4&&Jt(e,$e)),et(e,r),n===1&&ie===0&&(t.mode&1)===0&&(Wn=Re()+500,ds&&Gt()))}function et(e,t){var n=e.callbackNode;fd(e,t);var r=Gr(e,e===ze?$e:0);if(r===0)n!==null&&To(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&To(n),t===1)e.tag===0?pp($u.bind(null,e)):Ci($u.bind(null,e)),ip(function(){(ie&6)===0&&Gt()}),n=null;else{switch(Oo(r)){case 1:n=pl;break;case 4:n=Lo;break;case 16:n=$r;break;case 536870912:n=Po;break;default:n=$r}n=Yu(n,Uu.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function Uu(e,t){if(Fs=-1,Ds=0,(ie&6)!==0)throw Error(i(327));var n=e.callbackNode;if(Hn()&&e.callbackNode!==n)return null;var r=Gr(e,e===ze?$e:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||t)t=zs(e,r);else{t=r;var s=ie;ie|=2;var o=Wu();(ze!==e||$e!==t)&&(It=null,Wn=Re()+500,gn(e,t));do try{Ap();break}catch(p){Vu(e,p)}while(!0);Zl(),Ls.current=o,ie=s,Le!==null?t=0:(ze=null,$e=0,t=Oe)}if(t!==0){if(t===2&&(s=fl(e),s!==0&&(r=s,t=Oa(e,s))),t===1)throw n=_r,gn(e,0),Jt(e,r),et(e,Re()),n;if(t===6)Jt(e,r);else{if(s=e.current.alternate,(r&30)===0&&!Lp(s)&&(t=zs(e,r),t===2&&(o=fl(e),o!==0&&(r=o,t=Oa(e,o))),t===1))throw n=_r,gn(e,0),Jt(e,r),et(e,Re()),n;switch(e.finishedWork=s,e.finishedLanes=r,t){case 0:case 1:throw Error(i(345));case 2:yn(e,Je,It);break;case 3:if(Jt(e,r),(r&130023424)===r&&(t=La+500-Re(),10<t)){if(Gr(e,0)!==0)break;if(s=e.suspendedLanes,(s&r)!==r){Ke(),e.pingedLanes|=e.suspendedLanes&s;break}e.timeoutHandle=Bl(yn.bind(null,e,Je,It),t);break}yn(e,Je,It);break;case 4:if(Jt(e,r),(r&4194240)===r)break;for(t=e.eventTimes,s=-1;0<r;){var c=31-mt(r);o=1<<c,c=t[c],c>s&&(s=c),r&=~o}if(r=s,r=Re()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Tp(r/1960))-r,10<r){e.timeoutHandle=Bl(yn.bind(null,e,Je,It),r);break}yn(e,Je,It);break;case 5:yn(e,Je,It);break;default:throw Error(i(329))}}}return et(e,Re()),e.callbackNode===n?Uu.bind(null,e):null}function Oa(e,t){var n=Rr;return e.current.memoizedState.isDehydrated&&(gn(e,t).flags|=256),e=zs(e,t),e!==2&&(t=Je,Je=n,t!==null&&Ia(t)),e}function Ia(e){Je===null?Je=e:Je.push.apply(Je,e)}function Lp(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var s=n[r],o=s.getSnapshot;s=s.value;try{if(!ht(o(),s))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Jt(e,t){for(t&=~Ta,t&=~Ps,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-mt(t),r=1<<n;e[n]=-1,t&=~r}}function $u(e){if((ie&6)!==0)throw Error(i(327));Hn();var t=Gr(e,0);if((t&1)===0)return et(e,Re()),null;var n=zs(e,t);if(e.tag!==0&&n===2){var r=fl(e);r!==0&&(t=r,n=Oa(e,r))}if(n===1)throw n=_r,gn(e,0),Jt(e,t),et(e,Re()),n;if(n===6)throw Error(i(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,yn(e,Je,It),et(e,Re()),null}function Fa(e,t){var n=ie;ie|=1;try{return e(t)}finally{ie=n,ie===0&&(Wn=Re()+500,ds&&Gt())}}function hn(e){Zt!==null&&Zt.tag===0&&(ie&6)===0&&Hn();var t=ie;ie|=1;var n=pt.transition,r=fe;try{if(pt.transition=null,fe=1,e)return e()}finally{fe=r,pt.transition=n,ie=t,(ie&6)===0&&Gt()}}function Da(){at=Vn.current,we(Vn)}function gn(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,op(n)),Le!==null)for(n=Le.return;n!==null;){var r=n;switch(Gl(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&us();break;case 3:Bn(),we(Ye),we(We),la();break;case 5:ra(r);break;case 4:Bn();break;case 13:we(Se);break;case 19:we(Se);break;case 10:Xl(r.type._context);break;case 22:case 23:Da()}n=n.return}if(ze=e,Le=e=en(e.current,null),$e=at=t,Oe=0,_r=null,Ta=Ps=mn=0,Je=Rr=null,dn!==null){for(t=0;t<dn.length;t++)if(n=dn[t],r=n.interleaved,r!==null){n.interleaved=null;var s=r.next,o=n.pending;if(o!==null){var c=o.next;o.next=s,r.next=c}n.pending=r}dn=null}return e}function Vu(e,t){do{var n=Le;try{if(Zl(),bs.current=Ns,ks){for(var r=je.memoizedState;r!==null;){var s=r.queue;s!==null&&(s.pending=null),r=r.next}ks=!1}if(fn=0,De=Ae=je=null,kr=!1,Sr=0,Ra.current=null,n===null||n.return===null){Oe=1,_r=t,Le=null;break}e:{var o=e,c=n.return,p=n,m=t;if(t=$e,p.flags|=32768,m!==null&&typeof m=="object"&&typeof m.then=="function"){var E=m,O=p,D=O.tag;if((O.mode&1)===0&&(D===0||D===11||D===15)){var A=O.alternate;A?(O.updateQueue=A.updateQueue,O.memoizedState=A.memoizedState,O.lanes=A.lanes):(O.updateQueue=null,O.memoizedState=null)}var V=mu(c);if(V!==null){V.flags&=-257,hu(V,c,p,o,t),V.mode&1&&fu(o,E,t),t=V,m=E;var H=t.updateQueue;if(H===null){var G=new Set;G.add(m),t.updateQueue=G}else H.add(m);break e}else{if((t&1)===0){fu(o,E,t),za();break e}m=Error(i(426))}}else if(be&&p.mode&1){var Te=mu(c);if(Te!==null){(Te.flags&65536)===0&&(Te.flags|=256),hu(Te,c,p,o,t),Kl(Un(m,p));break e}}o=m=Un(m,p),Oe!==4&&(Oe=2),Rr===null?Rr=[o]:Rr.push(o),o=c;do{switch(o.tag){case 3:o.flags|=65536,t&=-t,o.lanes|=t;var k=du(o,m,t);zi(o,k);break e;case 1:p=m;var h=o.type,S=o.stateNode;if((o.flags&128)===0&&(typeof h.getDerivedStateFromError=="function"||S!==null&&typeof S.componentDidCatch=="function"&&(Yt===null||!Yt.has(S)))){o.flags|=65536,t&=-t,o.lanes|=t;var M=pu(o,p,t);zi(o,M);break e}}o=o.return}while(o!==null)}Gu(n)}catch(K){t=K,Le===n&&n!==null&&(Le=n=n.return);continue}break}while(!0)}function Wu(){var e=Ls.current;return Ls.current=Ns,e===null?Ns:e}function za(){(Oe===0||Oe===3||Oe===2)&&(Oe=4),ze===null||(mn&268435455)===0&&(Ps&268435455)===0||Jt(ze,$e)}function zs(e,t){var n=ie;ie|=2;var r=Wu();(ze!==e||$e!==t)&&(It=null,gn(e,t));do try{Pp();break}catch(s){Vu(e,s)}while(!0);if(Zl(),ie=n,Ls.current=r,Le!==null)throw Error(i(261));return ze=null,$e=0,Oe}function Pp(){for(;Le!==null;)Hu(Le)}function Ap(){for(;Le!==null&&!sd();)Hu(Le)}function Hu(e){var t=Ku(e.alternate,e,at);e.memoizedProps=e.pendingProps,t===null?Gu(e):Le=t,Ra.current=null}function Gu(e){var t=e;do{var n=t.alternate;if(e=t.return,(t.flags&32768)===0){if(n=Np(n,t,at),n!==null){Le=n;return}}else{if(n=Ep(n,t),n!==null){n.flags&=32767,Le=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{Oe=6,Le=null;return}}if(t=t.sibling,t!==null){Le=t;return}Le=t=e}while(t!==null);Oe===0&&(Oe=5)}function yn(e,t,n){var r=fe,s=pt.transition;try{pt.transition=null,fe=1,Op(e,t,n,r)}finally{pt.transition=s,fe=r}return null}function Op(e,t,n,r){do Hn();while(Zt!==null);if((ie&6)!==0)throw Error(i(327));n=e.finishedWork;var s=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(i(177));e.callbackNode=null,e.callbackPriority=0;var o=n.lanes|n.childLanes;if(md(e,o),e===ze&&(Le=ze=null,$e=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||Os||(Os=!0,Yu($r,function(){return Hn(),null})),o=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||o){o=pt.transition,pt.transition=null;var c=fe;fe=1;var p=ie;ie|=4,Ra.current=null,_p(e,n),Fu(n,e),ep(zl),Kr=!!Dl,zl=Dl=null,e.current=n,Rp(n),ld(),ie=p,fe=c,pt.transition=o}else e.current=n;if(Os&&(Os=!1,Zt=e,Is=s),o=e.pendingLanes,o===0&&(Yt=null),id(n.stateNode),et(e,Re()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)s=t[n],r(s.value,{componentStack:s.stack,digest:s.digest});if(As)throw As=!1,e=Pa,Pa=null,e;return(Is&1)!==0&&e.tag!==0&&Hn(),o=e.pendingLanes,(o&1)!==0?e===Aa?Tr++:(Tr=0,Aa=e):Tr=0,Gt(),null}function Hn(){if(Zt!==null){var e=Oo(Is),t=pt.transition,n=fe;try{if(pt.transition=null,fe=16>e?16:e,Zt===null)var r=!1;else{if(e=Zt,Zt=null,Is=0,(ie&6)!==0)throw Error(i(331));var s=ie;for(ie|=4,W=e.current;W!==null;){var o=W,c=o.child;if((W.flags&16)!==0){var p=o.deletions;if(p!==null){for(var m=0;m<p.length;m++){var E=p[m];for(W=E;W!==null;){var O=W;switch(O.tag){case 0:case 11:case 15:Cr(8,O,o)}var D=O.child;if(D!==null)D.return=O,W=D;else for(;W!==null;){O=W;var A=O.sibling,V=O.return;if(Lu(O),O===E){W=null;break}if(A!==null){A.return=V,W=A;break}W=V}}}var H=o.alternate;if(H!==null){var G=H.child;if(G!==null){H.child=null;do{var Te=G.sibling;G.sibling=null,G=Te}while(G!==null)}}W=o}}if((o.subtreeFlags&2064)!==0&&c!==null)c.return=o,W=c;else e:for(;W!==null;){if(o=W,(o.flags&2048)!==0)switch(o.tag){case 0:case 11:case 15:Cr(9,o,o.return)}var k=o.sibling;if(k!==null){k.return=o.return,W=k;break e}W=o.return}}var h=e.current;for(W=h;W!==null;){c=W;var S=c.child;if((c.subtreeFlags&2064)!==0&&S!==null)S.return=c,W=S;else e:for(c=h;W!==null;){if(p=W,(p.flags&2048)!==0)try{switch(p.tag){case 0:case 11:case 15:Ts(9,p)}}catch(K){Ne(p,p.return,K)}if(p===c){W=null;break e}var M=p.sibling;if(M!==null){M.return=p.return,W=M;break e}W=p.return}}if(ie=s,Gt(),bt&&typeof bt.onPostCommitFiberRoot=="function")try{bt.onPostCommitFiberRoot(Vr,e)}catch{}r=!0}return r}finally{fe=n,pt.transition=t}}return!1}function qu(e,t,n){t=Un(n,t),t=du(e,t,1),e=Qt(e,t,1),t=Ke(),e!==null&&(er(e,1,t),et(e,t))}function Ne(e,t,n){if(e.tag===3)qu(e,e,n);else for(;t!==null;){if(t.tag===3){qu(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Yt===null||!Yt.has(r))){e=Un(n,e),e=pu(t,e,1),t=Qt(t,e,1),e=Ke(),t!==null&&(er(t,1,e),et(t,e));break}}t=t.return}}function Ip(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=Ke(),e.pingedLanes|=e.suspendedLanes&n,ze===e&&($e&n)===n&&(Oe===4||Oe===3&&($e&130023424)===$e&&500>Re()-La?gn(e,0):Ta|=n),et(e,t)}function Qu(e,t){t===0&&((e.mode&1)===0?t=1:(t=Hr,Hr<<=1,(Hr&130023424)===0&&(Hr=4194304)));var n=Ke();e=Pt(e,t),e!==null&&(er(e,t,n),et(e,n))}function Fp(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Qu(e,n)}function Dp(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,s=e.memoizedState;s!==null&&(n=s.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(i(314))}r!==null&&r.delete(t),Qu(e,n)}var Ku;Ku=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||Ye.current)Xe=!0;else{if((e.lanes&n)===0&&(t.flags&128)===0)return Xe=!1,jp(e,t,n);Xe=(e.flags&131072)!==0}else Xe=!1,be&&(t.flags&1048576)!==0&&_i(t,fs,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;_s(e,t),e=t.pendingProps;var s=An(t,We.current);Mn(t,n),s=ia(null,t,r,e,s,n);var o=ua();return t.flags|=1,typeof s=="object"&&s!==null&&typeof s.render=="function"&&s.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Ze(r)?(o=!0,cs(t)):o=!1,t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,ta(t),s.updater=Es,t.stateNode=s,s._reactInternals=t,ha(t,r,e,n),t=va(null,t,r,!0,o,n)):(t.tag=0,be&&o&&Hl(t),Qe(null,t,s,n),t=t.child),t;case 16:r=t.elementType;e:{switch(_s(e,t),e=t.pendingProps,s=r._init,r=s(r._payload),t.type=r,s=t.tag=Mp(r),e=yt(r,e),s){case 0:t=xa(null,t,r,e,n);break e;case 1:t=bu(null,t,r,e,n);break e;case 11:t=gu(null,t,r,e,n);break e;case 14:t=yu(null,t,r,yt(r.type,e),n);break e}throw Error(i(306,r,""))}return t;case 0:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:yt(r,s),xa(e,t,r,s,n);case 1:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:yt(r,s),bu(e,t,r,s,n);case 3:e:{if(ku(t),e===null)throw Error(i(387));r=t.pendingProps,o=t.memoizedState,s=o.element,Di(e,t),vs(t,r,null,n);var c=t.memoizedState;if(r=c.element,o.isDehydrated)if(o={element:r,isDehydrated:!1,cache:c.cache,pendingSuspenseBoundaries:c.pendingSuspenseBoundaries,transitions:c.transitions},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){s=Un(Error(i(423)),t),t=Su(e,t,r,n,s);break e}else if(r!==s){s=Un(Error(i(424)),t),t=Su(e,t,r,n,s);break e}else for(lt=Vt(t.stateNode.containerInfo.firstChild),st=t,be=!0,gt=null,n=Ii(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Fn(),r===s){t=Ot(e,t,n);break e}Qe(e,t,r,n)}t=t.child}return t;case 5:return Bi(t),e===null&&Ql(t),r=t.type,s=t.pendingProps,o=e!==null?e.memoizedProps:null,c=s.children,Ml(r,s)?c=null:o!==null&&Ml(r,o)&&(t.flags|=32),wu(e,t),Qe(e,t,c,n),t.child;case 6:return e===null&&Ql(t),null;case 13:return ju(e,t,n);case 4:return na(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Dn(t,null,r,n):Qe(e,t,r,n),t.child;case 11:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:yt(r,s),gu(e,t,r,s,n);case 7:return Qe(e,t,t.pendingProps,n),t.child;case 8:return Qe(e,t,t.pendingProps.children,n),t.child;case 12:return Qe(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,s=t.pendingProps,o=t.memoizedProps,c=s.value,xe(gs,r._currentValue),r._currentValue=c,o!==null)if(ht(o.value,c)){if(o.children===s.children&&!Ye.current){t=Ot(e,t,n);break e}}else for(o=t.child,o!==null&&(o.return=t);o!==null;){var p=o.dependencies;if(p!==null){c=o.child;for(var m=p.firstContext;m!==null;){if(m.context===r){if(o.tag===1){m=At(-1,n&-n),m.tag=2;var E=o.updateQueue;if(E!==null){E=E.shared;var O=E.pending;O===null?m.next=m:(m.next=O.next,O.next=m),E.pending=m}}o.lanes|=n,m=o.alternate,m!==null&&(m.lanes|=n),Jl(o.return,n,t),p.lanes|=n;break}m=m.next}}else if(o.tag===10)c=o.type===t.type?null:o.child;else if(o.tag===18){if(c=o.return,c===null)throw Error(i(341));c.lanes|=n,p=c.alternate,p!==null&&(p.lanes|=n),Jl(c,n,t),c=o.sibling}else c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===t){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}Qe(e,t,s.children,n),t=t.child}return t;case 9:return s=t.type,r=t.pendingProps.children,Mn(t,n),s=ct(s),r=r(s),t.flags|=1,Qe(e,t,r,n),t.child;case 14:return r=t.type,s=yt(r,t.pendingProps),s=yt(r.type,s),yu(e,t,r,s,n);case 15:return xu(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:yt(r,s),_s(e,t),t.tag=1,Ze(r)?(e=!0,cs(t)):e=!1,Mn(t,n),uu(t,r,s),ha(t,r,s,n),va(null,t,r,!0,e,n);case 19:return Eu(e,t,n);case 22:return vu(e,t,n)}throw Error(i(156,t.tag))};function Yu(e,t){return Ro(e,t)}function zp(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ft(e,t,n,r){return new zp(e,t,n,r)}function Ma(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Mp(e){if(typeof e=="function")return Ma(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Ee)return 11;if(e===Ce)return 14}return 2}function en(e,t){var n=e.alternate;return n===null?(n=ft(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Ms(e,t,n,r,s,o){var c=2;if(r=e,typeof e=="function")Ma(e)&&(c=1);else if(typeof e=="string")c=5;else e:switch(e){case ae:return xn(n.children,s,o,t);case me:c=8,s|=8;break;case ke:return e=ft(12,n,t,s|2),e.elementType=ke,e.lanes=o,e;case Ve:return e=ft(13,n,t,s),e.elementType=Ve,e.lanes=o,e;case he:return e=ft(19,n,t,s),e.elementType=he,e.lanes=o,e;case ye:return Bs(n,s,o,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Fe:c=10;break e;case Be:c=9;break e;case Ee:c=11;break e;case Ce:c=14;break e;case _e:c=16,r=null;break e}throw Error(i(130,e==null?e:typeof e,""))}return t=ft(c,n,t,s),t.elementType=e,t.type=r,t.lanes=o,t}function xn(e,t,n,r){return e=ft(7,e,r,t),e.lanes=n,e}function Bs(e,t,n,r){return e=ft(22,e,r,t),e.elementType=ye,e.lanes=n,e.stateNode={isHidden:!1},e}function Ba(e,t,n){return e=ft(6,e,null,t),e.lanes=n,e}function Ua(e,t,n){return t=ft(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Bp(e,t,n,r,s){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ml(0),this.expirationTimes=ml(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ml(0),this.identifierPrefix=r,this.onRecoverableError=s,this.mutableSourceEagerHydrationData=null}function $a(e,t,n,r,s,o,c,p,m){return e=new Bp(e,t,n,p,m),t===1?(t=1,o===!0&&(t|=8)):t=0,o=ft(3,null,null,t),e.current=o,o.stateNode=e,o.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},ta(o),e}function Up(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ue,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function Zu(e){if(!e)return Ht;e=e._reactInternals;e:{if(ln(e)!==e||e.tag!==1)throw Error(i(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Ze(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(i(171))}if(e.tag===1){var n=e.type;if(Ze(n))return Ni(e,n,t)}return t}function Xu(e,t,n,r,s,o,c,p,m){return e=$a(n,r,!0,e,s,o,c,p,m),e.context=Zu(null),n=e.current,r=Ke(),s=Xt(n),o=At(r,s),o.callback=t??null,Qt(n,o,s),e.current.lanes=s,er(e,s,r),et(e,r),e}function Us(e,t,n,r){var s=t.current,o=Ke(),c=Xt(s);return n=Zu(n),t.context===null?t.context=n:t.pendingContext=n,t=At(o,c),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=Qt(s,t,c),e!==null&&(wt(e,s,c,o),xs(e,s,c)),c}function $s(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Ju(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Va(e,t){Ju(e,t),(e=e.alternate)&&Ju(e,t)}function $p(){return null}var ec=typeof reportError=="function"?reportError:function(e){console.error(e)};function Wa(e){this._internalRoot=e}Vs.prototype.render=Wa.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));Us(e,t,null,null)},Vs.prototype.unmount=Wa.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;hn(function(){Us(null,e,null,null)}),t[_t]=null}};function Vs(e){this._internalRoot=e}Vs.prototype.unstable_scheduleHydration=function(e){if(e){var t=Do();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Bt.length&&t!==0&&t<Bt[n].priority;n++);Bt.splice(n,0,e),n===0&&Bo(e)}};function Ha(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Ws(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function tc(){}function Vp(e,t,n,r,s){if(s){if(typeof r=="function"){var o=r;r=function(){var E=$s(c);o.call(E)}}var c=Xu(t,r,e,0,null,!1,!1,"",tc);return e._reactRootContainer=c,e[_t]=c.current,mr(e.nodeType===8?e.parentNode:e),hn(),c}for(;s=e.lastChild;)e.removeChild(s);if(typeof r=="function"){var p=r;r=function(){var E=$s(m);p.call(E)}}var m=$a(e,0,!1,null,null,!1,!1,"",tc);return e._reactRootContainer=m,e[_t]=m.current,mr(e.nodeType===8?e.parentNode:e),hn(function(){Us(t,m,n,r)}),m}function Hs(e,t,n,r,s){var o=n._reactRootContainer;if(o){var c=o;if(typeof s=="function"){var p=s;s=function(){var m=$s(c);p.call(m)}}Us(t,c,e,s)}else c=Vp(n,t,e,s,r);return $s(c)}Io=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=Jn(t.pendingLanes);n!==0&&(hl(t,n|1),et(t,Re()),(ie&6)===0&&(Wn=Re()+500,Gt()))}break;case 13:hn(function(){var r=Pt(e,1);if(r!==null){var s=Ke();wt(r,e,1,s)}}),Va(e,1)}},gl=function(e){if(e.tag===13){var t=Pt(e,134217728);if(t!==null){var n=Ke();wt(t,e,134217728,n)}Va(e,134217728)}},Fo=function(e){if(e.tag===13){var t=Xt(e),n=Pt(e,t);if(n!==null){var r=Ke();wt(n,e,t,r)}Va(e,t)}},Do=function(){return fe},zo=function(e,t){var n=fe;try{return fe=e,t()}finally{fe=n}},il=function(e,t,n){switch(t){case"input":if(el(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var s=is(r);if(!s)throw Error(i(90));oo(r),el(r,s)}}}break;case"textarea":fo(e,n);break;case"select":t=n.value,t!=null&&bn(e,!!n.multiple,t,!1)}},ko=Fa,So=hn;var Wp={usingClientEntryPoint:!1,Events:[yr,Ln,is,wo,bo,Fa]},Lr={findFiberByHostInstance:an,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Hp={bundleType:Lr.bundleType,version:Lr.version,rendererPackageName:Lr.rendererPackageName,rendererConfig:Lr.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Q.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Co(e),e===null?null:e.stateNode},findFiberByHostInstance:Lr.findFiberByHostInstance||$p,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Gs=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Gs.isDisabled&&Gs.supportsFiber)try{Vr=Gs.inject(Hp),bt=Gs}catch{}}return tt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Wp,tt.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Ha(t))throw Error(i(200));return Up(e,t,null,n)},tt.createRoot=function(e,t){if(!Ha(e))throw Error(i(299));var n=!1,r="",s=ec;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(s=t.onRecoverableError)),t=$a(e,1,!1,null,null,n,!1,r,s),e[_t]=t.current,mr(e.nodeType===8?e.parentNode:e),new Wa(t)},tt.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(i(188)):(e=Object.keys(e).join(","),Error(i(268,e)));return e=Co(t),e=e===null?null:e.stateNode,e},tt.flushSync=function(e){return hn(e)},tt.hydrate=function(e,t,n){if(!Ws(t))throw Error(i(200));return Hs(null,e,t,!0,n)},tt.hydrateRoot=function(e,t,n){if(!Ha(e))throw Error(i(405));var r=n!=null&&n.hydratedSources||null,s=!1,o="",c=ec;if(n!=null&&(n.unstable_strictMode===!0&&(s=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onRecoverableError!==void 0&&(c=n.onRecoverableError)),t=Xu(t,null,e,1,n??null,s,!1,o,c),e[_t]=t.current,mr(e),r)for(e=0;e<r.length;e++)n=r[e],s=n._getVersion,s=s(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,s]:t.mutableSourceEagerHydrationData.push(n,s);return new Vs(t)},tt.render=function(e,t,n){if(!Ws(t))throw Error(i(200));return Hs(null,e,t,!1,n)},tt.unmountComponentAtNode=function(e){if(!Ws(e))throw Error(i(40));return e._reactRootContainer?(hn(function(){Hs(null,null,e,!1,function(){e._reactRootContainer=null,e[_t]=null})}),!0):!1},tt.unstable_batchedUpdates=Fa,tt.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!Ws(n))throw Error(i(200));if(e==null||e._reactInternals===void 0)throw Error(i(38));return Hs(e,t,n,!1,r)},tt.version="18.3.1-next-f1338f8080-20240426",tt}var uc;function Tc(){if(uc)return Qa.exports;uc=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(u){console.error(u)}}return a(),Qa.exports=ef(),Qa.exports}var cc;function tf(){if(cc)return qs;cc=1;var a=Tc();return qs.createRoot=a.createRoot,qs.hydrateRoot=a.hydrateRoot,qs}var nf=tf();const rf=_c(nf);Tc();/**
 * @remix-run/router v1.23.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Ar(){return Ar=Object.assign?Object.assign.bind():function(a){for(var u=1;u<arguments.length;u++){var i=arguments[u];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(a[d]=i[d])}return a},Ar.apply(this,arguments)}var nn;(function(a){a.Pop="POP",a.Push="PUSH",a.Replace="REPLACE"})(nn||(nn={}));const dc="popstate";function sf(a){a===void 0&&(a={});function u(d,f){let{pathname:y,search:g,hash:_}=d.location;return Xa("",{pathname:y,search:g,hash:_},f.state&&f.state.usr||null,f.state&&f.state.key||"default")}function i(d,f){return typeof f=="string"?f:Qs(f)}return af(u,i,null,a)}function Pe(a,u){if(a===!1||a===null||typeof a>"u")throw new Error(u)}function ro(a,u){if(!a){typeof console<"u"&&console.warn(u);try{throw new Error(u)}catch{}}}function lf(){return Math.random().toString(36).substr(2,8)}function pc(a,u){return{usr:a.state,key:a.key,idx:u}}function Xa(a,u,i,d){return i===void 0&&(i=null),Ar({pathname:typeof a=="string"?a:a.pathname,search:"",hash:""},typeof u=="string"?Gn(u):u,{state:i,key:u&&u.key||d||lf()})}function Qs(a){let{pathname:u="/",search:i="",hash:d=""}=a;return i&&i!=="?"&&(u+=i.charAt(0)==="?"?i:"?"+i),d&&d!=="#"&&(u+=d.charAt(0)==="#"?d:"#"+d),u}function Gn(a){let u={};if(a){let i=a.indexOf("#");i>=0&&(u.hash=a.substr(i),a=a.substr(0,i));let d=a.indexOf("?");d>=0&&(u.search=a.substr(d),a=a.substr(0,d)),a&&(u.pathname=a)}return u}function af(a,u,i,d){d===void 0&&(d={});let{window:f=document.defaultView,v5Compat:y=!1}=d,g=f.history,_=nn.Pop,v=null,C=R();C==null&&(C=0,g.replaceState(Ar({},g.state,{idx:C}),""));function R(){return(g.state||{idx:null}).idx}function N(){_=nn.Pop;let w=R(),I=w==null?null:w-C;C=w,v&&v({action:_,location:b.location,delta:I})}function z(w,I){_=nn.Push;let L=Xa(b.location,w,I);C=R()+1;let F=pc(L,C),Q=b.createHref(L);try{g.pushState(F,"",Q)}catch(ee){if(ee instanceof DOMException&&ee.name==="DataCloneError")throw ee;f.location.assign(Q)}y&&v&&v({action:_,location:b.location,delta:1})}function q(w,I){_=nn.Replace;let L=Xa(b.location,w,I);C=R();let F=pc(L,C),Q=b.createHref(L);g.replaceState(F,"",Q),y&&v&&v({action:_,location:b.location,delta:0})}function j(w){let I=f.location.origin!=="null"?f.location.origin:f.location.href,L=typeof w=="string"?w:Qs(w);return L=L.replace(/ $/,"%20"),Pe(I,"No window.location.(origin|href) available to create URL for href: "+L),new URL(L,I)}let b={get action(){return _},get location(){return a(f,g)},listen(w){if(v)throw new Error("A history only accepts one active listener");return f.addEventListener(dc,N),v=w,()=>{f.removeEventListener(dc,N),v=null}},createHref(w){return u(f,w)},createURL:j,encodeLocation(w){let I=j(w);return{pathname:I.pathname,search:I.search,hash:I.hash}},push:z,replace:q,go(w){return g.go(w)}};return b}var fc;(function(a){a.data="data",a.deferred="deferred",a.redirect="redirect",a.error="error"})(fc||(fc={}));function of(a,u,i){return i===void 0&&(i="/"),uf(a,u,i)}function uf(a,u,i,d){let f=typeof u=="string"?Gn(u):u,y=so(f.pathname||"/",i);if(y==null)return null;let g=Lc(a);cf(g);let _=null;for(let v=0;_==null&&v<g.length;++v){let C=kf(y);_=vf(g[v],C)}return _}function Lc(a,u,i,d){u===void 0&&(u=[]),i===void 0&&(i=[]),d===void 0&&(d="");let f=(y,g,_)=>{let v={relativePath:_===void 0?y.path||"":_,caseSensitive:y.caseSensitive===!0,childrenIndex:g,route:y};v.relativePath.startsWith("/")&&(Pe(v.relativePath.startsWith(d),'Absolute route path "'+v.relativePath+'" nested under path '+('"'+d+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),v.relativePath=v.relativePath.slice(d.length));let C=rn([d,v.relativePath]),R=i.concat(v);y.children&&y.children.length>0&&(Pe(y.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+C+'".')),Lc(y.children,u,R,C)),!(y.path==null&&!y.index)&&u.push({path:C,score:yf(C,y.index),routesMeta:R})};return a.forEach((y,g)=>{var _;if(y.path===""||!((_=y.path)!=null&&_.includes("?")))f(y,g);else for(let v of Pc(y.path))f(y,g,v)}),u}function Pc(a){let u=a.split("/");if(u.length===0)return[];let[i,...d]=u,f=i.endsWith("?"),y=i.replace(/\?$/,"");if(d.length===0)return f?[y,""]:[y];let g=Pc(d.join("/")),_=[];return _.push(...g.map(v=>v===""?y:[y,v].join("/"))),f&&_.push(...g),_.map(v=>a.startsWith("/")&&v===""?"/":v)}function cf(a){a.sort((u,i)=>u.score!==i.score?i.score-u.score:xf(u.routesMeta.map(d=>d.childrenIndex),i.routesMeta.map(d=>d.childrenIndex)))}const df=/^:[\w-]+$/,pf=3,ff=2,mf=1,hf=10,gf=-2,mc=a=>a==="*";function yf(a,u){let i=a.split("/"),d=i.length;return i.some(mc)&&(d+=gf),u&&(d+=ff),i.filter(f=>!mc(f)).reduce((f,y)=>f+(df.test(y)?pf:y===""?mf:hf),d)}function xf(a,u){return a.length===u.length&&a.slice(0,-1).every((d,f)=>d===u[f])?a[a.length-1]-u[u.length-1]:0}function vf(a,u,i){let{routesMeta:d}=a,f={},y="/",g=[];for(let _=0;_<d.length;++_){let v=d[_],C=_===d.length-1,R=y==="/"?u:u.slice(y.length)||"/",N=wf({path:v.relativePath,caseSensitive:v.caseSensitive,end:C},R),z=v.route;if(!N)return null;Object.assign(f,N.params),g.push({params:f,pathname:rn([y,N.pathname]),pathnameBase:Cf(rn([y,N.pathnameBase])),route:z}),N.pathnameBase!=="/"&&(y=rn([y,N.pathnameBase]))}return g}function wf(a,u){typeof a=="string"&&(a={path:a,caseSensitive:!1,end:!0});let[i,d]=bf(a.path,a.caseSensitive,a.end),f=u.match(i);if(!f)return null;let y=f[0],g=y.replace(/(.)\/+$/,"$1"),_=f.slice(1);return{params:d.reduce((C,R,N)=>{let{paramName:z,isOptional:q}=R;if(z==="*"){let b=_[N]||"";g=y.slice(0,y.length-b.length).replace(/(.)\/+$/,"$1")}const j=_[N];return q&&!j?C[z]=void 0:C[z]=(j||"").replace(/%2F/g,"/"),C},{}),pathname:y,pathnameBase:g,pattern:a}}function bf(a,u,i){u===void 0&&(u=!1),i===void 0&&(i=!0),ro(a==="*"||!a.endsWith("*")||a.endsWith("/*"),'Route path "'+a+'" will be treated as if it were '+('"'+a.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+a.replace(/\*$/,"/*")+'".'));let d=[],f="^"+a.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(g,_,v)=>(d.push({paramName:_,isOptional:v!=null}),v?"/?([^\\/]+)?":"/([^\\/]+)"));return a.endsWith("*")?(d.push({paramName:"*"}),f+=a==="*"||a==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):i?f+="\\/*$":a!==""&&a!=="/"&&(f+="(?:(?=\\/|$))"),[new RegExp(f,u?void 0:"i"),d]}function kf(a){try{return a.split("/").map(u=>decodeURIComponent(u).replace(/\//g,"%2F")).join("/")}catch(u){return ro(!1,'The URL path "'+a+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+u+").")),a}}function so(a,u){if(u==="/")return a;if(!a.toLowerCase().startsWith(u.toLowerCase()))return null;let i=u.endsWith("/")?u.length-1:u.length,d=a.charAt(i);return d&&d!=="/"?null:a.slice(i)||"/"}const Sf=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,jf=a=>Sf.test(a);function Nf(a,u){u===void 0&&(u="/");let{pathname:i,search:d="",hash:f=""}=typeof a=="string"?Gn(a):a,y;if(i)if(jf(i))y=i;else{if(i.includes("//")){let g=i;i=i.replace(/\/\/+/g,"/"),ro(!1,"Pathnames cannot have embedded double slashes - normalizing "+(g+" -> "+i))}i.startsWith("/")?y=hc(i.substring(1),"/"):y=hc(i,u)}else y=u;return{pathname:y,search:_f(d),hash:Rf(f)}}function hc(a,u){let i=u.replace(/\/+$/,"").split("/");return a.split("/").forEach(f=>{f===".."?i.length>1&&i.pop():f!=="."&&i.push(f)}),i.length>1?i.join("/"):"/"}function Za(a,u,i,d){return"Cannot include a '"+a+"' character in a manually specified "+("`to."+u+"` field ["+JSON.stringify(d)+"].  Please separate it out to the ")+("`to."+i+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function Ef(a){return a.filter((u,i)=>i===0||u.route.path&&u.route.path.length>0)}function Ac(a,u){let i=Ef(a);return u?i.map((d,f)=>f===i.length-1?d.pathname:d.pathnameBase):i.map(d=>d.pathnameBase)}function Oc(a,u,i,d){d===void 0&&(d=!1);let f;typeof a=="string"?f=Gn(a):(f=Ar({},a),Pe(!f.pathname||!f.pathname.includes("?"),Za("?","pathname","search",f)),Pe(!f.pathname||!f.pathname.includes("#"),Za("#","pathname","hash",f)),Pe(!f.search||!f.search.includes("#"),Za("#","search","hash",f)));let y=a===""||f.pathname==="",g=y?"/":f.pathname,_;if(g==null)_=i;else{let N=u.length-1;if(!d&&g.startsWith("..")){let z=g.split("/");for(;z[0]==="..";)z.shift(),N-=1;f.pathname=z.join("/")}_=N>=0?u[N]:"/"}let v=Nf(f,_),C=g&&g!=="/"&&g.endsWith("/"),R=(y||g===".")&&i.endsWith("/");return!v.pathname.endsWith("/")&&(C||R)&&(v.pathname+="/"),v}const rn=a=>a.join("/").replace(/\/\/+/g,"/"),Cf=a=>a.replace(/\/+$/,"").replace(/^\/*/,"/"),_f=a=>!a||a==="?"?"":a.startsWith("?")?a:"?"+a,Rf=a=>!a||a==="#"?"":a.startsWith("#")?a:"#"+a;function Tf(a){return a!=null&&typeof a.status=="number"&&typeof a.statusText=="string"&&typeof a.internal=="boolean"&&"data"in a}const Ic=["post","put","patch","delete"];new Set(Ic);const Lf=["get",...Ic];new Set(Lf);/**
 * React Router v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Or(){return Or=Object.assign?Object.assign.bind():function(a){for(var u=1;u<arguments.length;u++){var i=arguments[u];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(a[d]=i[d])}return a},Or.apply(this,arguments)}const lo=U.createContext(null),Pf=U.createContext(null),vn=U.createContext(null),Ys=U.createContext(null),sn=U.createContext({outlet:null,matches:[],isDataRoute:!1}),Fc=U.createContext(null);function Af(a,u){let{relative:i}=u===void 0?{}:u;Ir()||Pe(!1);let{basename:d,navigator:f}=U.useContext(vn),{hash:y,pathname:g,search:_}=zc(a,{relative:i}),v=g;return d!=="/"&&(v=g==="/"?d:rn([d,g])),f.createHref({pathname:v,search:_,hash:y})}function Ir(){return U.useContext(Ys)!=null}function wn(){return Ir()||Pe(!1),U.useContext(Ys).location}function Dc(a){U.useContext(vn).static||U.useLayoutEffect(a)}function Of(){let{isDataRoute:a}=U.useContext(sn);return a?Kf():If()}function If(){Ir()||Pe(!1);let a=U.useContext(lo),{basename:u,future:i,navigator:d}=U.useContext(vn),{matches:f}=U.useContext(sn),{pathname:y}=wn(),g=JSON.stringify(Ac(f,i.v7_relativeSplatPath)),_=U.useRef(!1);return Dc(()=>{_.current=!0}),U.useCallback(function(C,R){if(R===void 0&&(R={}),!_.current)return;if(typeof C=="number"){d.go(C);return}let N=Oc(C,JSON.parse(g),y,R.relative==="path");a==null&&u!=="/"&&(N.pathname=N.pathname==="/"?u:rn([u,N.pathname])),(R.replace?d.replace:d.push)(N,R.state,R)},[u,d,g,y,a])}const Ff=U.createContext(null);function Df(a){let u=U.useContext(sn).outlet;return u&&U.createElement(Ff.Provider,{value:a},u)}function zc(a,u){let{relative:i}=u===void 0?{}:u,{future:d}=U.useContext(vn),{matches:f}=U.useContext(sn),{pathname:y}=wn(),g=JSON.stringify(Ac(f,d.v7_relativeSplatPath));return U.useMemo(()=>Oc(a,JSON.parse(g),y,i==="path"),[a,g,y,i])}function zf(a,u){return Mf(a,u)}function Mf(a,u,i,d){Ir()||Pe(!1);let{navigator:f}=U.useContext(vn),{matches:y}=U.useContext(sn),g=y[y.length-1],_=g?g.params:{};g&&g.pathname;let v=g?g.pathnameBase:"/";g&&g.route;let C=wn(),R;if(u){var N;let w=typeof u=="string"?Gn(u):u;v==="/"||(N=w.pathname)!=null&&N.startsWith(v)||Pe(!1),R=w}else R=C;let z=R.pathname||"/",q=z;if(v!=="/"){let w=v.replace(/^\//,"").split("/");q="/"+z.replace(/^\//,"").split("/").slice(w.length).join("/")}let j=of(a,{pathname:q}),b=Wf(j&&j.map(w=>Object.assign({},w,{params:Object.assign({},_,w.params),pathname:rn([v,f.encodeLocation?f.encodeLocation(w.pathname).pathname:w.pathname]),pathnameBase:w.pathnameBase==="/"?v:rn([v,f.encodeLocation?f.encodeLocation(w.pathnameBase).pathname:w.pathnameBase])})),y,i,d);return u&&b?U.createElement(Ys.Provider,{value:{location:Or({pathname:"/",search:"",hash:"",state:null,key:"default"},R),navigationType:nn.Pop}},b):b}function Bf(){let a=Qf(),u=Tf(a)?a.status+" "+a.statusText:a instanceof Error?a.message:JSON.stringify(a),i=a instanceof Error?a.stack:null,f={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return U.createElement(U.Fragment,null,U.createElement("h2",null,"Unexpected Application Error!"),U.createElement("h3",{style:{fontStyle:"italic"}},u),i?U.createElement("pre",{style:f},i):null,null)}const Uf=U.createElement(Bf,null);class $f extends U.Component{constructor(u){super(u),this.state={location:u.location,revalidation:u.revalidation,error:u.error}}static getDerivedStateFromError(u){return{error:u}}static getDerivedStateFromProps(u,i){return i.location!==u.location||i.revalidation!=="idle"&&u.revalidation==="idle"?{error:u.error,location:u.location,revalidation:u.revalidation}:{error:u.error!==void 0?u.error:i.error,location:i.location,revalidation:u.revalidation||i.revalidation}}componentDidCatch(u,i){console.error("React Router caught the following error during render",u,i)}render(){return this.state.error!==void 0?U.createElement(sn.Provider,{value:this.props.routeContext},U.createElement(Fc.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function Vf(a){let{routeContext:u,match:i,children:d}=a,f=U.useContext(lo);return f&&f.static&&f.staticContext&&(i.route.errorElement||i.route.ErrorBoundary)&&(f.staticContext._deepestRenderedBoundaryId=i.route.id),U.createElement(sn.Provider,{value:u},d)}function Wf(a,u,i,d){var f;if(u===void 0&&(u=[]),i===void 0&&(i=null),d===void 0&&(d=null),a==null){var y;if(!i)return null;if(i.errors)a=i.matches;else if((y=d)!=null&&y.v7_partialHydration&&u.length===0&&!i.initialized&&i.matches.length>0)a=i.matches;else return null}let g=a,_=(f=i)==null?void 0:f.errors;if(_!=null){let R=g.findIndex(N=>N.route.id&&(_==null?void 0:_[N.route.id])!==void 0);R>=0||Pe(!1),g=g.slice(0,Math.min(g.length,R+1))}let v=!1,C=-1;if(i&&d&&d.v7_partialHydration)for(let R=0;R<g.length;R++){let N=g[R];if((N.route.HydrateFallback||N.route.hydrateFallbackElement)&&(C=R),N.route.id){let{loaderData:z,errors:q}=i,j=N.route.loader&&z[N.route.id]===void 0&&(!q||q[N.route.id]===void 0);if(N.route.lazy||j){v=!0,C>=0?g=g.slice(0,C+1):g=[g[0]];break}}}return g.reduceRight((R,N,z)=>{let q,j=!1,b=null,w=null;i&&(q=_&&N.route.id?_[N.route.id]:void 0,b=N.route.errorElement||Uf,v&&(C<0&&z===0?(Yf("route-fallback"),j=!0,w=null):C===z&&(j=!0,w=N.route.hydrateFallbackElement||null)));let I=u.concat(g.slice(0,z+1)),L=()=>{let F;return q?F=b:j?F=w:N.route.Component?F=U.createElement(N.route.Component,null):N.route.element?F=N.route.element:F=R,U.createElement(Vf,{match:N,routeContext:{outlet:R,matches:I,isDataRoute:i!=null},children:F})};return i&&(N.route.ErrorBoundary||N.route.errorElement||z===0)?U.createElement($f,{location:i.location,revalidation:i.revalidation,component:b,error:q,children:L(),routeContext:{outlet:null,matches:I,isDataRoute:!0}}):L()},null)}var Mc=(function(a){return a.UseBlocker="useBlocker",a.UseRevalidator="useRevalidator",a.UseNavigateStable="useNavigate",a})(Mc||{}),Bc=(function(a){return a.UseBlocker="useBlocker",a.UseLoaderData="useLoaderData",a.UseActionData="useActionData",a.UseRouteError="useRouteError",a.UseNavigation="useNavigation",a.UseRouteLoaderData="useRouteLoaderData",a.UseMatches="useMatches",a.UseRevalidator="useRevalidator",a.UseNavigateStable="useNavigate",a.UseRouteId="useRouteId",a})(Bc||{});function Hf(a){let u=U.useContext(lo);return u||Pe(!1),u}function Gf(a){let u=U.useContext(Pf);return u||Pe(!1),u}function qf(a){let u=U.useContext(sn);return u||Pe(!1),u}function Uc(a){let u=qf(),i=u.matches[u.matches.length-1];return i.route.id||Pe(!1),i.route.id}function Qf(){var a;let u=U.useContext(Fc),i=Gf(),d=Uc();return u!==void 0?u:(a=i.errors)==null?void 0:a[d]}function Kf(){let{router:a}=Hf(Mc.UseNavigateStable),u=Uc(Bc.UseNavigateStable),i=U.useRef(!1);return Dc(()=>{i.current=!0}),U.useCallback(function(f,y){y===void 0&&(y={}),i.current&&(typeof f=="number"?a.navigate(f):a.navigate(f,Or({fromRouteId:u},y)))},[a,u])}const gc={};function Yf(a,u,i){gc[a]||(gc[a]=!0)}function Zf(a,u){a==null||a.v7_startTransition,a==null||a.v7_relativeSplatPath}function yc(a){return Df(a.context)}function Ft(a){Pe(!1)}function Xf(a){let{basename:u="/",children:i=null,location:d,navigationType:f=nn.Pop,navigator:y,static:g=!1,future:_}=a;Ir()&&Pe(!1);let v=u.replace(/^\/*/,"/"),C=U.useMemo(()=>({basename:v,navigator:y,static:g,future:Or({v7_relativeSplatPath:!1},_)}),[v,_,y,g]);typeof d=="string"&&(d=Gn(d));let{pathname:R="/",search:N="",hash:z="",state:q=null,key:j="default"}=d,b=U.useMemo(()=>{let w=so(R,v);return w==null?null:{location:{pathname:w,search:N,hash:z,state:q,key:j},navigationType:f}},[v,R,N,z,q,j,f]);return b==null?null:U.createElement(vn.Provider,{value:C},U.createElement(Ys.Provider,{children:i,value:b}))}function Jf(a){let{children:u,location:i}=a;return zf(Ja(u),i)}new Promise(()=>{});function Ja(a,u){u===void 0&&(u=[]);let i=[];return U.Children.forEach(a,(d,f)=>{if(!U.isValidElement(d))return;let y=[...u,f];if(d.type===U.Fragment){i.push.apply(i,Ja(d.props.children,y));return}d.type!==Ft&&Pe(!1),!d.props.index||!d.props.children||Pe(!1);let g={id:d.props.id||y.join("-"),caseSensitive:d.props.caseSensitive,element:d.props.element,Component:d.props.Component,index:d.props.index,path:d.props.path,loader:d.props.loader,action:d.props.action,errorElement:d.props.errorElement,ErrorBoundary:d.props.ErrorBoundary,hasErrorBoundary:d.props.ErrorBoundary!=null||d.props.errorElement!=null,shouldRevalidate:d.props.shouldRevalidate,handle:d.props.handle,lazy:d.props.lazy};d.props.children&&(g.children=Ja(d.props.children,y)),i.push(g)}),i}/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function eo(){return eo=Object.assign?Object.assign.bind():function(a){for(var u=1;u<arguments.length;u++){var i=arguments[u];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(a[d]=i[d])}return a},eo.apply(this,arguments)}function em(a,u){if(a==null)return{};var i={},d=Object.keys(a),f,y;for(y=0;y<d.length;y++)f=d[y],!(u.indexOf(f)>=0)&&(i[f]=a[f]);return i}function tm(a){return!!(a.metaKey||a.altKey||a.ctrlKey||a.shiftKey)}function nm(a,u){return a.button===0&&(!u||u==="_self")&&!tm(a)}const rm=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],sm="6";try{window.__reactRouterVersion=sm}catch{}const lm="startTransition",xc=Zp[lm];function am(a){let{basename:u,children:i,future:d,window:f}=a,y=U.useRef();y.current==null&&(y.current=sf({window:f,v5Compat:!0}));let g=y.current,[_,v]=U.useState({action:g.action,location:g.location}),{v7_startTransition:C}=d||{},R=U.useCallback(N=>{C&&xc?xc(()=>v(N)):v(N)},[v,C]);return U.useLayoutEffect(()=>g.listen(R),[g,R]),U.useEffect(()=>Zf(d),[d]),U.createElement(Xf,{basename:u,children:i,location:_.location,navigationType:_.action,navigator:g,future:d})}const om=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",im=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Et=U.forwardRef(function(u,i){let{onClick:d,relative:f,reloadDocument:y,replace:g,state:_,target:v,to:C,preventScrollReset:R,viewTransition:N}=u,z=em(u,rm),{basename:q}=U.useContext(vn),j,b=!1;if(typeof C=="string"&&im.test(C)&&(j=C,om))try{let F=new URL(window.location.href),Q=C.startsWith("//")?new URL(F.protocol+C):new URL(C),ee=so(Q.pathname,q);Q.origin===F.origin&&ee!=null?C=ee+Q.search+Q.hash:b=!0}catch{}let w=Af(C,{relative:f}),I=um(C,{replace:g,state:_,target:v,preventScrollReset:R,relative:f,viewTransition:N});function L(F){d&&d(F),F.defaultPrevented||I(F)}return U.createElement("a",eo({},z,{href:j||w,onClick:b||y?d:L,ref:i,target:v}))});var vc;(function(a){a.UseScrollRestoration="useScrollRestoration",a.UseSubmit="useSubmit",a.UseSubmitFetcher="useSubmitFetcher",a.UseFetcher="useFetcher",a.useViewTransitionState="useViewTransitionState"})(vc||(vc={}));var wc;(function(a){a.UseFetcher="useFetcher",a.UseFetchers="useFetchers",a.UseScrollRestoration="useScrollRestoration"})(wc||(wc={}));function um(a,u){let{target:i,replace:d,state:f,preventScrollReset:y,relative:g,viewTransition:_}=u===void 0?{}:u,v=Of(),C=wn(),R=zc(a,{relative:g});return U.useCallback(N=>{if(nm(N,i)){N.preventDefault();let z=d!==void 0?d:Qs(C)===Qs(R);v(a,{replace:z,state:f,preventScrollReset:y,relative:g,viewTransition:_})}},[C,v,R,d,f,i,a,y,g,_])}/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cm=a=>a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),$c=(...a)=>a.filter((u,i,d)=>!!u&&u.trim()!==""&&d.indexOf(u)===i).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var dm={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pm=U.forwardRef(({color:a="currentColor",size:u=24,strokeWidth:i=2,absoluteStrokeWidth:d,className:f="",children:y,iconNode:g,..._},v)=>U.createElement("svg",{ref:v,...dm,width:u,height:u,stroke:a,strokeWidth:d?Number(i)*24/Number(u):i,className:$c("lucide",f),..._},[...g.map(([C,R])=>U.createElement(C,R)),...Array.isArray(y)?y:[y]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=(a,u)=>{const i=U.forwardRef(({className:d,...f},y)=>U.createElement(pm,{ref:y,iconNode:u,className:$c(`lucide-${cm(a)}`,d),...f}));return i.displayName=`${a}`,i};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fm=Ie("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mm=Ie("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hm=Ie("Box",[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gm=Ie("ChartColumn",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bc=Ie("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ym=Ie("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xm=Ie("Cloud",[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kc=Ie("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vc=Ie("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vm=Ie("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const to=Ie("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wm=Ie("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bm=Ie("Layers",[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const km=Ie("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sm=Ie("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jm=Ie("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nm=Ie("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Em=Ie("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wc=Ie("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);function Hc(a){var u,i,d="";if(typeof a=="string"||typeof a=="number")d+=a;else if(typeof a=="object")if(Array.isArray(a)){var f=a.length;for(u=0;u<f;u++)a[u]&&(i=Hc(a[u]))&&(d&&(d+=" "),d+=i)}else for(i in a)a[i]&&(d&&(d+=" "),d+=i);return d}function Fr(){for(var a,u,i=0,d="",f=arguments.length;i<f;i++)(a=arguments[i])&&(u=Hc(a))&&(d&&(d+=" "),d+=u);return d}const Sc=[{href:"/docs/getting-started",label:"Docs"},{href:"/docs/core",label:"API"},{href:"/docs/orm",label:"ORM"},{href:"https://github.com/sitharaj88/vexorjs",label:"GitHub",external:!0}];function Cm(){const[a,u]=U.useState(!1),i=wn();return l.jsxs("nav",{className:"fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50",children:[l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:l.jsxs("div",{className:"flex items-center justify-between h-16",children:[l.jsxs(Et,{to:"/",className:"flex items-center gap-3",children:[l.jsx("div",{className:"w-8 h-8 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded-lg flex items-center justify-center font-bold text-white",children:"V"}),l.jsx("span",{className:"text-xl font-bold",children:"Vexor"}),l.jsx("span",{className:"hidden sm:inline text-xs bg-vexor-500/20 text-vexor-400 px-2 py-0.5 rounded-full font-medium",children:"v1.0.0"})]}),l.jsx("div",{className:"hidden md:flex items-center gap-8",children:Sc.map(d=>d.external?l.jsxs("a",{href:d.href,target:"_blank",rel:"noopener noreferrer",className:"nav-link text-sm flex items-center gap-1",children:[d.label==="GitHub"&&l.jsx(to,{className:"w-4 h-4"}),d.label]},d.href):l.jsx(Et,{to:d.href,className:Fr("nav-link text-sm",i.pathname.startsWith(d.href)&&"active"),children:d.label},d.href))}),l.jsx("div",{className:"hidden md:flex items-center gap-4",children:l.jsx(Et,{to:"/docs/getting-started",className:"btn-primary text-sm py-2",children:"Get Started"})}),l.jsx("button",{onClick:()=>u(!a),className:"md:hidden p-2 text-slate-400 hover:text-white",children:a?l.jsx(Em,{className:"w-6 h-6"}):l.jsx(Sm,{className:"w-6 h-6"})})]})}),a&&l.jsx("div",{className:"md:hidden bg-slate-900 border-b border-slate-800",children:l.jsxs("div",{className:"px-4 py-4 space-y-2",children:[Sc.map(d=>d.external?l.jsx("a",{href:d.href,target:"_blank",rel:"noopener noreferrer",className:"block px-4 py-2 text-slate-400 hover:text-white",children:d.label},d.href):l.jsx(Et,{to:d.href,onClick:()=>u(!1),className:"block px-4 py-2 text-slate-400 hover:text-white",children:d.label},d.href)),l.jsx(Et,{to:"/docs/getting-started",onClick:()=>u(!1),className:"block w-full btn-primary text-center mt-4",children:"Get Started"})]})})]})}const _m=[{title:"Getting Started",links:[{href:"/docs/getting-started",label:"Introduction",icon:l.jsx(mm,{className:"w-4 h-4"})},{href:"/docs/getting-started#installation",label:"Installation"},{href:"/docs/getting-started#quick-start",label:"Quick Start"}]},{title:"Core Concepts",links:[{href:"/docs/core",label:"Overview",icon:l.jsx(hm,{className:"w-4 h-4"})},{href:"/docs/core#routing",label:"Routing"},{href:"/docs/core#context",label:"Context"},{href:"/docs/core#validation",label:"Validation"},{href:"/docs/core#authentication",label:"Authentication"}]},{title:"Vexor ORM",links:[{href:"/docs/orm",label:"Overview",icon:l.jsx(Vc,{className:"w-4 h-4"})},{href:"/docs/orm#schema",label:"Schema Definition"},{href:"/docs/orm#queries",label:"Query Builder"},{href:"/docs/orm#migrations",label:"Migrations"},{href:"/docs/orm#transactions",label:"Transactions"}]},{title:"Middleware",links:[{href:"/docs/middleware",label:"Overview",icon:l.jsx(bm,{className:"w-4 h-4"})},{href:"/docs/middleware#cors",label:"CORS"},{href:"/docs/middleware#rate-limit",label:"Rate Limiting"},{href:"/docs/middleware#compression",label:"Compression"},{href:"/docs/middleware#upload",label:"File Upload"}]},{title:"Real-time",links:[{href:"/docs/realtime",label:"Overview",icon:l.jsx(Wc,{className:"w-4 h-4"})},{href:"/docs/realtime#websocket",label:"WebSocket"},{href:"/docs/realtime#sse",label:"Server-Sent Events"},{href:"/docs/realtime#pubsub",label:"Pub/Sub"}]},{title:"Deployment",links:[{href:"/docs/deployment",label:"Overview",icon:l.jsx(xm,{className:"w-4 h-4"})},{href:"/docs/deployment#node",label:"Node.js"},{href:"/docs/deployment#bun",label:"Bun"},{href:"/docs/deployment#lambda",label:"AWS Lambda"},{href:"/docs/deployment#cloudflare",label:"Cloudflare Workers"}]}];function Rm(){const a=wn();return l.jsx("aside",{className:"fixed left-0 top-16 bottom-0 w-64 bg-slate-900/50 border-r border-slate-800/50 overflow-y-auto scrollbar-hide",children:l.jsx("nav",{className:"p-4 space-y-6",children:_m.map(u=>l.jsxs("div",{children:[l.jsx("h3",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4",children:u.title}),l.jsx("ul",{className:"space-y-1",children:u.links.map(i=>{const d=a.pathname===i.href||a.pathname+a.hash===i.href;return l.jsx("li",{children:l.jsxs(Et,{to:i.href,className:Fr("sidebar-link flex items-center gap-2",d&&"active"),children:[i.icon,i.label]})},i.href)})})]},u.title))})})}function Tm(){const a=wn(),u=a.pathname==="/"||a.pathname==="",i=a.pathname.startsWith("/docs");return l.jsxs("div",{className:"min-h-screen bg-slate-950",children:[l.jsx(Cm,{}),i?l.jsxs("div",{className:"flex pt-16",children:[l.jsx(Rm,{}),l.jsx("main",{className:"flex-1 ml-64 p-8",children:l.jsx("div",{className:"max-w-4xl mx-auto",children:l.jsx(yc,{})})})]}):l.jsx("main",{className:u?"":"pt-16",children:l.jsx(yc,{})})]})}var Lm=Object.create,Zs=Object.defineProperty,Pm=Object.defineProperties,Am=Object.getOwnPropertyDescriptor,Om=Object.getOwnPropertyDescriptors,Gc=Object.getOwnPropertyNames,Ks=Object.getOwnPropertySymbols,Im=Object.getPrototypeOf,ao=Object.prototype.hasOwnProperty,qc=Object.prototype.propertyIsEnumerable,jc=(a,u,i)=>u in a?Zs(a,u,{enumerable:!0,configurable:!0,writable:!0,value:i}):a[u]=i,Ct=(a,u)=>{for(var i in u||(u={}))ao.call(u,i)&&jc(a,i,u[i]);if(Ks)for(var i of Ks(u))qc.call(u,i)&&jc(a,i,u[i]);return a},Xs=(a,u)=>Pm(a,Om(u)),Qc=(a,u)=>{var i={};for(var d in a)ao.call(a,d)&&u.indexOf(d)<0&&(i[d]=a[d]);if(a!=null&&Ks)for(var d of Ks(a))u.indexOf(d)<0&&qc.call(a,d)&&(i[d]=a[d]);return i},Fm=(a,u)=>function(){return u||(0,a[Gc(a)[0]])((u={exports:{}}).exports,u),u.exports},Dm=(a,u)=>{for(var i in u)Zs(a,i,{get:u[i],enumerable:!0})},zm=(a,u,i,d)=>{if(u&&typeof u=="object"||typeof u=="function")for(let f of Gc(u))!ao.call(a,f)&&f!==i&&Zs(a,f,{get:()=>u[f],enumerable:!(d=Am(u,f))||d.enumerable});return a},Mm=(a,u,i)=>(i=a!=null?Lm(Im(a)):{},zm(!a||!a.__esModule?Zs(i,"default",{value:a,enumerable:!0}):i,a)),Bm=Fm({"../../node_modules/.pnpm/prismjs@1.29.0_patch_hash=vrxx3pzkik6jpmgpayxfjunetu/node_modules/prismjs/prism.js"(a,u){var i=(function(){var d=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,f=0,y={},g={util:{encode:function j(b){return b instanceof _?new _(b.type,j(b.content),b.alias):Array.isArray(b)?b.map(j):b.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(j){return Object.prototype.toString.call(j).slice(8,-1)},objId:function(j){return j.__id||Object.defineProperty(j,"__id",{value:++f}),j.__id},clone:function j(b,w){w=w||{};var I,L;switch(g.util.type(b)){case"Object":if(L=g.util.objId(b),w[L])return w[L];I={},w[L]=I;for(var F in b)b.hasOwnProperty(F)&&(I[F]=j(b[F],w));return I;case"Array":return L=g.util.objId(b),w[L]?w[L]:(I=[],w[L]=I,b.forEach(function(Q,ee){I[ee]=j(Q,w)}),I);default:return b}},getLanguage:function(j){for(;j;){var b=d.exec(j.className);if(b)return b[1].toLowerCase();j=j.parentElement}return"none"},setLanguage:function(j,b){j.className=j.className.replace(RegExp(d,"gi"),""),j.classList.add("language-"+b)},isActive:function(j,b,w){for(var I="no-"+b;j;){var L=j.classList;if(L.contains(b))return!0;if(L.contains(I))return!1;j=j.parentElement}return!!w}},languages:{plain:y,plaintext:y,text:y,txt:y,extend:function(j,b){var w=g.util.clone(g.languages[j]);for(var I in b)w[I]=b[I];return w},insertBefore:function(j,b,w,I){I=I||g.languages;var L=I[j],F={};for(var Q in L)if(L.hasOwnProperty(Q)){if(Q==b)for(var ee in w)w.hasOwnProperty(ee)&&(F[ee]=w[ee]);w.hasOwnProperty(Q)||(F[Q]=L[Q])}var ue=I[j];return I[j]=F,g.languages.DFS(g.languages,function(ae,me){me===ue&&ae!=j&&(this[ae]=F)}),F},DFS:function j(b,w,I,L){L=L||{};var F=g.util.objId;for(var Q in b)if(b.hasOwnProperty(Q)){w.call(b,Q,b[Q],I||Q);var ee=b[Q],ue=g.util.type(ee);ue==="Object"&&!L[F(ee)]?(L[F(ee)]=!0,j(ee,w,null,L)):ue==="Array"&&!L[F(ee)]&&(L[F(ee)]=!0,j(ee,w,Q,L))}}},plugins:{},highlight:function(j,b,w){var I={code:j,grammar:b,language:w};if(g.hooks.run("before-tokenize",I),!I.grammar)throw new Error('The language "'+I.language+'" has no grammar.');return I.tokens=g.tokenize(I.code,I.grammar),g.hooks.run("after-tokenize",I),_.stringify(g.util.encode(I.tokens),I.language)},tokenize:function(j,b){var w=b.rest;if(w){for(var I in w)b[I]=w[I];delete b.rest}var L=new R;return N(L,L.head,j),C(j,L,b,L.head,0),q(L)},hooks:{all:{},add:function(j,b){var w=g.hooks.all;w[j]=w[j]||[],w[j].push(b)},run:function(j,b){var w=g.hooks.all[j];if(!(!w||!w.length))for(var I=0,L;L=w[I++];)L(b)}},Token:_};function _(j,b,w,I){this.type=j,this.content=b,this.alias=w,this.length=(I||"").length|0}_.stringify=function j(b,w){if(typeof b=="string")return b;if(Array.isArray(b)){var I="";return b.forEach(function(ue){I+=j(ue,w)}),I}var L={type:b.type,content:j(b.content,w),tag:"span",classes:["token",b.type],attributes:{},language:w},F=b.alias;F&&(Array.isArray(F)?Array.prototype.push.apply(L.classes,F):L.classes.push(F)),g.hooks.run("wrap",L);var Q="";for(var ee in L.attributes)Q+=" "+ee+'="'+(L.attributes[ee]||"").replace(/"/g,"&quot;")+'"';return"<"+L.tag+' class="'+L.classes.join(" ")+'"'+Q+">"+L.content+"</"+L.tag+">"};function v(j,b,w,I){j.lastIndex=b;var L=j.exec(w);if(L&&I&&L[1]){var F=L[1].length;L.index+=F,L[0]=L[0].slice(F)}return L}function C(j,b,w,I,L,F){for(var Q in w)if(!(!w.hasOwnProperty(Q)||!w[Q])){var ee=w[Q];ee=Array.isArray(ee)?ee:[ee];for(var ue=0;ue<ee.length;++ue){if(F&&F.cause==Q+","+ue)return;var ae=ee[ue],me=ae.inside,ke=!!ae.lookbehind,Fe=!!ae.greedy,Be=ae.alias;if(Fe&&!ae.pattern.global){var Ee=ae.pattern.toString().match(/[imsuy]*$/)[0];ae.pattern=RegExp(ae.pattern.source,Ee+"g")}for(var Ve=ae.pattern||ae,he=I.next,Ce=L;he!==b.tail&&!(F&&Ce>=F.reach);Ce+=he.value.length,he=he.next){var _e=he.value;if(b.length>j.length)return;if(!(_e instanceof _)){var ye=1,B;if(Fe){if(B=v(Ve,Ce,j,ke),!B||B.index>=j.length)break;var P=B.index,J=B.index+B[0].length,$=Ce;for($+=he.value.length;P>=$;)he=he.next,$+=he.value.length;if($-=he.value.length,Ce=$,he.value instanceof _)continue;for(var x=he;x!==b.tail&&($<J||typeof x.value=="string");x=x.next)ye++,$+=x.value.length;ye--,_e=j.slice(Ce,$),B.index-=Ce}else if(B=v(Ve,0,_e,ke),!B)continue;var P=B.index,ne=B[0],re=_e.slice(0,P),oe=_e.slice(P+ne.length),le=Ce+_e.length;F&&le>F.reach&&(F.reach=le);var de=he.prev;re&&(de=N(b,de,re),Ce+=re.length),z(b,de,ye);var pe=new _(Q,me?g.tokenize(ne,me):ne,Be,ne);if(he=N(b,de,pe),oe&&N(b,he,oe),ye>1){var ge={cause:Q+","+ue,reach:le};C(j,b,w,he.prev,Ce,ge),F&&ge.reach>F.reach&&(F.reach=ge.reach)}}}}}}function R(){var j={value:null,prev:null,next:null},b={value:null,prev:j,next:null};j.next=b,this.head=j,this.tail=b,this.length=0}function N(j,b,w){var I=b.next,L={value:w,prev:b,next:I};return b.next=L,I.prev=L,j.length++,L}function z(j,b,w){for(var I=b.next,L=0;L<w&&I!==j.tail;L++)I=I.next;b.next=I,I.prev=b,j.length-=L}function q(j){for(var b=[],w=j.head.next;w!==j.tail;)b.push(w.value),w=w.next;return b}return g})();u.exports=i,i.default=i}}),T=Mm(Bm());T.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},T.languages.markup.tag.inside["attr-value"].inside.entity=T.languages.markup.entity,T.languages.markup.doctype.inside["internal-subset"].inside=T.languages.markup,T.hooks.add("wrap",function(a){a.type==="entity"&&(a.attributes.title=a.content.replace(/&amp;/,"&"))}),Object.defineProperty(T.languages.markup.tag,"addInlined",{value:function(a,d){var i={},i=(i["language-"+d]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:T.languages[d]},i.cdata=/^<!\[CDATA\[|\]\]>$/i,{"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:i}}),d=(i["language-"+d]={pattern:/[\s\S]+/,inside:T.languages[d]},{});d[a]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return a}),"i"),lookbehind:!0,greedy:!0,inside:i},T.languages.insertBefore("markup","cdata",d)}}),Object.defineProperty(T.languages.markup.tag,"addAttribute",{value:function(a,u){T.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+a+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[u,"language-"+u],inside:T.languages[u]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),T.languages.html=T.languages.markup,T.languages.mathml=T.languages.markup,T.languages.svg=T.languages.markup,T.languages.xml=T.languages.extend("markup",{}),T.languages.ssml=T.languages.xml,T.languages.atom=T.languages.xml,T.languages.rss=T.languages.xml,(function(a){var u={pattern:/\\[\\(){}[\]^$+*?|.]/,alias:"escape"},i=/\\(?:x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]+\}|0[0-7]{0,2}|[123][0-7]{2}|c[a-zA-Z]|.)/,d="(?:[^\\\\-]|"+i.source+")",d=RegExp(d+"-"+d),f={pattern:/(<|')[^<>']+(?=[>']$)/,lookbehind:!0,alias:"variable"};a.languages.regex={"char-class":{pattern:/((?:^|[^\\])(?:\\\\)*)\[(?:[^\\\]]|\\[\s\S])*\]/,lookbehind:!0,inside:{"char-class-negation":{pattern:/(^\[)\^/,lookbehind:!0,alias:"operator"},"char-class-punctuation":{pattern:/^\[|\]$/,alias:"punctuation"},range:{pattern:d,inside:{escape:i,"range-punctuation":{pattern:/-/,alias:"operator"}}},"special-escape":u,"char-set":{pattern:/\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},escape:i}},"special-escape":u,"char-set":{pattern:/\.|\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},backreference:[{pattern:/\\(?![123][0-7]{2})[1-9]/,alias:"keyword"},{pattern:/\\k<[^<>']+>/,alias:"keyword",inside:{"group-name":f}}],anchor:{pattern:/[$^]|\\[ABbGZz]/,alias:"function"},escape:i,group:[{pattern:/\((?:\?(?:<[^<>']+>|'[^<>']+'|[>:]|<?[=!]|[idmnsuxU]+(?:-[idmnsuxU]+)?:?))?/,alias:"punctuation",inside:{"group-name":f}},{pattern:/\)/,alias:"punctuation"}],quantifier:{pattern:/(?:[+*?]|\{\d+(?:,\d*)?\})[?+]?/,alias:"number"},alternation:{pattern:/\|/,alias:"keyword"}}})(T),T.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},T.languages.javascript=T.languages.extend("clike",{"class-name":[T.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),T.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,T.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:T.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:T.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:T.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:T.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:T.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),T.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:T.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),T.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),T.languages.markup&&(T.languages.markup.tag.addInlined("script","javascript"),T.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),T.languages.js=T.languages.javascript,T.languages.actionscript=T.languages.extend("javascript",{keyword:/\b(?:as|break|case|catch|class|const|default|delete|do|dynamic|each|else|extends|final|finally|for|function|get|if|implements|import|in|include|instanceof|interface|internal|is|namespace|native|new|null|override|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|use|var|void|while|with)\b/,operator:/\+\+|--|(?:[+\-*\/%^]|&&?|\|\|?|<<?|>>?>?|[!=]=?)=?|[~?@]/}),T.languages.actionscript["class-name"].alias="function",delete T.languages.actionscript.parameter,delete T.languages.actionscript["literal-property"],T.languages.markup&&T.languages.insertBefore("actionscript","string",{xml:{pattern:/(^|[^.])<\/?\w+(?:\s+[^\s>\/=]+=("|')(?:\\[\s\S]|(?!\2)[^\\])*\2)*\s*\/?>/,lookbehind:!0,inside:T.languages.markup}}),(function(a){var u=/#(?!\{).+/,i={pattern:/#\{[^}]+\}/,alias:"variable"};a.languages.coffeescript=a.languages.extend("javascript",{comment:u,string:[{pattern:/'(?:\\[\s\S]|[^\\'])*'/,greedy:!0},{pattern:/"(?:\\[\s\S]|[^\\"])*"/,greedy:!0,inside:{interpolation:i}}],keyword:/\b(?:and|break|by|catch|class|continue|debugger|delete|do|each|else|extend|extends|false|finally|for|if|in|instanceof|is|isnt|let|loop|namespace|new|no|not|null|of|off|on|or|own|return|super|switch|then|this|throw|true|try|typeof|undefined|unless|until|when|while|window|with|yes|yield)\b/,"class-member":{pattern:/@(?!\d)\w+/,alias:"variable"}}),a.languages.insertBefore("coffeescript","comment",{"multiline-comment":{pattern:/###[\s\S]+?###/,alias:"comment"},"block-regex":{pattern:/\/{3}[\s\S]*?\/{3}/,alias:"regex",inside:{comment:u,interpolation:i}}}),a.languages.insertBefore("coffeescript","string",{"inline-javascript":{pattern:/`(?:\\[\s\S]|[^\\`])*`/,inside:{delimiter:{pattern:/^`|`$/,alias:"punctuation"},script:{pattern:/[\s\S]+/,alias:"language-javascript",inside:a.languages.javascript}}},"multiline-string":[{pattern:/'''[\s\S]*?'''/,greedy:!0,alias:"string"},{pattern:/"""[\s\S]*?"""/,greedy:!0,alias:"string",inside:{interpolation:i}}]}),a.languages.insertBefore("coffeescript","keyword",{property:/(?!\d)\w+(?=\s*:(?!:))/}),delete a.languages.coffeescript["template-string"],a.languages.coffee=a.languages.coffeescript})(T),(function(a){var u=a.languages.javadoclike={parameter:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*@(?:arg|arguments|param)\s+)\w+/m,lookbehind:!0},keyword:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,lookbehind:!0},punctuation:/[{}]/};Object.defineProperty(u,"addSupport",{value:function(i,d){(i=typeof i=="string"?[i]:i).forEach(function(f){var y=function(N){N.inside||(N.inside={}),N.inside.rest=d},g="doc-comment";if(_=a.languages[f]){var _,v=_[g];if((v=v||(_=a.languages.insertBefore(f,"comment",{"doc-comment":{pattern:/(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/,lookbehind:!0,alias:"comment"}}))[g])instanceof RegExp&&(v=_[g]={pattern:v}),Array.isArray(v))for(var C=0,R=v.length;C<R;C++)v[C]instanceof RegExp&&(v[C]={pattern:v[C]}),y(v[C]);else y(v)}})}}),u.addSupport(["java","javascript","php"],u)})(T),(function(a){var u=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/,u=(a.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+u.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+u.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+u.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+u.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:u,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},a.languages.css.atrule.inside.rest=a.languages.css,a.languages.markup);u&&(u.tag.addInlined("style","css"),u.tag.addAttribute("style","css"))})(T),(function(a){var u=/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,u=(a.languages.css.selector={pattern:a.languages.css.selector.pattern,lookbehind:!0,inside:u={"pseudo-element":/:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,"pseudo-class":/:[-\w]+/,class:/\.[-\w]+/,id:/#[-\w]+/,attribute:{pattern:RegExp(`\\[(?:[^[\\]"']|`+u.source+")*\\]"),greedy:!0,inside:{punctuation:/^\[|\]$/,"case-sensitivity":{pattern:/(\s)[si]$/i,lookbehind:!0,alias:"keyword"},namespace:{pattern:/^(\s*)(?:(?!\s)[-*\w\xA0-\uFFFF])*\|(?!=)/,lookbehind:!0,inside:{punctuation:/\|$/}},"attr-name":{pattern:/^(\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+/,lookbehind:!0},"attr-value":[u,{pattern:/(=\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+(?=\s*$)/,lookbehind:!0}],operator:/[|~*^$]?=/}},"n-th":[{pattern:/(\(\s*)[+-]?\d*[\dn](?:\s*[+-]\s*\d+)?(?=\s*\))/,lookbehind:!0,inside:{number:/[\dn]+/,operator:/[+-]/}},{pattern:/(\(\s*)(?:even|odd)(?=\s*\))/i,lookbehind:!0}],combinator:/>|\+|~|\|\|/,punctuation:/[(),]/}},a.languages.css.atrule.inside["selector-function-argument"].inside=u,a.languages.insertBefore("css","property",{variable:{pattern:/(^|[^-\w\xA0-\uFFFF])--(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*/i,lookbehind:!0}}),{pattern:/(\b\d+)(?:%|[a-z]+(?![\w-]))/,lookbehind:!0}),i={pattern:/(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/,lookbehind:!0};a.languages.insertBefore("css","function",{operator:{pattern:/(\s)[+\-*\/](?=\s)/,lookbehind:!0},hexcode:{pattern:/\B#[\da-f]{3,8}\b/i,alias:"color"},color:[{pattern:/(^|[^\w-])(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGr[ae]y|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGr[ae]y|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGr[ae]y|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gr[ae]y|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGr[ae]y|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGr[ae]y|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGr[ae]y|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Transparent|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)(?![\w-])/i,lookbehind:!0},{pattern:/\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,inside:{unit:u,number:i,function:/[\w-]+(?=\()/,punctuation:/[(),]/}}],entity:/\\[\da-f]{1,8}/i,unit:u,number:i})})(T),(function(a){var u=/[*&][^\s[\]{},]+/,i=/!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/,d="(?:"+i.source+"(?:[ 	]+"+u.source+")?|"+u.source+"(?:[ 	]+"+i.source+")?)",f=/(?:[^\s\x00-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source.replace(/<PLAIN>/g,function(){return/[^\s\x00-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/.source}),y=/"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source;function g(_,v){v=(v||"").replace(/m/g,"")+"m";var C=/([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:[\r\n]\s*)?#))/.source.replace(/<<prop>>/g,function(){return d}).replace(/<<value>>/g,function(){return _});return RegExp(C,v)}a.languages.yaml={scalar:{pattern:RegExp(/([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\S[^\r\n]*(?:\2[^\r\n]+)*)/.source.replace(/<<prop>>/g,function(){return d})),lookbehind:!0,alias:"string"},comment:/#.*/,key:{pattern:RegExp(/((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source.replace(/<<prop>>/g,function(){return d}).replace(/<<key>>/g,function(){return"(?:"+f+"|"+y+")"})),lookbehind:!0,greedy:!0,alias:"atrule"},directive:{pattern:/(^[ \t]*)%.+/m,lookbehind:!0,alias:"important"},datetime:{pattern:g(/\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source),lookbehind:!0,alias:"number"},boolean:{pattern:g(/false|true/.source,"i"),lookbehind:!0,alias:"important"},null:{pattern:g(/null|~/.source,"i"),lookbehind:!0,alias:"important"},string:{pattern:g(y),lookbehind:!0,greedy:!0},number:{pattern:g(/[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source,"i"),lookbehind:!0},tag:i,important:u,punctuation:/---|[:[\]{}\-,|>?]|\.\.\./},a.languages.yml=a.languages.yaml})(T),(function(a){var u=/(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;function i(C){return C=C.replace(/<inner>/g,function(){return u}),RegExp(/((?:^|[^\\])(?:\\{2})*)/.source+"(?:"+C+")")}var d=/(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source,f=/\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(/__/g,function(){return d}),y=/\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source,g=(a.languages.markdown=a.languages.extend("markup",{}),a.languages.insertBefore("markdown","prolog",{"front-matter-block":{pattern:/(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,lookbehind:!0,greedy:!0,inside:{punctuation:/^---|---$/,"front-matter":{pattern:/\S+(?:\s+\S+)*/,alias:["yaml","language-yaml"],inside:a.languages.yaml}}},blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},table:{pattern:RegExp("^"+f+y+"(?:"+f+")*","m"),inside:{"table-data-rows":{pattern:RegExp("^("+f+y+")(?:"+f+")*$"),lookbehind:!0,inside:{"table-data":{pattern:RegExp(d),inside:a.languages.markdown},punctuation:/\|/}},"table-line":{pattern:RegExp("^("+f+")"+y+"$"),lookbehind:!0,inside:{punctuation:/\||:?-{3,}:?/}},"table-header-row":{pattern:RegExp("^"+f+"$"),inside:{"table-header":{pattern:RegExp(d),alias:"important",inside:a.languages.markdown},punctuation:/\|/}}}},code:[{pattern:/((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,lookbehind:!0,alias:"keyword"},{pattern:/^```[\s\S]*?^```$/m,greedy:!0,inside:{"code-block":{pattern:/^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,lookbehind:!0},"code-language":{pattern:/^(```).+/,lookbehind:!0},punctuation:/```/}}],title:[{pattern:/\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:i(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^..)[\s\S]+(?=..$)/,lookbehind:!0,inside:{}},punctuation:/\*\*|__/}},italic:{pattern:i(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^.)[\s\S]+(?=.$)/,lookbehind:!0,inside:{}},punctuation:/[*_]/}},strike:{pattern:i(/(~~?)(?:(?!~)<inner>)+\2/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^~~?)[\s\S]+(?=\1$)/,lookbehind:!0,inside:{}},punctuation:/~~?/}},"code-snippet":{pattern:/(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,lookbehind:!0,greedy:!0,alias:["code","keyword"]},url:{pattern:i(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source),lookbehind:!0,greedy:!0,inside:{operator:/^!/,content:{pattern:/(^\[)[^\]]+(?=\])/,lookbehind:!0,inside:{}},variable:{pattern:/(^\][ \t]?\[)[^\]]+(?=\]$)/,lookbehind:!0},url:{pattern:/(^\]\()[^\s)]+/,lookbehind:!0},string:{pattern:/(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,lookbehind:!0}}}}),["url","bold","italic","strike"].forEach(function(C){["url","bold","italic","strike","code-snippet"].forEach(function(R){C!==R&&(a.languages.markdown[C].inside.content.inside[R]=a.languages.markdown[R])})}),a.hooks.add("after-tokenize",function(C){C.language!=="markdown"&&C.language!=="md"||(function R(N){if(N&&typeof N!="string")for(var z=0,q=N.length;z<q;z++){var j,b=N[z];b.type!=="code"?R(b.content):(j=b.content[1],b=b.content[3],j&&b&&j.type==="code-language"&&b.type==="code-block"&&typeof j.content=="string"&&(j=j.content.replace(/\b#/g,"sharp").replace(/\b\+\+/g,"pp"),j="language-"+(j=(/[a-z][\w-]*/i.exec(j)||[""])[0].toLowerCase()),b.alias?typeof b.alias=="string"?b.alias=[b.alias,j]:b.alias.push(j):b.alias=[j]))}})(C.tokens)}),a.hooks.add("wrap",function(C){if(C.type==="code-block"){for(var R="",N=0,z=C.classes.length;N<z;N++){var q=C.classes[N],q=/language-(.+)/.exec(q);if(q){R=q[1];break}}var j,b=a.languages[R];b?C.content=a.highlight((function(w){return w=w.replace(g,""),w=w.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi,function(I,L){var F;return(L=L.toLowerCase())[0]==="#"?(F=L[1]==="x"?parseInt(L.slice(2),16):Number(L.slice(1)),v(F)):_[L]||I})})(C.content),b,R):R&&R!=="none"&&a.plugins.autoloader&&(j="md-"+new Date().valueOf()+"-"+Math.floor(1e16*Math.random()),C.attributes.id=j,a.plugins.autoloader.loadLanguages(R,function(){var w=document.getElementById(j);w&&(w.innerHTML=a.highlight(w.textContent,a.languages[R],R))}))}}),RegExp(a.languages.markup.tag.pattern.source,"gi")),_={amp:"&",lt:"<",gt:">",quot:'"'},v=String.fromCodePoint||String.fromCharCode;a.languages.md=a.languages.markdown})(T),T.languages.graphql={comment:/#.*/,description:{pattern:/(?:"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*")(?=\s*[a-z_])/i,greedy:!0,alias:"string",inside:{"language-markdown":{pattern:/(^"(?:"")?)(?!\1)[\s\S]+(?=\1$)/,lookbehind:!0,inside:T.languages.markdown}}},string:{pattern:/"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*"/,greedy:!0},number:/(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,boolean:/\b(?:false|true)\b/,variable:/\$[a-z_]\w*/i,directive:{pattern:/@[a-z_]\w*/i,alias:"function"},"attr-name":{pattern:/\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i,greedy:!0},"atom-input":{pattern:/\b[A-Z]\w*Input\b/,alias:"class-name"},scalar:/\b(?:Boolean|Float|ID|Int|String)\b/,constant:/\b[A-Z][A-Z_\d]*\b/,"class-name":{pattern:/(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/,lookbehind:!0},fragment:{pattern:/(\bfragment\s+|\.{3}\s*(?!on\b))[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},"definition-mutation":{pattern:/(\bmutation\s+)[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},"definition-query":{pattern:/(\bquery\s+)[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},keyword:/\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/,operator:/[!=|&]|\.{3}/,"property-query":/\w+(?=\s*\()/,object:/\w+(?=\s*\{)/,punctuation:/[!(){}\[\]:=,]/,property:/\w+/},T.hooks.add("after-tokenize",function(a){if(a.language==="graphql")for(var u=a.tokens.filter(function(j){return typeof j!="string"&&j.type!=="comment"&&j.type!=="scalar"}),i=0;i<u.length;){var d=u[i++];if(d.type==="keyword"&&d.content==="mutation"){var f=[];if(N(["definition-mutation","punctuation"])&&R(1).content==="("){i+=2;var y=z(/^\($/,/^\)$/);if(y===-1)continue;for(;i<y;i++){var g=R(0);g.type==="variable"&&(q(g,"variable-input"),f.push(g.content))}i=y+1}if(N(["punctuation","property-query"])&&R(0).content==="{"&&(i++,q(R(0),"property-mutation"),0<f.length)){var _=z(/^\{$/,/^\}$/);if(_!==-1)for(var v=i;v<_;v++){var C=u[v];C.type==="variable"&&0<=f.indexOf(C.content)&&q(C,"variable-input")}}}}function R(j){return u[i+j]}function N(j,b){b=b||0;for(var w=0;w<j.length;w++){var I=R(w+b);if(!I||I.type!==j[w])return}return 1}function z(j,b){for(var w=1,I=i;I<u.length;I++){var L=u[I],F=L.content;if(L.type==="punctuation"&&typeof F=="string"){if(j.test(F))w++;else if(b.test(F)&&--w===0)return I}}return-1}function q(j,b){var w=j.alias;w?Array.isArray(w)||(j.alias=w=[w]):j.alias=w=[],w.push(b)}}),T.languages.sql={comment:{pattern:/(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,lookbehind:!0},variable:[{pattern:/@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,greedy:!0},/@[\w.$]+/],string:{pattern:/(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,greedy:!0,lookbehind:!0},identifier:{pattern:/(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,greedy:!0,lookbehind:!0,inside:{punctuation:/^`|`$/}},function:/\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i,keyword:/\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,boolean:/\b(?:FALSE|NULL|TRUE)\b/i,number:/\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,operator:/[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,punctuation:/[;[\]()`,.]/},(function(a){var u=a.languages.javascript["template-string"],i=u.pattern.source,d=u.inside.interpolation,f=d.inside["interpolation-punctuation"],y=d.pattern.source;function g(N,z){if(a.languages[N])return{pattern:RegExp("((?:"+z+")\\s*)"+i),lookbehind:!0,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},"embedded-code":{pattern:/[\s\S]+/,alias:N}}}}function _(N,z,q){return N={code:N,grammar:z,language:q},a.hooks.run("before-tokenize",N),N.tokens=a.tokenize(N.code,N.grammar),a.hooks.run("after-tokenize",N),N.tokens}function v(N,z,q){var w=a.tokenize(N,{interpolation:{pattern:RegExp(y),lookbehind:!0}}),j=0,b={},w=_(w.map(function(L){if(typeof L=="string")return L;for(var F,Q,L=L.content;N.indexOf((Q=j++,F="___"+q.toUpperCase()+"_"+Q+"___"))!==-1;);return b[F]=L,F}).join(""),z,q),I=Object.keys(b);return j=0,(function L(F){for(var Q=0;Q<F.length;Q++){if(j>=I.length)return;var ee,ue,ae,me,ke,Fe,Be,Ee=F[Q];typeof Ee=="string"||typeof Ee.content=="string"?(ee=I[j],(Be=(Fe=typeof Ee=="string"?Ee:Ee.content).indexOf(ee))!==-1&&(++j,ue=Fe.substring(0,Be),ke=b[ee],ae=void 0,(me={})["interpolation-punctuation"]=f,(me=a.tokenize(ke,me)).length===3&&((ae=[1,1]).push.apply(ae,_(me[1],a.languages.javascript,"javascript")),me.splice.apply(me,ae)),ae=new a.Token("interpolation",me,d.alias,ke),me=Fe.substring(Be+ee.length),ke=[],ue&&ke.push(ue),ke.push(ae),me&&(L(Fe=[me]),ke.push.apply(ke,Fe)),typeof Ee=="string"?(F.splice.apply(F,[Q,1].concat(ke)),Q+=ke.length-1):Ee.content=ke)):(Be=Ee.content,Array.isArray(Be)?L(Be):L([Be]))}})(w),new a.Token(q,w,"language-"+q,N)}a.languages.javascript["template-string"]=[g("css",/\b(?:styled(?:\([^)]*\))?(?:\s*\.\s*\w+(?:\([^)]*\))*)*|css(?:\s*\.\s*(?:global|resolve))?|createGlobalStyle|keyframes)/.source),g("html",/\bhtml|\.\s*(?:inner|outer)HTML\s*\+?=/.source),g("svg",/\bsvg/.source),g("markdown",/\b(?:markdown|md)/.source),g("graphql",/\b(?:gql|graphql(?:\s*\.\s*experimental)?)/.source),g("sql",/\bsql/.source),u].filter(Boolean);var C={javascript:!0,js:!0,typescript:!0,ts:!0,jsx:!0,tsx:!0};function R(N){return typeof N=="string"?N:Array.isArray(N)?N.map(R).join(""):R(N.content)}a.hooks.add("after-tokenize",function(N){N.language in C&&(function z(q){for(var j=0,b=q.length;j<b;j++){var w,I,L,F=q[j];typeof F!="string"&&(w=F.content,Array.isArray(w)?F.type==="template-string"?(F=w[1],w.length===3&&typeof F!="string"&&F.type==="embedded-code"&&(I=R(F),F=F.alias,F=Array.isArray(F)?F[0]:F,L=a.languages[F])&&(w[1]=v(I,L,F))):z(w):typeof w!="string"&&z([w]))}})(N.tokens)})})(T),(function(a){a.languages.typescript=a.languages.extend("javascript",{"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,lookbehind:!0,greedy:!0,inside:null},builtin:/\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/}),a.languages.typescript.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/,/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,/\btype\b(?=\s*(?:[\{*]|$))/),delete a.languages.typescript.parameter,delete a.languages.typescript["literal-property"];var u=a.languages.extend("typescript",{});delete u["class-name"],a.languages.typescript["class-name"].inside=u,a.languages.insertBefore("typescript","function",{decorator:{pattern:/@[$\w\xA0-\uFFFF]+/,inside:{at:{pattern:/^@/,alias:"operator"},function:/^[\s\S]+/}},"generic-function":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,greedy:!0,inside:{function:/^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:u}}}}),a.languages.ts=a.languages.typescript})(T),(function(a){var u=a.languages.javascript,i=/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})+\}/.source,d="(@(?:arg|argument|param|property)\\s+(?:"+i+"\\s+)?)";a.languages.jsdoc=a.languages.extend("javadoclike",{parameter:{pattern:RegExp(d+/(?:(?!\s)[$\w\xA0-\uFFFF.])+(?=\s|$)/.source),lookbehind:!0,inside:{punctuation:/\./}}}),a.languages.insertBefore("jsdoc","keyword",{"optional-parameter":{pattern:RegExp(d+/\[(?:(?!\s)[$\w\xA0-\uFFFF.])+(?:=[^[\]]+)?\](?=\s|$)/.source),lookbehind:!0,inside:{parameter:{pattern:/(^\[)[$\w\xA0-\uFFFF\.]+/,lookbehind:!0,inside:{punctuation:/\./}},code:{pattern:/(=)[\s\S]*(?=\]$)/,lookbehind:!0,inside:u,alias:"language-javascript"},punctuation:/[=[\]]/}},"class-name":[{pattern:RegExp(/(@(?:augments|class|extends|interface|memberof!?|template|this|typedef)\s+(?:<TYPE>\s+)?)[A-Z]\w*(?:\.[A-Z]\w*)*/.source.replace(/<TYPE>/g,function(){return i})),lookbehind:!0,inside:{punctuation:/\./}},{pattern:RegExp("(@[a-z]+\\s+)"+i),lookbehind:!0,inside:{string:u.string,number:u.number,boolean:u.boolean,keyword:a.languages.typescript.keyword,operator:/=>|\.\.\.|[&|?:*]/,punctuation:/[.,;=<>{}()[\]]/}}],example:{pattern:/(@example\s+(?!\s))(?:[^@\s]|\s+(?!\s))+?(?=\s*(?:\*\s*)?(?:@\w|\*\/))/,lookbehind:!0,inside:{code:{pattern:/^([\t ]*(?:\*\s*)?)\S.*$/m,lookbehind:!0,inside:u,alias:"language-javascript"}}}}),a.languages.javadoclike.addSupport("javascript",a.languages.jsdoc)})(T),(function(a){a.languages.flow=a.languages.extend("javascript",{}),a.languages.insertBefore("flow","keyword",{type:[{pattern:/\b(?:[Bb]oolean|Function|[Nn]umber|[Ss]tring|[Ss]ymbol|any|mixed|null|void)\b/,alias:"class-name"}]}),a.languages.flow["function-variable"].pattern=/(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=\s*(?:function\b|(?:\([^()]*\)(?:\s*:\s*\w+)?|(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/i,delete a.languages.flow.parameter,a.languages.insertBefore("flow","operator",{"flow-punctuation":{pattern:/\{\||\|\}/,alias:"punctuation"}}),Array.isArray(a.languages.flow.keyword)||(a.languages.flow.keyword=[a.languages.flow.keyword]),a.languages.flow.keyword.unshift({pattern:/(^|[^$]\b)(?:Class|declare|opaque|type)\b(?!\$)/,lookbehind:!0},{pattern:/(^|[^$]\B)\$(?:Diff|Enum|Exact|Keys|ObjMap|PropertyType|Record|Shape|Subtype|Supertype|await)\b(?!\$)/,lookbehind:!0})})(T),T.languages.n4js=T.languages.extend("javascript",{keyword:/\b(?:Array|any|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|module|new|null|number|package|private|protected|public|return|set|static|string|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/}),T.languages.insertBefore("n4js","constant",{annotation:{pattern:/@+\w+/,alias:"operator"}}),T.languages.n4jsd=T.languages.n4js,(function(a){function u(g,_){return RegExp(g.replace(/<ID>/g,function(){return/(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/.source}),_)}a.languages.insertBefore("javascript","function-variable",{"method-variable":{pattern:RegExp("(\\.\\s*)"+a.languages.javascript["function-variable"].pattern.source),lookbehind:!0,alias:["function-variable","method","function","property-access"]}}),a.languages.insertBefore("javascript","function",{method:{pattern:RegExp("(\\.\\s*)"+a.languages.javascript.function.source),lookbehind:!0,alias:["function","property-access"]}}),a.languages.insertBefore("javascript","constant",{"known-class-name":[{pattern:/\b(?:(?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)?Array|ArrayBuffer|BigInt|Boolean|DataView|Date|Error|Function|Intl|JSON|(?:Weak)?(?:Map|Set)|Math|Number|Object|Promise|Proxy|Reflect|RegExp|String|Symbol|WebAssembly)\b/,alias:"class-name"},{pattern:/\b(?:[A-Z]\w*)Error\b/,alias:"class-name"}]}),a.languages.insertBefore("javascript","keyword",{imports:{pattern:u(/(\bimport\b\s*)(?:<ID>(?:\s*,\s*(?:\*\s*as\s+<ID>|\{[^{}]*\}))?|\*\s*as\s+<ID>|\{[^{}]*\})(?=\s*\bfrom\b)/.source),lookbehind:!0,inside:a.languages.javascript},exports:{pattern:u(/(\bexport\b\s*)(?:\*(?:\s*as\s+<ID>)?(?=\s*\bfrom\b)|\{[^{}]*\})/.source),lookbehind:!0,inside:a.languages.javascript}}),a.languages.javascript.keyword.unshift({pattern:/\b(?:as|default|export|from|import)\b/,alias:"module"},{pattern:/\b(?:await|break|catch|continue|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/,alias:"control-flow"},{pattern:/\bnull\b/,alias:["null","nil"]},{pattern:/\bundefined\b/,alias:"nil"}),a.languages.insertBefore("javascript","operator",{spread:{pattern:/\.{3}/,alias:"operator"},arrow:{pattern:/=>/,alias:"operator"}}),a.languages.insertBefore("javascript","punctuation",{"property-access":{pattern:u(/(\.\s*)#?<ID>/.source),lookbehind:!0},"maybe-class-name":{pattern:/(^|[^$\w\xA0-\uFFFF])[A-Z][$\w\xA0-\uFFFF]+/,lookbehind:!0},dom:{pattern:/\b(?:document|(?:local|session)Storage|location|navigator|performance|window)\b/,alias:"variable"},console:{pattern:/\bconsole(?=\s*\.)/,alias:"class-name"}});for(var i=["function","function-variable","method","method-variable","property-access"],d=0;d<i.length;d++){var y=i[d],f=a.languages.javascript[y],y=(f=a.util.type(f)==="RegExp"?a.languages.javascript[y]={pattern:f}:f).inside||{};(f.inside=y)["maybe-class-name"]=/^[A-Z][\s\S]*/}})(T),(function(a){var u=a.util.clone(a.languages.javascript),i=/(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source,d=/(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source,f=/(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;function y(v,C){return v=v.replace(/<S>/g,function(){return i}).replace(/<BRACES>/g,function(){return d}).replace(/<SPREAD>/g,function(){return f}),RegExp(v,C)}f=y(f).source,a.languages.jsx=a.languages.extend("markup",u),a.languages.jsx.tag.pattern=y(/<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/.source),a.languages.jsx.tag.inside.tag.pattern=/^<\/?[^\s>\/]*/,a.languages.jsx.tag.inside["attr-value"].pattern=/=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/,a.languages.jsx.tag.inside.tag.inside["class-name"]=/^[A-Z]\w*(?:\.[A-Z]\w*)*$/,a.languages.jsx.tag.inside.comment=u.comment,a.languages.insertBefore("inside","attr-name",{spread:{pattern:y(/<SPREAD>/.source),inside:a.languages.jsx}},a.languages.jsx.tag),a.languages.insertBefore("inside","special-attr",{script:{pattern:y(/=<BRACES>/.source),alias:"language-javascript",inside:{"script-punctuation":{pattern:/^=(?=\{)/,alias:"punctuation"},rest:a.languages.jsx}}},a.languages.jsx.tag);function g(v){for(var C=[],R=0;R<v.length;R++){var N=v[R],z=!1;typeof N!="string"&&(N.type==="tag"&&N.content[0]&&N.content[0].type==="tag"?N.content[0].content[0].content==="</"?0<C.length&&C[C.length-1].tagName===_(N.content[0].content[1])&&C.pop():N.content[N.content.length-1].content!=="/>"&&C.push({tagName:_(N.content[0].content[1]),openedBraces:0}):0<C.length&&N.type==="punctuation"&&N.content==="{"?C[C.length-1].openedBraces++:0<C.length&&0<C[C.length-1].openedBraces&&N.type==="punctuation"&&N.content==="}"?C[C.length-1].openedBraces--:z=!0),(z||typeof N=="string")&&0<C.length&&C[C.length-1].openedBraces===0&&(z=_(N),R<v.length-1&&(typeof v[R+1]=="string"||v[R+1].type==="plain-text")&&(z+=_(v[R+1]),v.splice(R+1,1)),0<R&&(typeof v[R-1]=="string"||v[R-1].type==="plain-text")&&(z=_(v[R-1])+z,v.splice(R-1,1),R--),v[R]=new a.Token("plain-text",z,null,z)),N.content&&typeof N.content!="string"&&g(N.content)}}var _=function(v){return v?typeof v=="string"?v:typeof v.content=="string"?v.content:v.content.map(_).join(""):""};a.hooks.add("after-tokenize",function(v){v.language!=="jsx"&&v.language!=="tsx"||g(v.tokens)})})(T),(function(a){var u=a.util.clone(a.languages.typescript),u=(a.languages.tsx=a.languages.extend("jsx",u),delete a.languages.tsx.parameter,delete a.languages.tsx["literal-property"],a.languages.tsx.tag);u.pattern=RegExp(/(^|[^\w$]|(?=<\/))/.source+"(?:"+u.pattern.source+")",u.pattern.flags),u.lookbehind=!0})(T),T.languages.swift={comment:{pattern:/(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/,lookbehind:!0,greedy:!0},"string-literal":[{pattern:RegExp(/(^|[^"#])/.source+"(?:"+/"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/.source+"|"+/"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/.source+")"+/(?!["#])/.source),lookbehind:!0,greedy:!0,inside:{interpolation:{pattern:/(\\\()(?:[^()]|\([^()]*\))*(?=\))/,lookbehind:!0,inside:null},"interpolation-punctuation":{pattern:/^\)|\\\($/,alias:"punctuation"},punctuation:/\\(?=[\r\n])/,string:/[\s\S]+/}},{pattern:RegExp(/(^|[^"#])(#+)/.source+"(?:"+/"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/.source+"|"+/"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source+")\\2"),lookbehind:!0,greedy:!0,inside:{interpolation:{pattern:/(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/,lookbehind:!0,inside:null},"interpolation-punctuation":{pattern:/^\)|\\#+\($/,alias:"punctuation"},string:/[\s\S]+/}}],directive:{pattern:RegExp(/#/.source+"(?:"+/(?:elseif|if)\b/.source+"(?:[ 	]*"+/(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/.source+")+|"+/(?:else|endif)\b/.source+")"),alias:"property",inside:{"directive-name":/^#\w+/,boolean:/\b(?:false|true)\b/,number:/\b\d+(?:\.\d+)*\b/,operator:/!|&&|\|\||[<>]=?/,punctuation:/[(),]/}},literal:{pattern:/#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/,alias:"constant"},"other-directive":{pattern:/#\w+\b/,alias:"property"},attribute:{pattern:/@\w+/,alias:"atrule"},"function-definition":{pattern:/(\bfunc\s+)\w+/,lookbehind:!0,alias:"function"},label:{pattern:/\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/,lookbehind:!0,alias:"important"},keyword:/\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,boolean:/\b(?:false|true)\b/,nil:{pattern:/\bnil\b/,alias:"constant"},"short-argument":/\$\d+\b/,omit:{pattern:/\b_\b/,alias:"keyword"},number:/\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,"class-name":/\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/,function:/\b[a-z_]\w*(?=\s*\()/i,constant:/\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,operator:/[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/,punctuation:/[{}[\]();,.:\\]/},T.languages.swift["string-literal"].forEach(function(a){a.inside.interpolation.inside=T.languages.swift}),(function(a){a.languages.kotlin=a.languages.extend("clike",{keyword:{pattern:/(^|[^.])\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/,lookbehind:!0},function:[{pattern:/(?:`[^\r\n`]+`|\b\w+)(?=\s*\()/,greedy:!0},{pattern:/(\.)(?:`[^\r\n`]+`|\w+)(?=\s*\{)/,lookbehind:!0,greedy:!0}],number:/\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/,operator:/\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/}),delete a.languages.kotlin["class-name"];var u={"interpolation-punctuation":{pattern:/^\$\{?|\}$/,alias:"punctuation"},expression:{pattern:/[\s\S]+/,inside:a.languages.kotlin}};a.languages.insertBefore("kotlin","string",{"string-literal":[{pattern:/"""(?:[^$]|\$(?:(?!\{)|\{[^{}]*\}))*?"""/,alias:"multiline",inside:{interpolation:{pattern:/\$(?:[a-z_]\w*|\{[^{}]*\})/i,inside:u},string:/[\s\S]+/}},{pattern:/"(?:[^"\\\r\n$]|\\.|\$(?:(?!\{)|\{[^{}]*\}))*"/,alias:"singleline",inside:{interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$(?:[a-z_]\w*|\{[^{}]*\})/i,lookbehind:!0,inside:u},string:/[\s\S]+/}}],char:{pattern:/'(?:[^'\\\r\n]|\\(?:.|u[a-fA-F0-9]{0,4}))'/,greedy:!0}}),delete a.languages.kotlin.string,a.languages.insertBefore("kotlin","keyword",{annotation:{pattern:/\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/,alias:"builtin"}}),a.languages.insertBefore("kotlin","function",{label:{pattern:/\b\w+@|@\w+\b/,alias:"symbol"}}),a.languages.kt=a.languages.kotlin,a.languages.kts=a.languages.kotlin})(T),T.languages.c=T.languages.extend("clike",{comment:{pattern:/\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},string:{pattern:/"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,greedy:!0},"class-name":{pattern:/(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,lookbehind:!0},keyword:/\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,function:/\b[a-z_]\w*(?=\s*\()/i,number:/(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,operator:/>>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/}),T.languages.insertBefore("c","string",{char:{pattern:/'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,greedy:!0}}),T.languages.insertBefore("c","string",{macro:{pattern:/(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,lookbehind:!0,greedy:!0,alias:"property",inside:{string:[{pattern:/^(#\s*include\s*)<[^>]+>/,lookbehind:!0},T.languages.c.string],char:T.languages.c.char,comment:T.languages.c.comment,"macro-name":[{pattern:/(^#\s*define\s+)\w+\b(?!\()/i,lookbehind:!0},{pattern:/(^#\s*define\s+)\w+\b(?=\()/i,lookbehind:!0,alias:"function"}],directive:{pattern:/^(#\s*)[a-z]+/,lookbehind:!0,alias:"keyword"},"directive-hash":/^#/,punctuation:/##|\\(?=[\r\n])/,expression:{pattern:/\S[\s\S]*/,inside:T.languages.c}}}}),T.languages.insertBefore("c","function",{constant:/\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/}),delete T.languages.c.boolean,T.languages.objectivec=T.languages.extend("c",{string:{pattern:/@?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,greedy:!0},keyword:/\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,operator:/-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/}),delete T.languages.objectivec["class-name"],T.languages.objc=T.languages.objectivec,T.languages.reason=T.languages.extend("clike",{string:{pattern:/"(?:\\(?:\r\n|[\s\S])|[^\\\r\n"])*"/,greedy:!0},"class-name":/\b[A-Z]\w*/,keyword:/\b(?:and|as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|sig|struct|switch|then|to|try|type|val|virtual|when|while|with)\b/,operator:/\.{3}|:[:=]|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/}),T.languages.insertBefore("reason","class-name",{char:{pattern:/'(?:\\x[\da-f]{2}|\\o[0-3][0-7][0-7]|\\\d{3}|\\.|[^'\\\r\n])'/,greedy:!0},constructor:/\b[A-Z]\w*\b(?!\s*\.)/,label:{pattern:/\b[a-z]\w*(?=::)/,alias:"symbol"}}),delete T.languages.reason.function,(function(a){for(var u=/\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source,i=0;i<2;i++)u=u.replace(/<self>/g,function(){return u});u=u.replace(/<self>/g,function(){return/[^\s\S]/.source}),a.languages.rust={comment:[{pattern:RegExp(/(^|[^\\])/.source+u),lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/,greedy:!0},char:{pattern:/b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,greedy:!0},attribute:{pattern:/#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/,greedy:!0,alias:"attr-name",inside:{string:null}},"closure-params":{pattern:/([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/,lookbehind:!0,greedy:!0,inside:{"closure-punctuation":{pattern:/^\||\|$/,alias:"punctuation"},rest:null}},"lifetime-annotation":{pattern:/'\w+/,alias:"symbol"},"fragment-specifier":{pattern:/(\$\w+:)[a-z]+/,lookbehind:!0,alias:"punctuation"},variable:/\$\w+/,"function-definition":{pattern:/(\bfn\s+)\w+/,lookbehind:!0,alias:"function"},"type-definition":{pattern:/(\b(?:enum|struct|trait|type|union)\s+)\w+/,lookbehind:!0,alias:"class-name"},"module-declaration":[{pattern:/(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/,lookbehind:!0,alias:"namespace"},{pattern:/(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/,lookbehind:!0,alias:"namespace",inside:{punctuation:/::/}}],keyword:[/\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,/\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/],function:/\b[a-z_]\w*(?=\s*(?:::\s*<|\())/,macro:{pattern:/\b\w+!/,alias:"property"},constant:/\b[A-Z_][A-Z_\d]+\b/,"class-name":/\b[A-Z]\w*\b/,namespace:{pattern:/(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/,inside:{punctuation:/::/}},number:/\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/,boolean:/\b(?:false|true)\b/,punctuation:/->|\.\.=|\.{1,3}|::|[{}[\];(),:]/,operator:/[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/},a.languages.rust["closure-params"].inside.rest=a.languages.rust,a.languages.rust.attribute.inside.string=a.languages.rust.string})(T),T.languages.go=T.languages.extend("clike",{string:{pattern:/(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/,lookbehind:!0,greedy:!0},keyword:/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,boolean:/\b(?:_|false|iota|nil|true)\b/,number:[/\b0(?:b[01_]+|o[0-7_]+)i?\b/i,/\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i,/(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i],operator:/[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,builtin:/\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/}),T.languages.insertBefore("go","string",{char:{pattern:/'(?:\\.|[^'\\\r\n]){0,10}'/,greedy:!0}}),delete T.languages.go["class-name"],(function(a){var u=/\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,i=/\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(/<keyword>/g,function(){return u.source});a.languages.cpp=a.languages.extend("c",{"class-name":[{pattern:RegExp(/(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source.replace(/<keyword>/g,function(){return u.source})),lookbehind:!0},/\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,/\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,/\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/],keyword:u,number:{pattern:/(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,greedy:!0},operator:/>>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,boolean:/\b(?:false|true)\b/}),a.languages.insertBefore("cpp","string",{module:{pattern:RegExp(/(\b(?:import|module)\s+)/.source+"(?:"+/"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source+"|"+/<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(/<mod-name>/g,function(){return i})+")"),lookbehind:!0,greedy:!0,inside:{string:/^[<"][\s\S]+/,operator:/:/,punctuation:/\./}},"raw-string":{pattern:/R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,alias:"string",greedy:!0}}),a.languages.insertBefore("cpp","keyword",{"generic-function":{pattern:/\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i,inside:{function:/^\w+/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:a.languages.cpp}}}}),a.languages.insertBefore("cpp","operator",{"double-colon":{pattern:/::/,alias:"punctuation"}}),a.languages.insertBefore("cpp","class-name",{"base-clause":{pattern:/(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,lookbehind:!0,greedy:!0,inside:a.languages.extend("cpp",{})}}),a.languages.insertBefore("inside","double-colon",{"class-name":/\b[a-z_]\w*\b(?!\s*::)/i},a.languages.cpp["base-clause"])})(T),T.languages.python={comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0,greedy:!0},"string-interpolation":{pattern:/(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,greedy:!0,inside:{interpolation:{pattern:/((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,lookbehind:!0,inside:{"format-spec":{pattern:/(:)[^:(){}]+(?=\}$)/,lookbehind:!0},"conversion-option":{pattern:/![sra](?=[:}]$)/,alias:"punctuation"},rest:null}},string:/[\s\S]+/}},"triple-quoted-string":{pattern:/(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,greedy:!0,alias:"string"},string:{pattern:/(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,greedy:!0},function:{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)\w+/i,lookbehind:!0},decorator:{pattern:/(^[\t ]*)@\w+(?:\.\w+)*/m,lookbehind:!0,alias:["annotation","punctuation"],inside:{punctuation:/\./}},keyword:/\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,builtin:/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,boolean:/\b(?:False|None|True)\b/,number:/\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,operator:/[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,punctuation:/[{}[\];(),.:]/},T.languages.python["string-interpolation"].inside.interpolation.inside.rest=T.languages.python,T.languages.py=T.languages.python,T.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},T.languages.webmanifest=T.languages.json;var Kc={};Dm(Kc,{dracula:()=>$m,duotoneDark:()=>Wm,duotoneLight:()=>Gm,github:()=>Qm,gruvboxMaterialDark:()=>Sh,gruvboxMaterialLight:()=>Nh,jettwaveDark:()=>hh,jettwaveLight:()=>yh,nightOwl:()=>Ym,nightOwlLight:()=>Xm,oceanicNext:()=>eh,okaidia:()=>nh,oneDark:()=>vh,oneLight:()=>bh,palenight:()=>sh,shadesOfPurple:()=>ah,synthwave84:()=>ih,ultramin:()=>ch,vsDark:()=>Yc,vsLight:()=>fh});var Um={plain:{color:"#F8F8F2",backgroundColor:"#282A36"},styles:[{types:["prolog","constant","builtin"],style:{color:"rgb(189, 147, 249)"}},{types:["inserted","function"],style:{color:"rgb(80, 250, 123)"}},{types:["deleted"],style:{color:"rgb(255, 85, 85)"}},{types:["changed"],style:{color:"rgb(255, 184, 108)"}},{types:["punctuation","symbol"],style:{color:"rgb(248, 248, 242)"}},{types:["string","char","tag","selector"],style:{color:"rgb(255, 121, 198)"}},{types:["keyword","variable"],style:{color:"rgb(189, 147, 249)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(98, 114, 164)"}},{types:["attr-name"],style:{color:"rgb(241, 250, 140)"}}]},$m=Um,Vm={plain:{backgroundColor:"#2a2734",color:"#9a86fd"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#6c6783"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#e09142"}},{types:["property","function"],style:{color:"#9a86fd"}},{types:["tag-id","selector","atrule-id"],style:{color:"#eeebff"}},{types:["attr-name"],style:{color:"#c4b9fe"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","atrule","placeholder","variable"],style:{color:"#ffcc99"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#c4b9fe"}}]},Wm=Vm,Hm={plain:{backgroundColor:"#faf8f5",color:"#728fcb"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#b6ad9a"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#063289"}},{types:["property","function"],style:{color:"#b29762"}},{types:["tag-id","selector","atrule-id"],style:{color:"#2d2006"}},{types:["attr-name"],style:{color:"#896724"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","atrule"],style:{color:"#728fcb"}},{types:["placeholder","variable"],style:{color:"#93abdc"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#896724"}}]},Gm=Hm,qm={plain:{color:"#393A34",backgroundColor:"#f6f8fa"},styles:[{types:["comment","prolog","doctype","cdata"],style:{color:"#999988",fontStyle:"italic"}},{types:["namespace"],style:{opacity:.7}},{types:["string","attr-value"],style:{color:"#e3116c"}},{types:["punctuation","operator"],style:{color:"#393A34"}},{types:["entity","url","symbol","number","boolean","variable","constant","property","regex","inserted"],style:{color:"#36acaa"}},{types:["atrule","keyword","attr-name","selector"],style:{color:"#00a4db"}},{types:["function","deleted","tag"],style:{color:"#d73a49"}},{types:["function-variable"],style:{color:"#6f42c1"}},{types:["tag","selector","keyword"],style:{color:"#00009f"}}]},Qm=qm,Km={plain:{color:"#d6deeb",backgroundColor:"#011627"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)",fontStyle:"italic"}},{types:["inserted","attr-name"],style:{color:"rgb(173, 219, 103)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(99, 119, 119)",fontStyle:"italic"}},{types:["string","url"],style:{color:"rgb(173, 219, 103)"}},{types:["variable"],style:{color:"rgb(214, 222, 235)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation"],style:{color:"rgb(199, 146, 234)"}},{types:["selector","doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["class-name"],style:{color:"rgb(255, 203, 139)"}},{types:["tag","operator","keyword"],style:{color:"rgb(127, 219, 202)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["property"],style:{color:"rgb(128, 203, 196)"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}}]},Ym=Km,Zm={plain:{color:"#403f53",backgroundColor:"#FBFBFB"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)",fontStyle:"italic"}},{types:["inserted","attr-name"],style:{color:"rgb(72, 118, 214)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(152, 159, 177)",fontStyle:"italic"}},{types:["string","builtin","char","constant","url"],style:{color:"rgb(72, 118, 214)"}},{types:["variable"],style:{color:"rgb(201, 103, 101)"}},{types:["number"],style:{color:"rgb(170, 9, 130)"}},{types:["punctuation"],style:{color:"rgb(153, 76, 195)"}},{types:["function","selector","doctype"],style:{color:"rgb(153, 76, 195)",fontStyle:"italic"}},{types:["class-name"],style:{color:"rgb(17, 17, 17)"}},{types:["tag"],style:{color:"rgb(153, 76, 195)"}},{types:["operator","property","keyword","namespace"],style:{color:"rgb(12, 150, 155)"}},{types:["boolean"],style:{color:"rgb(188, 84, 84)"}}]},Xm=Zm,ot={char:"#D8DEE9",comment:"#999999",keyword:"#c5a5c5",primitive:"#5a9bcf",string:"#8dc891",variable:"#d7deea",boolean:"#ff8b50",tag:"#fc929e",function:"#79b6f2",className:"#FAC863"},Jm={plain:{backgroundColor:"#282c34",color:"#ffffff"},styles:[{types:["attr-name"],style:{color:ot.keyword}},{types:["attr-value"],style:{color:ot.string}},{types:["comment","block-comment","prolog","doctype","cdata","shebang"],style:{color:ot.comment}},{types:["property","number","function-name","constant","symbol","deleted"],style:{color:ot.primitive}},{types:["boolean"],style:{color:ot.boolean}},{types:["tag"],style:{color:ot.tag}},{types:["string"],style:{color:ot.string}},{types:["punctuation"],style:{color:ot.string}},{types:["selector","char","builtin","inserted"],style:{color:ot.char}},{types:["function"],style:{color:ot.function}},{types:["operator","entity","url","variable"],style:{color:ot.variable}},{types:["keyword"],style:{color:ot.keyword}},{types:["atrule","class-name"],style:{color:ot.className}},{types:["important"],style:{fontWeight:"400"}},{types:["bold"],style:{fontWeight:"bold"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["namespace"],style:{opacity:.7}}]},eh=Jm,th={plain:{color:"#f8f8f2",backgroundColor:"#272822"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"#f92672",fontStyle:"italic"}},{types:["inserted"],style:{color:"rgb(173, 219, 103)",fontStyle:"italic"}},{types:["comment"],style:{color:"#8292a2",fontStyle:"italic"}},{types:["string","url"],style:{color:"#a6e22e"}},{types:["variable"],style:{color:"#f8f8f2"}},{types:["number"],style:{color:"#ae81ff"}},{types:["builtin","char","constant","function","class-name"],style:{color:"#e6db74"}},{types:["punctuation"],style:{color:"#f8f8f2"}},{types:["selector","doctype"],style:{color:"#a6e22e",fontStyle:"italic"}},{types:["tag","operator","keyword"],style:{color:"#66d9ef"}},{types:["boolean"],style:{color:"#ae81ff"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)",opacity:.7}},{types:["tag","property"],style:{color:"#f92672"}},{types:["attr-name"],style:{color:"#a6e22e !important"}},{types:["doctype"],style:{color:"#8292a2"}},{types:["rule"],style:{color:"#e6db74"}}]},nh=th,rh={plain:{color:"#bfc7d5",backgroundColor:"#292d3e"},styles:[{types:["comment"],style:{color:"rgb(105, 112, 152)",fontStyle:"italic"}},{types:["string","inserted"],style:{color:"rgb(195, 232, 141)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation","selector"],style:{color:"rgb(199, 146, 234)"}},{types:["variable"],style:{color:"rgb(191, 199, 213)"}},{types:["class-name","attr-name"],style:{color:"rgb(255, 203, 107)"}},{types:["tag","deleted"],style:{color:"rgb(255, 85, 114)"}},{types:["operator"],style:{color:"rgb(137, 221, 255)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["keyword"],style:{fontStyle:"italic"}},{types:["doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}},{types:["url"],style:{color:"rgb(221, 221, 221)"}}]},sh=rh,lh={plain:{color:"#9EFEFF",backgroundColor:"#2D2A55"},styles:[{types:["changed"],style:{color:"rgb(255, 238, 128)"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)"}},{types:["inserted"],style:{color:"rgb(173, 219, 103)"}},{types:["comment"],style:{color:"rgb(179, 98, 255)",fontStyle:"italic"}},{types:["punctuation"],style:{color:"rgb(255, 255, 255)"}},{types:["constant"],style:{color:"rgb(255, 98, 140)"}},{types:["string","url"],style:{color:"rgb(165, 255, 144)"}},{types:["variable"],style:{color:"rgb(255, 238, 128)"}},{types:["number","boolean"],style:{color:"rgb(255, 98, 140)"}},{types:["attr-name"],style:{color:"rgb(255, 180, 84)"}},{types:["keyword","operator","property","namespace","tag","selector","doctype"],style:{color:"rgb(255, 157, 0)"}},{types:["builtin","char","constant","function","class-name"],style:{color:"rgb(250, 208, 0)"}}]},ah=lh,oh={plain:{backgroundColor:"linear-gradient(to bottom, #2a2139 75%, #34294f)",backgroundImage:"#34294f",color:"#f92aad",textShadow:"0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"},styles:[{types:["comment","block-comment","prolog","doctype","cdata"],style:{color:"#495495",fontStyle:"italic"}},{types:["punctuation"],style:{color:"#ccc"}},{types:["tag","attr-name","namespace","number","unit","hexcode","deleted"],style:{color:"#e2777a"}},{types:["property","selector"],style:{color:"#72f1b8",textShadow:"0 0 2px #100c0f, 0 0 10px #257c5575, 0 0 35px #21272475"}},{types:["function-name"],style:{color:"#6196cc"}},{types:["boolean","selector-id","function"],style:{color:"#fdfdfd",textShadow:"0 0 2px #001716, 0 0 3px #03edf975, 0 0 5px #03edf975, 0 0 8px #03edf975"}},{types:["class-name","maybe-class-name","builtin"],style:{color:"#fff5f6",textShadow:"0 0 2px #000, 0 0 10px #fc1f2c75, 0 0 5px #fc1f2c75, 0 0 25px #fc1f2c75"}},{types:["constant","symbol"],style:{color:"#f92aad",textShadow:"0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"}},{types:["important","atrule","keyword","selector-class"],style:{color:"#f4eee4",textShadow:"0 0 2px #393a33, 0 0 8px #f39f0575, 0 0 2px #f39f0575"}},{types:["string","char","attr-value","regex","variable"],style:{color:"#f87c32"}},{types:["parameter"],style:{fontStyle:"italic"}},{types:["entity","url"],style:{color:"#67cdcc"}},{types:["operator"],style:{color:"ffffffee"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["entity"],style:{cursor:"help"}},{types:["inserted"],style:{color:"green"}}]},ih=oh,uh={plain:{color:"#282a2e",backgroundColor:"#ffffff"},styles:[{types:["comment"],style:{color:"rgb(197, 200, 198)"}},{types:["string","number","builtin","variable"],style:{color:"rgb(150, 152, 150)"}},{types:["class-name","function","tag","attr-name"],style:{color:"rgb(40, 42, 46)"}}]},ch=uh,dh={plain:{color:"#9CDCFE",backgroundColor:"#1E1E1E"},styles:[{types:["prolog"],style:{color:"rgb(0, 0, 128)"}},{types:["comment"],style:{color:"rgb(106, 153, 85)"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"rgb(86, 156, 214)"}},{types:["number","inserted"],style:{color:"rgb(181, 206, 168)"}},{types:["constant"],style:{color:"rgb(100, 102, 149)"}},{types:["attr-name","variable"],style:{color:"rgb(156, 220, 254)"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"rgb(206, 145, 120)"}},{types:["selector"],style:{color:"rgb(215, 186, 125)"}},{types:["tag"],style:{color:"rgb(78, 201, 176)"}},{types:["tag"],languages:["markup"],style:{color:"rgb(86, 156, 214)"}},{types:["punctuation","operator"],style:{color:"rgb(212, 212, 212)"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"rgb(220, 220, 170)"}},{types:["class-name"],style:{color:"rgb(78, 201, 176)"}},{types:["char"],style:{color:"rgb(209, 105, 105)"}}]},Yc=dh,ph={plain:{color:"#000000",backgroundColor:"#ffffff"},styles:[{types:["comment"],style:{color:"rgb(0, 128, 0)"}},{types:["builtin"],style:{color:"rgb(0, 112, 193)"}},{types:["number","variable","inserted"],style:{color:"rgb(9, 134, 88)"}},{types:["operator"],style:{color:"rgb(0, 0, 0)"}},{types:["constant","char"],style:{color:"rgb(129, 31, 63)"}},{types:["tag"],style:{color:"rgb(128, 0, 0)"}},{types:["attr-name"],style:{color:"rgb(255, 0, 0)"}},{types:["deleted","string"],style:{color:"rgb(163, 21, 21)"}},{types:["changed","punctuation"],style:{color:"rgb(4, 81, 165)"}},{types:["function","keyword"],style:{color:"rgb(0, 0, 255)"}},{types:["class-name"],style:{color:"rgb(38, 127, 153)"}}]},fh=ph,mh={plain:{color:"#f8fafc",backgroundColor:"#011627"},styles:[{types:["prolog"],style:{color:"#000080"}},{types:["comment"],style:{color:"#6A9955"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"#569CD6"}},{types:["number","inserted"],style:{color:"#B5CEA8"}},{types:["constant"],style:{color:"#f8fafc"}},{types:["attr-name","variable"],style:{color:"#9CDCFE"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"#cbd5e1"}},{types:["selector"],style:{color:"#D7BA7D"}},{types:["tag"],style:{color:"#0ea5e9"}},{types:["tag"],languages:["markup"],style:{color:"#0ea5e9"}},{types:["punctuation","operator"],style:{color:"#D4D4D4"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"#7dd3fc"}},{types:["class-name"],style:{color:"#0ea5e9"}},{types:["char"],style:{color:"#D16969"}}]},hh=mh,gh={plain:{color:"#0f172a",backgroundColor:"#f1f5f9"},styles:[{types:["prolog"],style:{color:"#000080"}},{types:["comment"],style:{color:"#6A9955"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"#0c4a6e"}},{types:["number","inserted"],style:{color:"#B5CEA8"}},{types:["constant"],style:{color:"#0f172a"}},{types:["attr-name","variable"],style:{color:"#0c4a6e"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"#64748b"}},{types:["selector"],style:{color:"#D7BA7D"}},{types:["tag"],style:{color:"#0ea5e9"}},{types:["tag"],languages:["markup"],style:{color:"#0ea5e9"}},{types:["punctuation","operator"],style:{color:"#475569"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"#0e7490"}},{types:["class-name"],style:{color:"#0ea5e9"}},{types:["char"],style:{color:"#D16969"}}]},yh=gh,xh={plain:{backgroundColor:"hsl(220, 13%, 18%)",color:"hsl(220, 14%, 71%)",textShadow:"0 1px rgba(0, 0, 0, 0.3)"},styles:[{types:["comment","prolog","cdata"],style:{color:"hsl(220, 10%, 40%)"}},{types:["doctype","punctuation","entity"],style:{color:"hsl(220, 14%, 71%)"}},{types:["attr-name","class-name","maybe-class-name","boolean","constant","number","atrule"],style:{color:"hsl(29, 54%, 61%)"}},{types:["keyword"],style:{color:"hsl(286, 60%, 67%)"}},{types:["property","tag","symbol","deleted","important"],style:{color:"hsl(355, 65%, 65%)"}},{types:["selector","string","char","builtin","inserted","regex","attr-value"],style:{color:"hsl(95, 38%, 62%)"}},{types:["variable","operator","function"],style:{color:"hsl(207, 82%, 66%)"}},{types:["url"],style:{color:"hsl(187, 47%, 55%)"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"hsl(220, 14%, 71%)"}}]},vh=xh,wh={plain:{backgroundColor:"hsl(230, 1%, 98%)",color:"hsl(230, 8%, 24%)"},styles:[{types:["comment","prolog","cdata"],style:{color:"hsl(230, 4%, 64%)"}},{types:["doctype","punctuation","entity"],style:{color:"hsl(230, 8%, 24%)"}},{types:["attr-name","class-name","boolean","constant","number","atrule"],style:{color:"hsl(35, 99%, 36%)"}},{types:["keyword"],style:{color:"hsl(301, 63%, 40%)"}},{types:["property","tag","symbol","deleted","important"],style:{color:"hsl(5, 74%, 59%)"}},{types:["selector","string","char","builtin","inserted","regex","attr-value","punctuation"],style:{color:"hsl(119, 34%, 47%)"}},{types:["variable","operator","function"],style:{color:"hsl(221, 87%, 60%)"}},{types:["url"],style:{color:"hsl(198, 99%, 37%)"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"hsl(230, 8%, 24%)"}}]},bh=wh,kh={plain:{color:"#ebdbb2",backgroundColor:"#292828"},styles:[{types:["imports","class-name","maybe-class-name","constant","doctype","builtin","function"],style:{color:"#d8a657"}},{types:["property-access"],style:{color:"#7daea3"}},{types:["tag"],style:{color:"#e78a4e"}},{types:["attr-name","char","url","regex"],style:{color:"#a9b665"}},{types:["attr-value","string"],style:{color:"#89b482"}},{types:["comment","prolog","cdata","operator","inserted"],style:{color:"#a89984"}},{types:["delimiter","boolean","keyword","selector","important","atrule","property","variable","deleted"],style:{color:"#ea6962"}},{types:["entity","number","symbol"],style:{color:"#d3869b"}}]},Sh=kh,jh={plain:{color:"#654735",backgroundColor:"#f9f5d7"},styles:[{types:["delimiter","boolean","keyword","selector","important","atrule","property","variable","deleted"],style:{color:"#af2528"}},{types:["imports","class-name","maybe-class-name","constant","doctype","builtin"],style:{color:"#b4730e"}},{types:["string","attr-value"],style:{color:"#477a5b"}},{types:["property-access"],style:{color:"#266b79"}},{types:["function","attr-name","char","url"],style:{color:"#72761e"}},{types:["tag"],style:{color:"#b94c07"}},{types:["comment","prolog","cdata","operator","inserted"],style:{color:"#a89984"}},{types:["entity","number","symbol"],style:{color:"#924f79"}}]},Nh=jh,Eh=a=>U.useCallback(u=>{var i=u,{className:d,style:f,line:y}=i,g=Qc(i,["className","style","line"]);const _=Xs(Ct({},g),{className:Fr("token-line",d)});return typeof a=="object"&&"plain"in a&&(_.style=a.plain),typeof f=="object"&&(_.style=Ct(Ct({},_.style||{}),f)),_},[a]),Ch=a=>{const u=U.useCallback(({types:i,empty:d})=>{if(a!=null){{if(i.length===1&&i[0]==="plain")return d!=null?{display:"inline-block"}:void 0;if(i.length===1&&d!=null)return a[i[0]]}return Object.assign(d!=null?{display:"inline-block"}:{},...i.map(f=>a[f]))}},[a]);return U.useCallback(i=>{var d=i,{token:f,className:y,style:g}=d,_=Qc(d,["token","className","style"]);const v=Xs(Ct({},_),{className:Fr("token",...f.types,y),children:f.content,style:u(f)});return g!=null&&(v.style=Ct(Ct({},v.style||{}),g)),v},[u])},_h=/\r\n|\r|\n/,Nc=a=>{a.length===0?a.push({types:["plain"],content:`
`,empty:!0}):a.length===1&&a[0].content===""&&(a[0].content=`
`,a[0].empty=!0)},Ec=(a,u)=>{const i=a.length;return i>0&&a[i-1]===u?a:a.concat(u)},Rh=a=>{const u=[[]],i=[a],d=[0],f=[a.length];let y=0,g=0,_=[];const v=[_];for(;g>-1;){for(;(y=d[g]++)<f[g];){let C,R=u[g];const z=i[g][y];if(typeof z=="string"?(R=g>0?R:["plain"],C=z):(R=Ec(R,z.type),z.alias&&(R=Ec(R,z.alias)),C=z.content),typeof C!="string"){g++,u.push(R),i.push(C),d.push(0),f.push(C.length);continue}const q=C.split(_h),j=q.length;_.push({types:R,content:q[0]});for(let b=1;b<j;b++)Nc(_),v.push(_=[]),_.push({types:R,content:q[b]})}g--,u.pop(),i.pop(),d.pop(),f.pop()}return Nc(_),v},Cc=Rh,Th=({prism:a,code:u,grammar:i,language:d})=>U.useMemo(()=>{if(i==null)return Cc([u]);const f={code:u,grammar:i,language:d,tokens:[]};return a.hooks.run("before-tokenize",f),f.tokens=a.tokenize(u,i),a.hooks.run("after-tokenize",f),Cc(f.tokens)},[u,i,d,a]),Lh=(a,u)=>{const{plain:i}=a,d=a.styles.reduce((f,y)=>{const{languages:g,style:_}=y;return g&&!g.includes(u)||y.types.forEach(v=>{const C=Ct(Ct({},f[v]),_);f[v]=C}),f},{});return d.root=i,d.plain=Xs(Ct({},i),{backgroundColor:void 0}),d},Ph=Lh,Ah=({children:a,language:u,code:i,theme:d,prism:f})=>{const y=u.toLowerCase(),g=Ph(d,y),_=Eh(g),v=Ch(g),C=f.languages[y],R=Th({prism:f,language:y,code:i,grammar:C});return a({tokens:R,className:`prism-code language-${y}`,style:g!=null?g.root:{},getLineProps:_,getTokenProps:v})},Oh=a=>U.createElement(Ah,Xs(Ct({},a),{prism:a.prism||T,theme:a.theme||Yc,code:a.code,language:a.language}));/*! Bundled license information:

prismjs/prism.js:
  (**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   *)
*/function Y({code:a,language:u="typescript",filename:i,showLineNumbers:d=!1}){const[f,y]=U.useState(!1),g=async()=>{await navigator.clipboard.writeText(a),y(!0),setTimeout(()=>y(!1),2e3)};return l.jsxs("div",{className:"code-block group",children:[i&&l.jsxs("div",{className:"flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50",children:[l.jsx("span",{className:"text-xs text-slate-500 font-mono",children:i}),l.jsx("button",{onClick:g,className:"opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all duration-200 flex items-center gap-1 text-xs",children:f?l.jsxs(l.Fragment,{children:[l.jsx(bc,{className:"w-3 h-3 text-green-400"}),l.jsx("span",{className:"text-green-400",children:"Copied!"})]}):l.jsxs(l.Fragment,{children:[l.jsx(kc,{className:"w-3 h-3"}),l.jsx("span",{children:"Copy"})]})})]}),l.jsxs("div",{className:"relative",children:[!i&&l.jsx("button",{onClick:g,className:"absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all duration-200 p-1.5 rounded bg-slate-800/80",children:f?l.jsx(bc,{className:"w-4 h-4 text-green-400"}):l.jsx(kc,{className:"w-4 h-4"})}),l.jsx(Oh,{theme:Kc.nightOwl,code:a.trim(),language:u,children:({className:_,style:v,tokens:C,getLineProps:R,getTokenProps:N})=>l.jsx("pre",{className:Fr(_,"p-4 overflow-x-auto text-sm"),style:{...v,backgroundColor:"transparent"},children:C.map((z,q)=>l.jsxs("div",{...R({line:z}),children:[d&&l.jsx("span",{className:"inline-block w-8 text-slate-600 select-none text-right mr-4",children:q+1}),z.map((j,b)=>l.jsx("span",{...N({token:j})},b))]},q))})})]})]})}const Ih=`import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Type-safe schema validation
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: 'email' })
});

// Auto-validated routes with OpenAPI generation
app.get('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  response: { 200: UserSchema }
}, async (ctx) => {
  return ctx.json({
    id: ctx.params.id,
    name: 'John',
    email: 'john@example.com'
  });
});

app.listen(3000);`,Fh=[{icon:l.jsx(Wc,{className:"w-6 h-6"}),title:"Blazing Fast",description:"50K+ requests/sec with Radix tree routing and JIT-compiled validators",color:"text-vexor-400",bg:"bg-vexor-500/10"},{icon:l.jsx(Vc,{className:"w-6 h-6"}),title:"Built-in ORM",description:"Type-safe query builder with PostgreSQL, MySQL, and SQLite support",color:"text-purple-400",bg:"bg-purple-500/10"},{icon:l.jsx(jm,{className:"w-6 h-6"}),title:"Type Safe",description:"End-to-end type inference from database to API response",color:"text-pink-400",bg:"bg-pink-500/10"},{icon:l.jsx(wm,{className:"w-6 h-6"}),title:"Multi-Runtime",description:"Run on Node.js, Bun, Deno, AWS Lambda, Cloudflare Workers",color:"text-green-400",bg:"bg-green-500/10"},{icon:l.jsx(Nm,{className:"w-6 h-6"}),title:"Real-time",description:"WebSocket and Server-Sent Events with Pub/Sub support",color:"text-yellow-400",bg:"bg-yellow-500/10"},{icon:l.jsx(gm,{className:"w-6 h-6"}),title:"Observability",description:"OpenTelemetry tracing and Prometheus metrics built-in",color:"text-red-400",bg:"bg-red-500/10"}],Dh=[{value:"50K+",label:"Requests/sec"},{value:"<10KB",label:"Edge Bundle"},{value:"100%",label:"Type Safe"},{value:"5+",label:"Runtimes"}],zh=["CORS","Compression","Rate Limiting","File Upload","Caching","Health Check","Versioning","OAuth2"];function Mh(){return l.jsxs("div",{className:"pt-16",children:[l.jsx("section",{className:"relative py-20 hero-gradient overflow-hidden",children:l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:l.jsxs("div",{className:"text-center max-w-4xl mx-auto",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2 mb-8",children:[l.jsxs("span",{className:"relative flex h-2 w-2",children:[l.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"}),l.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-green-500"})]}),l.jsx("span",{className:"text-sm text-slate-300",children:"Now with AWS Lambda & Edge Runtime Support"})]}),l.jsxs("h1",{className:"text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6",children:[l.jsx("span",{className:"gradient-text",children:"Build APIs"}),l.jsx("br",{}),l.jsx("span",{className:"text-white",children:"at Lightning Speed"})]}),l.jsx("p",{className:"text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed",children:"A blazing-fast, batteries-included, multi-runtime Node.js backend framework with its own ORM. Type-safe from database to API response."}),l.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-4 mb-16",children:[l.jsxs(Et,{to:"/docs/getting-started",className:"w-full sm:w-auto btn-primary flex items-center justify-center gap-2",children:["Get Started",l.jsx(fm,{className:"w-4 h-4"})]}),l.jsxs("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto btn-secondary flex items-center justify-center gap-2",children:[l.jsx(to,{className:"w-5 h-5"}),"Star on GitHub"]})]}),l.jsx("div",{className:"max-w-3xl mx-auto text-left",children:l.jsx(Y,{code:Ih,filename:"app.ts"})})]})})}),l.jsx("section",{className:"py-12 border-y border-slate-800/50 bg-slate-900/30",children:l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:l.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-8",children:Dh.map(a=>l.jsxs("div",{className:"text-center",children:[l.jsx("div",{className:"text-4xl font-bold text-vexor-400 mb-2",children:a.value}),l.jsx("div",{className:"text-sm text-slate-500",children:a.label})]},a.label))})})}),l.jsx("section",{className:"py-24",children:l.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[l.jsxs("div",{className:"text-center mb-16",children:[l.jsx("h2",{className:"text-3xl sm:text-4xl font-bold mb-4",children:"Everything You Need"}),l.jsx("p",{className:"text-lg text-slate-400 max-w-2xl mx-auto",children:"A complete toolkit for building production-ready APIs without the boilerplate"})]}),l.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-6",children:Fh.map(a=>l.jsxs("div",{className:"feature-card",children:[l.jsx("div",{className:`w-12 h-12 ${a.bg} rounded-xl flex items-center justify-center mb-4 ${a.color}`,children:a.icon}),l.jsx("h3",{className:"text-lg font-semibold mb-2",children:a.title}),l.jsx("p",{className:"text-slate-400 text-sm",children:a.description})]},a.title))})]})}),l.jsx("section",{className:"py-24 bg-slate-900/30",children:l.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[l.jsxs("div",{className:"text-center mb-16",children:[l.jsx("h2",{className:"text-3xl sm:text-4xl font-bold mb-4",children:"Built-in Middleware"}),l.jsx("p",{className:"text-lg text-slate-400",children:"Production-ready middleware out of the box"})]}),l.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto",children:zh.map(a=>l.jsxs("div",{className:"flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-3",children:[l.jsx(ym,{className:"w-4 h-4 text-vexor-400"}),l.jsx("span",{className:"text-sm",children:a})]},a))})]})}),l.jsx("section",{className:"py-24",children:l.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center",children:[l.jsx("h2",{className:"text-3xl sm:text-4xl font-bold mb-6",children:"Ready to Build?"}),l.jsx("p",{className:"text-xl text-slate-400 mb-10",children:"Start building production-ready APIs in minutes with Vexor"}),l.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-4",children:[l.jsx(Et,{to:"/docs/getting-started",className:"w-full sm:w-auto btn-primary",children:"Get Started Now"}),l.jsx(Et,{to:"/docs/core",className:"w-full sm:w-auto btn-secondary",children:"Read the Docs"})]})]})}),l.jsx("footer",{className:"py-12 border-t border-slate-800/50",children:l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:l.jsxs("div",{className:"flex flex-col gap-8",children:[l.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-6",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"w-6 h-6 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded flex items-center justify-center font-bold text-white text-xs",children:"V"}),l.jsx("span",{className:"font-semibold",children:"Vexor"}),l.jsx("span",{className:"text-slate-500 text-sm",children:"© 2024"})]}),l.jsxs("div",{className:"flex items-center gap-6",children:[l.jsx("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"text-slate-400 hover:text-white transition-colors",children:l.jsx(to,{className:"w-5 h-5"})}),l.jsx("a",{href:"https://www.linkedin.com/in/sitharaj88",target:"_blank",rel:"noopener noreferrer",className:"text-slate-400 hover:text-white transition-colors",children:l.jsx(km,{className:"w-5 h-5"})}),l.jsx("a",{href:"https://sitharaj.in",target:"_blank",rel:"noopener noreferrer",className:"text-slate-400 hover:text-white transition-colors",children:l.jsx(vm,{className:"w-5 h-5"})})]})]}),l.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/50",children:[l.jsxs("div",{className:"flex items-center gap-6 text-sm",children:[l.jsx(Et,{to:"/docs/getting-started",className:"text-slate-400 hover:text-white transition-colors",children:"Documentation"}),l.jsx("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"text-slate-400 hover:text-white transition-colors",children:"GitHub"})]}),l.jsxs("div",{className:"text-sm text-slate-500",children:["Built by"," ",l.jsx("a",{href:"https://sitharaj.in",target:"_blank",rel:"noopener noreferrer",className:"text-vexor-400 hover:text-vexor-300 transition-colors",children:"Sitharaj Seenivasan"})]})]})]})})})]})}const Bh="npm install @vexorjs/core @vexorjs/orm",Uh=`import { Vexor, Type, cors, rateLimit } from '@vexorjs/core';

const app = new Vexor();

// Add middleware
app.use(cors());
app.use(rateLimit({ max: 100, windowMs: 60000 }));

// Health check endpoint
app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok', timestamp: Date.now() });
});

// Create user endpoint with validation
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    email: Type.String({ format: 'email' })
  })
}, async (ctx) => {
  const { name, email } = ctx.body;
  // Your logic here...
  return ctx.status(201).json({ id: '1', name, email });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});`,$h=`my-api/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Route handlers
│   │   ├── users.ts
│   │   └── products.ts
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── db/               # Database schema & queries
├── package.json
└── tsconfig.json`,Vh=`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}`;function Wh(){return l.jsxs("div",{className:"space-y-12",children:[l.jsxs("div",{children:[l.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Getting Started"}),l.jsx("p",{className:"text-lg text-slate-400",children:"Learn how to set up and build your first Vexor application in minutes."})]}),l.jsxs("section",{id:"installation",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Installation"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Install Vexor and its ORM using npm, yarn, or pnpm:"}),l.jsx(Y,{code:Bh,language:"bash"}),l.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:l.jsxs("p",{className:"text-sm text-slate-300",children:[l.jsx("strong",{className:"text-vexor-400",children:"Note:"})," Vexor requires Node.js 18+ or Bun 1.0+. It also works with Deno using the npm: specifier."]})})]}),l.jsxs("section",{id:"quick-start",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Quick Start"}),l.jsxs("p",{className:"text-slate-400 mb-4",children:["Create a new file ",l.jsx("code",{className:"bg-slate-800 px-2 py-0.5 rounded text-sm",children:"app.ts"})," and add the following code:"]}),l.jsx(Y,{code:Uh,filename:"app.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-6",children:[l.jsx("h3",{className:"text-lg font-semibold mb-3",children:"Run Your Application"}),l.jsxs("p",{className:"text-slate-400 mb-4",children:["Use ",l.jsx("code",{className:"bg-slate-800 px-2 py-0.5 rounded text-sm",children:"tsx"})," or ",l.jsx("code",{className:"bg-slate-800 px-2 py-0.5 rounded text-sm",children:"bun"})," to run your TypeScript file directly:"]}),l.jsx(Y,{code:`# With Node.js
npx tsx app.ts

# With Bun
bun run app.ts`,language:"bash"})]})]}),l.jsxs("section",{children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Recommended Project Structure"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"For larger applications, we recommend organizing your code like this:"}),l.jsx(Y,{code:$h,language:"text"})]}),l.jsxs("section",{children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"TypeScript Configuration"}),l.jsxs("p",{className:"text-slate-400 mb-4",children:["Here's a recommended ",l.jsx("code",{className:"bg-slate-800 px-2 py-0.5 rounded text-sm",children:"tsconfig.json"})," for Vexor projects:"]}),l.jsx(Y,{code:Vh,filename:"tsconfig.json",language:"json"})]}),l.jsxs("section",{className:"p-6 bg-slate-900/50 border border-slate-800 rounded-2xl",children:[l.jsx("h2",{className:"text-xl font-bold mb-4",children:"Next Steps"}),l.jsxs("ul",{className:"space-y-3",children:[l.jsxs("li",{className:"flex items-start gap-3",children:[l.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"1"}),l.jsxs("div",{children:[l.jsx("strong",{children:"Learn Core Concepts"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Understand routing, context, and request handling"})]})]}),l.jsxs("li",{className:"flex items-start gap-3",children:[l.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"2"}),l.jsxs("div",{children:[l.jsx("strong",{children:"Set Up Database"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Connect to PostgreSQL, MySQL, or SQLite with Vexor ORM"})]})]}),l.jsxs("li",{className:"flex items-start gap-3",children:[l.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"3"}),l.jsxs("div",{children:[l.jsx("strong",{children:"Add Authentication"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Implement JWT or OAuth2 authentication"})]})]}),l.jsxs("li",{className:"flex items-start gap-3",children:[l.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"4"}),l.jsxs("div",{children:[l.jsx("strong",{children:"Deploy"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Deploy to Node.js, Bun, AWS Lambda, or Edge"})]})]})]})]})]})}const Hh=`import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor({
  logging: { level: 'info' },
  trustProxy: true
});

// Define a schema for type-safe validation
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  email: Type.String({ format: 'email' }),
  role: Type.Union([Type.Literal('admin'), Type.Literal('user')])
});

// GET route with params validation
app.get('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  response: { 200: UserSchema }
}, async (ctx) => {
  const { id } = ctx.params;
  // Your logic here...
  return ctx.json({ id, name: 'John', email: 'john@example.com', role: 'user' });
});

// POST route with body validation
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String({ format: 'email' })
  }),
  response: { 201: UserSchema }
}, async (ctx) => {
  const { name, email } = ctx.body;
  return ctx.status(201).json({ id: '1', name, email, role: 'user' });
});

app.listen(3000);`,Gh=`app.get('/example', async (ctx) => {
  // Request information
  const method = ctx.method;           // 'GET', 'POST', etc.
  const path = ctx.path;               // '/example'
  const url = ctx.url;                 // Full URL object
  const query = ctx.query;             // Parsed query parameters
  const params = ctx.params;           // Route parameters
  const headers = ctx.headers;         // Request headers
  const body = ctx.body;               // Parsed request body

  // Response methods
  return ctx
    .status(200)
    .header('X-Custom-Header', 'value')
    .cookie('session', 'abc123', { httpOnly: true })
    .json({ message: 'Hello!' });
});`,qh=`// JSON response
ctx.json({ data: 'value' });

// Text response
ctx.text('Hello, World!');

// HTML response
ctx.html('<h1>Hello, World!</h1>');

// Redirect
ctx.redirect('/new-location');
ctx.redirect('/permanent', 301);

// Send file
ctx.sendFile('/path/to/file.pdf');

// Stream response
ctx.stream(readableStream, 'application/octet-stream');

// No content
ctx.noContent();

// Custom status with chaining
ctx.status(201).json({ created: true });`,Qh=`// Basic routes
app.get('/users', handler);
app.post('/users', handler);
app.put('/users/:id', handler);
app.patch('/users/:id', handler);
app.delete('/users/:id', handler);

// Route with multiple methods
app.route('/resource')
  .get(getHandler)
  .post(postHandler)
  .put(putHandler);

// Wildcard routes
app.get('/files/*', (ctx) => {
  const filepath = ctx.params['*']; // Everything after /files/
  return ctx.text(\`Requested: \${filepath}\`);
});

// Optional parameters
app.get('/users/:id?', (ctx) => {
  const id = ctx.params.id; // May be undefined
  return ctx.json({ id: id || 'all' });
});

// Route groups
app.group('/api/v1', (group) => {
  group.get('/users', listUsers);
  group.post('/users', createUser);
  group.get('/users/:id', getUser);
});`,Kh=`import { Type } from '@vexorjs/core';

// String types
Type.String()                              // Any string
Type.String({ minLength: 1, maxLength: 100 }) // Length constraints
Type.String({ format: 'email' })           // Email format
Type.String({ format: 'uri' })             // URI format
Type.String({ pattern: '^[a-z]+$' })       // Regex pattern

// Number types
Type.Number()                              // Any number
Type.Number({ minimum: 0, maximum: 100 })  // Range constraints
Type.Integer()                             // Integer only
Type.Integer({ minimum: 1 })               // Positive integer

// Boolean and Null
Type.Boolean()
Type.Null()

// Literal values
Type.Literal('active')
Type.Literal(42)

// Arrays
Type.Array(Type.String())                  // Array of strings
Type.Array(Type.Number(), { minItems: 1 }) // Non-empty array

// Objects
Type.Object({
  name: Type.String(),
  age: Type.Number(),
  email: Type.Optional(Type.String())      // Optional field
})

// Unions
Type.Union([
  Type.Literal('pending'),
  Type.Literal('active'),
  Type.Literal('completed')
])

// Records (dynamic keys)
Type.Record(Type.String(), Type.Number())  // { [key: string]: number }`,Yh=`app.addHook('onRequest', async (ctx) => {
  // Runs before route matching
  console.log(\`Incoming: \${ctx.method} \${ctx.path}\`);
});

app.addHook('preValidation', async (ctx) => {
  // Runs before schema validation
  // Good for authentication checks
});

app.addHook('preHandler', async (ctx) => {
  // Runs after validation, before handler
  // Request is validated at this point
});

app.addHook('onSend', async (ctx, response) => {
  // Runs before sending response
  // Can modify the response
  return response;
});

app.addHook('onResponse', async (ctx) => {
  // Runs after response is sent
  // Good for logging, metrics
});

app.addHook('onError', async (error, ctx) => {
  // Runs when an error occurs
  console.error('Error:', error.message);
  return ctx.status(500).json({ error: 'Internal Server Error' });
});`,Zh=`// Global error handler
app.setErrorHandler(async (error, ctx) => {
  // Log the error
  console.error(error);

  // Return appropriate response
  if (error.name === 'ValidationError') {
    return ctx.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }

  if (error.statusCode) {
    return ctx.status(error.statusCode).json({
      error: error.message
    });
  }

  return ctx.status(500).json({
    error: 'Internal Server Error'
  });
});

// Not found handler
app.setNotFoundHandler(async (ctx) => {
  return ctx.status(404).json({
    error: 'Not Found',
    path: ctx.path
  });
});

// Throwing errors in handlers
app.get('/protected', async (ctx) => {
  if (!ctx.headers.authorization) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
  return ctx.json({ secret: 'data' });
});`;function Xh(){return l.jsxs("div",{className:"space-y-12",children:[l.jsxs("div",{children:[l.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Core Concepts"}),l.jsx("p",{className:"text-lg text-slate-400",children:"Learn the fundamental concepts of building applications with Vexor."})]}),l.jsxs("section",{id:"application",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Application"}),l.jsxs("p",{className:"text-slate-400 mb-4",children:["The ",l.jsx("code",{className:"bg-slate-800 px-2 py-0.5 rounded text-sm",children:"Vexor"})," class is the core of your application. It handles routing, middleware, and server lifecycle."]}),l.jsx(Y,{code:Hh,filename:"app.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"context",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Request Context"}),l.jsxs("p",{className:"text-slate-400 mb-4",children:["Every route handler receives a context object (",l.jsx("code",{className:"bg-slate-800 px-2 py-0.5 rounded text-sm",children:"ctx"}),") that provides access to request data and response methods."]}),l.jsx(Y,{code:Gh,filename:"context.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Response Methods"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Vexor provides fluent response methods for common response types:"}),l.jsx(Y,{code:qh,showLineNumbers:!0})]})]}),l.jsxs("section",{id:"routing",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Routing"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Vexor uses a high-performance radix tree router for lightning-fast route matching."}),l.jsx(Y,{code:Qh,filename:"routes.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("h4",{className:"font-semibold mb-2",children:"Route Parameters"}),l.jsxs("p",{className:"text-sm text-slate-400",children:["Use ",l.jsx("code",{className:"bg-slate-800 px-1 rounded",children:":param"})," for named parameters. Access via ",l.jsx("code",{className:"bg-slate-800 px-1 rounded",children:"ctx.params.param"}),"."]})]}),l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("h4",{className:"font-semibold mb-2",children:"Wildcards"}),l.jsxs("p",{className:"text-sm text-slate-400",children:["Use ",l.jsx("code",{className:"bg-slate-800 px-1 rounded",children:"*"})," to match everything. Access via ",l.jsx("code",{className:"bg-slate-800 px-1 rounded",children:"ctx.params['*']"}),"."]})]})]})]}),l.jsxs("section",{id:"validation",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Schema Validation"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Vexor includes a TypeBox-compatible schema system for runtime validation with full TypeScript inference."}),l.jsx(Y,{code:Kh,filename:"schemas.ts",showLineNumbers:!0}),l.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:l.jsxs("p",{className:"text-sm text-slate-300",children:[l.jsx("strong",{className:"text-vexor-400",children:"Type Inference:"})," All schemas automatically infer TypeScript types. When you define a body schema, ",l.jsx("code",{className:"bg-slate-800 px-1 rounded",children:"ctx.body"})," is fully typed!"]})})]}),l.jsxs("section",{id:"hooks",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Lifecycle Hooks"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Hooks allow you to intercept requests at different stages of the request lifecycle."}),l.jsx(Y,{code:Yh,filename:"hooks.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-6",children:[l.jsx("h3",{className:"text-lg font-semibold mb-3",children:"Hook Execution Order"}),l.jsxs("div",{className:"flex flex-wrap items-center gap-2 text-sm",children:[l.jsx("span",{className:"px-3 py-1 bg-slate-800 rounded-full",children:"onRequest"}),l.jsx("span",{className:"text-slate-500",children:"→"}),l.jsx("span",{className:"px-3 py-1 bg-slate-800 rounded-full",children:"preValidation"}),l.jsx("span",{className:"text-slate-500",children:"→"}),l.jsx("span",{className:"px-3 py-1 bg-slate-800 rounded-full",children:"preHandler"}),l.jsx("span",{className:"text-slate-500",children:"→"}),l.jsx("span",{className:"px-3 py-1 bg-vexor-500/20 text-vexor-400 rounded-full",children:"Handler"}),l.jsx("span",{className:"text-slate-500",children:"→"}),l.jsx("span",{className:"px-3 py-1 bg-slate-800 rounded-full",children:"onSend"}),l.jsx("span",{className:"text-slate-500",children:"→"}),l.jsx("span",{className:"px-3 py-1 bg-slate-800 rounded-full",children:"onResponse"})]})]})]}),l.jsxs("section",{id:"error-handling",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Error Handling"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Vexor provides centralized error handling with custom error handlers."}),l.jsx(Y,{code:Zh,filename:"errors.ts",showLineNumbers:!0})]}),l.jsxs("section",{className:"p-6 bg-slate-900/50 border border-slate-800 rounded-2xl",children:[l.jsx("h2",{className:"text-xl font-bold mb-4",children:"Next Steps"}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[l.jsxs("a",{href:"/vexorjs/docs/orm",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Vexor ORM →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Learn about database operations with the built-in ORM"})]}),l.jsxs("a",{href:"/vexorjs/docs/middleware",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Middleware →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Explore built-in middleware for CORS, rate limiting, and more"})]})]})]})]})}const Jh=`import { Database, PostgresDriver } from '@vexorjs/orm';

// Create database connection
const db = new Database({
  driver: new PostgresDriver({
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'password',
    // Connection pool settings
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMs: 30000
    }
  })
});

// Connect to database
await db.connect();

// Use in your app
app.decorate('db', db);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.close();
  process.exit(0);
});`,eg=`import { defineTable, column, sql } from '@vexorjs/orm';

// Define users table
export const users = defineTable('users', {
  id: column.serial().primaryKey(),
  email: column.varchar(255).unique().notNull(),
  name: column.varchar(100).notNull(),
  password: column.varchar(255).notNull(),
  role: column.enum('role', ['admin', 'user', 'guest']).default('user'),
  isActive: column.boolean().default(true),
  metadata: column.jsonb<{ preferences: Record<string, unknown> }>(),
  createdAt: column.timestamp().defaultNow(),
  updatedAt: column.timestamp().defaultNow()
});

// Define posts table with foreign key
export const posts = defineTable('posts', {
  id: column.serial().primaryKey(),
  title: column.varchar(255).notNull(),
  content: column.text(),
  slug: column.varchar(255).unique().notNull(),
  authorId: column.integer().references(() => users.id).notNull(),
  publishedAt: column.timestamp().nullable(),
  views: column.integer().default(0),
  tags: column.array(column.varchar(50)),
  createdAt: column.timestamp().defaultNow()
});

// Define comments table
export const comments = defineTable('comments', {
  id: column.serial().primaryKey(),
  content: column.text().notNull(),
  postId: column.integer().references(() => posts.id).notNull(),
  authorId: column.integer().references(() => users.id).notNull(),
  createdAt: column.timestamp().defaultNow()
});`,tg=`import { eq, and, or, like, gt, lt, isNull, inArray, desc, asc } from '@vexorjs/orm';

// Basic select
const allUsers = await db.select().from(users);

// Select specific columns
const userNames = await db.select({
  id: users.id,
  name: users.name,
  email: users.email
}).from(users);

// Where conditions
const activeAdmins = await db.select()
  .from(users)
  .where(and(
    eq(users.role, 'admin'),
    eq(users.isActive, true)
  ));

// Complex conditions
const filteredUsers = await db.select()
  .from(users)
  .where(or(
    eq(users.role, 'admin'),
    and(
      eq(users.role, 'user'),
      gt(users.createdAt, new Date('2024-01-01'))
    )
  ));

// Pattern matching
const searchResults = await db.select()
  .from(users)
  .where(like(users.email, '%@example.com'));

// NULL checks
const unverified = await db.select()
  .from(users)
  .where(isNull(users.verifiedAt));

// IN clause
const specificUsers = await db.select()
  .from(users)
  .where(inArray(users.id, [1, 2, 3, 4, 5]));

// Ordering
const sortedUsers = await db.select()
  .from(users)
  .orderBy(desc(users.createdAt), asc(users.name));

// Pagination
const page = await db.select()
  .from(users)
  .limit(10)
  .offset(20);

// Get first result
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1))
  .first();`,ng=`// Inner join
const postsWithAuthors = await db.select({
  postId: posts.id,
  postTitle: posts.title,
  authorName: users.name,
  authorEmail: users.email
})
.from(posts)
.innerJoin(users, eq(posts.authorId, users.id));

// Left join
const usersWithPosts = await db.select({
  userId: users.id,
  userName: users.name,
  postCount: sql\`COUNT(\${posts.id})\`
})
.from(users)
.leftJoin(posts, eq(users.id, posts.authorId))
.groupBy(users.id, users.name);

// Multiple joins
const commentsWithDetails = await db.select({
  commentId: comments.id,
  content: comments.content,
  postTitle: posts.title,
  authorName: users.name
})
.from(comments)
.innerJoin(posts, eq(comments.postId, posts.id))
.innerJoin(users, eq(comments.authorId, users.id))
.orderBy(desc(comments.createdAt));`,rg=`// Insert single record
const newUser = await db.insert(users)
  .values({
    email: 'john@example.com',
    name: 'John Doe',
    password: hashedPassword
  })
  .returning();

// Insert multiple records
const newUsers = await db.insert(users)
  .values([
    { email: 'alice@example.com', name: 'Alice', password: hash1 },
    { email: 'bob@example.com', name: 'Bob', password: hash2 }
  ])
  .returning();

// Insert with conflict handling (upsert)
const upserted = await db.insert(users)
  .values({
    email: 'john@example.com',
    name: 'John Updated',
    password: newHash
  })
  .onConflict('email')
  .doUpdate({
    name: 'John Updated',
    updatedAt: new Date()
  })
  .returning();

// Insert with returning specific columns
const userId = await db.insert(users)
  .values({ email: 'new@example.com', name: 'New User', password: hash })
  .returning({ id: users.id });`,sg=`// Update single record
await db.update(users)
  .set({ name: 'Jane Doe', updatedAt: new Date() })
  .where(eq(users.id, 1));

// Update with returning
const updated = await db.update(users)
  .set({ isActive: false })
  .where(eq(users.email, 'john@example.com'))
  .returning();

// Increment/decrement
await db.update(posts)
  .set({ views: sql\`\${posts.views} + 1\` })
  .where(eq(posts.id, 1));

// Conditional update
await db.update(users)
  .set({
    role: 'admin',
    updatedAt: new Date()
  })
  .where(and(
    eq(users.role, 'user'),
    gt(users.createdAt, new Date('2023-01-01'))
  ));`,lg=`// Delete single record
await db.delete(users)
  .where(eq(users.id, 1));

// Delete with returning
const deleted = await db.delete(users)
  .where(eq(users.email, 'old@example.com'))
  .returning();

// Delete multiple
await db.delete(posts)
  .where(and(
    eq(posts.authorId, 1),
    isNull(posts.publishedAt)
  ));

// Delete all (use with caution!)
await db.delete(sessions)
  .where(lt(sessions.expiresAt, new Date()));`,ag=`// Basic transaction
await db.transaction(async (tx) => {
  // All operations use the transaction connection
  const user = await tx.insert(users)
    .values({ email: 'new@example.com', name: 'New User', password: hash })
    .returning();

  await tx.insert(posts)
    .values({
      title: 'First Post',
      content: 'Hello!',
      slug: 'first-post',
      authorId: user[0].id
    });

  // If any operation fails, everything is rolled back
});

// Transaction with isolation level
await db.transaction(async (tx) => {
  // Serializable isolation for strict consistency
  const balance = await tx.select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.id, 1))
    .first();

  if (balance && balance.balance >= amount) {
    await tx.update(accounts)
      .set({ balance: sql\`\${accounts.balance} - \${amount}\` })
      .where(eq(accounts.id, 1));

    await tx.update(accounts)
      .set({ balance: sql\`\${accounts.balance} + \${amount}\` })
      .where(eq(accounts.id, 2));
  }
}, { isolationLevel: 'serializable' });

// Nested savepoints
await db.transaction(async (tx) => {
  await tx.insert(users).values(userData);

  try {
    await tx.savepoint(async (sp) => {
      await sp.insert(posts).values(postData);
      // This might fail, but won't rollback the user insert
    });
  } catch (e) {
    console.log('Post insert failed, but user was created');
  }
});`,og=`// migrations/001_create_users.ts
import { Migration } from '@vexorjs/orm';

export const migration: Migration = {
  name: '001_create_users',

  async up(db) {
    await db.schema.createTable('users', (table) => {
      table.serial('id').primaryKey();
      table.varchar('email', 255).unique().notNull();
      table.varchar('name', 100).notNull();
      table.varchar('password', 255).notNull();
      table.enum('role', ['admin', 'user', 'guest']).default('user');
      table.boolean('is_active').default(true);
      table.jsonb('metadata');
      table.timestamp('created_at').defaultNow();
      table.timestamp('updated_at').defaultNow();
    });

    // Create index
    await db.schema.createIndex('users', 'idx_users_email', ['email']);
  },

  async down(db) {
    await db.schema.dropTable('users');
  }
};`,ig=`# Run all pending migrations
npx vexor db:migrate

# Rollback last migration
npx vexor db:rollback

# Rollback all migrations
npx vexor db:rollback --all

# Check migration status
npx vexor db:status

# Generate new migration
npx vexor db:generate create_posts`;function ug(){return l.jsxs("div",{className:"space-y-12",children:[l.jsxs("div",{children:[l.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Vexor ORM"}),l.jsx("p",{className:"text-lg text-slate-400",children:"A blazing-fast, type-safe ORM designed for modern TypeScript applications."})]}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("div",{className:"text-2xl mb-2",children:"⚡"}),l.jsx("h3",{className:"font-semibold mb-1",children:"High Performance"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Prepared statements, connection pooling, and query optimization"})]}),l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("div",{className:"text-2xl mb-2",children:"🔒"}),l.jsx("h3",{className:"font-semibold mb-1",children:"Type Safe"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Full TypeScript inference from schema to query results"})]}),l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("div",{className:"text-2xl mb-2",children:"💾"}),l.jsx("h3",{className:"font-semibold mb-1",children:"Multi-Database"}),l.jsx("p",{className:"text-sm text-slate-400",children:"PostgreSQL, MySQL, and SQLite support"})]})]}),l.jsxs("section",{id:"connection",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Database Connection"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Connect to your database with built-in connection pooling and health checks."}),l.jsx(Y,{code:Jh,filename:"db.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"schema",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Schema Definition"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Define your tables with full type inference. Column types are automatically inferred."}),l.jsx(Y,{code:eg,filename:"schema.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-6 overflow-x-auto",children:[l.jsx("h3",{className:"text-lg font-semibold mb-3",children:"Column Types"}),l.jsxs("table",{className:"w-full text-sm",children:[l.jsx("thead",{children:l.jsxs("tr",{className:"border-b border-slate-800",children:[l.jsx("th",{className:"text-left py-2 px-4",children:"Method"}),l.jsx("th",{className:"text-left py-2 px-4",children:"SQL Type"}),l.jsx("th",{className:"text-left py-2 px-4",children:"TypeScript Type"})]})}),l.jsxs("tbody",{className:"text-slate-400",children:[l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"serial()"})}),l.jsx("td",{className:"py-2 px-4",children:"SERIAL"}),l.jsx("td",{className:"py-2 px-4",children:"number"})]}),l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"integer()"})}),l.jsx("td",{className:"py-2 px-4",children:"INTEGER"}),l.jsx("td",{className:"py-2 px-4",children:"number"})]}),l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"bigint()"})}),l.jsx("td",{className:"py-2 px-4",children:"BIGINT"}),l.jsx("td",{className:"py-2 px-4",children:"bigint"})]}),l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"varchar(n)"})}),l.jsx("td",{className:"py-2 px-4",children:"VARCHAR(n)"}),l.jsx("td",{className:"py-2 px-4",children:"string"})]}),l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"text()"})}),l.jsx("td",{className:"py-2 px-4",children:"TEXT"}),l.jsx("td",{className:"py-2 px-4",children:"string"})]}),l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"boolean()"})}),l.jsx("td",{className:"py-2 px-4",children:"BOOLEAN"}),l.jsx("td",{className:"py-2 px-4",children:"boolean"})]}),l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"timestamp()"})}),l.jsx("td",{className:"py-2 px-4",children:"TIMESTAMP"}),l.jsx("td",{className:"py-2 px-4",children:"Date"})]}),l.jsxs("tr",{className:"border-b border-slate-800/50",children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"jsonb<T>()"})}),l.jsx("td",{className:"py-2 px-4",children:"JSONB"}),l.jsx("td",{className:"py-2 px-4",children:"T"})]}),l.jsxs("tr",{children:[l.jsx("td",{className:"py-2 px-4",children:l.jsx("code",{children:"array(type)"})}),l.jsx("td",{className:"py-2 px-4",children:"type[]"}),l.jsx("td",{className:"py-2 px-4",children:"Type[]"})]})]})]})]})]}),l.jsxs("section",{id:"select",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"SELECT Queries"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Build type-safe SELECT queries with filtering, sorting, and pagination."}),l.jsx(Y,{code:tg,filename:"queries.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"joins",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"JOIN Queries"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Combine data from multiple tables with type-safe joins."}),l.jsx(Y,{code:ng,filename:"joins.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"insert",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"INSERT Operations"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Insert single or multiple records with conflict handling."}),l.jsx(Y,{code:rg,filename:"insert.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"update",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"UPDATE Operations"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Update records with type-safe conditions and expressions."}),l.jsx(Y,{code:sg,filename:"update.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"delete",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"DELETE Operations"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Delete records with safe conditions."}),l.jsx(Y,{code:lg,filename:"delete.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"transactions",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Transactions"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Execute multiple operations atomically with full ACID compliance."}),l.jsx(Y,{code:ag,filename:"transactions.ts",showLineNumbers:!0}),l.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:l.jsxs("p",{className:"text-sm text-slate-300",children:[l.jsx("strong",{className:"text-vexor-400",children:"Automatic Rollback:"})," If any operation throws an error, the entire transaction is automatically rolled back. No manual cleanup required."]})})]}),l.jsxs("section",{id:"migrations",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Migrations"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Version-controlled database schema changes with up/down migrations."}),l.jsx(Y,{code:og,filename:"migrations/001_create_users.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-6",children:[l.jsx("h3",{className:"text-lg font-semibold mb-3",children:"Migration CLI"}),l.jsx(Y,{code:ig,language:"bash"})]})]}),l.jsxs("section",{className:"p-6 bg-slate-900/50 border border-slate-800 rounded-2xl",children:[l.jsx("h2",{className:"text-xl font-bold mb-4",children:"Next Steps"}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[l.jsxs("a",{href:"/vexorjs/docs/middleware",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Middleware →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Add authentication, caching, and more with built-in middleware"})]}),l.jsxs("a",{href:"/vexorjs/docs/realtime",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Real-time →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Build WebSocket and SSE applications"})]})]})]})]})}const cg=`import { Vexor, cors } from '@vexorjs/core';

const app = new Vexor();

// Basic CORS - allow all origins
app.use(cors());

// Configured CORS
app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Dynamic origin validation
app.use(cors({
  origin: (origin) => {
    // Allow any subdomain of example.com
    return origin?.endsWith('.example.com') ?? false;
  }
}));

// Per-route CORS
app.get('/public', cors({ origin: '*' }), handler);`,dg=`import { Vexor, rateLimit, slowDown } from '@vexorjs/core';

const app = new Vexor();

// Basic rate limiting
app.use(rateLimit({
  max: 100,              // Max requests per window
  windowMs: 60 * 1000,   // 1 minute window
  message: 'Too many requests, please try again later'
}));

// Rate limit with custom key generator
app.use(rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (ctx) => {
    // Rate limit by user ID instead of IP
    return ctx.state.userId || ctx.ip;
  }
}));

// Slow down instead of blocking
app.use(slowDown({
  windowMs: 60 * 1000,
  delayAfter: 50,        // Start delaying after 50 requests
  delayMs: 500,          // Add 500ms delay per request
  maxDelayMs: 5000       // Max delay of 5 seconds
}));

// Different limits for different routes
app.use('/api/auth/*', rateLimit({ max: 5, windowMs: 60000 }));
app.use('/api/*', rateLimit({ max: 100, windowMs: 60000 }));`,pg=`import { Vexor, JWT, createJWT, verifyJWT } from '@vexorjs/core';

const app = new Vexor();
const jwt = createJWT({ secret: process.env.JWT_SECRET! });

// Login route - create token
app.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.body;

  // Validate credentials (your logic here)
  const user = await validateUser(email, password);

  // Create access token
  const accessToken = await jwt.sign({
    sub: user.id,
    email: user.email,
    role: user.role
  }, { expiresIn: '15m' });

  // Create refresh token
  const refreshToken = await jwt.sign({
    sub: user.id,
    type: 'refresh'
  }, { expiresIn: '7d' });

  return ctx.json({ accessToken, refreshToken });
});

// JWT middleware for protected routes
const authenticate = async (ctx, next) => {
  const header = ctx.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return ctx.status(401).json({ error: 'Missing token' });
  }

  try {
    const token = header.slice(7);
    const payload = await jwt.verify(token);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    return ctx.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route
app.get('/api/profile', authenticate, async (ctx) => {
  return ctx.json({ user: ctx.state.user });
});`,fg=`import { Vexor, SessionManager, MemorySessionStore } from '@vexorjs/core';

const app = new Vexor();

// Create session manager
const sessions = new SessionManager({
  store: new MemorySessionStore(), // Use Redis in production
  cookie: {
    name: 'session_id',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  secret: process.env.SESSION_SECRET!
});

// Session middleware
app.use(sessions.middleware());

// Login - create session
app.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.body;
  const user = await validateUser(email, password);

  // Store user in session
  ctx.session.set('userId', user.id);
  ctx.session.set('role', user.role);

  return ctx.json({ success: true });
});

// Access session data
app.get('/api/profile', async (ctx) => {
  const userId = ctx.session.get('userId');

  if (!userId) {
    return ctx.status(401).json({ error: 'Not logged in' });
  }

  const user = await getUser(userId);
  return ctx.json({ user });
});

// Logout - destroy session
app.post('/auth/logout', async (ctx) => {
  await ctx.session.destroy();
  return ctx.json({ success: true });
});`,mg=`import { Vexor, compression } from '@vexorjs/core';

const app = new Vexor();

// Enable gzip/brotli compression
app.use(compression());

// Configure compression
app.use(compression({
  threshold: 1024,         // Only compress responses > 1KB
  level: 6,                // Compression level (1-9)
  encodings: ['br', 'gzip', 'deflate'] // Preferred order
}));

// Disable compression for specific routes
app.get('/stream', { compress: false }, streamHandler);`,hg=`import { Vexor, cacheMiddleware, createMemoryCache, createRedisCache } from '@vexorjs/core';

const app = new Vexor();

// In-memory cache
const memoryCache = createMemoryCache({
  max: 1000,           // Max entries
  ttl: 5 * 60 * 1000   // 5 minutes TTL
});

// Redis cache (for distributed systems)
const redisCache = createRedisCache({
  url: process.env.REDIS_URL!,
  prefix: 'cache:',
  ttl: 5 * 60 * 1000
});

// Cache GET requests
app.use(cacheMiddleware({
  store: memoryCache,
  ttl: 60000,
  methods: ['GET'],
  keyGenerator: (ctx) => \`\${ctx.method}:\${ctx.path}:\${ctx.querystring}\`
}));

// Cache specific route
app.get('/api/products',
  cacheMiddleware({ store: memoryCache, ttl: 300000 }),
  async (ctx) => {
    const products = await db.select().from(products);
    return ctx.json(products);
  }
);

// Manual cache control
app.get('/api/product/:id', async (ctx) => {
  const cacheKey = \`product:\${ctx.params.id}\`;

  // Try cache first
  let product = await memoryCache.get(cacheKey);

  if (!product) {
    product = await db.select().from(products).where(eq(products.id, ctx.params.id)).first();
    await memoryCache.set(cacheKey, product, 300000);
  }

  return ctx.json(product);
});`,gg=`import { Vexor, upload, singleUpload, multiUpload } from '@vexorjs/core';

const app = new Vexor();

// Single file upload
app.post('/upload/avatar',
  singleUpload({
    field: 'avatar',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    destination: './uploads/avatars'
  }),
  async (ctx) => {
    const file = ctx.file;
    return ctx.json({
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    });
  }
);

// Multiple files upload
app.post('/upload/gallery',
  multiUpload({
    field: 'images',
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/*']
  }),
  async (ctx) => {
    const files = ctx.files;
    return ctx.json({
      count: files.length,
      files: files.map(f => ({ name: f.filename, size: f.size }))
    });
  }
);

// Custom file handling
app.post('/upload/document',
  upload({
    storage: 's3', // or 'local', 'gcs'
    bucket: 'my-bucket',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/msword'],
    filename: (file) => \`\${Date.now()}-\${file.originalname}\`
  }),
  async (ctx) => {
    return ctx.json({ url: ctx.file.url });
  }
);`,yg=`import { Vexor, healthCheck, databaseCheck, redisCheck, memoryCheck } from '@vexorjs/core';

const app = new Vexor();

// Basic health check
app.use(healthCheck({
  path: '/health'
}));

// Comprehensive health checks
app.use(healthCheck({
  path: '/health',
  checks: [
    databaseCheck('postgres', db),
    redisCheck('redis', redisClient),
    memoryCheck('memory', {
      maxHeapUsed: 500 * 1024 * 1024 // 500MB
    }),
    {
      name: 'external-api',
      check: async () => {
        const res = await fetch('https://api.example.com/health');
        return res.ok;
      }
    }
  ]
}));

// Response format:
// GET /health
// {
//   "status": "healthy",
//   "timestamp": "2024-01-15T10:30:00Z",
//   "checks": {
//     "postgres": { "status": "healthy", "latency": 5 },
//     "redis": { "status": "healthy", "latency": 2 },
//     "memory": { "status": "healthy", "heapUsed": 150000000 },
//     "external-api": { "status": "healthy", "latency": 120 }
//   }
// }`,xg=`import { Vexor, createLogger, createRequestLogger } from '@vexorjs/core';

const app = new Vexor();

// Create structured logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  pretty: process.env.NODE_ENV !== 'production'
});

// Request logging middleware
app.use(createRequestLogger({
  logger,
  // Skip health check logs
  skip: (ctx) => ctx.path === '/health',
  // Custom log format
  customProps: (ctx) => ({
    userId: ctx.state.userId,
    traceId: ctx.headers.get('x-trace-id')
  })
}));

// Use logger in handlers
app.get('/api/data', async (ctx) => {
  logger.info('Fetching data', { userId: ctx.state.userId });

  try {
    const data = await fetchData();
    return ctx.json(data);
  } catch (error) {
    logger.error('Failed to fetch data', { error: error.message });
    throw error;
  }
});

// Log output (production):
// {"level":"info","time":1705312200000,"msg":"Fetching data","userId":"123"}
// {"level":"info","time":1705312200050,"msg":"request completed","method":"GET","path":"/api/data","status":200,"duration":50}`,vg=`import { Vexor, versioning, createVersionRouter } from '@vexorjs/core';

const app = new Vexor();

// URL path versioning
app.use(versioning({
  type: 'path',
  prefix: '/api'
}));

// Header versioning
app.use(versioning({
  type: 'header',
  header: 'X-API-Version',
  default: '1'
}));

// Create versioned routes
const v1Router = createVersionRouter('1');
const v2Router = createVersionRouter('2');

v1Router.get('/users', async (ctx) => {
  return ctx.json({ version: 1, users: await getUsersV1() });
});

v2Router.get('/users', async (ctx) => {
  return ctx.json({ version: 2, users: await getUsersV2() });
});

app.use(v1Router);
app.use(v2Router);

// Deprecation warnings
app.get('/api/v1/old-endpoint',
  deprecated({
    sunset: '2024-06-01',
    alternative: '/api/v2/new-endpoint'
  }),
  handler
);`;function wg(){return l.jsxs("div",{className:"space-y-12",children:[l.jsxs("div",{children:[l.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Middleware"}),l.jsx("p",{className:"text-lg text-slate-400",children:"Vexor includes a comprehensive set of production-ready middleware for common use cases."})]}),l.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[{name:"CORS",href:"#cors"},{name:"Rate Limiting",href:"#rate-limit"},{name:"JWT Auth",href:"#jwt"},{name:"Sessions",href:"#sessions"},{name:"Compression",href:"#compression"},{name:"Caching",href:"#caching"},{name:"File Upload",href:"#upload"},{name:"Health Check",href:"#health"},{name:"Logging",href:"#logging"},{name:"Versioning",href:"#versioning"}].map(a=>l.jsx("a",{href:a.href,className:"p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm",children:a.name},a.name))}),l.jsxs("section",{id:"cors",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"CORS"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Cross-Origin Resource Sharing middleware for handling browser security policies."}),l.jsx(Y,{code:cg,filename:"cors.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"rate-limit",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Rate Limiting"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Protect your API from abuse with flexible rate limiting strategies."}),l.jsx(Y,{code:dg,filename:"rate-limit.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"jwt",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"JWT Authentication"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"JSON Web Token authentication with support for access and refresh tokens."}),l.jsx(Y,{code:pg,filename:"jwt-auth.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"sessions",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Session Management"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Server-side session management with multiple storage backends."}),l.jsx(Y,{code:fg,filename:"sessions.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"compression",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Compression"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Automatic response compression with gzip, deflate, and Brotli support."}),l.jsx(Y,{code:mg,filename:"compression.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"caching",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Caching"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Response caching with in-memory and Redis backends."}),l.jsx(Y,{code:hg,filename:"caching.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"upload",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"File Upload"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Handle file uploads with validation, size limits, and storage options."}),l.jsx(Y,{code:gg,filename:"upload.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"health",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Health Checks"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Expose health endpoints for load balancers and monitoring systems."}),l.jsx(Y,{code:yg,filename:"health.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"logging",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Logging"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Structured logging with request tracing and custom formatters."}),l.jsx(Y,{code:xg,filename:"logging.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"versioning",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"API Versioning"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Version your API with path, header, or query parameter strategies."}),l.jsx(Y,{code:vg,filename:"versioning.ts",showLineNumbers:!0})]}),l.jsxs("section",{className:"p-6 bg-slate-900/50 border border-slate-800 rounded-2xl",children:[l.jsx("h2",{className:"text-xl font-bold mb-4",children:"Next Steps"}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[l.jsxs("a",{href:"/vexorjs/docs/realtime",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Real-time →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Build WebSocket and SSE applications"})]}),l.jsxs("a",{href:"/vexorjs/docs/deployment",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Deployment →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Deploy to Node.js, Bun, Lambda, and Edge"})]})]})]})]})}const bg=`import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Basic WebSocket endpoint
app.ws('/chat', {
  // Optional: validate incoming messages
  message: Type.Object({
    type: Type.Union([Type.Literal('message'), Type.Literal('typing')]),
    content: Type.String()
  })
}, {
  // Connection opened
  open(ws, ctx) {
    console.log('Client connected:', ws.id);
    ws.send(JSON.stringify({ type: 'welcome', id: ws.id }));
  },

  // Message received
  message(ws, data, ctx) {
    console.log('Received:', data);

    // Broadcast to all clients
    ws.publish('chat', JSON.stringify({
      from: ws.id,
      ...data
    }));
  },

  // Connection closed
  close(ws, code, reason, ctx) {
    console.log('Client disconnected:', ws.id);
  },

  // Error occurred
  error(ws, error, ctx) {
    console.error('WebSocket error:', error);
  }
});

app.listen(3000);`,kg=`// WebSocket with rooms/channels
app.ws('/chat/:room', {
  open(ws, ctx) {
    const room = ctx.params.room;

    // Subscribe to room
    ws.subscribe(\`room:\${room}\`);

    // Notify room of new user
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'join',
      user: ws.id
    }));
  },

  message(ws, data, ctx) {
    const room = ctx.params.room;

    // Broadcast message to room only
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'message',
      from: ws.id,
      ...data
    }));
  },

  close(ws, code, reason, ctx) {
    const room = ctx.params.room;

    // Notify room of user leaving
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'leave',
      user: ws.id
    }));

    // Unsubscribe from room
    ws.unsubscribe(\`room:\${room}\`);
  }
});`,Sg=`// WebSocket with authentication
app.ws('/secure', {
  // Upgrade hook - runs before connection is established
  async upgrade(ctx) {
    const token = ctx.query.token || ctx.headers.get('authorization')?.slice(7);

    if (!token) {
      return ctx.status(401).text('Unauthorized');
    }

    try {
      const user = await verifyToken(token);
      ctx.state.user = user;
      // Continue with upgrade
    } catch (error) {
      return ctx.status(401).text('Invalid token');
    }
  },

  open(ws, ctx) {
    // User is authenticated
    console.log('Authenticated user connected:', ctx.state.user.id);

    // Subscribe to user-specific channel
    ws.subscribe(\`user:\${ctx.state.user.id}\`);
  },

  message(ws, data, ctx) {
    // Access user in message handler
    const user = ctx.state.user;
    console.log(\`Message from \${user.name}:\`, data);
  }
});`,jg=`import { Vexor, SSEStream, createSSEStream } from '@vexorjs/core';

const app = new Vexor();

// Basic SSE endpoint
app.get('/events', async (ctx) => {
  const stream = createSSEStream();

  // Send initial event
  stream.send({ event: 'connected', data: { id: Date.now() } });

  // Set up interval to send events
  const interval = setInterval(() => {
    stream.send({
      event: 'tick',
      data: { time: new Date().toISOString() }
    });
  }, 1000);

  // Clean up on disconnect
  ctx.onClose(() => {
    clearInterval(interval);
    stream.close();
  });

  return stream.response();
});

// SSE with async generator
app.get('/progress/:taskId', async (ctx) => {
  const taskId = ctx.params.taskId;

  async function* generateProgress() {
    for (let i = 0; i <= 100; i += 10) {
      yield { event: 'progress', data: { taskId, percent: i } };
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    yield { event: 'complete', data: { taskId } };
  }

  return ctx.sse(generateProgress());
});`,Ng=`// Browser client for SSE
const eventSource = new EventSource('/events');

eventSource.onopen = () => {
  console.log('Connected to SSE');
};

eventSource.addEventListener('connected', (event) => {
  const data = JSON.parse(event.data);
  console.log('Connection ID:', data.id);
});

eventSource.addEventListener('tick', (event) => {
  const data = JSON.parse(event.data);
  console.log('Server time:', data.time);
});

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};

// Clean up
window.addEventListener('beforeunload', () => {
  eventSource.close();
});`,Eg=`import { Vexor, createEventBus, MemoryPubSubAdapter } from '@vexorjs/core';

const app = new Vexor();

// Create event bus
const eventBus = createEventBus({
  adapter: new MemoryPubSubAdapter()
});

// Subscribe to events
eventBus.subscribe('user:created', async (data) => {
  console.log('User created:', data);
  // Send welcome email, update analytics, etc.
});

eventBus.subscribe('order:placed', async (data) => {
  console.log('Order placed:', data);
  // Process payment, send confirmation, etc.
});

// Publish events from handlers
app.post('/users', async (ctx) => {
  const user = await createUser(ctx.body);

  // Publish event
  await eventBus.publish('user:created', {
    id: user.id,
    email: user.email,
    createdAt: new Date()
  });

  return ctx.status(201).json(user);
});

app.post('/orders', async (ctx) => {
  const order = await createOrder(ctx.body);

  await eventBus.publish('order:placed', {
    orderId: order.id,
    userId: order.userId,
    total: order.total
  });

  return ctx.status(201).json(order);
});`,Cg=`import { Vexor, createEventBus, createRedisPubSub } from '@vexorjs/core';

// Redis Pub/Sub for distributed systems
const eventBus = createEventBus({
  adapter: createRedisPubSub({
    url: process.env.REDIS_URL!,
    prefix: 'events:'
  })
});

// Events are now distributed across all instances
eventBus.subscribe('cache:invalidate', async (data) => {
  // All instances receive this event
  await localCache.delete(data.key);
});

// Publish from any instance
app.put('/products/:id', async (ctx) => {
  const product = await updateProduct(ctx.params.id, ctx.body);

  // All instances will invalidate their cache
  await eventBus.publish('cache:invalidate', {
    key: \`product:\${product.id}\`
  });

  return ctx.json(product);
});`,_g=`import { Vexor, CircuitBreaker, createCircuitBreaker, retry } from '@vexorjs/core';

const app = new Vexor();

// Create circuit breaker for external API
const apiBreaker = createCircuitBreaker({
  name: 'external-api',
  timeout: 5000,           // Request timeout
  errorThreshold: 50,      // Open circuit after 50% errors
  volumeThreshold: 10,     // Minimum 10 requests before calculating
  resetTimeout: 30000,     // Try again after 30 seconds

  // Fallback when circuit is open
  fallback: async () => {
    return { data: [], cached: true };
  }
});

// Use circuit breaker
app.get('/api/external-data', async (ctx) => {
  const data = await apiBreaker.fire(async () => {
    const res = await fetch('https://external-api.com/data');
    if (!res.ok) throw new Error('API error');
    return res.json();
  });

  return ctx.json(data);
});

// Retry with exponential backoff
app.get('/api/reliable-data', async (ctx) => {
  const data = await retry(
    async () => {
      const res = await fetch('https://api.example.com/data');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 10000,
      factor: 2,            // Exponential backoff factor
      onRetry: (error, attempt) => {
        console.log(\`Retry attempt \${attempt}:\`, error.message);
      }
    }
  );

  return ctx.json(data);
});`,Rg=`// Browser WebSocket client
const ws = new WebSocket('ws://localhost:3000/chat');

ws.onopen = () => {
  console.log('Connected to WebSocket');

  // Send a message
  ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello, server!'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);

  switch (data.type) {
    case 'welcome':
      console.log('My ID:', data.id);
      break;
    case 'message':
      console.log(\`\${data.from}: \${data.content}\`);
      break;
  }
};

ws.onclose = (event) => {
  console.log('Disconnected:', event.code, event.reason);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Send with reconnection logic
function sendWithReconnect(data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    // Queue message and reconnect
    messageQueue.push(data);
    reconnect();
  }
}`;function Tg(){return l.jsxs("div",{className:"space-y-12",children:[l.jsxs("div",{children:[l.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Real-time Features"}),l.jsx("p",{className:"text-lg text-slate-400",children:"Build real-time applications with WebSockets, Server-Sent Events, and Pub/Sub."})]}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("div",{className:"text-2xl mb-2",children:"🔌"}),l.jsx("h3",{className:"font-semibold mb-1",children:"WebSocket"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Bidirectional real-time communication with rooms and channels"})]}),l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("div",{className:"text-2xl mb-2",children:"📡"}),l.jsx("h3",{className:"font-semibold mb-1",children:"Server-Sent Events"}),l.jsx("p",{className:"text-sm text-slate-400",children:"One-way streaming from server to client"})]}),l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("div",{className:"text-2xl mb-2",children:"📨"}),l.jsx("h3",{className:"font-semibold mb-1",children:"Pub/Sub"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Event-driven architecture with memory or Redis backend"})]})]}),l.jsxs("section",{id:"websocket",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"WebSocket"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Create WebSocket endpoints with type-safe message validation and lifecycle hooks."}),l.jsx(Y,{code:bg,filename:"websocket.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Rooms & Channels"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Organize connections into rooms for targeted broadcasting."}),l.jsx(Y,{code:kg,filename:"rooms.ts",showLineNumbers:!0})]}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Authentication"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Authenticate WebSocket connections before they're established."}),l.jsx(Y,{code:Sg,filename:"ws-auth.ts",showLineNumbers:!0})]}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Client Example"}),l.jsx(Y,{code:Rg,filename:"client.js",language:"javascript",showLineNumbers:!0})]})]}),l.jsxs("section",{id:"sse",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Server-Sent Events (SSE)"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Stream events to clients for progress updates, notifications, and live data."}),l.jsx(Y,{code:jg,filename:"sse.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Client Example"}),l.jsx(Y,{code:Ng,filename:"sse-client.js",language:"javascript",showLineNumbers:!0})]}),l.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:l.jsxs("p",{className:"text-sm text-slate-300",children:[l.jsx("strong",{className:"text-vexor-400",children:"When to use SSE vs WebSocket:"})," Use SSE for one-way server-to-client streaming (notifications, live updates). Use WebSocket for bidirectional communication (chat, gaming, collaboration)."]})})]}),l.jsxs("section",{id:"pubsub",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Pub/Sub & Event Bus"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Decouple your application with event-driven architecture."}),l.jsx(Y,{code:Eg,filename:"pubsub.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Redis Pub/Sub (Distributed)"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Scale horizontally with Redis-backed pub/sub for multi-instance deployments."}),l.jsx(Y,{code:Cg,filename:"redis-pubsub.ts",showLineNumbers:!0})]})]}),l.jsxs("section",{id:"resilience",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Resilience Patterns"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Protect your application from cascading failures with circuit breakers and retries."}),l.jsx(Y,{code:_g,filename:"resilience.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("h4",{className:"font-semibold mb-2",children:"Circuit Breaker States"}),l.jsxs("ul",{className:"text-sm text-slate-400 space-y-1",children:[l.jsxs("li",{children:[l.jsx("strong",{className:"text-green-400",children:"Closed:"})," Normal operation, requests pass through"]}),l.jsxs("li",{children:[l.jsx("strong",{className:"text-yellow-400",children:"Open:"})," Failing, requests blocked, fallback used"]}),l.jsxs("li",{children:[l.jsx("strong",{className:"text-blue-400",children:"Half-Open:"})," Testing if service recovered"]})]})]}),l.jsxs("div",{className:"p-4 bg-slate-900/50 border border-slate-800 rounded-xl",children:[l.jsx("h4",{className:"font-semibold mb-2",children:"Retry Strategies"}),l.jsxs("ul",{className:"text-sm text-slate-400 space-y-1",children:[l.jsxs("li",{children:[l.jsx("strong",{children:"Exponential:"})," 1s, 2s, 4s, 8s..."]}),l.jsxs("li",{children:[l.jsx("strong",{children:"Linear:"})," 1s, 2s, 3s, 4s..."]}),l.jsxs("li",{children:[l.jsx("strong",{children:"Fixed:"})," 1s, 1s, 1s, 1s..."]})]})]})]})]}),l.jsxs("section",{className:"p-6 bg-slate-900/50 border border-slate-800 rounded-2xl",children:[l.jsx("h2",{className:"text-xl font-bold mb-4",children:"Next Steps"}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[l.jsxs("a",{href:"/vexorjs/docs/deployment",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Deployment →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Deploy to Node.js, Bun, Lambda, and Edge"})]}),l.jsxs("a",{href:"/vexorjs/docs/core",className:"block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors",children:[l.jsx("h3",{className:"font-semibold mb-1",children:"Core Concepts →"}),l.jsx("p",{className:"text-sm text-slate-400",children:"Review routing, context, and lifecycle hooks"})]})]})]})]})}const Lg=`// server.ts
import { Vexor } from '@vexorjs/core';
import { createApp } from './app';

const app = createApp();

const port = parseInt(process.env.PORT || '3000');
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(\`Server running on http://\${host}:\${port}\`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});`,Pg=`# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]`,Ag=`version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:`,Og=`// server.ts (Bun)
import { Vexor } from '@vexorjs/core';
import { createApp } from './app';

const app = createApp();

const port = parseInt(Bun.env.PORT || '3000');

// Bun auto-detects and uses its native HTTP server
app.listen(port, () => {
  console.log(\`Bun server running on port \${port}\`);
});`,Ig=`FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "dist/server.js"]`,Fg=`// lambda.ts
import { Vexor, createLambdaHandler } from '@vexorjs/core';

const app = new Vexor();

app.get('/hello', (ctx) => {
  return ctx.json({ message: 'Hello from Lambda!' });
});

app.get('/users/:id', (ctx) => {
  return ctx.json({ userId: ctx.params.id });
});

// Export Lambda handler
export const handler = createLambdaHandler(app);`,Dg=`// lambda-streaming.ts
import { Vexor, createStreamingLambdaHandler } from '@vexorjs/core';

const app = new Vexor();

app.get('/stream', async (ctx) => {
  async function* generate() {
    for (let i = 0; i < 10; i++) {
      yield { count: i };
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return ctx.stream(generate());
});

// Export streaming Lambda handler
export const handler = createStreamingLambdaHandler(app);`,zg=`# template.yaml (AWS SAM)
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 256
    Runtime: nodejs20.x
    Environment:
      Variables:
        NODE_ENV: production

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/lambda.handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2022"
        Sourcemap: true
        EntryPoints:
          - src/lambda.ts

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint
    Value: !Sub "https://\${ServerlessHttpApi}.execute-api.\${AWS::Region}.amazonaws.com"`,Mg=`// worker.ts
import { Vexor } from '@vexorjs/core';

const app = new Vexor();

app.get('/', (ctx) => {
  return ctx.json({
    message: 'Hello from Cloudflare Workers!',
    cf: ctx.cf // Cloudflare-specific properties
  });
});

app.get('/geo', (ctx) => {
  return ctx.json({
    country: ctx.cf?.country,
    city: ctx.cf?.city,
    timezone: ctx.cf?.timezone
  });
});

// Export for Cloudflare Workers
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  }
};`,Bg=`# wrangler.toml
name = "my-vexor-api"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-d1-database-id"`,Ug=`// api/index.ts (Vercel Edge)
import { Vexor } from '@vexorjs/core';

const app = new Vexor();

app.get('/api', (ctx) => {
  return ctx.json({
    message: 'Hello from Vercel Edge!',
    region: process.env.VERCEL_REGION
  });
});

app.get('/api/users/:id', (ctx) => {
  return ctx.json({ userId: ctx.params.id });
});

// Export for Vercel Edge
export const config = {
  runtime: 'edge'
};

export default app.fetch;`,$g=`// vercel.json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "functions": {
    "api/index.ts": {
      "runtime": "edge"
    }
  }
}`,Vg=`# ecosystem.config.js (PM2)
module.exports = {
  apps: [{
    name: 'vexor-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001
    }
  }]
};

# Commands:
# pm2 start ecosystem.config.js
# pm2 start ecosystem.config.js --env staging
# pm2 reload vexor-api
# pm2 logs vexor-api
# pm2 monit`,Wg=`# /etc/nginx/sites-available/vexor-api
upstream vexor_cluster {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://vexor_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://vexor_cluster;
        proxy_connect_timeout 5s;
        proxy_read_timeout 5s;
    }
}`,Hg=`# .env.example
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgres://user:password@localhost:5432/myapp

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=info`;function Gg(){return l.jsxs("div",{className:"space-y-12",children:[l.jsxs("div",{children:[l.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Deployment"}),l.jsx("p",{className:"text-lg text-slate-400",children:"Deploy Vexor applications to Node.js, Bun, AWS Lambda, Cloudflare Workers, and more."})]}),l.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[{name:"Node.js",href:"#nodejs"},{name:"Docker",href:"#docker"},{name:"Bun",href:"#bun"},{name:"AWS Lambda",href:"#lambda"},{name:"Cloudflare",href:"#cloudflare"},{name:"Vercel Edge",href:"#vercel"},{name:"PM2 Cluster",href:"#pm2"},{name:"Nginx",href:"#nginx"}].map(a=>l.jsx("a",{href:a.href,className:"p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm",children:a.name},a.name))}),l.jsxs("section",{id:"env",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Environment Variables"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Always use environment variables for configuration. Never commit secrets to version control."}),l.jsx(Y,{code:Hg,filename:".env.example",showLineNumbers:!0})]}),l.jsxs("section",{id:"nodejs",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Node.js Deployment"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Standard Node.js deployment with graceful shutdown handling."}),l.jsx(Y,{code:Lg,filename:"server.ts",showLineNumbers:!0})]}),l.jsxs("section",{id:"docker",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Docker"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Multi-stage Docker build for optimized production images."}),l.jsx(Y,{code:Pg,filename:"Dockerfile",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Docker Compose"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Full stack deployment with PostgreSQL and Redis."}),l.jsx(Y,{code:Ag,filename:"docker-compose.yml",showLineNumbers:!0})]})]}),l.jsxs("section",{id:"bun",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Bun Deployment"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Vexor automatically uses Bun's native HTTP server for maximum performance."}),l.jsx(Y,{code:Og,filename:"server.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Bun Dockerfile"}),l.jsx(Y,{code:Ig,filename:"Dockerfile.bun",showLineNumbers:!0})]}),l.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:l.jsxs("p",{className:"text-sm text-slate-300",children:[l.jsx("strong",{className:"text-vexor-400",children:"Performance Tip:"})," Bun's native HTTP server is significantly faster than Node.js. Expect 2-3x higher throughput for compute-bound workloads."]})})]}),l.jsxs("section",{id:"lambda",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"AWS Lambda"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Deploy as a serverless function with API Gateway."}),l.jsx(Y,{code:Fg,filename:"lambda.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Lambda Streaming"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Use response streaming for large responses or real-time data."}),l.jsx(Y,{code:Dg,filename:"lambda-streaming.ts",showLineNumbers:!0})]}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"SAM Template"}),l.jsx(Y,{code:zg,filename:"template.yaml",showLineNumbers:!0})]})]}),l.jsxs("section",{id:"cloudflare",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Cloudflare Workers"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Deploy to the edge for ultra-low latency worldwide."}),l.jsx(Y,{code:Mg,filename:"worker.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Wrangler Configuration"}),l.jsx(Y,{code:Bg,filename:"wrangler.toml",showLineNumbers:!0})]})]}),l.jsxs("section",{id:"vercel",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Vercel Edge"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Deploy to Vercel's edge network with zero configuration."}),l.jsx(Y,{code:Ug,filename:"api/index.ts",showLineNumbers:!0}),l.jsxs("div",{className:"mt-8",children:[l.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Vercel Configuration"}),l.jsx(Y,{code:$g,filename:"vercel.json",showLineNumbers:!0})]})]}),l.jsxs("section",{id:"pm2",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"PM2 Cluster Mode"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Run multiple instances with automatic load balancing and zero-downtime reloads."}),l.jsx(Y,{code:Vg,filename:"ecosystem.config.js",showLineNumbers:!0})]}),l.jsxs("section",{id:"nginx",children:[l.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Nginx Reverse Proxy"}),l.jsx("p",{className:"text-slate-400 mb-4",children:"Production-ready Nginx configuration with SSL and load balancing."}),l.jsx(Y,{code:Wg,filename:"nginx.conf",showLineNumbers:!0})]}),l.jsxs("section",{className:"p-6 bg-slate-900/50 border border-slate-800 rounded-2xl",children:[l.jsx("h2",{className:"text-xl font-bold mb-4",children:"Production Checklist"}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[l.jsxs("div",{children:[l.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Security"}),l.jsxs("ul",{className:"space-y-2 text-sm text-slate-400",children:[l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Use HTTPS everywhere"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Set secure headers (CORS, CSP, HSTS)"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Rate limit API endpoints"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Validate all inputs"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Use environment variables for secrets"})]})]})]}),l.jsxs("div",{children:[l.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Performance"}),l.jsxs("ul",{className:"space-y-2 text-sm text-slate-400",children:[l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Enable compression"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Use connection pooling for databases"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Implement caching strategies"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Monitor with health checks"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Set up logging and tracing"})]})]})]}),l.jsxs("div",{children:[l.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Reliability"}),l.jsxs("ul",{className:"space-y-2 text-sm text-slate-400",children:[l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Handle graceful shutdown"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Use circuit breakers for external services"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Implement retry logic"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Set appropriate timeouts"})]})]})]}),l.jsxs("div",{children:[l.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Operations"}),l.jsxs("ul",{className:"space-y-2 text-sm text-slate-400",children:[l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Set up CI/CD pipelines"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Configure alerts and monitoring"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Plan for database backups"})]}),l.jsxs("li",{className:"flex items-start gap-2",children:[l.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),l.jsx("span",{children:"Document runbooks"})]})]})]})]})]})]})}function qg(){return l.jsx(Jf,{children:l.jsxs(Ft,{path:"/",element:l.jsx(Tm,{}),children:[l.jsx(Ft,{index:!0,element:l.jsx(Mh,{})}),l.jsx(Ft,{path:"docs/getting-started",element:l.jsx(Wh,{})}),l.jsx(Ft,{path:"docs/core",element:l.jsx(Xh,{})}),l.jsx(Ft,{path:"docs/orm",element:l.jsx(ug,{})}),l.jsx(Ft,{path:"docs/middleware",element:l.jsx(wg,{})}),l.jsx(Ft,{path:"docs/realtime",element:l.jsx(Tg,{})}),l.jsx(Ft,{path:"docs/deployment",element:l.jsx(Gg,{})})]})})}rf.createRoot(document.getElementById("root")).render(l.jsx(Rc.StrictMode,{children:l.jsx(am,{basename:"/vexorjs",children:l.jsx(qg,{})})}));
