function Qp(l,u){for(var i=0;i<u.length;i++){const d=u[i];if(typeof d!="string"&&!Array.isArray(d)){for(const f in d)if(f!=="default"&&!(f in l)){const x=Object.getOwnPropertyDescriptor(d,f);x&&Object.defineProperty(l,f,x.get?x:{enumerable:!0,get:()=>d[f]})}}}return Object.freeze(Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}))}(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const f of document.querySelectorAll('link[rel="modulepreload"]'))d(f);new MutationObserver(f=>{for(const x of f)if(x.type==="childList")for(const h of x.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&d(h)}).observe(document,{childList:!0,subtree:!0});function i(f){const x={};return f.integrity&&(x.integrity=f.integrity),f.referrerPolicy&&(x.referrerPolicy=f.referrerPolicy),f.crossOrigin==="use-credentials"?x.credentials="include":f.crossOrigin==="anonymous"?x.credentials="omit":x.credentials="same-origin",x}function d(f){if(f.ep)return;f.ep=!0;const x=i(f);fetch(f.href,x)}})();function _c(l){return l&&l.__esModule&&Object.prototype.hasOwnProperty.call(l,"default")?l.default:l}var ql={exports:{}},An={},Ql={exports:{}},se={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var rc;function Kp(){if(rc)return se;rc=1;var l=Symbol.for("react.element"),u=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),d=Symbol.for("react.strict_mode"),f=Symbol.for("react.profiler"),x=Symbol.for("react.provider"),h=Symbol.for("react.context"),_=Symbol.for("react.forward_ref"),v=Symbol.for("react.suspense"),C=Symbol.for("react.memo"),R=Symbol.for("react.lazy"),N=Symbol.iterator;function M(y){return y===null||typeof y!="object"?null:(y=N&&y[N]||y["@@iterator"],typeof y=="function"?y:null)}var q={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},j=Object.assign,b={};function w(y,P,re){this.props=y,this.context=P,this.refs=b,this.updater=re||q}w.prototype.isReactComponent={},w.prototype.setState=function(y,P){if(typeof y!="object"&&typeof y!="function"&&y!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,y,P,"setState")},w.prototype.forceUpdate=function(y){this.updater.enqueueForceUpdate(this,y,"forceUpdate")};function I(){}I.prototype=w.prototype;function L(y,P,re){this.props=y,this.context=P,this.refs=b,this.updater=re||q}var F=L.prototype=new I;F.constructor=L,j(F,w.prototype),F.isPureReactComponent=!0;var Q=Array.isArray,ee=Object.prototype.hasOwnProperty,ue={current:null},le={key:!0,ref:!0,__self:!0,__source:!0};function me(y,P,re){var ne,oe={},ae=null,de=null;if(P!=null)for(ne in P.ref!==void 0&&(de=P.ref),P.key!==void 0&&(ae=""+P.key),P)ee.call(P,ne)&&!le.hasOwnProperty(ne)&&(oe[ne]=P[ne]);var pe=arguments.length-2;if(pe===1)oe.children=re;else if(1<pe){for(var ge=Array(pe),rt=0;rt<pe;rt++)ge[rt]=arguments[rt+2];oe.children=ge}if(y&&y.defaultProps)for(ne in pe=y.defaultProps,pe)oe[ne]===void 0&&(oe[ne]=pe[ne]);return{$$typeof:l,type:y,key:ae,ref:de,props:oe,_owner:ue.current}}function ke(y,P){return{$$typeof:l,type:y.type,key:P,ref:y.ref,props:y.props,_owner:y._owner}}function Fe(y){return typeof y=="object"&&y!==null&&y.$$typeof===l}function Be(y){var P={"=":"=0",":":"=2"};return"$"+y.replace(/[=:]/g,function(re){return P[re]})}var Ee=/\/+/g;function Ve(y,P){return typeof y=="object"&&y!==null&&y.key!=null?Be(""+y.key):P.toString(36)}function he(y,P,re,ne,oe){var ae=typeof y;(ae==="undefined"||ae==="boolean")&&(y=null);var de=!1;if(y===null)de=!0;else switch(ae){case"string":case"number":de=!0;break;case"object":switch(y.$$typeof){case l:case u:de=!0}}if(de)return de=y,oe=oe(de),y=ne===""?"."+Ve(de,0):ne,Q(oe)?(re="",y!=null&&(re=y.replace(Ee,"$&/")+"/"),he(oe,P,re,"",function(rt){return rt})):oe!=null&&(Fe(oe)&&(oe=ke(oe,re+(!oe.key||de&&de.key===oe.key?"":(""+oe.key).replace(Ee,"$&/")+"/")+y)),P.push(oe)),1;if(de=0,ne=ne===""?".":ne+":",Q(y))for(var pe=0;pe<y.length;pe++){ae=y[pe];var ge=ne+Ve(ae,pe);de+=he(ae,P,re,ge,oe)}else if(ge=M(y),typeof ge=="function")for(y=ge.call(y),pe=0;!(ae=y.next()).done;)ae=ae.value,ge=ne+Ve(ae,pe++),de+=he(ae,P,re,ge,oe);else if(ae==="object")throw P=String(y),Error("Objects are not valid as a React child (found: "+(P==="[object Object]"?"object with keys {"+Object.keys(y).join(", ")+"}":P)+"). If you meant to render a collection of children, use an array instead.");return de}function Ce(y,P,re){if(y==null)return y;var ne=[],oe=0;return he(y,ne,"","",function(ae){return P.call(re,ae,oe++)}),ne}function _e(y){if(y._status===-1){var P=y._result;P=P(),P.then(function(re){(y._status===0||y._status===-1)&&(y._status=1,y._result=re)},function(re){(y._status===0||y._status===-1)&&(y._status=2,y._result=re)}),y._status===-1&&(y._status=0,y._result=P)}if(y._status===1)return y._result.default;throw y._result}var xe={current:null},B={transition:null},J={ReactCurrentDispatcher:xe,ReactCurrentBatchConfig:B,ReactCurrentOwner:ue};function $(){throw Error("act(...) is not supported in production builds of React.")}return se.Children={map:Ce,forEach:function(y,P,re){Ce(y,function(){P.apply(this,arguments)},re)},count:function(y){var P=0;return Ce(y,function(){P++}),P},toArray:function(y){return Ce(y,function(P){return P})||[]},only:function(y){if(!Fe(y))throw Error("React.Children.only expected to receive a single React element child.");return y}},se.Component=w,se.Fragment=i,se.Profiler=f,se.PureComponent=L,se.StrictMode=d,se.Suspense=v,se.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=J,se.act=$,se.cloneElement=function(y,P,re){if(y==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+y+".");var ne=j({},y.props),oe=y.key,ae=y.ref,de=y._owner;if(P!=null){if(P.ref!==void 0&&(ae=P.ref,de=ue.current),P.key!==void 0&&(oe=""+P.key),y.type&&y.type.defaultProps)var pe=y.type.defaultProps;for(ge in P)ee.call(P,ge)&&!le.hasOwnProperty(ge)&&(ne[ge]=P[ge]===void 0&&pe!==void 0?pe[ge]:P[ge])}var ge=arguments.length-2;if(ge===1)ne.children=re;else if(1<ge){pe=Array(ge);for(var rt=0;rt<ge;rt++)pe[rt]=arguments[rt+2];ne.children=pe}return{$$typeof:l,type:y.type,key:oe,ref:ae,props:ne,_owner:de}},se.createContext=function(y){return y={$$typeof:h,_currentValue:y,_currentValue2:y,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},y.Provider={$$typeof:x,_context:y},y.Consumer=y},se.createElement=me,se.createFactory=function(y){var P=me.bind(null,y);return P.type=y,P},se.createRef=function(){return{current:null}},se.forwardRef=function(y){return{$$typeof:_,render:y}},se.isValidElement=Fe,se.lazy=function(y){return{$$typeof:R,_payload:{_status:-1,_result:y},_init:_e}},se.memo=function(y,P){return{$$typeof:C,type:y,compare:P===void 0?null:P}},se.startTransition=function(y){var P=B.transition;B.transition={};try{y()}finally{B.transition=P}},se.unstable_act=$,se.useCallback=function(y,P){return xe.current.useCallback(y,P)},se.useContext=function(y){return xe.current.useContext(y)},se.useDebugValue=function(){},se.useDeferredValue=function(y){return xe.current.useDeferredValue(y)},se.useEffect=function(y,P){return xe.current.useEffect(y,P)},se.useId=function(){return xe.current.useId()},se.useImperativeHandle=function(y,P,re){return xe.current.useImperativeHandle(y,P,re)},se.useInsertionEffect=function(y,P){return xe.current.useInsertionEffect(y,P)},se.useLayoutEffect=function(y,P){return xe.current.useLayoutEffect(y,P)},se.useMemo=function(y,P){return xe.current.useMemo(y,P)},se.useReducer=function(y,P,re){return xe.current.useReducer(y,P,re)},se.useRef=function(y){return xe.current.useRef(y)},se.useState=function(y){return xe.current.useState(y)},se.useSyncExternalStore=function(y,P,re){return xe.current.useSyncExternalStore(y,P,re)},se.useTransition=function(){return xe.current.useTransition()},se.version="18.3.1",se}var nc;function ro(){return nc||(nc=1,Ql.exports=Kp()),Ql.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var sc;function Yp(){if(sc)return An;sc=1;var l=ro(),u=Symbol.for("react.element"),i=Symbol.for("react.fragment"),d=Object.prototype.hasOwnProperty,f=l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,x={key:!0,ref:!0,__self:!0,__source:!0};function h(_,v,C){var R,N={},M=null,q=null;C!==void 0&&(M=""+C),v.key!==void 0&&(M=""+v.key),v.ref!==void 0&&(q=v.ref);for(R in v)d.call(v,R)&&!x.hasOwnProperty(R)&&(N[R]=v[R]);if(_&&_.defaultProps)for(R in v=_.defaultProps,v)N[R]===void 0&&(N[R]=v[R]);return{$$typeof:u,type:_,key:M,ref:q,props:N,_owner:f.current}}return An.Fragment=i,An.jsx=h,An.jsxs=h,An}var ac;function Zp(){return ac||(ac=1,ql.exports=Yp()),ql.exports}var a=Zp(),U=ro();const Rc=_c(U),Xp=Qp({__proto__:null,default:Rc},[U]);var qs={},Kl={exports:{}},tt={},Yl={exports:{}},Zl={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var lc;function Jp(){return lc||(lc=1,(function(l){function u(B,J){var $=B.length;B.push(J);e:for(;0<$;){var y=$-1>>>1,P=B[y];if(0<f(P,J))B[y]=J,B[$]=P,$=y;else break e}}function i(B){return B.length===0?null:B[0]}function d(B){if(B.length===0)return null;var J=B[0],$=B.pop();if($!==J){B[0]=$;e:for(var y=0,P=B.length,re=P>>>1;y<re;){var ne=2*(y+1)-1,oe=B[ne],ae=ne+1,de=B[ae];if(0>f(oe,$))ae<P&&0>f(de,oe)?(B[y]=de,B[ae]=$,y=ae):(B[y]=oe,B[ne]=$,y=ne);else if(ae<P&&0>f(de,$))B[y]=de,B[ae]=$,y=ae;else break e}}return J}function f(B,J){var $=B.sortIndex-J.sortIndex;return $!==0?$:B.id-J.id}if(typeof performance=="object"&&typeof performance.now=="function"){var x=performance;l.unstable_now=function(){return x.now()}}else{var h=Date,_=h.now();l.unstable_now=function(){return h.now()-_}}var v=[],C=[],R=1,N=null,M=3,q=!1,j=!1,b=!1,w=typeof setTimeout=="function"?setTimeout:null,I=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function F(B){for(var J=i(C);J!==null;){if(J.callback===null)d(C);else if(J.startTime<=B)d(C),J.sortIndex=J.expirationTime,u(v,J);else break;J=i(C)}}function Q(B){if(b=!1,F(B),!j)if(i(v)!==null)j=!0,_e(ee);else{var J=i(C);J!==null&&xe(Q,J.startTime-B)}}function ee(B,J){j=!1,b&&(b=!1,I(me),me=-1),q=!0;var $=M;try{for(F(J),N=i(v);N!==null&&(!(N.expirationTime>J)||B&&!Be());){var y=N.callback;if(typeof y=="function"){N.callback=null,M=N.priorityLevel;var P=y(N.expirationTime<=J);J=l.unstable_now(),typeof P=="function"?N.callback=P:N===i(v)&&d(v),F(J)}else d(v);N=i(v)}if(N!==null)var re=!0;else{var ne=i(C);ne!==null&&xe(Q,ne.startTime-J),re=!1}return re}finally{N=null,M=$,q=!1}}var ue=!1,le=null,me=-1,ke=5,Fe=-1;function Be(){return!(l.unstable_now()-Fe<ke)}function Ee(){if(le!==null){var B=l.unstable_now();Fe=B;var J=!0;try{J=le(!0,B)}finally{J?Ve():(ue=!1,le=null)}}else ue=!1}var Ve;if(typeof L=="function")Ve=function(){L(Ee)};else if(typeof MessageChannel<"u"){var he=new MessageChannel,Ce=he.port2;he.port1.onmessage=Ee,Ve=function(){Ce.postMessage(null)}}else Ve=function(){w(Ee,0)};function _e(B){le=B,ue||(ue=!0,Ve())}function xe(B,J){me=w(function(){B(l.unstable_now())},J)}l.unstable_IdlePriority=5,l.unstable_ImmediatePriority=1,l.unstable_LowPriority=4,l.unstable_NormalPriority=3,l.unstable_Profiling=null,l.unstable_UserBlockingPriority=2,l.unstable_cancelCallback=function(B){B.callback=null},l.unstable_continueExecution=function(){j||q||(j=!0,_e(ee))},l.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):ke=0<B?Math.floor(1e3/B):5},l.unstable_getCurrentPriorityLevel=function(){return M},l.unstable_getFirstCallbackNode=function(){return i(v)},l.unstable_next=function(B){switch(M){case 1:case 2:case 3:var J=3;break;default:J=M}var $=M;M=J;try{return B()}finally{M=$}},l.unstable_pauseExecution=function(){},l.unstable_requestPaint=function(){},l.unstable_runWithPriority=function(B,J){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var $=M;M=B;try{return J()}finally{M=$}},l.unstable_scheduleCallback=function(B,J,$){var y=l.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?y+$:y):$=y,B){case 1:var P=-1;break;case 2:P=250;break;case 5:P=1073741823;break;case 4:P=1e4;break;default:P=5e3}return P=$+P,B={id:R++,callback:J,priorityLevel:B,startTime:$,expirationTime:P,sortIndex:-1},$>y?(B.sortIndex=$,u(C,B),i(v)===null&&B===i(C)&&(b?(I(me),me=-1):b=!0,xe(Q,$-y))):(B.sortIndex=P,u(v,B),j||q||(j=!0,_e(ee))),B},l.unstable_shouldYield=Be,l.unstable_wrapCallback=function(B){var J=M;return function(){var $=M;M=J;try{return B.apply(this,arguments)}finally{M=$}}}})(Zl)),Zl}var oc;function ef(){return oc||(oc=1,Yl.exports=Jp()),Yl.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ic;function tf(){if(ic)return tt;ic=1;var l=ro(),u=ef();function i(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,r=1;r<arguments.length;r++)t+="&args[]="+encodeURIComponent(arguments[r]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var d=new Set,f={};function x(e,t){h(e,t),h(e+"Capture",t)}function h(e,t){for(f[e]=t,e=0;e<t.length;e++)d.add(t[e])}var _=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),v=Object.prototype.hasOwnProperty,C=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,R={},N={};function M(e){return v.call(N,e)?!0:v.call(R,e)?!1:C.test(e)?N[e]=!0:(R[e]=!0,!1)}function q(e,t,r,n){if(r!==null&&r.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return n?!1:r!==null?!r.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function j(e,t,r,n){if(t===null||typeof t>"u"||q(e,t,r,n))return!0;if(n)return!1;if(r!==null)switch(r.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function b(e,t,r,n,s,o,c){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=n,this.attributeNamespace=s,this.mustUseProperty=r,this.propertyName=e,this.type=t,this.sanitizeURL=o,this.removeEmptyString=c}var w={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){w[e]=new b(e,0,!1,e,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];w[t]=new b(t,1,!1,e[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(e){w[e]=new b(e,2,!1,e.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){w[e]=new b(e,2,!1,e,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){w[e]=new b(e,3,!1,e.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(e){w[e]=new b(e,3,!0,e,null,!1,!1)}),["capture","download"].forEach(function(e){w[e]=new b(e,4,!1,e,null,!1,!1)}),["cols","rows","size","span"].forEach(function(e){w[e]=new b(e,6,!1,e,null,!1,!1)}),["rowSpan","start"].forEach(function(e){w[e]=new b(e,5,!1,e.toLowerCase(),null,!1,!1)});var I=/[\-:]([a-z])/g;function L(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(I,L);w[t]=new b(t,1,!1,e,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(I,L);w[t]=new b(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(I,L);w[t]=new b(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(e){w[e]=new b(e,1,!1,e.toLowerCase(),null,!1,!1)}),w.xlinkHref=new b("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(e){w[e]=new b(e,1,!1,e.toLowerCase(),null,!0,!0)});function F(e,t,r,n){var s=w.hasOwnProperty(t)?w[t]:null;(s!==null?s.type!==0:n||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(j(t,r,s,n)&&(r=null),n||s===null?M(t)&&(r===null?e.removeAttribute(t):e.setAttribute(t,""+r)):s.mustUseProperty?e[s.propertyName]=r===null?s.type===3?!1:"":r:(t=s.attributeName,n=s.attributeNamespace,r===null?e.removeAttribute(t):(s=s.type,r=s===3||s===4&&r===!0?"":""+r,n?e.setAttributeNS(n,t,r):e.setAttribute(t,r))))}var Q=l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ee=Symbol.for("react.element"),ue=Symbol.for("react.portal"),le=Symbol.for("react.fragment"),me=Symbol.for("react.strict_mode"),ke=Symbol.for("react.profiler"),Fe=Symbol.for("react.provider"),Be=Symbol.for("react.context"),Ee=Symbol.for("react.forward_ref"),Ve=Symbol.for("react.suspense"),he=Symbol.for("react.suspense_list"),Ce=Symbol.for("react.memo"),_e=Symbol.for("react.lazy"),xe=Symbol.for("react.offscreen"),B=Symbol.iterator;function J(e){return e===null||typeof e!="object"?null:(e=B&&e[B]||e["@@iterator"],typeof e=="function"?e:null)}var $=Object.assign,y;function P(e){if(y===void 0)try{throw Error()}catch(r){var t=r.stack.trim().match(/\n( *(at )?)/);y=t&&t[1]||""}return`
`+y+e}var re=!1;function ne(e,t){if(!e||re)return"";re=!0;var r=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(E){var n=E}Reflect.construct(e,[],t)}else{try{t.call()}catch(E){n=E}e.call(t.prototype)}else{try{throw Error()}catch(E){n=E}e()}}catch(E){if(E&&n&&typeof E.stack=="string"){for(var s=E.stack.split(`
`),o=n.stack.split(`
`),c=s.length-1,p=o.length-1;1<=c&&0<=p&&s[c]!==o[p];)p--;for(;1<=c&&0<=p;c--,p--)if(s[c]!==o[p]){if(c!==1||p!==1)do if(c--,p--,0>p||s[c]!==o[p]){var m=`
`+s[c].replace(" at new "," at ");return e.displayName&&m.includes("<anonymous>")&&(m=m.replace("<anonymous>",e.displayName)),m}while(1<=c&&0<=p);break}}}finally{re=!1,Error.prepareStackTrace=r}return(e=e?e.displayName||e.name:"")?P(e):""}function oe(e){switch(e.tag){case 5:return P(e.type);case 16:return P("Lazy");case 13:return P("Suspense");case 19:return P("SuspenseList");case 0:case 2:case 15:return e=ne(e.type,!1),e;case 11:return e=ne(e.type.render,!1),e;case 1:return e=ne(e.type,!0),e;default:return""}}function ae(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case le:return"Fragment";case ue:return"Portal";case ke:return"Profiler";case me:return"StrictMode";case Ve:return"Suspense";case he:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Be:return(e.displayName||"Context")+".Consumer";case Fe:return(e._context.displayName||"Context")+".Provider";case Ee:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ce:return t=e.displayName||null,t!==null?t:ae(e.type)||"Memo";case _e:t=e._payload,e=e._init;try{return ae(e(t))}catch{}}return null}function de(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return ae(t);case 8:return t===me?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function pe(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ge(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function rt(e){var t=ge(e)?"checked":"value",r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),n=""+e[t];if(!e.hasOwnProperty(t)&&typeof r<"u"&&typeof r.get=="function"&&typeof r.set=="function"){var s=r.get,o=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(c){n=""+c,o.call(this,c)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(c){n=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Dn(e){e._valueTracker||(e._valueTracker=rt(e))}function oo(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var r=t.getValue(),n="";return e&&(n=ge(e)?e.checked?"true":"false":e.value),e=n,e!==r?(t.setValue(e),!0):!1}function Mn(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function ea(e,t){var r=t.checked;return $({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:r??e._wrapperState.initialChecked})}function io(e,t){var r=t.defaultValue==null?"":t.defaultValue,n=t.checked!=null?t.checked:t.defaultChecked;r=pe(t.value!=null?t.value:r),e._wrapperState={initialChecked:n,initialValue:r,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function uo(e,t){t=t.checked,t!=null&&F(e,"checked",t,!1)}function ta(e,t){uo(e,t);var r=pe(t.value),n=t.type;if(r!=null)n==="number"?(r===0&&e.value===""||e.value!=r)&&(e.value=""+r):e.value!==""+r&&(e.value=""+r);else if(n==="submit"||n==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?ra(e,t.type,r):t.hasOwnProperty("defaultValue")&&ra(e,t.type,pe(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function co(e,t,r){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var n=t.type;if(!(n!=="submit"&&n!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,r||t===e.value||(e.value=t),e.defaultValue=t}r=e.name,r!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,r!==""&&(e.name=r)}function ra(e,t,r){(t!=="number"||Mn(e.ownerDocument)!==e)&&(r==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+r&&(e.defaultValue=""+r))}var qr=Array.isArray;function wr(e,t,r,n){if(e=e.options,t){t={};for(var s=0;s<r.length;s++)t["$"+r[s]]=!0;for(r=0;r<e.length;r++)s=t.hasOwnProperty("$"+e[r].value),e[r].selected!==s&&(e[r].selected=s),s&&n&&(e[r].defaultSelected=!0)}else{for(r=""+pe(r),t=null,s=0;s<e.length;s++){if(e[s].value===r){e[s].selected=!0,n&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function na(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(i(91));return $({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function po(e,t){var r=t.value;if(r==null){if(r=t.children,t=t.defaultValue,r!=null){if(t!=null)throw Error(i(92));if(qr(r)){if(1<r.length)throw Error(i(93));r=r[0]}t=r}t==null&&(t=""),r=t}e._wrapperState={initialValue:pe(r)}}function fo(e,t){var r=pe(t.value),n=pe(t.defaultValue);r!=null&&(r=""+r,r!==e.value&&(e.value=r),t.defaultValue==null&&e.defaultValue!==r&&(e.defaultValue=r)),n!=null&&(e.defaultValue=""+n)}function mo(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function ho(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function sa(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?ho(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var zn,go=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,r,n,s){MSApp.execUnsafeLocalFunction(function(){return e(t,r,n,s)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(zn=zn||document.createElement("div"),zn.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=zn.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Qr(e,t){if(t){var r=e.firstChild;if(r&&r===e.lastChild&&r.nodeType===3){r.nodeValue=t;return}}e.textContent=t}var Kr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Xc=["Webkit","ms","Moz","O"];Object.keys(Kr).forEach(function(e){Xc.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Kr[t]=Kr[e]})});function xo(e,t,r){return t==null||typeof t=="boolean"||t===""?"":r||typeof t!="number"||t===0||Kr.hasOwnProperty(e)&&Kr[e]?(""+t).trim():t+"px"}function yo(e,t){e=e.style;for(var r in t)if(t.hasOwnProperty(r)){var n=r.indexOf("--")===0,s=xo(r,t[r],n);r==="float"&&(r="cssFloat"),n?e.setProperty(r,s):e[r]=s}}var Jc=$({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function aa(e,t){if(t){if(Jc[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(i(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(i(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(i(61))}if(t.style!=null&&typeof t.style!="object")throw Error(i(62))}}function la(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var oa=null;function ia(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var ua=null,br=null,kr=null;function vo(e){if(e=yn(e)){if(typeof ua!="function")throw Error(i(280));var t=e.stateNode;t&&(t=is(t),ua(e.stateNode,e.type,t))}}function wo(e){br?kr?kr.push(e):kr=[e]:br=e}function bo(){if(br){var e=br,t=kr;if(kr=br=null,vo(e),t)for(e=0;e<t.length;e++)vo(t[e])}}function ko(e,t){return e(t)}function So(){}var ca=!1;function jo(e,t,r){if(ca)return e(t,r);ca=!0;try{return ko(e,t,r)}finally{ca=!1,(br!==null||kr!==null)&&(So(),bo())}}function Yr(e,t){var r=e.stateNode;if(r===null)return null;var n=is(r);if(n===null)return null;r=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(r&&typeof r!="function")throw Error(i(231,t,typeof r));return r}var da=!1;if(_)try{var Zr={};Object.defineProperty(Zr,"passive",{get:function(){da=!0}}),window.addEventListener("test",Zr,Zr),window.removeEventListener("test",Zr,Zr)}catch{da=!1}function ed(e,t,r,n,s,o,c,p,m){var E=Array.prototype.slice.call(arguments,3);try{t.apply(r,E)}catch(O){this.onError(O)}}var Xr=!1,Bn=null,Un=!1,pa=null,td={onError:function(e){Xr=!0,Bn=e}};function rd(e,t,r,n,s,o,c,p,m){Xr=!1,Bn=null,ed.apply(td,arguments)}function nd(e,t,r,n,s,o,c,p,m){if(rd.apply(this,arguments),Xr){if(Xr){var E=Bn;Xr=!1,Bn=null}else throw Error(i(198));Un||(Un=!0,pa=E)}}function ar(e){var t=e,r=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(r=t.return),e=t.return;while(e)}return t.tag===3?r:null}function No(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Eo(e){if(ar(e)!==e)throw Error(i(188))}function sd(e){var t=e.alternate;if(!t){if(t=ar(e),t===null)throw Error(i(188));return t!==e?null:e}for(var r=e,n=t;;){var s=r.return;if(s===null)break;var o=s.alternate;if(o===null){if(n=s.return,n!==null){r=n;continue}break}if(s.child===o.child){for(o=s.child;o;){if(o===r)return Eo(s),e;if(o===n)return Eo(s),t;o=o.sibling}throw Error(i(188))}if(r.return!==n.return)r=s,n=o;else{for(var c=!1,p=s.child;p;){if(p===r){c=!0,r=s,n=o;break}if(p===n){c=!0,n=s,r=o;break}p=p.sibling}if(!c){for(p=o.child;p;){if(p===r){c=!0,r=o,n=s;break}if(p===n){c=!0,n=o,r=s;break}p=p.sibling}if(!c)throw Error(i(189))}}if(r.alternate!==n)throw Error(i(190))}if(r.tag!==3)throw Error(i(188));return r.stateNode.current===r?e:t}function Co(e){return e=sd(e),e!==null?_o(e):null}function _o(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=_o(e);if(t!==null)return t;e=e.sibling}return null}var Ro=u.unstable_scheduleCallback,To=u.unstable_cancelCallback,ad=u.unstable_shouldYield,ld=u.unstable_requestPaint,Re=u.unstable_now,od=u.unstable_getCurrentPriorityLevel,fa=u.unstable_ImmediatePriority,Lo=u.unstable_UserBlockingPriority,$n=u.unstable_NormalPriority,id=u.unstable_LowPriority,Po=u.unstable_IdlePriority,Vn=null,bt=null;function ud(e){if(bt&&typeof bt.onCommitFiberRoot=="function")try{bt.onCommitFiberRoot(Vn,e,void 0,(e.current.flags&128)===128)}catch{}}var mt=Math.clz32?Math.clz32:pd,cd=Math.log,dd=Math.LN2;function pd(e){return e>>>=0,e===0?32:31-(cd(e)/dd|0)|0}var Wn=64,Hn=4194304;function Jr(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Gn(e,t){var r=e.pendingLanes;if(r===0)return 0;var n=0,s=e.suspendedLanes,o=e.pingedLanes,c=r&268435455;if(c!==0){var p=c&~s;p!==0?n=Jr(p):(o&=c,o!==0&&(n=Jr(o)))}else c=r&~s,c!==0?n=Jr(c):o!==0&&(n=Jr(o));if(n===0)return 0;if(t!==0&&t!==n&&(t&s)===0&&(s=n&-n,o=t&-t,s>=o||s===16&&(o&4194240)!==0))return t;if((n&4)!==0&&(n|=r&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=n;0<t;)r=31-mt(t),s=1<<r,n|=e[r],t&=~s;return n}function fd(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function md(e,t){for(var r=e.suspendedLanes,n=e.pingedLanes,s=e.expirationTimes,o=e.pendingLanes;0<o;){var c=31-mt(o),p=1<<c,m=s[c];m===-1?((p&r)===0||(p&n)!==0)&&(s[c]=fd(p,t)):m<=t&&(e.expiredLanes|=p),o&=~p}}function ma(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Ao(){var e=Wn;return Wn<<=1,(Wn&4194240)===0&&(Wn=64),e}function ha(e){for(var t=[],r=0;31>r;r++)t.push(e);return t}function en(e,t,r){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-mt(t),e[t]=r}function hd(e,t){var r=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var n=e.eventTimes;for(e=e.expirationTimes;0<r;){var s=31-mt(r),o=1<<s;t[s]=0,n[s]=-1,e[s]=-1,r&=~o}}function ga(e,t){var r=e.entangledLanes|=t;for(e=e.entanglements;r;){var n=31-mt(r),s=1<<n;s&t|e[n]&t&&(e[n]|=t),r&=~s}}var fe=0;function Oo(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Io,xa,Fo,Do,Mo,ya=!1,qn=[],Dt=null,Mt=null,zt=null,tn=new Map,rn=new Map,Bt=[],gd="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function zo(e,t){switch(e){case"focusin":case"focusout":Dt=null;break;case"dragenter":case"dragleave":Mt=null;break;case"mouseover":case"mouseout":zt=null;break;case"pointerover":case"pointerout":tn.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":rn.delete(t.pointerId)}}function nn(e,t,r,n,s,o){return e===null||e.nativeEvent!==o?(e={blockedOn:t,domEventName:r,eventSystemFlags:n,nativeEvent:o,targetContainers:[s]},t!==null&&(t=yn(t),t!==null&&xa(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function xd(e,t,r,n,s){switch(t){case"focusin":return Dt=nn(Dt,e,t,r,n,s),!0;case"dragenter":return Mt=nn(Mt,e,t,r,n,s),!0;case"mouseover":return zt=nn(zt,e,t,r,n,s),!0;case"pointerover":var o=s.pointerId;return tn.set(o,nn(tn.get(o)||null,e,t,r,n,s)),!0;case"gotpointercapture":return o=s.pointerId,rn.set(o,nn(rn.get(o)||null,e,t,r,n,s)),!0}return!1}function Bo(e){var t=lr(e.target);if(t!==null){var r=ar(t);if(r!==null){if(t=r.tag,t===13){if(t=No(r),t!==null){e.blockedOn=t,Mo(e.priority,function(){Fo(r)});return}}else if(t===3&&r.stateNode.current.memoizedState.isDehydrated){e.blockedOn=r.tag===3?r.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Qn(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var r=wa(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(r===null){r=e.nativeEvent;var n=new r.constructor(r.type,r);oa=n,r.target.dispatchEvent(n),oa=null}else return t=yn(r),t!==null&&xa(t),e.blockedOn=r,!1;t.shift()}return!0}function Uo(e,t,r){Qn(e)&&r.delete(t)}function yd(){ya=!1,Dt!==null&&Qn(Dt)&&(Dt=null),Mt!==null&&Qn(Mt)&&(Mt=null),zt!==null&&Qn(zt)&&(zt=null),tn.forEach(Uo),rn.forEach(Uo)}function sn(e,t){e.blockedOn===t&&(e.blockedOn=null,ya||(ya=!0,u.unstable_scheduleCallback(u.unstable_NormalPriority,yd)))}function an(e){function t(s){return sn(s,e)}if(0<qn.length){sn(qn[0],e);for(var r=1;r<qn.length;r++){var n=qn[r];n.blockedOn===e&&(n.blockedOn=null)}}for(Dt!==null&&sn(Dt,e),Mt!==null&&sn(Mt,e),zt!==null&&sn(zt,e),tn.forEach(t),rn.forEach(t),r=0;r<Bt.length;r++)n=Bt[r],n.blockedOn===e&&(n.blockedOn=null);for(;0<Bt.length&&(r=Bt[0],r.blockedOn===null);)Bo(r),r.blockedOn===null&&Bt.shift()}var Sr=Q.ReactCurrentBatchConfig,Kn=!0;function vd(e,t,r,n){var s=fe,o=Sr.transition;Sr.transition=null;try{fe=1,va(e,t,r,n)}finally{fe=s,Sr.transition=o}}function wd(e,t,r,n){var s=fe,o=Sr.transition;Sr.transition=null;try{fe=4,va(e,t,r,n)}finally{fe=s,Sr.transition=o}}function va(e,t,r,n){if(Kn){var s=wa(e,t,r,n);if(s===null)Da(e,t,n,Yn,r),zo(e,n);else if(xd(s,e,t,r,n))n.stopPropagation();else if(zo(e,n),t&4&&-1<gd.indexOf(e)){for(;s!==null;){var o=yn(s);if(o!==null&&Io(o),o=wa(e,t,r,n),o===null&&Da(e,t,n,Yn,r),o===s)break;s=o}s!==null&&n.stopPropagation()}else Da(e,t,n,null,r)}}var Yn=null;function wa(e,t,r,n){if(Yn=null,e=ia(n),e=lr(e),e!==null)if(t=ar(e),t===null)e=null;else if(r=t.tag,r===13){if(e=No(t),e!==null)return e;e=null}else if(r===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return Yn=e,null}function $o(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(od()){case fa:return 1;case Lo:return 4;case $n:case id:return 16;case Po:return 536870912;default:return 16}default:return 16}}var Ut=null,ba=null,Zn=null;function Vo(){if(Zn)return Zn;var e,t=ba,r=t.length,n,s="value"in Ut?Ut.value:Ut.textContent,o=s.length;for(e=0;e<r&&t[e]===s[e];e++);var c=r-e;for(n=1;n<=c&&t[r-n]===s[o-n];n++);return Zn=s.slice(e,1<n?1-n:void 0)}function Xn(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Jn(){return!0}function Wo(){return!1}function nt(e){function t(r,n,s,o,c){this._reactName=r,this._targetInst=s,this.type=n,this.nativeEvent=o,this.target=c,this.currentTarget=null;for(var p in e)e.hasOwnProperty(p)&&(r=e[p],this[p]=r?r(o):o[p]);return this.isDefaultPrevented=(o.defaultPrevented!=null?o.defaultPrevented:o.returnValue===!1)?Jn:Wo,this.isPropagationStopped=Wo,this}return $(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var r=this.nativeEvent;r&&(r.preventDefault?r.preventDefault():typeof r.returnValue!="unknown"&&(r.returnValue=!1),this.isDefaultPrevented=Jn)},stopPropagation:function(){var r=this.nativeEvent;r&&(r.stopPropagation?r.stopPropagation():typeof r.cancelBubble!="unknown"&&(r.cancelBubble=!0),this.isPropagationStopped=Jn)},persist:function(){},isPersistent:Jn}),t}var jr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ka=nt(jr),ln=$({},jr,{view:0,detail:0}),bd=nt(ln),Sa,ja,on,es=$({},ln,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ea,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==on&&(on&&e.type==="mousemove"?(Sa=e.screenX-on.screenX,ja=e.screenY-on.screenY):ja=Sa=0,on=e),Sa)},movementY:function(e){return"movementY"in e?e.movementY:ja}}),Ho=nt(es),kd=$({},es,{dataTransfer:0}),Sd=nt(kd),jd=$({},ln,{relatedTarget:0}),Na=nt(jd),Nd=$({},jr,{animationName:0,elapsedTime:0,pseudoElement:0}),Ed=nt(Nd),Cd=$({},jr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),_d=nt(Cd),Rd=$({},jr,{data:0}),Go=nt(Rd),Td={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Ld={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Pd={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Ad(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Pd[e])?!!t[e]:!1}function Ea(){return Ad}var Od=$({},ln,{key:function(e){if(e.key){var t=Td[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Xn(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Ld[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ea,charCode:function(e){return e.type==="keypress"?Xn(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Xn(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Id=nt(Od),Fd=$({},es,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),qo=nt(Fd),Dd=$({},ln,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ea}),Md=nt(Dd),zd=$({},jr,{propertyName:0,elapsedTime:0,pseudoElement:0}),Bd=nt(zd),Ud=$({},es,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),$d=nt(Ud),Vd=[9,13,27,32],Ca=_&&"CompositionEvent"in window,un=null;_&&"documentMode"in document&&(un=document.documentMode);var Wd=_&&"TextEvent"in window&&!un,Qo=_&&(!Ca||un&&8<un&&11>=un),Ko=" ",Yo=!1;function Zo(e,t){switch(e){case"keyup":return Vd.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Xo(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Nr=!1;function Hd(e,t){switch(e){case"compositionend":return Xo(t);case"keypress":return t.which!==32?null:(Yo=!0,Ko);case"textInput":return e=t.data,e===Ko&&Yo?null:e;default:return null}}function Gd(e,t){if(Nr)return e==="compositionend"||!Ca&&Zo(e,t)?(e=Vo(),Zn=ba=Ut=null,Nr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Qo&&t.locale!=="ko"?null:t.data;default:return null}}var qd={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Jo(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!qd[e.type]:t==="textarea"}function ei(e,t,r,n){wo(n),t=as(t,"onChange"),0<t.length&&(r=new ka("onChange","change",null,r,n),e.push({event:r,listeners:t}))}var cn=null,dn=null;function Qd(e){yi(e,0)}function ts(e){var t=Tr(e);if(oo(t))return e}function Kd(e,t){if(e==="change")return t}var ti=!1;if(_){var _a;if(_){var Ra="oninput"in document;if(!Ra){var ri=document.createElement("div");ri.setAttribute("oninput","return;"),Ra=typeof ri.oninput=="function"}_a=Ra}else _a=!1;ti=_a&&(!document.documentMode||9<document.documentMode)}function ni(){cn&&(cn.detachEvent("onpropertychange",si),dn=cn=null)}function si(e){if(e.propertyName==="value"&&ts(dn)){var t=[];ei(t,dn,e,ia(e)),jo(Qd,t)}}function Yd(e,t,r){e==="focusin"?(ni(),cn=t,dn=r,cn.attachEvent("onpropertychange",si)):e==="focusout"&&ni()}function Zd(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ts(dn)}function Xd(e,t){if(e==="click")return ts(t)}function Jd(e,t){if(e==="input"||e==="change")return ts(t)}function ep(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ht=typeof Object.is=="function"?Object.is:ep;function pn(e,t){if(ht(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var r=Object.keys(e),n=Object.keys(t);if(r.length!==n.length)return!1;for(n=0;n<r.length;n++){var s=r[n];if(!v.call(t,s)||!ht(e[s],t[s]))return!1}return!0}function ai(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function li(e,t){var r=ai(e);e=0;for(var n;r;){if(r.nodeType===3){if(n=e+r.textContent.length,e<=t&&n>=t)return{node:r,offset:t-e};e=n}e:{for(;r;){if(r.nextSibling){r=r.nextSibling;break e}r=r.parentNode}r=void 0}r=ai(r)}}function oi(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?oi(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function ii(){for(var e=window,t=Mn();t instanceof e.HTMLIFrameElement;){try{var r=typeof t.contentWindow.location.href=="string"}catch{r=!1}if(r)e=t.contentWindow;else break;t=Mn(e.document)}return t}function Ta(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function tp(e){var t=ii(),r=e.focusedElem,n=e.selectionRange;if(t!==r&&r&&r.ownerDocument&&oi(r.ownerDocument.documentElement,r)){if(n!==null&&Ta(r)){if(t=n.start,e=n.end,e===void 0&&(e=t),"selectionStart"in r)r.selectionStart=t,r.selectionEnd=Math.min(e,r.value.length);else if(e=(t=r.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var s=r.textContent.length,o=Math.min(n.start,s);n=n.end===void 0?o:Math.min(n.end,s),!e.extend&&o>n&&(s=n,n=o,o=s),s=li(r,o);var c=li(r,n);s&&c&&(e.rangeCount!==1||e.anchorNode!==s.node||e.anchorOffset!==s.offset||e.focusNode!==c.node||e.focusOffset!==c.offset)&&(t=t.createRange(),t.setStart(s.node,s.offset),e.removeAllRanges(),o>n?(e.addRange(t),e.extend(c.node,c.offset)):(t.setEnd(c.node,c.offset),e.addRange(t)))}}for(t=[],e=r;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof r.focus=="function"&&r.focus(),r=0;r<t.length;r++)e=t[r],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var rp=_&&"documentMode"in document&&11>=document.documentMode,Er=null,La=null,fn=null,Pa=!1;function ui(e,t,r){var n=r.window===r?r.document:r.nodeType===9?r:r.ownerDocument;Pa||Er==null||Er!==Mn(n)||(n=Er,"selectionStart"in n&&Ta(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),fn&&pn(fn,n)||(fn=n,n=as(La,"onSelect"),0<n.length&&(t=new ka("onSelect","select",null,t,r),e.push({event:t,listeners:n}),t.target=Er)))}function rs(e,t){var r={};return r[e.toLowerCase()]=t.toLowerCase(),r["Webkit"+e]="webkit"+t,r["Moz"+e]="moz"+t,r}var Cr={animationend:rs("Animation","AnimationEnd"),animationiteration:rs("Animation","AnimationIteration"),animationstart:rs("Animation","AnimationStart"),transitionend:rs("Transition","TransitionEnd")},Aa={},ci={};_&&(ci=document.createElement("div").style,"AnimationEvent"in window||(delete Cr.animationend.animation,delete Cr.animationiteration.animation,delete Cr.animationstart.animation),"TransitionEvent"in window||delete Cr.transitionend.transition);function ns(e){if(Aa[e])return Aa[e];if(!Cr[e])return e;var t=Cr[e],r;for(r in t)if(t.hasOwnProperty(r)&&r in ci)return Aa[e]=t[r];return e}var di=ns("animationend"),pi=ns("animationiteration"),fi=ns("animationstart"),mi=ns("transitionend"),hi=new Map,gi="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function $t(e,t){hi.set(e,t),x(t,[e])}for(var Oa=0;Oa<gi.length;Oa++){var Ia=gi[Oa],np=Ia.toLowerCase(),sp=Ia[0].toUpperCase()+Ia.slice(1);$t(np,"on"+sp)}$t(di,"onAnimationEnd"),$t(pi,"onAnimationIteration"),$t(fi,"onAnimationStart"),$t("dblclick","onDoubleClick"),$t("focusin","onFocus"),$t("focusout","onBlur"),$t(mi,"onTransitionEnd"),h("onMouseEnter",["mouseout","mouseover"]),h("onMouseLeave",["mouseout","mouseover"]),h("onPointerEnter",["pointerout","pointerover"]),h("onPointerLeave",["pointerout","pointerover"]),x("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),x("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),x("onBeforeInput",["compositionend","keypress","textInput","paste"]),x("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),x("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),x("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var mn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),ap=new Set("cancel close invalid load scroll toggle".split(" ").concat(mn));function xi(e,t,r){var n=e.type||"unknown-event";e.currentTarget=r,nd(n,t,void 0,e),e.currentTarget=null}function yi(e,t){t=(t&4)!==0;for(var r=0;r<e.length;r++){var n=e[r],s=n.event;n=n.listeners;e:{var o=void 0;if(t)for(var c=n.length-1;0<=c;c--){var p=n[c],m=p.instance,E=p.currentTarget;if(p=p.listener,m!==o&&s.isPropagationStopped())break e;xi(s,p,E),o=m}else for(c=0;c<n.length;c++){if(p=n[c],m=p.instance,E=p.currentTarget,p=p.listener,m!==o&&s.isPropagationStopped())break e;xi(s,p,E),o=m}}}if(Un)throw e=pa,Un=!1,pa=null,e}function ve(e,t){var r=t[Va];r===void 0&&(r=t[Va]=new Set);var n=e+"__bubble";r.has(n)||(vi(t,e,2,!1),r.add(n))}function Fa(e,t,r){var n=0;t&&(n|=4),vi(r,e,n,t)}var ss="_reactListening"+Math.random().toString(36).slice(2);function hn(e){if(!e[ss]){e[ss]=!0,d.forEach(function(r){r!=="selectionchange"&&(ap.has(r)||Fa(r,!1,e),Fa(r,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[ss]||(t[ss]=!0,Fa("selectionchange",!1,t))}}function vi(e,t,r,n){switch($o(t)){case 1:var s=vd;break;case 4:s=wd;break;default:s=va}r=s.bind(null,t,r,e),s=void 0,!da||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),n?s!==void 0?e.addEventListener(t,r,{capture:!0,passive:s}):e.addEventListener(t,r,!0):s!==void 0?e.addEventListener(t,r,{passive:s}):e.addEventListener(t,r,!1)}function Da(e,t,r,n,s){var o=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var c=n.tag;if(c===3||c===4){var p=n.stateNode.containerInfo;if(p===s||p.nodeType===8&&p.parentNode===s)break;if(c===4)for(c=n.return;c!==null;){var m=c.tag;if((m===3||m===4)&&(m=c.stateNode.containerInfo,m===s||m.nodeType===8&&m.parentNode===s))return;c=c.return}for(;p!==null;){if(c=lr(p),c===null)return;if(m=c.tag,m===5||m===6){n=o=c;continue e}p=p.parentNode}}n=n.return}jo(function(){var E=o,O=ia(r),D=[];e:{var A=hi.get(e);if(A!==void 0){var V=ka,H=e;switch(e){case"keypress":if(Xn(r)===0)break e;case"keydown":case"keyup":V=Id;break;case"focusin":H="focus",V=Na;break;case"focusout":H="blur",V=Na;break;case"beforeblur":case"afterblur":V=Na;break;case"click":if(r.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":V=Ho;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":V=Sd;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":V=Md;break;case di:case pi:case fi:V=Ed;break;case mi:V=Bd;break;case"scroll":V=bd;break;case"wheel":V=$d;break;case"copy":case"cut":case"paste":V=_d;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":V=qo}var G=(t&4)!==0,Te=!G&&e==="scroll",k=G?A!==null?A+"Capture":null:A;G=[];for(var g=E,S;g!==null;){S=g;var z=S.stateNode;if(S.tag===5&&z!==null&&(S=z,k!==null&&(z=Yr(g,k),z!=null&&G.push(gn(g,z,S)))),Te)break;g=g.return}0<G.length&&(A=new V(A,H,null,r,O),D.push({event:A,listeners:G}))}}if((t&7)===0){e:{if(A=e==="mouseover"||e==="pointerover",V=e==="mouseout"||e==="pointerout",A&&r!==oa&&(H=r.relatedTarget||r.fromElement)&&(lr(H)||H[_t]))break e;if((V||A)&&(A=O.window===O?O:(A=O.ownerDocument)?A.defaultView||A.parentWindow:window,V?(H=r.relatedTarget||r.toElement,V=E,H=H?lr(H):null,H!==null&&(Te=ar(H),H!==Te||H.tag!==5&&H.tag!==6)&&(H=null)):(V=null,H=E),V!==H)){if(G=Ho,z="onMouseLeave",k="onMouseEnter",g="mouse",(e==="pointerout"||e==="pointerover")&&(G=qo,z="onPointerLeave",k="onPointerEnter",g="pointer"),Te=V==null?A:Tr(V),S=H==null?A:Tr(H),A=new G(z,g+"leave",V,r,O),A.target=Te,A.relatedTarget=S,z=null,lr(O)===E&&(G=new G(k,g+"enter",H,r,O),G.target=S,G.relatedTarget=Te,z=G),Te=z,V&&H)t:{for(G=V,k=H,g=0,S=G;S;S=_r(S))g++;for(S=0,z=k;z;z=_r(z))S++;for(;0<g-S;)G=_r(G),g--;for(;0<S-g;)k=_r(k),S--;for(;g--;){if(G===k||k!==null&&G===k.alternate)break t;G=_r(G),k=_r(k)}G=null}else G=null;V!==null&&wi(D,A,V,G,!1),H!==null&&Te!==null&&wi(D,Te,H,G,!0)}}e:{if(A=E?Tr(E):window,V=A.nodeName&&A.nodeName.toLowerCase(),V==="select"||V==="input"&&A.type==="file")var K=Kd;else if(Jo(A))if(ti)K=Jd;else{K=Zd;var Z=Yd}else(V=A.nodeName)&&V.toLowerCase()==="input"&&(A.type==="checkbox"||A.type==="radio")&&(K=Xd);if(K&&(K=K(e,E))){ei(D,K,r,O);break e}Z&&Z(e,A,E),e==="focusout"&&(Z=A._wrapperState)&&Z.controlled&&A.type==="number"&&ra(A,"number",A.value)}switch(Z=E?Tr(E):window,e){case"focusin":(Jo(Z)||Z.contentEditable==="true")&&(Er=Z,La=E,fn=null);break;case"focusout":fn=La=Er=null;break;case"mousedown":Pa=!0;break;case"contextmenu":case"mouseup":case"dragend":Pa=!1,ui(D,r,O);break;case"selectionchange":if(rp)break;case"keydown":case"keyup":ui(D,r,O)}var X;if(Ca)e:{switch(e){case"compositionstart":var te="onCompositionStart";break e;case"compositionend":te="onCompositionEnd";break e;case"compositionupdate":te="onCompositionUpdate";break e}te=void 0}else Nr?Zo(e,r)&&(te="onCompositionEnd"):e==="keydown"&&r.keyCode===229&&(te="onCompositionStart");te&&(Qo&&r.locale!=="ko"&&(Nr||te!=="onCompositionStart"?te==="onCompositionEnd"&&Nr&&(X=Vo()):(Ut=O,ba="value"in Ut?Ut.value:Ut.textContent,Nr=!0)),Z=as(E,te),0<Z.length&&(te=new Go(te,e,null,r,O),D.push({event:te,listeners:Z}),X?te.data=X:(X=Xo(r),X!==null&&(te.data=X)))),(X=Wd?Hd(e,r):Gd(e,r))&&(E=as(E,"onBeforeInput"),0<E.length&&(O=new Go("onBeforeInput","beforeinput",null,r,O),D.push({event:O,listeners:E}),O.data=X))}yi(D,t)})}function gn(e,t,r){return{instance:e,listener:t,currentTarget:r}}function as(e,t){for(var r=t+"Capture",n=[];e!==null;){var s=e,o=s.stateNode;s.tag===5&&o!==null&&(s=o,o=Yr(e,r),o!=null&&n.unshift(gn(e,o,s)),o=Yr(e,t),o!=null&&n.push(gn(e,o,s))),e=e.return}return n}function _r(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function wi(e,t,r,n,s){for(var o=t._reactName,c=[];r!==null&&r!==n;){var p=r,m=p.alternate,E=p.stateNode;if(m!==null&&m===n)break;p.tag===5&&E!==null&&(p=E,s?(m=Yr(r,o),m!=null&&c.unshift(gn(r,m,p))):s||(m=Yr(r,o),m!=null&&c.push(gn(r,m,p)))),r=r.return}c.length!==0&&e.push({event:t,listeners:c})}var lp=/\r\n?/g,op=/\u0000|\uFFFD/g;function bi(e){return(typeof e=="string"?e:""+e).replace(lp,`
`).replace(op,"")}function ls(e,t,r){if(t=bi(t),bi(e)!==t&&r)throw Error(i(425))}function os(){}var Ma=null,za=null;function Ba(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Ua=typeof setTimeout=="function"?setTimeout:void 0,ip=typeof clearTimeout=="function"?clearTimeout:void 0,ki=typeof Promise=="function"?Promise:void 0,up=typeof queueMicrotask=="function"?queueMicrotask:typeof ki<"u"?function(e){return ki.resolve(null).then(e).catch(cp)}:Ua;function cp(e){setTimeout(function(){throw e})}function $a(e,t){var r=t,n=0;do{var s=r.nextSibling;if(e.removeChild(r),s&&s.nodeType===8)if(r=s.data,r==="/$"){if(n===0){e.removeChild(s),an(t);return}n--}else r!=="$"&&r!=="$?"&&r!=="$!"||n++;r=s}while(r);an(t)}function Vt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function Si(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var r=e.data;if(r==="$"||r==="$!"||r==="$?"){if(t===0)return e;t--}else r==="/$"&&t++}e=e.previousSibling}return null}var Rr=Math.random().toString(36).slice(2),kt="__reactFiber$"+Rr,xn="__reactProps$"+Rr,_t="__reactContainer$"+Rr,Va="__reactEvents$"+Rr,dp="__reactListeners$"+Rr,pp="__reactHandles$"+Rr;function lr(e){var t=e[kt];if(t)return t;for(var r=e.parentNode;r;){if(t=r[_t]||r[kt]){if(r=t.alternate,t.child!==null||r!==null&&r.child!==null)for(e=Si(e);e!==null;){if(r=e[kt])return r;e=Si(e)}return t}e=r,r=e.parentNode}return null}function yn(e){return e=e[kt]||e[_t],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Tr(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(i(33))}function is(e){return e[xn]||null}var Wa=[],Lr=-1;function Wt(e){return{current:e}}function we(e){0>Lr||(e.current=Wa[Lr],Wa[Lr]=null,Lr--)}function ye(e,t){Lr++,Wa[Lr]=e.current,e.current=t}var Ht={},We=Wt(Ht),Ye=Wt(!1),or=Ht;function Pr(e,t){var r=e.type.contextTypes;if(!r)return Ht;var n=e.stateNode;if(n&&n.__reactInternalMemoizedUnmaskedChildContext===t)return n.__reactInternalMemoizedMaskedChildContext;var s={},o;for(o in r)s[o]=t[o];return n&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=s),s}function Ze(e){return e=e.childContextTypes,e!=null}function us(){we(Ye),we(We)}function ji(e,t,r){if(We.current!==Ht)throw Error(i(168));ye(We,t),ye(Ye,r)}function Ni(e,t,r){var n=e.stateNode;if(t=t.childContextTypes,typeof n.getChildContext!="function")return r;n=n.getChildContext();for(var s in n)if(!(s in t))throw Error(i(108,de(e)||"Unknown",s));return $({},r,n)}function cs(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Ht,or=We.current,ye(We,e),ye(Ye,Ye.current),!0}function Ei(e,t,r){var n=e.stateNode;if(!n)throw Error(i(169));r?(e=Ni(e,t,or),n.__reactInternalMemoizedMergedChildContext=e,we(Ye),we(We),ye(We,e)):we(Ye),ye(Ye,r)}var Rt=null,ds=!1,Ha=!1;function Ci(e){Rt===null?Rt=[e]:Rt.push(e)}function fp(e){ds=!0,Ci(e)}function Gt(){if(!Ha&&Rt!==null){Ha=!0;var e=0,t=fe;try{var r=Rt;for(fe=1;e<r.length;e++){var n=r[e];do n=n(!0);while(n!==null)}Rt=null,ds=!1}catch(s){throw Rt!==null&&(Rt=Rt.slice(e+1)),Ro(fa,Gt),s}finally{fe=t,Ha=!1}}return null}var Ar=[],Or=0,ps=null,fs=0,it=[],ut=0,ir=null,Tt=1,Lt="";function ur(e,t){Ar[Or++]=fs,Ar[Or++]=ps,ps=e,fs=t}function _i(e,t,r){it[ut++]=Tt,it[ut++]=Lt,it[ut++]=ir,ir=e;var n=Tt;e=Lt;var s=32-mt(n)-1;n&=~(1<<s),r+=1;var o=32-mt(t)+s;if(30<o){var c=s-s%5;o=(n&(1<<c)-1).toString(32),n>>=c,s-=c,Tt=1<<32-mt(t)+s|r<<s|n,Lt=o+e}else Tt=1<<o|r<<s|n,Lt=e}function Ga(e){e.return!==null&&(ur(e,1),_i(e,1,0))}function qa(e){for(;e===ps;)ps=Ar[--Or],Ar[Or]=null,fs=Ar[--Or],Ar[Or]=null;for(;e===ir;)ir=it[--ut],it[ut]=null,Lt=it[--ut],it[ut]=null,Tt=it[--ut],it[ut]=null}var st=null,at=null,be=!1,gt=null;function Ri(e,t){var r=ft(5,null,null,0);r.elementType="DELETED",r.stateNode=t,r.return=e,t=e.deletions,t===null?(e.deletions=[r],e.flags|=16):t.push(r)}function Ti(e,t){switch(e.tag){case 5:var r=e.type;return t=t.nodeType!==1||r.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,st=e,at=Vt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,st=e,at=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(r=ir!==null?{id:Tt,overflow:Lt}:null,e.memoizedState={dehydrated:t,treeContext:r,retryLane:1073741824},r=ft(18,null,null,0),r.stateNode=t,r.return=e,e.child=r,st=e,at=null,!0):!1;default:return!1}}function Qa(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Ka(e){if(be){var t=at;if(t){var r=t;if(!Ti(e,t)){if(Qa(e))throw Error(i(418));t=Vt(r.nextSibling);var n=st;t&&Ti(e,t)?Ri(n,r):(e.flags=e.flags&-4097|2,be=!1,st=e)}}else{if(Qa(e))throw Error(i(418));e.flags=e.flags&-4097|2,be=!1,st=e}}}function Li(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;st=e}function ms(e){if(e!==st)return!1;if(!be)return Li(e),be=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!Ba(e.type,e.memoizedProps)),t&&(t=at)){if(Qa(e))throw Pi(),Error(i(418));for(;t;)Ri(e,t),t=Vt(t.nextSibling)}if(Li(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(i(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var r=e.data;if(r==="/$"){if(t===0){at=Vt(e.nextSibling);break e}t--}else r!=="$"&&r!=="$!"&&r!=="$?"||t++}e=e.nextSibling}at=null}}else at=st?Vt(e.stateNode.nextSibling):null;return!0}function Pi(){for(var e=at;e;)e=Vt(e.nextSibling)}function Ir(){at=st=null,be=!1}function Ya(e){gt===null?gt=[e]:gt.push(e)}var mp=Q.ReactCurrentBatchConfig;function vn(e,t,r){if(e=r.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(r._owner){if(r=r._owner,r){if(r.tag!==1)throw Error(i(309));var n=r.stateNode}if(!n)throw Error(i(147,e));var s=n,o=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===o?t.ref:(t=function(c){var p=s.refs;c===null?delete p[o]:p[o]=c},t._stringRef=o,t)}if(typeof e!="string")throw Error(i(284));if(!r._owner)throw Error(i(290,e))}return e}function hs(e,t){throw e=Object.prototype.toString.call(t),Error(i(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Ai(e){var t=e._init;return t(e._payload)}function Oi(e){function t(k,g){if(e){var S=k.deletions;S===null?(k.deletions=[g],k.flags|=16):S.push(g)}}function r(k,g){if(!e)return null;for(;g!==null;)t(k,g),g=g.sibling;return null}function n(k,g){for(k=new Map;g!==null;)g.key!==null?k.set(g.key,g):k.set(g.index,g),g=g.sibling;return k}function s(k,g){return k=er(k,g),k.index=0,k.sibling=null,k}function o(k,g,S){return k.index=S,e?(S=k.alternate,S!==null?(S=S.index,S<g?(k.flags|=2,g):S):(k.flags|=2,g)):(k.flags|=1048576,g)}function c(k){return e&&k.alternate===null&&(k.flags|=2),k}function p(k,g,S,z){return g===null||g.tag!==6?(g=Ul(S,k.mode,z),g.return=k,g):(g=s(g,S),g.return=k,g)}function m(k,g,S,z){var K=S.type;return K===le?O(k,g,S.props.children,z,S.key):g!==null&&(g.elementType===K||typeof K=="object"&&K!==null&&K.$$typeof===_e&&Ai(K)===g.type)?(z=s(g,S.props),z.ref=vn(k,g,S),z.return=k,z):(z=zs(S.type,S.key,S.props,null,k.mode,z),z.ref=vn(k,g,S),z.return=k,z)}function E(k,g,S,z){return g===null||g.tag!==4||g.stateNode.containerInfo!==S.containerInfo||g.stateNode.implementation!==S.implementation?(g=$l(S,k.mode,z),g.return=k,g):(g=s(g,S.children||[]),g.return=k,g)}function O(k,g,S,z,K){return g===null||g.tag!==7?(g=xr(S,k.mode,z,K),g.return=k,g):(g=s(g,S),g.return=k,g)}function D(k,g,S){if(typeof g=="string"&&g!==""||typeof g=="number")return g=Ul(""+g,k.mode,S),g.return=k,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case ee:return S=zs(g.type,g.key,g.props,null,k.mode,S),S.ref=vn(k,null,g),S.return=k,S;case ue:return g=$l(g,k.mode,S),g.return=k,g;case _e:var z=g._init;return D(k,z(g._payload),S)}if(qr(g)||J(g))return g=xr(g,k.mode,S,null),g.return=k,g;hs(k,g)}return null}function A(k,g,S,z){var K=g!==null?g.key:null;if(typeof S=="string"&&S!==""||typeof S=="number")return K!==null?null:p(k,g,""+S,z);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case ee:return S.key===K?m(k,g,S,z):null;case ue:return S.key===K?E(k,g,S,z):null;case _e:return K=S._init,A(k,g,K(S._payload),z)}if(qr(S)||J(S))return K!==null?null:O(k,g,S,z,null);hs(k,S)}return null}function V(k,g,S,z,K){if(typeof z=="string"&&z!==""||typeof z=="number")return k=k.get(S)||null,p(g,k,""+z,K);if(typeof z=="object"&&z!==null){switch(z.$$typeof){case ee:return k=k.get(z.key===null?S:z.key)||null,m(g,k,z,K);case ue:return k=k.get(z.key===null?S:z.key)||null,E(g,k,z,K);case _e:var Z=z._init;return V(k,g,S,Z(z._payload),K)}if(qr(z)||J(z))return k=k.get(S)||null,O(g,k,z,K,null);hs(g,z)}return null}function H(k,g,S,z){for(var K=null,Z=null,X=g,te=g=0,ze=null;X!==null&&te<S.length;te++){X.index>te?(ze=X,X=null):ze=X.sibling;var ce=A(k,X,S[te],z);if(ce===null){X===null&&(X=ze);break}e&&X&&ce.alternate===null&&t(k,X),g=o(ce,g,te),Z===null?K=ce:Z.sibling=ce,Z=ce,X=ze}if(te===S.length)return r(k,X),be&&ur(k,te),K;if(X===null){for(;te<S.length;te++)X=D(k,S[te],z),X!==null&&(g=o(X,g,te),Z===null?K=X:Z.sibling=X,Z=X);return be&&ur(k,te),K}for(X=n(k,X);te<S.length;te++)ze=V(X,k,te,S[te],z),ze!==null&&(e&&ze.alternate!==null&&X.delete(ze.key===null?te:ze.key),g=o(ze,g,te),Z===null?K=ze:Z.sibling=ze,Z=ze);return e&&X.forEach(function(tr){return t(k,tr)}),be&&ur(k,te),K}function G(k,g,S,z){var K=J(S);if(typeof K!="function")throw Error(i(150));if(S=K.call(S),S==null)throw Error(i(151));for(var Z=K=null,X=g,te=g=0,ze=null,ce=S.next();X!==null&&!ce.done;te++,ce=S.next()){X.index>te?(ze=X,X=null):ze=X.sibling;var tr=A(k,X,ce.value,z);if(tr===null){X===null&&(X=ze);break}e&&X&&tr.alternate===null&&t(k,X),g=o(tr,g,te),Z===null?K=tr:Z.sibling=tr,Z=tr,X=ze}if(ce.done)return r(k,X),be&&ur(k,te),K;if(X===null){for(;!ce.done;te++,ce=S.next())ce=D(k,ce.value,z),ce!==null&&(g=o(ce,g,te),Z===null?K=ce:Z.sibling=ce,Z=ce);return be&&ur(k,te),K}for(X=n(k,X);!ce.done;te++,ce=S.next())ce=V(X,k,te,ce.value,z),ce!==null&&(e&&ce.alternate!==null&&X.delete(ce.key===null?te:ce.key),g=o(ce,g,te),Z===null?K=ce:Z.sibling=ce,Z=ce);return e&&X.forEach(function(qp){return t(k,qp)}),be&&ur(k,te),K}function Te(k,g,S,z){if(typeof S=="object"&&S!==null&&S.type===le&&S.key===null&&(S=S.props.children),typeof S=="object"&&S!==null){switch(S.$$typeof){case ee:e:{for(var K=S.key,Z=g;Z!==null;){if(Z.key===K){if(K=S.type,K===le){if(Z.tag===7){r(k,Z.sibling),g=s(Z,S.props.children),g.return=k,k=g;break e}}else if(Z.elementType===K||typeof K=="object"&&K!==null&&K.$$typeof===_e&&Ai(K)===Z.type){r(k,Z.sibling),g=s(Z,S.props),g.ref=vn(k,Z,S),g.return=k,k=g;break e}r(k,Z);break}else t(k,Z);Z=Z.sibling}S.type===le?(g=xr(S.props.children,k.mode,z,S.key),g.return=k,k=g):(z=zs(S.type,S.key,S.props,null,k.mode,z),z.ref=vn(k,g,S),z.return=k,k=z)}return c(k);case ue:e:{for(Z=S.key;g!==null;){if(g.key===Z)if(g.tag===4&&g.stateNode.containerInfo===S.containerInfo&&g.stateNode.implementation===S.implementation){r(k,g.sibling),g=s(g,S.children||[]),g.return=k,k=g;break e}else{r(k,g);break}else t(k,g);g=g.sibling}g=$l(S,k.mode,z),g.return=k,k=g}return c(k);case _e:return Z=S._init,Te(k,g,Z(S._payload),z)}if(qr(S))return H(k,g,S,z);if(J(S))return G(k,g,S,z);hs(k,S)}return typeof S=="string"&&S!==""||typeof S=="number"?(S=""+S,g!==null&&g.tag===6?(r(k,g.sibling),g=s(g,S),g.return=k,k=g):(r(k,g),g=Ul(S,k.mode,z),g.return=k,k=g),c(k)):r(k,g)}return Te}var Fr=Oi(!0),Ii=Oi(!1),gs=Wt(null),xs=null,Dr=null,Za=null;function Xa(){Za=Dr=xs=null}function Ja(e){var t=gs.current;we(gs),e._currentValue=t}function el(e,t,r){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===r)break;e=e.return}}function Mr(e,t){xs=e,Za=Dr=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(Xe=!0),e.firstContext=null)}function ct(e){var t=e._currentValue;if(Za!==e)if(e={context:e,memoizedValue:t,next:null},Dr===null){if(xs===null)throw Error(i(308));Dr=e,xs.dependencies={lanes:0,firstContext:e}}else Dr=Dr.next=e;return t}var cr=null;function tl(e){cr===null?cr=[e]:cr.push(e)}function Fi(e,t,r,n){var s=t.interleaved;return s===null?(r.next=r,tl(t)):(r.next=s.next,s.next=r),t.interleaved=r,Pt(e,n)}function Pt(e,t){e.lanes|=t;var r=e.alternate;for(r!==null&&(r.lanes|=t),r=e,e=e.return;e!==null;)e.childLanes|=t,r=e.alternate,r!==null&&(r.childLanes|=t),r=e,e=e.return;return r.tag===3?r.stateNode:null}var qt=!1;function rl(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Di(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function At(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function Qt(e,t,r){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(ie&2)!==0){var s=n.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),n.pending=t,Pt(e,r)}return s=n.interleaved,s===null?(t.next=t,tl(n)):(t.next=s.next,s.next=t),n.interleaved=t,Pt(e,r)}function ys(e,t,r){if(t=t.updateQueue,t!==null&&(t=t.shared,(r&4194240)!==0)){var n=t.lanes;n&=e.pendingLanes,r|=n,t.lanes=r,ga(e,r)}}function Mi(e,t){var r=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,r===n)){var s=null,o=null;if(r=r.firstBaseUpdate,r!==null){do{var c={eventTime:r.eventTime,lane:r.lane,tag:r.tag,payload:r.payload,callback:r.callback,next:null};o===null?s=o=c:o=o.next=c,r=r.next}while(r!==null);o===null?s=o=t:o=o.next=t}else s=o=t;r={baseState:n.baseState,firstBaseUpdate:s,lastBaseUpdate:o,shared:n.shared,effects:n.effects},e.updateQueue=r;return}e=r.lastBaseUpdate,e===null?r.firstBaseUpdate=t:e.next=t,r.lastBaseUpdate=t}function vs(e,t,r,n){var s=e.updateQueue;qt=!1;var o=s.firstBaseUpdate,c=s.lastBaseUpdate,p=s.shared.pending;if(p!==null){s.shared.pending=null;var m=p,E=m.next;m.next=null,c===null?o=E:c.next=E,c=m;var O=e.alternate;O!==null&&(O=O.updateQueue,p=O.lastBaseUpdate,p!==c&&(p===null?O.firstBaseUpdate=E:p.next=E,O.lastBaseUpdate=m))}if(o!==null){var D=s.baseState;c=0,O=E=m=null,p=o;do{var A=p.lane,V=p.eventTime;if((n&A)===A){O!==null&&(O=O.next={eventTime:V,lane:0,tag:p.tag,payload:p.payload,callback:p.callback,next:null});e:{var H=e,G=p;switch(A=t,V=r,G.tag){case 1:if(H=G.payload,typeof H=="function"){D=H.call(V,D,A);break e}D=H;break e;case 3:H.flags=H.flags&-65537|128;case 0:if(H=G.payload,A=typeof H=="function"?H.call(V,D,A):H,A==null)break e;D=$({},D,A);break e;case 2:qt=!0}}p.callback!==null&&p.lane!==0&&(e.flags|=64,A=s.effects,A===null?s.effects=[p]:A.push(p))}else V={eventTime:V,lane:A,tag:p.tag,payload:p.payload,callback:p.callback,next:null},O===null?(E=O=V,m=D):O=O.next=V,c|=A;if(p=p.next,p===null){if(p=s.shared.pending,p===null)break;A=p,p=A.next,A.next=null,s.lastBaseUpdate=A,s.shared.pending=null}}while(!0);if(O===null&&(m=D),s.baseState=m,s.firstBaseUpdate=E,s.lastBaseUpdate=O,t=s.shared.interleaved,t!==null){s=t;do c|=s.lane,s=s.next;while(s!==t)}else o===null&&(s.shared.lanes=0);fr|=c,e.lanes=c,e.memoizedState=D}}function zi(e,t,r){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var n=e[t],s=n.callback;if(s!==null){if(n.callback=null,n=r,typeof s!="function")throw Error(i(191,s));s.call(n)}}}var wn={},St=Wt(wn),bn=Wt(wn),kn=Wt(wn);function dr(e){if(e===wn)throw Error(i(174));return e}function nl(e,t){switch(ye(kn,t),ye(bn,e),ye(St,wn),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:sa(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=sa(t,e)}we(St),ye(St,t)}function zr(){we(St),we(bn),we(kn)}function Bi(e){dr(kn.current);var t=dr(St.current),r=sa(t,e.type);t!==r&&(ye(bn,e),ye(St,r))}function sl(e){bn.current===e&&(we(St),we(bn))}var Se=Wt(0);function ws(e){for(var t=e;t!==null;){if(t.tag===13){var r=t.memoizedState;if(r!==null&&(r=r.dehydrated,r===null||r.data==="$?"||r.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var al=[];function ll(){for(var e=0;e<al.length;e++)al[e]._workInProgressVersionPrimary=null;al.length=0}var bs=Q.ReactCurrentDispatcher,ol=Q.ReactCurrentBatchConfig,pr=0,je=null,Oe=null,De=null,ks=!1,Sn=!1,jn=0,hp=0;function He(){throw Error(i(321))}function il(e,t){if(t===null)return!1;for(var r=0;r<t.length&&r<e.length;r++)if(!ht(e[r],t[r]))return!1;return!0}function ul(e,t,r,n,s,o){if(pr=o,je=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,bs.current=e===null||e.memoizedState===null?vp:wp,e=r(n,s),Sn){o=0;do{if(Sn=!1,jn=0,25<=o)throw Error(i(301));o+=1,De=Oe=null,t.updateQueue=null,bs.current=bp,e=r(n,s)}while(Sn)}if(bs.current=Ns,t=Oe!==null&&Oe.next!==null,pr=0,De=Oe=je=null,ks=!1,t)throw Error(i(300));return e}function cl(){var e=jn!==0;return jn=0,e}function jt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return De===null?je.memoizedState=De=e:De=De.next=e,De}function dt(){if(Oe===null){var e=je.alternate;e=e!==null?e.memoizedState:null}else e=Oe.next;var t=De===null?je.memoizedState:De.next;if(t!==null)De=t,Oe=e;else{if(e===null)throw Error(i(310));Oe=e,e={memoizedState:Oe.memoizedState,baseState:Oe.baseState,baseQueue:Oe.baseQueue,queue:Oe.queue,next:null},De===null?je.memoizedState=De=e:De=De.next=e}return De}function Nn(e,t){return typeof t=="function"?t(e):t}function dl(e){var t=dt(),r=t.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=e;var n=Oe,s=n.baseQueue,o=r.pending;if(o!==null){if(s!==null){var c=s.next;s.next=o.next,o.next=c}n.baseQueue=s=o,r.pending=null}if(s!==null){o=s.next,n=n.baseState;var p=c=null,m=null,E=o;do{var O=E.lane;if((pr&O)===O)m!==null&&(m=m.next={lane:0,action:E.action,hasEagerState:E.hasEagerState,eagerState:E.eagerState,next:null}),n=E.hasEagerState?E.eagerState:e(n,E.action);else{var D={lane:O,action:E.action,hasEagerState:E.hasEagerState,eagerState:E.eagerState,next:null};m===null?(p=m=D,c=n):m=m.next=D,je.lanes|=O,fr|=O}E=E.next}while(E!==null&&E!==o);m===null?c=n:m.next=p,ht(n,t.memoizedState)||(Xe=!0),t.memoizedState=n,t.baseState=c,t.baseQueue=m,r.lastRenderedState=n}if(e=r.interleaved,e!==null){s=e;do o=s.lane,je.lanes|=o,fr|=o,s=s.next;while(s!==e)}else s===null&&(r.lanes=0);return[t.memoizedState,r.dispatch]}function pl(e){var t=dt(),r=t.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=e;var n=r.dispatch,s=r.pending,o=t.memoizedState;if(s!==null){r.pending=null;var c=s=s.next;do o=e(o,c.action),c=c.next;while(c!==s);ht(o,t.memoizedState)||(Xe=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),r.lastRenderedState=o}return[o,n]}function Ui(){}function $i(e,t){var r=je,n=dt(),s=t(),o=!ht(n.memoizedState,s);if(o&&(n.memoizedState=s,Xe=!0),n=n.queue,fl(Hi.bind(null,r,n,e),[e]),n.getSnapshot!==t||o||De!==null&&De.memoizedState.tag&1){if(r.flags|=2048,En(9,Wi.bind(null,r,n,s,t),void 0,null),Me===null)throw Error(i(349));(pr&30)!==0||Vi(r,t,s)}return s}function Vi(e,t,r){e.flags|=16384,e={getSnapshot:t,value:r},t=je.updateQueue,t===null?(t={lastEffect:null,stores:null},je.updateQueue=t,t.stores=[e]):(r=t.stores,r===null?t.stores=[e]:r.push(e))}function Wi(e,t,r,n){t.value=r,t.getSnapshot=n,Gi(t)&&qi(e)}function Hi(e,t,r){return r(function(){Gi(t)&&qi(e)})}function Gi(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!ht(e,r)}catch{return!0}}function qi(e){var t=Pt(e,1);t!==null&&wt(t,e,1,-1)}function Qi(e){var t=jt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Nn,lastRenderedState:e},t.queue=e,e=e.dispatch=yp.bind(null,je,e),[t.memoizedState,e]}function En(e,t,r,n){return e={tag:e,create:t,destroy:r,deps:n,next:null},t=je.updateQueue,t===null?(t={lastEffect:null,stores:null},je.updateQueue=t,t.lastEffect=e.next=e):(r=t.lastEffect,r===null?t.lastEffect=e.next=e:(n=r.next,r.next=e,e.next=n,t.lastEffect=e)),e}function Ki(){return dt().memoizedState}function Ss(e,t,r,n){var s=jt();je.flags|=e,s.memoizedState=En(1|t,r,void 0,n===void 0?null:n)}function js(e,t,r,n){var s=dt();n=n===void 0?null:n;var o=void 0;if(Oe!==null){var c=Oe.memoizedState;if(o=c.destroy,n!==null&&il(n,c.deps)){s.memoizedState=En(t,r,o,n);return}}je.flags|=e,s.memoizedState=En(1|t,r,o,n)}function Yi(e,t){return Ss(8390656,8,e,t)}function fl(e,t){return js(2048,8,e,t)}function Zi(e,t){return js(4,2,e,t)}function Xi(e,t){return js(4,4,e,t)}function Ji(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function eu(e,t,r){return r=r!=null?r.concat([e]):null,js(4,4,Ji.bind(null,t,e),r)}function ml(){}function tu(e,t){var r=dt();t=t===void 0?null:t;var n=r.memoizedState;return n!==null&&t!==null&&il(t,n[1])?n[0]:(r.memoizedState=[e,t],e)}function ru(e,t){var r=dt();t=t===void 0?null:t;var n=r.memoizedState;return n!==null&&t!==null&&il(t,n[1])?n[0]:(e=e(),r.memoizedState=[e,t],e)}function nu(e,t,r){return(pr&21)===0?(e.baseState&&(e.baseState=!1,Xe=!0),e.memoizedState=r):(ht(r,t)||(r=Ao(),je.lanes|=r,fr|=r,e.baseState=!0),t)}function gp(e,t){var r=fe;fe=r!==0&&4>r?r:4,e(!0);var n=ol.transition;ol.transition={};try{e(!1),t()}finally{fe=r,ol.transition=n}}function su(){return dt().memoizedState}function xp(e,t,r){var n=Xt(e);if(r={lane:n,action:r,hasEagerState:!1,eagerState:null,next:null},au(e))lu(t,r);else if(r=Fi(e,t,r,n),r!==null){var s=Ke();wt(r,e,n,s),ou(r,t,n)}}function yp(e,t,r){var n=Xt(e),s={lane:n,action:r,hasEagerState:!1,eagerState:null,next:null};if(au(e))lu(t,s);else{var o=e.alternate;if(e.lanes===0&&(o===null||o.lanes===0)&&(o=t.lastRenderedReducer,o!==null))try{var c=t.lastRenderedState,p=o(c,r);if(s.hasEagerState=!0,s.eagerState=p,ht(p,c)){var m=t.interleaved;m===null?(s.next=s,tl(t)):(s.next=m.next,m.next=s),t.interleaved=s;return}}catch{}finally{}r=Fi(e,t,s,n),r!==null&&(s=Ke(),wt(r,e,n,s),ou(r,t,n))}}function au(e){var t=e.alternate;return e===je||t!==null&&t===je}function lu(e,t){Sn=ks=!0;var r=e.pending;r===null?t.next=t:(t.next=r.next,r.next=t),e.pending=t}function ou(e,t,r){if((r&4194240)!==0){var n=t.lanes;n&=e.pendingLanes,r|=n,t.lanes=r,ga(e,r)}}var Ns={readContext:ct,useCallback:He,useContext:He,useEffect:He,useImperativeHandle:He,useInsertionEffect:He,useLayoutEffect:He,useMemo:He,useReducer:He,useRef:He,useState:He,useDebugValue:He,useDeferredValue:He,useTransition:He,useMutableSource:He,useSyncExternalStore:He,useId:He,unstable_isNewReconciler:!1},vp={readContext:ct,useCallback:function(e,t){return jt().memoizedState=[e,t===void 0?null:t],e},useContext:ct,useEffect:Yi,useImperativeHandle:function(e,t,r){return r=r!=null?r.concat([e]):null,Ss(4194308,4,Ji.bind(null,t,e),r)},useLayoutEffect:function(e,t){return Ss(4194308,4,e,t)},useInsertionEffect:function(e,t){return Ss(4,2,e,t)},useMemo:function(e,t){var r=jt();return t=t===void 0?null:t,e=e(),r.memoizedState=[e,t],e},useReducer:function(e,t,r){var n=jt();return t=r!==void 0?r(t):t,n.memoizedState=n.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},n.queue=e,e=e.dispatch=xp.bind(null,je,e),[n.memoizedState,e]},useRef:function(e){var t=jt();return e={current:e},t.memoizedState=e},useState:Qi,useDebugValue:ml,useDeferredValue:function(e){return jt().memoizedState=e},useTransition:function(){var e=Qi(!1),t=e[0];return e=gp.bind(null,e[1]),jt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,r){var n=je,s=jt();if(be){if(r===void 0)throw Error(i(407));r=r()}else{if(r=t(),Me===null)throw Error(i(349));(pr&30)!==0||Vi(n,t,r)}s.memoizedState=r;var o={value:r,getSnapshot:t};return s.queue=o,Yi(Hi.bind(null,n,o,e),[e]),n.flags|=2048,En(9,Wi.bind(null,n,o,r,t),void 0,null),r},useId:function(){var e=jt(),t=Me.identifierPrefix;if(be){var r=Lt,n=Tt;r=(n&~(1<<32-mt(n)-1)).toString(32)+r,t=":"+t+"R"+r,r=jn++,0<r&&(t+="H"+r.toString(32)),t+=":"}else r=hp++,t=":"+t+"r"+r.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},wp={readContext:ct,useCallback:tu,useContext:ct,useEffect:fl,useImperativeHandle:eu,useInsertionEffect:Zi,useLayoutEffect:Xi,useMemo:ru,useReducer:dl,useRef:Ki,useState:function(){return dl(Nn)},useDebugValue:ml,useDeferredValue:function(e){var t=dt();return nu(t,Oe.memoizedState,e)},useTransition:function(){var e=dl(Nn)[0],t=dt().memoizedState;return[e,t]},useMutableSource:Ui,useSyncExternalStore:$i,useId:su,unstable_isNewReconciler:!1},bp={readContext:ct,useCallback:tu,useContext:ct,useEffect:fl,useImperativeHandle:eu,useInsertionEffect:Zi,useLayoutEffect:Xi,useMemo:ru,useReducer:pl,useRef:Ki,useState:function(){return pl(Nn)},useDebugValue:ml,useDeferredValue:function(e){var t=dt();return Oe===null?t.memoizedState=e:nu(t,Oe.memoizedState,e)},useTransition:function(){var e=pl(Nn)[0],t=dt().memoizedState;return[e,t]},useMutableSource:Ui,useSyncExternalStore:$i,useId:su,unstable_isNewReconciler:!1};function xt(e,t){if(e&&e.defaultProps){t=$({},t),e=e.defaultProps;for(var r in e)t[r]===void 0&&(t[r]=e[r]);return t}return t}function hl(e,t,r,n){t=e.memoizedState,r=r(n,t),r=r==null?t:$({},t,r),e.memoizedState=r,e.lanes===0&&(e.updateQueue.baseState=r)}var Es={isMounted:function(e){return(e=e._reactInternals)?ar(e)===e:!1},enqueueSetState:function(e,t,r){e=e._reactInternals;var n=Ke(),s=Xt(e),o=At(n,s);o.payload=t,r!=null&&(o.callback=r),t=Qt(e,o,s),t!==null&&(wt(t,e,s,n),ys(t,e,s))},enqueueReplaceState:function(e,t,r){e=e._reactInternals;var n=Ke(),s=Xt(e),o=At(n,s);o.tag=1,o.payload=t,r!=null&&(o.callback=r),t=Qt(e,o,s),t!==null&&(wt(t,e,s,n),ys(t,e,s))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var r=Ke(),n=Xt(e),s=At(r,n);s.tag=2,t!=null&&(s.callback=t),t=Qt(e,s,n),t!==null&&(wt(t,e,n,r),ys(t,e,n))}};function iu(e,t,r,n,s,o,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,o,c):t.prototype&&t.prototype.isPureReactComponent?!pn(r,n)||!pn(s,o):!0}function uu(e,t,r){var n=!1,s=Ht,o=t.contextType;return typeof o=="object"&&o!==null?o=ct(o):(s=Ze(t)?or:We.current,n=t.contextTypes,o=(n=n!=null)?Pr(e,s):Ht),t=new t(r,o),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Es,e.stateNode=t,t._reactInternals=e,n&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=s,e.__reactInternalMemoizedMaskedChildContext=o),t}function cu(e,t,r,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(r,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(r,n),t.state!==e&&Es.enqueueReplaceState(t,t.state,null)}function gl(e,t,r,n){var s=e.stateNode;s.props=r,s.state=e.memoizedState,s.refs={},rl(e);var o=t.contextType;typeof o=="object"&&o!==null?s.context=ct(o):(o=Ze(t)?or:We.current,s.context=Pr(e,o)),s.state=e.memoizedState,o=t.getDerivedStateFromProps,typeof o=="function"&&(hl(e,t,o,r),s.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(t=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),t!==s.state&&Es.enqueueReplaceState(s,s.state,null),vs(e,r,s,n),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308)}function Br(e,t){try{var r="",n=t;do r+=oe(n),n=n.return;while(n);var s=r}catch(o){s=`
Error generating stack: `+o.message+`
`+o.stack}return{value:e,source:t,stack:s,digest:null}}function xl(e,t,r){return{value:e,source:null,stack:r??null,digest:t??null}}function yl(e,t){try{console.error(t.value)}catch(r){setTimeout(function(){throw r})}}var kp=typeof WeakMap=="function"?WeakMap:Map;function du(e,t,r){r=At(-1,r),r.tag=3,r.payload={element:null};var n=t.value;return r.callback=function(){As||(As=!0,Al=n),yl(e,t)},r}function pu(e,t,r){r=At(-1,r),r.tag=3;var n=e.type.getDerivedStateFromError;if(typeof n=="function"){var s=t.value;r.payload=function(){return n(s)},r.callback=function(){yl(e,t)}}var o=e.stateNode;return o!==null&&typeof o.componentDidCatch=="function"&&(r.callback=function(){yl(e,t),typeof n!="function"&&(Yt===null?Yt=new Set([this]):Yt.add(this));var c=t.stack;this.componentDidCatch(t.value,{componentStack:c!==null?c:""})}),r}function fu(e,t,r){var n=e.pingCache;if(n===null){n=e.pingCache=new kp;var s=new Set;n.set(t,s)}else s=n.get(t),s===void 0&&(s=new Set,n.set(t,s));s.has(r)||(s.add(r),e=Fp.bind(null,e,t,r),t.then(e,e))}function mu(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function hu(e,t,r,n,s){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,r.flags|=131072,r.flags&=-52805,r.tag===1&&(r.alternate===null?r.tag=17:(t=At(-1,1),t.tag=2,Qt(r,t,1))),r.lanes|=1),e):(e.flags|=65536,e.lanes=s,e)}var Sp=Q.ReactCurrentOwner,Xe=!1;function Qe(e,t,r,n){t.child=e===null?Ii(t,null,r,n):Fr(t,e.child,r,n)}function gu(e,t,r,n,s){r=r.render;var o=t.ref;return Mr(t,s),n=ul(e,t,r,n,o,s),r=cl(),e!==null&&!Xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~s,Ot(e,t,s)):(be&&r&&Ga(t),t.flags|=1,Qe(e,t,n,s),t.child)}function xu(e,t,r,n,s){if(e===null){var o=r.type;return typeof o=="function"&&!Bl(o)&&o.defaultProps===void 0&&r.compare===null&&r.defaultProps===void 0?(t.tag=15,t.type=o,yu(e,t,o,n,s)):(e=zs(r.type,null,n,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(o=e.child,(e.lanes&s)===0){var c=o.memoizedProps;if(r=r.compare,r=r!==null?r:pn,r(c,n)&&e.ref===t.ref)return Ot(e,t,s)}return t.flags|=1,e=er(o,n),e.ref=t.ref,e.return=t,t.child=e}function yu(e,t,r,n,s){if(e!==null){var o=e.memoizedProps;if(pn(o,n)&&e.ref===t.ref)if(Xe=!1,t.pendingProps=n=o,(e.lanes&s)!==0)(e.flags&131072)!==0&&(Xe=!0);else return t.lanes=e.lanes,Ot(e,t,s)}return vl(e,t,r,n,s)}function vu(e,t,r){var n=t.pendingProps,s=n.children,o=e!==null?e.memoizedState:null;if(n.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},ye($r,lt),lt|=r;else{if((r&1073741824)===0)return e=o!==null?o.baseLanes|r:r,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,ye($r,lt),lt|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},n=o!==null?o.baseLanes:r,ye($r,lt),lt|=n}else o!==null?(n=o.baseLanes|r,t.memoizedState=null):n=r,ye($r,lt),lt|=n;return Qe(e,t,s,r),t.child}function wu(e,t){var r=t.ref;(e===null&&r!==null||e!==null&&e.ref!==r)&&(t.flags|=512,t.flags|=2097152)}function vl(e,t,r,n,s){var o=Ze(r)?or:We.current;return o=Pr(t,o),Mr(t,s),r=ul(e,t,r,n,o,s),n=cl(),e!==null&&!Xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~s,Ot(e,t,s)):(be&&n&&Ga(t),t.flags|=1,Qe(e,t,r,s),t.child)}function bu(e,t,r,n,s){if(Ze(r)){var o=!0;cs(t)}else o=!1;if(Mr(t,s),t.stateNode===null)_s(e,t),uu(t,r,n),gl(t,r,n,s),n=!0;else if(e===null){var c=t.stateNode,p=t.memoizedProps;c.props=p;var m=c.context,E=r.contextType;typeof E=="object"&&E!==null?E=ct(E):(E=Ze(r)?or:We.current,E=Pr(t,E));var O=r.getDerivedStateFromProps,D=typeof O=="function"||typeof c.getSnapshotBeforeUpdate=="function";D||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(p!==n||m!==E)&&cu(t,c,n,E),qt=!1;var A=t.memoizedState;c.state=A,vs(t,n,c,s),m=t.memoizedState,p!==n||A!==m||Ye.current||qt?(typeof O=="function"&&(hl(t,r,O,n),m=t.memoizedState),(p=qt||iu(t,r,p,n,A,m,E))?(D||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount()),typeof c.componentDidMount=="function"&&(t.flags|=4194308)):(typeof c.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=m),c.props=n,c.state=m,c.context=E,n=p):(typeof c.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{c=t.stateNode,Di(e,t),p=t.memoizedProps,E=t.type===t.elementType?p:xt(t.type,p),c.props=E,D=t.pendingProps,A=c.context,m=r.contextType,typeof m=="object"&&m!==null?m=ct(m):(m=Ze(r)?or:We.current,m=Pr(t,m));var V=r.getDerivedStateFromProps;(O=typeof V=="function"||typeof c.getSnapshotBeforeUpdate=="function")||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(p!==D||A!==m)&&cu(t,c,n,m),qt=!1,A=t.memoizedState,c.state=A,vs(t,n,c,s);var H=t.memoizedState;p!==D||A!==H||Ye.current||qt?(typeof V=="function"&&(hl(t,r,V,n),H=t.memoizedState),(E=qt||iu(t,r,E,n,A,H,m)||!1)?(O||typeof c.UNSAFE_componentWillUpdate!="function"&&typeof c.componentWillUpdate!="function"||(typeof c.componentWillUpdate=="function"&&c.componentWillUpdate(n,H,m),typeof c.UNSAFE_componentWillUpdate=="function"&&c.UNSAFE_componentWillUpdate(n,H,m)),typeof c.componentDidUpdate=="function"&&(t.flags|=4),typeof c.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof c.componentDidUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=H),c.props=n,c.state=H,c.context=m,n=E):(typeof c.componentDidUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||p===e.memoizedProps&&A===e.memoizedState||(t.flags|=1024),n=!1)}return wl(e,t,r,n,o,s)}function wl(e,t,r,n,s,o){wu(e,t);var c=(t.flags&128)!==0;if(!n&&!c)return s&&Ei(t,r,!1),Ot(e,t,o);n=t.stateNode,Sp.current=t;var p=c&&typeof r.getDerivedStateFromError!="function"?null:n.render();return t.flags|=1,e!==null&&c?(t.child=Fr(t,e.child,null,o),t.child=Fr(t,null,p,o)):Qe(e,t,p,o),t.memoizedState=n.state,s&&Ei(t,r,!0),t.child}function ku(e){var t=e.stateNode;t.pendingContext?ji(e,t.pendingContext,t.pendingContext!==t.context):t.context&&ji(e,t.context,!1),nl(e,t.containerInfo)}function Su(e,t,r,n,s){return Ir(),Ya(s),t.flags|=256,Qe(e,t,r,n),t.child}var bl={dehydrated:null,treeContext:null,retryLane:0};function kl(e){return{baseLanes:e,cachePool:null,transitions:null}}function ju(e,t,r){var n=t.pendingProps,s=Se.current,o=!1,c=(t.flags&128)!==0,p;if((p=c)||(p=e!==null&&e.memoizedState===null?!1:(s&2)!==0),p?(o=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(s|=1),ye(Se,s&1),e===null)return Ka(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(c=n.children,e=n.fallback,o?(n=t.mode,o=t.child,c={mode:"hidden",children:c},(n&1)===0&&o!==null?(o.childLanes=0,o.pendingProps=c):o=Bs(c,n,0,null),e=xr(e,n,r,null),o.return=t,e.return=t,o.sibling=e,t.child=o,t.child.memoizedState=kl(r),t.memoizedState=bl,e):Sl(t,c));if(s=e.memoizedState,s!==null&&(p=s.dehydrated,p!==null))return jp(e,t,c,n,p,s,r);if(o){o=n.fallback,c=t.mode,s=e.child,p=s.sibling;var m={mode:"hidden",children:n.children};return(c&1)===0&&t.child!==s?(n=t.child,n.childLanes=0,n.pendingProps=m,t.deletions=null):(n=er(s,m),n.subtreeFlags=s.subtreeFlags&14680064),p!==null?o=er(p,o):(o=xr(o,c,r,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,n=o,o=t.child,c=e.child.memoizedState,c=c===null?kl(r):{baseLanes:c.baseLanes|r,cachePool:null,transitions:c.transitions},o.memoizedState=c,o.childLanes=e.childLanes&~r,t.memoizedState=bl,n}return o=e.child,e=o.sibling,n=er(o,{mode:"visible",children:n.children}),(t.mode&1)===0&&(n.lanes=r),n.return=t,n.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=n,t.memoizedState=null,n}function Sl(e,t){return t=Bs({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Cs(e,t,r,n){return n!==null&&Ya(n),Fr(t,e.child,null,r),e=Sl(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function jp(e,t,r,n,s,o,c){if(r)return t.flags&256?(t.flags&=-257,n=xl(Error(i(422))),Cs(e,t,c,n)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(o=n.fallback,s=t.mode,n=Bs({mode:"visible",children:n.children},s,0,null),o=xr(o,s,c,null),o.flags|=2,n.return=t,o.return=t,n.sibling=o,t.child=n,(t.mode&1)!==0&&Fr(t,e.child,null,c),t.child.memoizedState=kl(c),t.memoizedState=bl,o);if((t.mode&1)===0)return Cs(e,t,c,null);if(s.data==="$!"){if(n=s.nextSibling&&s.nextSibling.dataset,n)var p=n.dgst;return n=p,o=Error(i(419)),n=xl(o,n,void 0),Cs(e,t,c,n)}if(p=(c&e.childLanes)!==0,Xe||p){if(n=Me,n!==null){switch(c&-c){case 4:s=2;break;case 16:s=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:s=32;break;case 536870912:s=268435456;break;default:s=0}s=(s&(n.suspendedLanes|c))!==0?0:s,s!==0&&s!==o.retryLane&&(o.retryLane=s,Pt(e,s),wt(n,e,s,-1))}return zl(),n=xl(Error(i(421))),Cs(e,t,c,n)}return s.data==="$?"?(t.flags|=128,t.child=e.child,t=Dp.bind(null,e),s._reactRetry=t,null):(e=o.treeContext,at=Vt(s.nextSibling),st=t,be=!0,gt=null,e!==null&&(it[ut++]=Tt,it[ut++]=Lt,it[ut++]=ir,Tt=e.id,Lt=e.overflow,ir=t),t=Sl(t,n.children),t.flags|=4096,t)}function Nu(e,t,r){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),el(e.return,t,r)}function jl(e,t,r,n,s){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:r,tailMode:s}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=n,o.tail=r,o.tailMode=s)}function Eu(e,t,r){var n=t.pendingProps,s=n.revealOrder,o=n.tail;if(Qe(e,t,n.children,r),n=Se.current,(n&2)!==0)n=n&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Nu(e,r,t);else if(e.tag===19)Nu(e,r,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}n&=1}if(ye(Se,n),(t.mode&1)===0)t.memoizedState=null;else switch(s){case"forwards":for(r=t.child,s=null;r!==null;)e=r.alternate,e!==null&&ws(e)===null&&(s=r),r=r.sibling;r=s,r===null?(s=t.child,t.child=null):(s=r.sibling,r.sibling=null),jl(t,!1,s,r,o);break;case"backwards":for(r=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&ws(e)===null){t.child=s;break}e=s.sibling,s.sibling=r,r=s,s=e}jl(t,!0,r,null,o);break;case"together":jl(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function _s(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Ot(e,t,r){if(e!==null&&(t.dependencies=e.dependencies),fr|=t.lanes,(r&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,r=er(e,e.pendingProps),t.child=r,r.return=t;e.sibling!==null;)e=e.sibling,r=r.sibling=er(e,e.pendingProps),r.return=t;r.sibling=null}return t.child}function Np(e,t,r){switch(t.tag){case 3:ku(t),Ir();break;case 5:Bi(t);break;case 1:Ze(t.type)&&cs(t);break;case 4:nl(t,t.stateNode.containerInfo);break;case 10:var n=t.type._context,s=t.memoizedProps.value;ye(gs,n._currentValue),n._currentValue=s;break;case 13:if(n=t.memoizedState,n!==null)return n.dehydrated!==null?(ye(Se,Se.current&1),t.flags|=128,null):(r&t.child.childLanes)!==0?ju(e,t,r):(ye(Se,Se.current&1),e=Ot(e,t,r),e!==null?e.sibling:null);ye(Se,Se.current&1);break;case 19:if(n=(r&t.childLanes)!==0,(e.flags&128)!==0){if(n)return Eu(e,t,r);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),ye(Se,Se.current),n)break;return null;case 22:case 23:return t.lanes=0,vu(e,t,r)}return Ot(e,t,r)}var Cu,Nl,_u,Ru;Cu=function(e,t){for(var r=t.child;r!==null;){if(r.tag===5||r.tag===6)e.appendChild(r.stateNode);else if(r.tag!==4&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break;for(;r.sibling===null;){if(r.return===null||r.return===t)return;r=r.return}r.sibling.return=r.return,r=r.sibling}},Nl=function(){},_u=function(e,t,r,n){var s=e.memoizedProps;if(s!==n){e=t.stateNode,dr(St.current);var o=null;switch(r){case"input":s=ea(e,s),n=ea(e,n),o=[];break;case"select":s=$({},s,{value:void 0}),n=$({},n,{value:void 0}),o=[];break;case"textarea":s=na(e,s),n=na(e,n),o=[];break;default:typeof s.onClick!="function"&&typeof n.onClick=="function"&&(e.onclick=os)}aa(r,n);var c;r=null;for(E in s)if(!n.hasOwnProperty(E)&&s.hasOwnProperty(E)&&s[E]!=null)if(E==="style"){var p=s[E];for(c in p)p.hasOwnProperty(c)&&(r||(r={}),r[c]="")}else E!=="dangerouslySetInnerHTML"&&E!=="children"&&E!=="suppressContentEditableWarning"&&E!=="suppressHydrationWarning"&&E!=="autoFocus"&&(f.hasOwnProperty(E)?o||(o=[]):(o=o||[]).push(E,null));for(E in n){var m=n[E];if(p=s!=null?s[E]:void 0,n.hasOwnProperty(E)&&m!==p&&(m!=null||p!=null))if(E==="style")if(p){for(c in p)!p.hasOwnProperty(c)||m&&m.hasOwnProperty(c)||(r||(r={}),r[c]="");for(c in m)m.hasOwnProperty(c)&&p[c]!==m[c]&&(r||(r={}),r[c]=m[c])}else r||(o||(o=[]),o.push(E,r)),r=m;else E==="dangerouslySetInnerHTML"?(m=m?m.__html:void 0,p=p?p.__html:void 0,m!=null&&p!==m&&(o=o||[]).push(E,m)):E==="children"?typeof m!="string"&&typeof m!="number"||(o=o||[]).push(E,""+m):E!=="suppressContentEditableWarning"&&E!=="suppressHydrationWarning"&&(f.hasOwnProperty(E)?(m!=null&&E==="onScroll"&&ve("scroll",e),o||p===m||(o=[])):(o=o||[]).push(E,m))}r&&(o=o||[]).push("style",r);var E=o;(t.updateQueue=E)&&(t.flags|=4)}},Ru=function(e,t,r,n){r!==n&&(t.flags|=4)};function Cn(e,t){if(!be)switch(e.tailMode){case"hidden":t=e.tail;for(var r=null;t!==null;)t.alternate!==null&&(r=t),t=t.sibling;r===null?e.tail=null:r.sibling=null;break;case"collapsed":r=e.tail;for(var n=null;r!==null;)r.alternate!==null&&(n=r),r=r.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null}}function Ge(e){var t=e.alternate!==null&&e.alternate.child===e.child,r=0,n=0;if(t)for(var s=e.child;s!==null;)r|=s.lanes|s.childLanes,n|=s.subtreeFlags&14680064,n|=s.flags&14680064,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)r|=s.lanes|s.childLanes,n|=s.subtreeFlags,n|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=n,e.childLanes=r,t}function Ep(e,t,r){var n=t.pendingProps;switch(qa(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ge(t),null;case 1:return Ze(t.type)&&us(),Ge(t),null;case 3:return n=t.stateNode,zr(),we(Ye),we(We),ll(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(ms(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,gt!==null&&(Fl(gt),gt=null))),Nl(e,t),Ge(t),null;case 5:sl(t);var s=dr(kn.current);if(r=t.type,e!==null&&t.stateNode!=null)_u(e,t,r,n,s),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!n){if(t.stateNode===null)throw Error(i(166));return Ge(t),null}if(e=dr(St.current),ms(t)){n=t.stateNode,r=t.type;var o=t.memoizedProps;switch(n[kt]=t,n[xn]=o,e=(t.mode&1)!==0,r){case"dialog":ve("cancel",n),ve("close",n);break;case"iframe":case"object":case"embed":ve("load",n);break;case"video":case"audio":for(s=0;s<mn.length;s++)ve(mn[s],n);break;case"source":ve("error",n);break;case"img":case"image":case"link":ve("error",n),ve("load",n);break;case"details":ve("toggle",n);break;case"input":io(n,o),ve("invalid",n);break;case"select":n._wrapperState={wasMultiple:!!o.multiple},ve("invalid",n);break;case"textarea":po(n,o),ve("invalid",n)}aa(r,o),s=null;for(var c in o)if(o.hasOwnProperty(c)){var p=o[c];c==="children"?typeof p=="string"?n.textContent!==p&&(o.suppressHydrationWarning!==!0&&ls(n.textContent,p,e),s=["children",p]):typeof p=="number"&&n.textContent!==""+p&&(o.suppressHydrationWarning!==!0&&ls(n.textContent,p,e),s=["children",""+p]):f.hasOwnProperty(c)&&p!=null&&c==="onScroll"&&ve("scroll",n)}switch(r){case"input":Dn(n),co(n,o,!0);break;case"textarea":Dn(n),mo(n);break;case"select":case"option":break;default:typeof o.onClick=="function"&&(n.onclick=os)}n=s,t.updateQueue=n,n!==null&&(t.flags|=4)}else{c=s.nodeType===9?s:s.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=ho(r)),e==="http://www.w3.org/1999/xhtml"?r==="script"?(e=c.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof n.is=="string"?e=c.createElement(r,{is:n.is}):(e=c.createElement(r),r==="select"&&(c=e,n.multiple?c.multiple=!0:n.size&&(c.size=n.size))):e=c.createElementNS(e,r),e[kt]=t,e[xn]=n,Cu(e,t,!1,!1),t.stateNode=e;e:{switch(c=la(r,n),r){case"dialog":ve("cancel",e),ve("close",e),s=n;break;case"iframe":case"object":case"embed":ve("load",e),s=n;break;case"video":case"audio":for(s=0;s<mn.length;s++)ve(mn[s],e);s=n;break;case"source":ve("error",e),s=n;break;case"img":case"image":case"link":ve("error",e),ve("load",e),s=n;break;case"details":ve("toggle",e),s=n;break;case"input":io(e,n),s=ea(e,n),ve("invalid",e);break;case"option":s=n;break;case"select":e._wrapperState={wasMultiple:!!n.multiple},s=$({},n,{value:void 0}),ve("invalid",e);break;case"textarea":po(e,n),s=na(e,n),ve("invalid",e);break;default:s=n}aa(r,s),p=s;for(o in p)if(p.hasOwnProperty(o)){var m=p[o];o==="style"?yo(e,m):o==="dangerouslySetInnerHTML"?(m=m?m.__html:void 0,m!=null&&go(e,m)):o==="children"?typeof m=="string"?(r!=="textarea"||m!=="")&&Qr(e,m):typeof m=="number"&&Qr(e,""+m):o!=="suppressContentEditableWarning"&&o!=="suppressHydrationWarning"&&o!=="autoFocus"&&(f.hasOwnProperty(o)?m!=null&&o==="onScroll"&&ve("scroll",e):m!=null&&F(e,o,m,c))}switch(r){case"input":Dn(e),co(e,n,!1);break;case"textarea":Dn(e),mo(e);break;case"option":n.value!=null&&e.setAttribute("value",""+pe(n.value));break;case"select":e.multiple=!!n.multiple,o=n.value,o!=null?wr(e,!!n.multiple,o,!1):n.defaultValue!=null&&wr(e,!!n.multiple,n.defaultValue,!0);break;default:typeof s.onClick=="function"&&(e.onclick=os)}switch(r){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}}n&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return Ge(t),null;case 6:if(e&&t.stateNode!=null)Ru(e,t,e.memoizedProps,n);else{if(typeof n!="string"&&t.stateNode===null)throw Error(i(166));if(r=dr(kn.current),dr(St.current),ms(t)){if(n=t.stateNode,r=t.memoizedProps,n[kt]=t,(o=n.nodeValue!==r)&&(e=st,e!==null))switch(e.tag){case 3:ls(n.nodeValue,r,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&ls(n.nodeValue,r,(e.mode&1)!==0)}o&&(t.flags|=4)}else n=(r.nodeType===9?r:r.ownerDocument).createTextNode(n),n[kt]=t,t.stateNode=n}return Ge(t),null;case 13:if(we(Se),n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(be&&at!==null&&(t.mode&1)!==0&&(t.flags&128)===0)Pi(),Ir(),t.flags|=98560,o=!1;else if(o=ms(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(i(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(i(317));o[kt]=t}else Ir(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ge(t),o=!1}else gt!==null&&(Fl(gt),gt=null),o=!0;if(!o)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=r,t):(n=n!==null,n!==(e!==null&&e.memoizedState!==null)&&n&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Se.current&1)!==0?Ie===0&&(Ie=3):zl())),t.updateQueue!==null&&(t.flags|=4),Ge(t),null);case 4:return zr(),Nl(e,t),e===null&&hn(t.stateNode.containerInfo),Ge(t),null;case 10:return Ja(t.type._context),Ge(t),null;case 17:return Ze(t.type)&&us(),Ge(t),null;case 19:if(we(Se),o=t.memoizedState,o===null)return Ge(t),null;if(n=(t.flags&128)!==0,c=o.rendering,c===null)if(n)Cn(o,!1);else{if(Ie!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(c=ws(e),c!==null){for(t.flags|=128,Cn(o,!1),n=c.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),t.subtreeFlags=0,n=r,r=t.child;r!==null;)o=r,e=n,o.flags&=14680066,c=o.alternate,c===null?(o.childLanes=0,o.lanes=e,o.child=null,o.subtreeFlags=0,o.memoizedProps=null,o.memoizedState=null,o.updateQueue=null,o.dependencies=null,o.stateNode=null):(o.childLanes=c.childLanes,o.lanes=c.lanes,o.child=c.child,o.subtreeFlags=0,o.deletions=null,o.memoizedProps=c.memoizedProps,o.memoizedState=c.memoizedState,o.updateQueue=c.updateQueue,o.type=c.type,e=c.dependencies,o.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),r=r.sibling;return ye(Se,Se.current&1|2),t.child}e=e.sibling}o.tail!==null&&Re()>Vr&&(t.flags|=128,n=!0,Cn(o,!1),t.lanes=4194304)}else{if(!n)if(e=ws(c),e!==null){if(t.flags|=128,n=!0,r=e.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),Cn(o,!0),o.tail===null&&o.tailMode==="hidden"&&!c.alternate&&!be)return Ge(t),null}else 2*Re()-o.renderingStartTime>Vr&&r!==1073741824&&(t.flags|=128,n=!0,Cn(o,!1),t.lanes=4194304);o.isBackwards?(c.sibling=t.child,t.child=c):(r=o.last,r!==null?r.sibling=c:t.child=c,o.last=c)}return o.tail!==null?(t=o.tail,o.rendering=t,o.tail=t.sibling,o.renderingStartTime=Re(),t.sibling=null,r=Se.current,ye(Se,n?r&1|2:r&1),t):(Ge(t),null);case 22:case 23:return Ml(),n=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==n&&(t.flags|=8192),n&&(t.mode&1)!==0?(lt&1073741824)!==0&&(Ge(t),t.subtreeFlags&6&&(t.flags|=8192)):Ge(t),null;case 24:return null;case 25:return null}throw Error(i(156,t.tag))}function Cp(e,t){switch(qa(t),t.tag){case 1:return Ze(t.type)&&us(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return zr(),we(Ye),we(We),ll(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return sl(t),null;case 13:if(we(Se),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Ir()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return we(Se),null;case 4:return zr(),null;case 10:return Ja(t.type._context),null;case 22:case 23:return Ml(),null;case 24:return null;default:return null}}var Rs=!1,qe=!1,_p=typeof WeakSet=="function"?WeakSet:Set,W=null;function Ur(e,t){var r=e.ref;if(r!==null)if(typeof r=="function")try{r(null)}catch(n){Ne(e,t,n)}else r.current=null}function El(e,t,r){try{r()}catch(n){Ne(e,t,n)}}var Tu=!1;function Rp(e,t){if(Ma=Kn,e=ii(),Ta(e)){if("selectionStart"in e)var r={start:e.selectionStart,end:e.selectionEnd};else e:{r=(r=e.ownerDocument)&&r.defaultView||window;var n=r.getSelection&&r.getSelection();if(n&&n.rangeCount!==0){r=n.anchorNode;var s=n.anchorOffset,o=n.focusNode;n=n.focusOffset;try{r.nodeType,o.nodeType}catch{r=null;break e}var c=0,p=-1,m=-1,E=0,O=0,D=e,A=null;t:for(;;){for(var V;D!==r||s!==0&&D.nodeType!==3||(p=c+s),D!==o||n!==0&&D.nodeType!==3||(m=c+n),D.nodeType===3&&(c+=D.nodeValue.length),(V=D.firstChild)!==null;)A=D,D=V;for(;;){if(D===e)break t;if(A===r&&++E===s&&(p=c),A===o&&++O===n&&(m=c),(V=D.nextSibling)!==null)break;D=A,A=D.parentNode}D=V}r=p===-1||m===-1?null:{start:p,end:m}}else r=null}r=r||{start:0,end:0}}else r=null;for(za={focusedElem:e,selectionRange:r},Kn=!1,W=t;W!==null;)if(t=W,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,W=e;else for(;W!==null;){t=W;try{var H=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(H!==null){var G=H.memoizedProps,Te=H.memoizedState,k=t.stateNode,g=k.getSnapshotBeforeUpdate(t.elementType===t.type?G:xt(t.type,G),Te);k.__reactInternalSnapshotBeforeUpdate=g}break;case 3:var S=t.stateNode.containerInfo;S.nodeType===1?S.textContent="":S.nodeType===9&&S.documentElement&&S.removeChild(S.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(i(163))}}catch(z){Ne(t,t.return,z)}if(e=t.sibling,e!==null){e.return=t.return,W=e;break}W=t.return}return H=Tu,Tu=!1,H}function _n(e,t,r){var n=t.updateQueue;if(n=n!==null?n.lastEffect:null,n!==null){var s=n=n.next;do{if((s.tag&e)===e){var o=s.destroy;s.destroy=void 0,o!==void 0&&El(t,r,o)}s=s.next}while(s!==n)}}function Ts(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var r=t=t.next;do{if((r.tag&e)===e){var n=r.create;r.destroy=n()}r=r.next}while(r!==t)}}function Cl(e){var t=e.ref;if(t!==null){var r=e.stateNode;switch(e.tag){case 5:e=r;break;default:e=r}typeof t=="function"?t(e):t.current=e}}function Lu(e){var t=e.alternate;t!==null&&(e.alternate=null,Lu(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[kt],delete t[xn],delete t[Va],delete t[dp],delete t[pp])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Pu(e){return e.tag===5||e.tag===3||e.tag===4}function Au(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Pu(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function _l(e,t,r){var n=e.tag;if(n===5||n===6)e=e.stateNode,t?r.nodeType===8?r.parentNode.insertBefore(e,t):r.insertBefore(e,t):(r.nodeType===8?(t=r.parentNode,t.insertBefore(e,r)):(t=r,t.appendChild(e)),r=r._reactRootContainer,r!=null||t.onclick!==null||(t.onclick=os));else if(n!==4&&(e=e.child,e!==null))for(_l(e,t,r),e=e.sibling;e!==null;)_l(e,t,r),e=e.sibling}function Rl(e,t,r){var n=e.tag;if(n===5||n===6)e=e.stateNode,t?r.insertBefore(e,t):r.appendChild(e);else if(n!==4&&(e=e.child,e!==null))for(Rl(e,t,r),e=e.sibling;e!==null;)Rl(e,t,r),e=e.sibling}var Ue=null,yt=!1;function Kt(e,t,r){for(r=r.child;r!==null;)Ou(e,t,r),r=r.sibling}function Ou(e,t,r){if(bt&&typeof bt.onCommitFiberUnmount=="function")try{bt.onCommitFiberUnmount(Vn,r)}catch{}switch(r.tag){case 5:qe||Ur(r,t);case 6:var n=Ue,s=yt;Ue=null,Kt(e,t,r),Ue=n,yt=s,Ue!==null&&(yt?(e=Ue,r=r.stateNode,e.nodeType===8?e.parentNode.removeChild(r):e.removeChild(r)):Ue.removeChild(r.stateNode));break;case 18:Ue!==null&&(yt?(e=Ue,r=r.stateNode,e.nodeType===8?$a(e.parentNode,r):e.nodeType===1&&$a(e,r),an(e)):$a(Ue,r.stateNode));break;case 4:n=Ue,s=yt,Ue=r.stateNode.containerInfo,yt=!0,Kt(e,t,r),Ue=n,yt=s;break;case 0:case 11:case 14:case 15:if(!qe&&(n=r.updateQueue,n!==null&&(n=n.lastEffect,n!==null))){s=n=n.next;do{var o=s,c=o.destroy;o=o.tag,c!==void 0&&((o&2)!==0||(o&4)!==0)&&El(r,t,c),s=s.next}while(s!==n)}Kt(e,t,r);break;case 1:if(!qe&&(Ur(r,t),n=r.stateNode,typeof n.componentWillUnmount=="function"))try{n.props=r.memoizedProps,n.state=r.memoizedState,n.componentWillUnmount()}catch(p){Ne(r,t,p)}Kt(e,t,r);break;case 21:Kt(e,t,r);break;case 22:r.mode&1?(qe=(n=qe)||r.memoizedState!==null,Kt(e,t,r),qe=n):Kt(e,t,r);break;default:Kt(e,t,r)}}function Iu(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var r=e.stateNode;r===null&&(r=e.stateNode=new _p),t.forEach(function(n){var s=Mp.bind(null,e,n);r.has(n)||(r.add(n),n.then(s,s))})}}function vt(e,t){var r=t.deletions;if(r!==null)for(var n=0;n<r.length;n++){var s=r[n];try{var o=e,c=t,p=c;e:for(;p!==null;){switch(p.tag){case 5:Ue=p.stateNode,yt=!1;break e;case 3:Ue=p.stateNode.containerInfo,yt=!0;break e;case 4:Ue=p.stateNode.containerInfo,yt=!0;break e}p=p.return}if(Ue===null)throw Error(i(160));Ou(o,c,s),Ue=null,yt=!1;var m=s.alternate;m!==null&&(m.return=null),s.return=null}catch(E){Ne(s,t,E)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Fu(t,e),t=t.sibling}function Fu(e,t){var r=e.alternate,n=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(vt(t,e),Nt(e),n&4){try{_n(3,e,e.return),Ts(3,e)}catch(G){Ne(e,e.return,G)}try{_n(5,e,e.return)}catch(G){Ne(e,e.return,G)}}break;case 1:vt(t,e),Nt(e),n&512&&r!==null&&Ur(r,r.return);break;case 5:if(vt(t,e),Nt(e),n&512&&r!==null&&Ur(r,r.return),e.flags&32){var s=e.stateNode;try{Qr(s,"")}catch(G){Ne(e,e.return,G)}}if(n&4&&(s=e.stateNode,s!=null)){var o=e.memoizedProps,c=r!==null?r.memoizedProps:o,p=e.type,m=e.updateQueue;if(e.updateQueue=null,m!==null)try{p==="input"&&o.type==="radio"&&o.name!=null&&uo(s,o),la(p,c);var E=la(p,o);for(c=0;c<m.length;c+=2){var O=m[c],D=m[c+1];O==="style"?yo(s,D):O==="dangerouslySetInnerHTML"?go(s,D):O==="children"?Qr(s,D):F(s,O,D,E)}switch(p){case"input":ta(s,o);break;case"textarea":fo(s,o);break;case"select":var A=s._wrapperState.wasMultiple;s._wrapperState.wasMultiple=!!o.multiple;var V=o.value;V!=null?wr(s,!!o.multiple,V,!1):A!==!!o.multiple&&(o.defaultValue!=null?wr(s,!!o.multiple,o.defaultValue,!0):wr(s,!!o.multiple,o.multiple?[]:"",!1))}s[xn]=o}catch(G){Ne(e,e.return,G)}}break;case 6:if(vt(t,e),Nt(e),n&4){if(e.stateNode===null)throw Error(i(162));s=e.stateNode,o=e.memoizedProps;try{s.nodeValue=o}catch(G){Ne(e,e.return,G)}}break;case 3:if(vt(t,e),Nt(e),n&4&&r!==null&&r.memoizedState.isDehydrated)try{an(t.containerInfo)}catch(G){Ne(e,e.return,G)}break;case 4:vt(t,e),Nt(e);break;case 13:vt(t,e),Nt(e),s=e.child,s.flags&8192&&(o=s.memoizedState!==null,s.stateNode.isHidden=o,!o||s.alternate!==null&&s.alternate.memoizedState!==null||(Pl=Re())),n&4&&Iu(e);break;case 22:if(O=r!==null&&r.memoizedState!==null,e.mode&1?(qe=(E=qe)||O,vt(t,e),qe=E):vt(t,e),Nt(e),n&8192){if(E=e.memoizedState!==null,(e.stateNode.isHidden=E)&&!O&&(e.mode&1)!==0)for(W=e,O=e.child;O!==null;){for(D=W=O;W!==null;){switch(A=W,V=A.child,A.tag){case 0:case 11:case 14:case 15:_n(4,A,A.return);break;case 1:Ur(A,A.return);var H=A.stateNode;if(typeof H.componentWillUnmount=="function"){n=A,r=A.return;try{t=n,H.props=t.memoizedProps,H.state=t.memoizedState,H.componentWillUnmount()}catch(G){Ne(n,r,G)}}break;case 5:Ur(A,A.return);break;case 22:if(A.memoizedState!==null){zu(D);continue}}V!==null?(V.return=A,W=V):zu(D)}O=O.sibling}e:for(O=null,D=e;;){if(D.tag===5){if(O===null){O=D;try{s=D.stateNode,E?(o=s.style,typeof o.setProperty=="function"?o.setProperty("display","none","important"):o.display="none"):(p=D.stateNode,m=D.memoizedProps.style,c=m!=null&&m.hasOwnProperty("display")?m.display:null,p.style.display=xo("display",c))}catch(G){Ne(e,e.return,G)}}}else if(D.tag===6){if(O===null)try{D.stateNode.nodeValue=E?"":D.memoizedProps}catch(G){Ne(e,e.return,G)}}else if((D.tag!==22&&D.tag!==23||D.memoizedState===null||D===e)&&D.child!==null){D.child.return=D,D=D.child;continue}if(D===e)break e;for(;D.sibling===null;){if(D.return===null||D.return===e)break e;O===D&&(O=null),D=D.return}O===D&&(O=null),D.sibling.return=D.return,D=D.sibling}}break;case 19:vt(t,e),Nt(e),n&4&&Iu(e);break;case 21:break;default:vt(t,e),Nt(e)}}function Nt(e){var t=e.flags;if(t&2){try{e:{for(var r=e.return;r!==null;){if(Pu(r)){var n=r;break e}r=r.return}throw Error(i(160))}switch(n.tag){case 5:var s=n.stateNode;n.flags&32&&(Qr(s,""),n.flags&=-33);var o=Au(e);Rl(e,o,s);break;case 3:case 4:var c=n.stateNode.containerInfo,p=Au(e);_l(e,p,c);break;default:throw Error(i(161))}}catch(m){Ne(e,e.return,m)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Tp(e,t,r){W=e,Du(e)}function Du(e,t,r){for(var n=(e.mode&1)!==0;W!==null;){var s=W,o=s.child;if(s.tag===22&&n){var c=s.memoizedState!==null||Rs;if(!c){var p=s.alternate,m=p!==null&&p.memoizedState!==null||qe;p=Rs;var E=qe;if(Rs=c,(qe=m)&&!E)for(W=s;W!==null;)c=W,m=c.child,c.tag===22&&c.memoizedState!==null?Bu(s):m!==null?(m.return=c,W=m):Bu(s);for(;o!==null;)W=o,Du(o),o=o.sibling;W=s,Rs=p,qe=E}Mu(e)}else(s.subtreeFlags&8772)!==0&&o!==null?(o.return=s,W=o):Mu(e)}}function Mu(e){for(;W!==null;){var t=W;if((t.flags&8772)!==0){var r=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:qe||Ts(5,t);break;case 1:var n=t.stateNode;if(t.flags&4&&!qe)if(r===null)n.componentDidMount();else{var s=t.elementType===t.type?r.memoizedProps:xt(t.type,r.memoizedProps);n.componentDidUpdate(s,r.memoizedState,n.__reactInternalSnapshotBeforeUpdate)}var o=t.updateQueue;o!==null&&zi(t,o,n);break;case 3:var c=t.updateQueue;if(c!==null){if(r=null,t.child!==null)switch(t.child.tag){case 5:r=t.child.stateNode;break;case 1:r=t.child.stateNode}zi(t,c,r)}break;case 5:var p=t.stateNode;if(r===null&&t.flags&4){r=p;var m=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":m.autoFocus&&r.focus();break;case"img":m.src&&(r.src=m.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var E=t.alternate;if(E!==null){var O=E.memoizedState;if(O!==null){var D=O.dehydrated;D!==null&&an(D)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(i(163))}qe||t.flags&512&&Cl(t)}catch(A){Ne(t,t.return,A)}}if(t===e){W=null;break}if(r=t.sibling,r!==null){r.return=t.return,W=r;break}W=t.return}}function zu(e){for(;W!==null;){var t=W;if(t===e){W=null;break}var r=t.sibling;if(r!==null){r.return=t.return,W=r;break}W=t.return}}function Bu(e){for(;W!==null;){var t=W;try{switch(t.tag){case 0:case 11:case 15:var r=t.return;try{Ts(4,t)}catch(m){Ne(t,r,m)}break;case 1:var n=t.stateNode;if(typeof n.componentDidMount=="function"){var s=t.return;try{n.componentDidMount()}catch(m){Ne(t,s,m)}}var o=t.return;try{Cl(t)}catch(m){Ne(t,o,m)}break;case 5:var c=t.return;try{Cl(t)}catch(m){Ne(t,c,m)}}}catch(m){Ne(t,t.return,m)}if(t===e){W=null;break}var p=t.sibling;if(p!==null){p.return=t.return,W=p;break}W=t.return}}var Lp=Math.ceil,Ls=Q.ReactCurrentDispatcher,Tl=Q.ReactCurrentOwner,pt=Q.ReactCurrentBatchConfig,ie=0,Me=null,Pe=null,$e=0,lt=0,$r=Wt(0),Ie=0,Rn=null,fr=0,Ps=0,Ll=0,Tn=null,Je=null,Pl=0,Vr=1/0,It=null,As=!1,Al=null,Yt=null,Os=!1,Zt=null,Is=0,Ln=0,Ol=null,Fs=-1,Ds=0;function Ke(){return(ie&6)!==0?Re():Fs!==-1?Fs:Fs=Re()}function Xt(e){return(e.mode&1)===0?1:(ie&2)!==0&&$e!==0?$e&-$e:mp.transition!==null?(Ds===0&&(Ds=Ao()),Ds):(e=fe,e!==0||(e=window.event,e=e===void 0?16:$o(e.type)),e)}function wt(e,t,r,n){if(50<Ln)throw Ln=0,Ol=null,Error(i(185));en(e,r,n),((ie&2)===0||e!==Me)&&(e===Me&&((ie&2)===0&&(Ps|=r),Ie===4&&Jt(e,$e)),et(e,n),r===1&&ie===0&&(t.mode&1)===0&&(Vr=Re()+500,ds&&Gt()))}function et(e,t){var r=e.callbackNode;md(e,t);var n=Gn(e,e===Me?$e:0);if(n===0)r!==null&&To(r),e.callbackNode=null,e.callbackPriority=0;else if(t=n&-n,e.callbackPriority!==t){if(r!=null&&To(r),t===1)e.tag===0?fp($u.bind(null,e)):Ci($u.bind(null,e)),up(function(){(ie&6)===0&&Gt()}),r=null;else{switch(Oo(n)){case 1:r=fa;break;case 4:r=Lo;break;case 16:r=$n;break;case 536870912:r=Po;break;default:r=$n}r=Yu(r,Uu.bind(null,e))}e.callbackPriority=t,e.callbackNode=r}}function Uu(e,t){if(Fs=-1,Ds=0,(ie&6)!==0)throw Error(i(327));var r=e.callbackNode;if(Wr()&&e.callbackNode!==r)return null;var n=Gn(e,e===Me?$e:0);if(n===0)return null;if((n&30)!==0||(n&e.expiredLanes)!==0||t)t=Ms(e,n);else{t=n;var s=ie;ie|=2;var o=Wu();(Me!==e||$e!==t)&&(It=null,Vr=Re()+500,hr(e,t));do try{Op();break}catch(p){Vu(e,p)}while(!0);Xa(),Ls.current=o,ie=s,Pe!==null?t=0:(Me=null,$e=0,t=Ie)}if(t!==0){if(t===2&&(s=ma(e),s!==0&&(n=s,t=Il(e,s))),t===1)throw r=Rn,hr(e,0),Jt(e,n),et(e,Re()),r;if(t===6)Jt(e,n);else{if(s=e.current.alternate,(n&30)===0&&!Pp(s)&&(t=Ms(e,n),t===2&&(o=ma(e),o!==0&&(n=o,t=Il(e,o))),t===1))throw r=Rn,hr(e,0),Jt(e,n),et(e,Re()),r;switch(e.finishedWork=s,e.finishedLanes=n,t){case 0:case 1:throw Error(i(345));case 2:gr(e,Je,It);break;case 3:if(Jt(e,n),(n&130023424)===n&&(t=Pl+500-Re(),10<t)){if(Gn(e,0)!==0)break;if(s=e.suspendedLanes,(s&n)!==n){Ke(),e.pingedLanes|=e.suspendedLanes&s;break}e.timeoutHandle=Ua(gr.bind(null,e,Je,It),t);break}gr(e,Je,It);break;case 4:if(Jt(e,n),(n&4194240)===n)break;for(t=e.eventTimes,s=-1;0<n;){var c=31-mt(n);o=1<<c,c=t[c],c>s&&(s=c),n&=~o}if(n=s,n=Re()-n,n=(120>n?120:480>n?480:1080>n?1080:1920>n?1920:3e3>n?3e3:4320>n?4320:1960*Lp(n/1960))-n,10<n){e.timeoutHandle=Ua(gr.bind(null,e,Je,It),n);break}gr(e,Je,It);break;case 5:gr(e,Je,It);break;default:throw Error(i(329))}}}return et(e,Re()),e.callbackNode===r?Uu.bind(null,e):null}function Il(e,t){var r=Tn;return e.current.memoizedState.isDehydrated&&(hr(e,t).flags|=256),e=Ms(e,t),e!==2&&(t=Je,Je=r,t!==null&&Fl(t)),e}function Fl(e){Je===null?Je=e:Je.push.apply(Je,e)}function Pp(e){for(var t=e;;){if(t.flags&16384){var r=t.updateQueue;if(r!==null&&(r=r.stores,r!==null))for(var n=0;n<r.length;n++){var s=r[n],o=s.getSnapshot;s=s.value;try{if(!ht(o(),s))return!1}catch{return!1}}}if(r=t.child,t.subtreeFlags&16384&&r!==null)r.return=t,t=r;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Jt(e,t){for(t&=~Ll,t&=~Ps,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var r=31-mt(t),n=1<<r;e[r]=-1,t&=~n}}function $u(e){if((ie&6)!==0)throw Error(i(327));Wr();var t=Gn(e,0);if((t&1)===0)return et(e,Re()),null;var r=Ms(e,t);if(e.tag!==0&&r===2){var n=ma(e);n!==0&&(t=n,r=Il(e,n))}if(r===1)throw r=Rn,hr(e,0),Jt(e,t),et(e,Re()),r;if(r===6)throw Error(i(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,gr(e,Je,It),et(e,Re()),null}function Dl(e,t){var r=ie;ie|=1;try{return e(t)}finally{ie=r,ie===0&&(Vr=Re()+500,ds&&Gt())}}function mr(e){Zt!==null&&Zt.tag===0&&(ie&6)===0&&Wr();var t=ie;ie|=1;var r=pt.transition,n=fe;try{if(pt.transition=null,fe=1,e)return e()}finally{fe=n,pt.transition=r,ie=t,(ie&6)===0&&Gt()}}function Ml(){lt=$r.current,we($r)}function hr(e,t){e.finishedWork=null,e.finishedLanes=0;var r=e.timeoutHandle;if(r!==-1&&(e.timeoutHandle=-1,ip(r)),Pe!==null)for(r=Pe.return;r!==null;){var n=r;switch(qa(n),n.tag){case 1:n=n.type.childContextTypes,n!=null&&us();break;case 3:zr(),we(Ye),we(We),ll();break;case 5:sl(n);break;case 4:zr();break;case 13:we(Se);break;case 19:we(Se);break;case 10:Ja(n.type._context);break;case 22:case 23:Ml()}r=r.return}if(Me=e,Pe=e=er(e.current,null),$e=lt=t,Ie=0,Rn=null,Ll=Ps=fr=0,Je=Tn=null,cr!==null){for(t=0;t<cr.length;t++)if(r=cr[t],n=r.interleaved,n!==null){r.interleaved=null;var s=n.next,o=r.pending;if(o!==null){var c=o.next;o.next=s,n.next=c}r.pending=n}cr=null}return e}function Vu(e,t){do{var r=Pe;try{if(Xa(),bs.current=Ns,ks){for(var n=je.memoizedState;n!==null;){var s=n.queue;s!==null&&(s.pending=null),n=n.next}ks=!1}if(pr=0,De=Oe=je=null,Sn=!1,jn=0,Tl.current=null,r===null||r.return===null){Ie=1,Rn=t,Pe=null;break}e:{var o=e,c=r.return,p=r,m=t;if(t=$e,p.flags|=32768,m!==null&&typeof m=="object"&&typeof m.then=="function"){var E=m,O=p,D=O.tag;if((O.mode&1)===0&&(D===0||D===11||D===15)){var A=O.alternate;A?(O.updateQueue=A.updateQueue,O.memoizedState=A.memoizedState,O.lanes=A.lanes):(O.updateQueue=null,O.memoizedState=null)}var V=mu(c);if(V!==null){V.flags&=-257,hu(V,c,p,o,t),V.mode&1&&fu(o,E,t),t=V,m=E;var H=t.updateQueue;if(H===null){var G=new Set;G.add(m),t.updateQueue=G}else H.add(m);break e}else{if((t&1)===0){fu(o,E,t),zl();break e}m=Error(i(426))}}else if(be&&p.mode&1){var Te=mu(c);if(Te!==null){(Te.flags&65536)===0&&(Te.flags|=256),hu(Te,c,p,o,t),Ya(Br(m,p));break e}}o=m=Br(m,p),Ie!==4&&(Ie=2),Tn===null?Tn=[o]:Tn.push(o),o=c;do{switch(o.tag){case 3:o.flags|=65536,t&=-t,o.lanes|=t;var k=du(o,m,t);Mi(o,k);break e;case 1:p=m;var g=o.type,S=o.stateNode;if((o.flags&128)===0&&(typeof g.getDerivedStateFromError=="function"||S!==null&&typeof S.componentDidCatch=="function"&&(Yt===null||!Yt.has(S)))){o.flags|=65536,t&=-t,o.lanes|=t;var z=pu(o,p,t);Mi(o,z);break e}}o=o.return}while(o!==null)}Gu(r)}catch(K){t=K,Pe===r&&r!==null&&(Pe=r=r.return);continue}break}while(!0)}function Wu(){var e=Ls.current;return Ls.current=Ns,e===null?Ns:e}function zl(){(Ie===0||Ie===3||Ie===2)&&(Ie=4),Me===null||(fr&268435455)===0&&(Ps&268435455)===0||Jt(Me,$e)}function Ms(e,t){var r=ie;ie|=2;var n=Wu();(Me!==e||$e!==t)&&(It=null,hr(e,t));do try{Ap();break}catch(s){Vu(e,s)}while(!0);if(Xa(),ie=r,Ls.current=n,Pe!==null)throw Error(i(261));return Me=null,$e=0,Ie}function Ap(){for(;Pe!==null;)Hu(Pe)}function Op(){for(;Pe!==null&&!ad();)Hu(Pe)}function Hu(e){var t=Ku(e.alternate,e,lt);e.memoizedProps=e.pendingProps,t===null?Gu(e):Pe=t,Tl.current=null}function Gu(e){var t=e;do{var r=t.alternate;if(e=t.return,(t.flags&32768)===0){if(r=Ep(r,t,lt),r!==null){Pe=r;return}}else{if(r=Cp(r,t),r!==null){r.flags&=32767,Pe=r;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{Ie=6,Pe=null;return}}if(t=t.sibling,t!==null){Pe=t;return}Pe=t=e}while(t!==null);Ie===0&&(Ie=5)}function gr(e,t,r){var n=fe,s=pt.transition;try{pt.transition=null,fe=1,Ip(e,t,r,n)}finally{pt.transition=s,fe=n}return null}function Ip(e,t,r,n){do Wr();while(Zt!==null);if((ie&6)!==0)throw Error(i(327));r=e.finishedWork;var s=e.finishedLanes;if(r===null)return null;if(e.finishedWork=null,e.finishedLanes=0,r===e.current)throw Error(i(177));e.callbackNode=null,e.callbackPriority=0;var o=r.lanes|r.childLanes;if(hd(e,o),e===Me&&(Pe=Me=null,$e=0),(r.subtreeFlags&2064)===0&&(r.flags&2064)===0||Os||(Os=!0,Yu($n,function(){return Wr(),null})),o=(r.flags&15990)!==0,(r.subtreeFlags&15990)!==0||o){o=pt.transition,pt.transition=null;var c=fe;fe=1;var p=ie;ie|=4,Tl.current=null,Rp(e,r),Fu(r,e),tp(za),Kn=!!Ma,za=Ma=null,e.current=r,Tp(r),ld(),ie=p,fe=c,pt.transition=o}else e.current=r;if(Os&&(Os=!1,Zt=e,Is=s),o=e.pendingLanes,o===0&&(Yt=null),ud(r.stateNode),et(e,Re()),t!==null)for(n=e.onRecoverableError,r=0;r<t.length;r++)s=t[r],n(s.value,{componentStack:s.stack,digest:s.digest});if(As)throw As=!1,e=Al,Al=null,e;return(Is&1)!==0&&e.tag!==0&&Wr(),o=e.pendingLanes,(o&1)!==0?e===Ol?Ln++:(Ln=0,Ol=e):Ln=0,Gt(),null}function Wr(){if(Zt!==null){var e=Oo(Is),t=pt.transition,r=fe;try{if(pt.transition=null,fe=16>e?16:e,Zt===null)var n=!1;else{if(e=Zt,Zt=null,Is=0,(ie&6)!==0)throw Error(i(331));var s=ie;for(ie|=4,W=e.current;W!==null;){var o=W,c=o.child;if((W.flags&16)!==0){var p=o.deletions;if(p!==null){for(var m=0;m<p.length;m++){var E=p[m];for(W=E;W!==null;){var O=W;switch(O.tag){case 0:case 11:case 15:_n(8,O,o)}var D=O.child;if(D!==null)D.return=O,W=D;else for(;W!==null;){O=W;var A=O.sibling,V=O.return;if(Lu(O),O===E){W=null;break}if(A!==null){A.return=V,W=A;break}W=V}}}var H=o.alternate;if(H!==null){var G=H.child;if(G!==null){H.child=null;do{var Te=G.sibling;G.sibling=null,G=Te}while(G!==null)}}W=o}}if((o.subtreeFlags&2064)!==0&&c!==null)c.return=o,W=c;else e:for(;W!==null;){if(o=W,(o.flags&2048)!==0)switch(o.tag){case 0:case 11:case 15:_n(9,o,o.return)}var k=o.sibling;if(k!==null){k.return=o.return,W=k;break e}W=o.return}}var g=e.current;for(W=g;W!==null;){c=W;var S=c.child;if((c.subtreeFlags&2064)!==0&&S!==null)S.return=c,W=S;else e:for(c=g;W!==null;){if(p=W,(p.flags&2048)!==0)try{switch(p.tag){case 0:case 11:case 15:Ts(9,p)}}catch(K){Ne(p,p.return,K)}if(p===c){W=null;break e}var z=p.sibling;if(z!==null){z.return=p.return,W=z;break e}W=p.return}}if(ie=s,Gt(),bt&&typeof bt.onPostCommitFiberRoot=="function")try{bt.onPostCommitFiberRoot(Vn,e)}catch{}n=!0}return n}finally{fe=r,pt.transition=t}}return!1}function qu(e,t,r){t=Br(r,t),t=du(e,t,1),e=Qt(e,t,1),t=Ke(),e!==null&&(en(e,1,t),et(e,t))}function Ne(e,t,r){if(e.tag===3)qu(e,e,r);else for(;t!==null;){if(t.tag===3){qu(t,e,r);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(Yt===null||!Yt.has(n))){e=Br(r,e),e=pu(t,e,1),t=Qt(t,e,1),e=Ke(),t!==null&&(en(t,1,e),et(t,e));break}}t=t.return}}function Fp(e,t,r){var n=e.pingCache;n!==null&&n.delete(t),t=Ke(),e.pingedLanes|=e.suspendedLanes&r,Me===e&&($e&r)===r&&(Ie===4||Ie===3&&($e&130023424)===$e&&500>Re()-Pl?hr(e,0):Ll|=r),et(e,t)}function Qu(e,t){t===0&&((e.mode&1)===0?t=1:(t=Hn,Hn<<=1,(Hn&130023424)===0&&(Hn=4194304)));var r=Ke();e=Pt(e,t),e!==null&&(en(e,t,r),et(e,r))}function Dp(e){var t=e.memoizedState,r=0;t!==null&&(r=t.retryLane),Qu(e,r)}function Mp(e,t){var r=0;switch(e.tag){case 13:var n=e.stateNode,s=e.memoizedState;s!==null&&(r=s.retryLane);break;case 19:n=e.stateNode;break;default:throw Error(i(314))}n!==null&&n.delete(t),Qu(e,r)}var Ku;Ku=function(e,t,r){if(e!==null)if(e.memoizedProps!==t.pendingProps||Ye.current)Xe=!0;else{if((e.lanes&r)===0&&(t.flags&128)===0)return Xe=!1,Np(e,t,r);Xe=(e.flags&131072)!==0}else Xe=!1,be&&(t.flags&1048576)!==0&&_i(t,fs,t.index);switch(t.lanes=0,t.tag){case 2:var n=t.type;_s(e,t),e=t.pendingProps;var s=Pr(t,We.current);Mr(t,r),s=ul(null,t,n,e,s,r);var o=cl();return t.flags|=1,typeof s=="object"&&s!==null&&typeof s.render=="function"&&s.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Ze(n)?(o=!0,cs(t)):o=!1,t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,rl(t),s.updater=Es,t.stateNode=s,s._reactInternals=t,gl(t,n,e,r),t=wl(null,t,n,!0,o,r)):(t.tag=0,be&&o&&Ga(t),Qe(null,t,s,r),t=t.child),t;case 16:n=t.elementType;e:{switch(_s(e,t),e=t.pendingProps,s=n._init,n=s(n._payload),t.type=n,s=t.tag=Bp(n),e=xt(n,e),s){case 0:t=vl(null,t,n,e,r);break e;case 1:t=bu(null,t,n,e,r);break e;case 11:t=gu(null,t,n,e,r);break e;case 14:t=xu(null,t,n,xt(n.type,e),r);break e}throw Error(i(306,n,""))}return t;case 0:return n=t.type,s=t.pendingProps,s=t.elementType===n?s:xt(n,s),vl(e,t,n,s,r);case 1:return n=t.type,s=t.pendingProps,s=t.elementType===n?s:xt(n,s),bu(e,t,n,s,r);case 3:e:{if(ku(t),e===null)throw Error(i(387));n=t.pendingProps,o=t.memoizedState,s=o.element,Di(e,t),vs(t,n,null,r);var c=t.memoizedState;if(n=c.element,o.isDehydrated)if(o={element:n,isDehydrated:!1,cache:c.cache,pendingSuspenseBoundaries:c.pendingSuspenseBoundaries,transitions:c.transitions},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){s=Br(Error(i(423)),t),t=Su(e,t,n,r,s);break e}else if(n!==s){s=Br(Error(i(424)),t),t=Su(e,t,n,r,s);break e}else for(at=Vt(t.stateNode.containerInfo.firstChild),st=t,be=!0,gt=null,r=Ii(t,null,n,r),t.child=r;r;)r.flags=r.flags&-3|4096,r=r.sibling;else{if(Ir(),n===s){t=Ot(e,t,r);break e}Qe(e,t,n,r)}t=t.child}return t;case 5:return Bi(t),e===null&&Ka(t),n=t.type,s=t.pendingProps,o=e!==null?e.memoizedProps:null,c=s.children,Ba(n,s)?c=null:o!==null&&Ba(n,o)&&(t.flags|=32),wu(e,t),Qe(e,t,c,r),t.child;case 6:return e===null&&Ka(t),null;case 13:return ju(e,t,r);case 4:return nl(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Fr(t,null,n,r):Qe(e,t,n,r),t.child;case 11:return n=t.type,s=t.pendingProps,s=t.elementType===n?s:xt(n,s),gu(e,t,n,s,r);case 7:return Qe(e,t,t.pendingProps,r),t.child;case 8:return Qe(e,t,t.pendingProps.children,r),t.child;case 12:return Qe(e,t,t.pendingProps.children,r),t.child;case 10:e:{if(n=t.type._context,s=t.pendingProps,o=t.memoizedProps,c=s.value,ye(gs,n._currentValue),n._currentValue=c,o!==null)if(ht(o.value,c)){if(o.children===s.children&&!Ye.current){t=Ot(e,t,r);break e}}else for(o=t.child,o!==null&&(o.return=t);o!==null;){var p=o.dependencies;if(p!==null){c=o.child;for(var m=p.firstContext;m!==null;){if(m.context===n){if(o.tag===1){m=At(-1,r&-r),m.tag=2;var E=o.updateQueue;if(E!==null){E=E.shared;var O=E.pending;O===null?m.next=m:(m.next=O.next,O.next=m),E.pending=m}}o.lanes|=r,m=o.alternate,m!==null&&(m.lanes|=r),el(o.return,r,t),p.lanes|=r;break}m=m.next}}else if(o.tag===10)c=o.type===t.type?null:o.child;else if(o.tag===18){if(c=o.return,c===null)throw Error(i(341));c.lanes|=r,p=c.alternate,p!==null&&(p.lanes|=r),el(c,r,t),c=o.sibling}else c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===t){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}Qe(e,t,s.children,r),t=t.child}return t;case 9:return s=t.type,n=t.pendingProps.children,Mr(t,r),s=ct(s),n=n(s),t.flags|=1,Qe(e,t,n,r),t.child;case 14:return n=t.type,s=xt(n,t.pendingProps),s=xt(n.type,s),xu(e,t,n,s,r);case 15:return yu(e,t,t.type,t.pendingProps,r);case 17:return n=t.type,s=t.pendingProps,s=t.elementType===n?s:xt(n,s),_s(e,t),t.tag=1,Ze(n)?(e=!0,cs(t)):e=!1,Mr(t,r),uu(t,n,s),gl(t,n,s,r),wl(null,t,n,!0,e,r);case 19:return Eu(e,t,r);case 22:return vu(e,t,r)}throw Error(i(156,t.tag))};function Yu(e,t){return Ro(e,t)}function zp(e,t,r,n){this.tag=e,this.key=r,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ft(e,t,r,n){return new zp(e,t,r,n)}function Bl(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Bp(e){if(typeof e=="function")return Bl(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Ee)return 11;if(e===Ce)return 14}return 2}function er(e,t){var r=e.alternate;return r===null?(r=ft(e.tag,t,e.key,e.mode),r.elementType=e.elementType,r.type=e.type,r.stateNode=e.stateNode,r.alternate=e,e.alternate=r):(r.pendingProps=t,r.type=e.type,r.flags=0,r.subtreeFlags=0,r.deletions=null),r.flags=e.flags&14680064,r.childLanes=e.childLanes,r.lanes=e.lanes,r.child=e.child,r.memoizedProps=e.memoizedProps,r.memoizedState=e.memoizedState,r.updateQueue=e.updateQueue,t=e.dependencies,r.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},r.sibling=e.sibling,r.index=e.index,r.ref=e.ref,r}function zs(e,t,r,n,s,o){var c=2;if(n=e,typeof e=="function")Bl(e)&&(c=1);else if(typeof e=="string")c=5;else e:switch(e){case le:return xr(r.children,s,o,t);case me:c=8,s|=8;break;case ke:return e=ft(12,r,t,s|2),e.elementType=ke,e.lanes=o,e;case Ve:return e=ft(13,r,t,s),e.elementType=Ve,e.lanes=o,e;case he:return e=ft(19,r,t,s),e.elementType=he,e.lanes=o,e;case xe:return Bs(r,s,o,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Fe:c=10;break e;case Be:c=9;break e;case Ee:c=11;break e;case Ce:c=14;break e;case _e:c=16,n=null;break e}throw Error(i(130,e==null?e:typeof e,""))}return t=ft(c,r,t,s),t.elementType=e,t.type=n,t.lanes=o,t}function xr(e,t,r,n){return e=ft(7,e,n,t),e.lanes=r,e}function Bs(e,t,r,n){return e=ft(22,e,n,t),e.elementType=xe,e.lanes=r,e.stateNode={isHidden:!1},e}function Ul(e,t,r){return e=ft(6,e,null,t),e.lanes=r,e}function $l(e,t,r){return t=ft(4,e.children!==null?e.children:[],e.key,t),t.lanes=r,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Up(e,t,r,n,s){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ha(0),this.expirationTimes=ha(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ha(0),this.identifierPrefix=n,this.onRecoverableError=s,this.mutableSourceEagerHydrationData=null}function Vl(e,t,r,n,s,o,c,p,m){return e=new Up(e,t,r,p,m),t===1?(t=1,o===!0&&(t|=8)):t=0,o=ft(3,null,null,t),e.current=o,o.stateNode=e,o.memoizedState={element:n,isDehydrated:r,cache:null,transitions:null,pendingSuspenseBoundaries:null},rl(o),e}function $p(e,t,r){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ue,key:n==null?null:""+n,children:e,containerInfo:t,implementation:r}}function Zu(e){if(!e)return Ht;e=e._reactInternals;e:{if(ar(e)!==e||e.tag!==1)throw Error(i(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Ze(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(i(171))}if(e.tag===1){var r=e.type;if(Ze(r))return Ni(e,r,t)}return t}function Xu(e,t,r,n,s,o,c,p,m){return e=Vl(r,n,!0,e,s,o,c,p,m),e.context=Zu(null),r=e.current,n=Ke(),s=Xt(r),o=At(n,s),o.callback=t??null,Qt(r,o,s),e.current.lanes=s,en(e,s,n),et(e,n),e}function Us(e,t,r,n){var s=t.current,o=Ke(),c=Xt(s);return r=Zu(r),t.context===null?t.context=r:t.pendingContext=r,t=At(o,c),t.payload={element:e},n=n===void 0?null:n,n!==null&&(t.callback=n),e=Qt(s,t,c),e!==null&&(wt(e,s,c,o),ys(e,s,c)),c}function $s(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Ju(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var r=e.retryLane;e.retryLane=r!==0&&r<t?r:t}}function Wl(e,t){Ju(e,t),(e=e.alternate)&&Ju(e,t)}function Vp(){return null}var ec=typeof reportError=="function"?reportError:function(e){console.error(e)};function Hl(e){this._internalRoot=e}Vs.prototype.render=Hl.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));Us(e,t,null,null)},Vs.prototype.unmount=Hl.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;mr(function(){Us(null,e,null,null)}),t[_t]=null}};function Vs(e){this._internalRoot=e}Vs.prototype.unstable_scheduleHydration=function(e){if(e){var t=Do();e={blockedOn:null,target:e,priority:t};for(var r=0;r<Bt.length&&t!==0&&t<Bt[r].priority;r++);Bt.splice(r,0,e),r===0&&Bo(e)}};function Gl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Ws(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function tc(){}function Wp(e,t,r,n,s){if(s){if(typeof n=="function"){var o=n;n=function(){var E=$s(c);o.call(E)}}var c=Xu(t,n,e,0,null,!1,!1,"",tc);return e._reactRootContainer=c,e[_t]=c.current,hn(e.nodeType===8?e.parentNode:e),mr(),c}for(;s=e.lastChild;)e.removeChild(s);if(typeof n=="function"){var p=n;n=function(){var E=$s(m);p.call(E)}}var m=Vl(e,0,!1,null,null,!1,!1,"",tc);return e._reactRootContainer=m,e[_t]=m.current,hn(e.nodeType===8?e.parentNode:e),mr(function(){Us(t,m,r,n)}),m}function Hs(e,t,r,n,s){var o=r._reactRootContainer;if(o){var c=o;if(typeof s=="function"){var p=s;s=function(){var m=$s(c);p.call(m)}}Us(t,c,e,s)}else c=Wp(r,t,e,s,n);return $s(c)}Io=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var r=Jr(t.pendingLanes);r!==0&&(ga(t,r|1),et(t,Re()),(ie&6)===0&&(Vr=Re()+500,Gt()))}break;case 13:mr(function(){var n=Pt(e,1);if(n!==null){var s=Ke();wt(n,e,1,s)}}),Wl(e,1)}},xa=function(e){if(e.tag===13){var t=Pt(e,134217728);if(t!==null){var r=Ke();wt(t,e,134217728,r)}Wl(e,134217728)}},Fo=function(e){if(e.tag===13){var t=Xt(e),r=Pt(e,t);if(r!==null){var n=Ke();wt(r,e,t,n)}Wl(e,t)}},Do=function(){return fe},Mo=function(e,t){var r=fe;try{return fe=e,t()}finally{fe=r}},ua=function(e,t,r){switch(t){case"input":if(ta(e,r),t=r.name,r.type==="radio"&&t!=null){for(r=e;r.parentNode;)r=r.parentNode;for(r=r.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<r.length;t++){var n=r[t];if(n!==e&&n.form===e.form){var s=is(n);if(!s)throw Error(i(90));oo(n),ta(n,s)}}}break;case"textarea":fo(e,r);break;case"select":t=r.value,t!=null&&wr(e,!!r.multiple,t,!1)}},ko=Dl,So=mr;var Hp={usingClientEntryPoint:!1,Events:[yn,Tr,is,wo,bo,Dl]},Pn={findFiberByHostInstance:lr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Gp={bundleType:Pn.bundleType,version:Pn.version,rendererPackageName:Pn.rendererPackageName,rendererConfig:Pn.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Q.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Co(e),e===null?null:e.stateNode},findFiberByHostInstance:Pn.findFiberByHostInstance||Vp,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Gs=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Gs.isDisabled&&Gs.supportsFiber)try{Vn=Gs.inject(Gp),bt=Gs}catch{}}return tt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Hp,tt.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Gl(t))throw Error(i(200));return $p(e,t,null,r)},tt.createRoot=function(e,t){if(!Gl(e))throw Error(i(299));var r=!1,n="",s=ec;return t!=null&&(t.unstable_strictMode===!0&&(r=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onRecoverableError!==void 0&&(s=t.onRecoverableError)),t=Vl(e,1,!1,null,null,r,!1,n,s),e[_t]=t.current,hn(e.nodeType===8?e.parentNode:e),new Hl(t)},tt.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(i(188)):(e=Object.keys(e).join(","),Error(i(268,e)));return e=Co(t),e=e===null?null:e.stateNode,e},tt.flushSync=function(e){return mr(e)},tt.hydrate=function(e,t,r){if(!Ws(t))throw Error(i(200));return Hs(null,e,t,!0,r)},tt.hydrateRoot=function(e,t,r){if(!Gl(e))throw Error(i(405));var n=r!=null&&r.hydratedSources||null,s=!1,o="",c=ec;if(r!=null&&(r.unstable_strictMode===!0&&(s=!0),r.identifierPrefix!==void 0&&(o=r.identifierPrefix),r.onRecoverableError!==void 0&&(c=r.onRecoverableError)),t=Xu(t,null,e,1,r??null,s,!1,o,c),e[_t]=t.current,hn(e),n)for(e=0;e<n.length;e++)r=n[e],s=r._getVersion,s=s(r._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[r,s]:t.mutableSourceEagerHydrationData.push(r,s);return new Vs(t)},tt.render=function(e,t,r){if(!Ws(t))throw Error(i(200));return Hs(null,e,t,!1,r)},tt.unmountComponentAtNode=function(e){if(!Ws(e))throw Error(i(40));return e._reactRootContainer?(mr(function(){Hs(null,null,e,!1,function(){e._reactRootContainer=null,e[_t]=null})}),!0):!1},tt.unstable_batchedUpdates=Dl,tt.unstable_renderSubtreeIntoContainer=function(e,t,r,n){if(!Ws(r))throw Error(i(200));if(e==null||e._reactInternals===void 0)throw Error(i(38));return Hs(e,t,r,!1,n)},tt.version="18.3.1-next-f1338f8080-20240426",tt}var uc;function Tc(){if(uc)return Kl.exports;uc=1;function l(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l)}catch(u){console.error(u)}}return l(),Kl.exports=tf(),Kl.exports}var cc;function rf(){if(cc)return qs;cc=1;var l=Tc();return qs.createRoot=l.createRoot,qs.hydrateRoot=l.hydrateRoot,qs}var nf=rf();const sf=_c(nf);Tc();/**
 * @remix-run/router v1.23.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function On(){return On=Object.assign?Object.assign.bind():function(l){for(var u=1;u<arguments.length;u++){var i=arguments[u];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(l[d]=i[d])}return l},On.apply(this,arguments)}var rr;(function(l){l.Pop="POP",l.Push="PUSH",l.Replace="REPLACE"})(rr||(rr={}));const dc="popstate";function af(l){l===void 0&&(l={});function u(d,f){let{pathname:x,search:h,hash:_}=d.location;return Jl("",{pathname:x,search:h,hash:_},f.state&&f.state.usr||null,f.state&&f.state.key||"default")}function i(d,f){return typeof f=="string"?f:Qs(f)}return of(u,i,null,l)}function Ae(l,u){if(l===!1||l===null||typeof l>"u")throw new Error(u)}function no(l,u){if(!l){typeof console<"u"&&console.warn(u);try{throw new Error(u)}catch{}}}function lf(){return Math.random().toString(36).substr(2,8)}function pc(l,u){return{usr:l.state,key:l.key,idx:u}}function Jl(l,u,i,d){return i===void 0&&(i=null),On({pathname:typeof l=="string"?l:l.pathname,search:"",hash:""},typeof u=="string"?Gr(u):u,{state:i,key:u&&u.key||d||lf()})}function Qs(l){let{pathname:u="/",search:i="",hash:d=""}=l;return i&&i!=="?"&&(u+=i.charAt(0)==="?"?i:"?"+i),d&&d!=="#"&&(u+=d.charAt(0)==="#"?d:"#"+d),u}function Gr(l){let u={};if(l){let i=l.indexOf("#");i>=0&&(u.hash=l.substr(i),l=l.substr(0,i));let d=l.indexOf("?");d>=0&&(u.search=l.substr(d),l=l.substr(0,d)),l&&(u.pathname=l)}return u}function of(l,u,i,d){d===void 0&&(d={});let{window:f=document.defaultView,v5Compat:x=!1}=d,h=f.history,_=rr.Pop,v=null,C=R();C==null&&(C=0,h.replaceState(On({},h.state,{idx:C}),""));function R(){return(h.state||{idx:null}).idx}function N(){_=rr.Pop;let w=R(),I=w==null?null:w-C;C=w,v&&v({action:_,location:b.location,delta:I})}function M(w,I){_=rr.Push;let L=Jl(b.location,w,I);C=R()+1;let F=pc(L,C),Q=b.createHref(L);try{h.pushState(F,"",Q)}catch(ee){if(ee instanceof DOMException&&ee.name==="DataCloneError")throw ee;f.location.assign(Q)}x&&v&&v({action:_,location:b.location,delta:1})}function q(w,I){_=rr.Replace;let L=Jl(b.location,w,I);C=R();let F=pc(L,C),Q=b.createHref(L);h.replaceState(F,"",Q),x&&v&&v({action:_,location:b.location,delta:0})}function j(w){let I=f.location.origin!=="null"?f.location.origin:f.location.href,L=typeof w=="string"?w:Qs(w);return L=L.replace(/ $/,"%20"),Ae(I,"No window.location.(origin|href) available to create URL for href: "+L),new URL(L,I)}let b={get action(){return _},get location(){return l(f,h)},listen(w){if(v)throw new Error("A history only accepts one active listener");return f.addEventListener(dc,N),v=w,()=>{f.removeEventListener(dc,N),v=null}},createHref(w){return u(f,w)},createURL:j,encodeLocation(w){let I=j(w);return{pathname:I.pathname,search:I.search,hash:I.hash}},push:M,replace:q,go(w){return h.go(w)}};return b}var fc;(function(l){l.data="data",l.deferred="deferred",l.redirect="redirect",l.error="error"})(fc||(fc={}));function uf(l,u,i){return i===void 0&&(i="/"),cf(l,u,i)}function cf(l,u,i,d){let f=typeof u=="string"?Gr(u):u,x=so(f.pathname||"/",i);if(x==null)return null;let h=Lc(l);df(h);let _=null;for(let v=0;_==null&&v<h.length;++v){let C=Sf(x);_=wf(h[v],C)}return _}function Lc(l,u,i,d){u===void 0&&(u=[]),i===void 0&&(i=[]),d===void 0&&(d="");let f=(x,h,_)=>{let v={relativePath:_===void 0?x.path||"":_,caseSensitive:x.caseSensitive===!0,childrenIndex:h,route:x};v.relativePath.startsWith("/")&&(Ae(v.relativePath.startsWith(d),'Absolute route path "'+v.relativePath+'" nested under path '+('"'+d+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),v.relativePath=v.relativePath.slice(d.length));let C=nr([d,v.relativePath]),R=i.concat(v);x.children&&x.children.length>0&&(Ae(x.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+C+'".')),Lc(x.children,u,R,C)),!(x.path==null&&!x.index)&&u.push({path:C,score:yf(C,x.index),routesMeta:R})};return l.forEach((x,h)=>{var _;if(x.path===""||!((_=x.path)!=null&&_.includes("?")))f(x,h);else for(let v of Pc(x.path))f(x,h,v)}),u}function Pc(l){let u=l.split("/");if(u.length===0)return[];let[i,...d]=u,f=i.endsWith("?"),x=i.replace(/\?$/,"");if(d.length===0)return f?[x,""]:[x];let h=Pc(d.join("/")),_=[];return _.push(...h.map(v=>v===""?x:[x,v].join("/"))),f&&_.push(...h),_.map(v=>l.startsWith("/")&&v===""?"/":v)}function df(l){l.sort((u,i)=>u.score!==i.score?i.score-u.score:vf(u.routesMeta.map(d=>d.childrenIndex),i.routesMeta.map(d=>d.childrenIndex)))}const pf=/^:[\w-]+$/,ff=3,mf=2,hf=1,gf=10,xf=-2,mc=l=>l==="*";function yf(l,u){let i=l.split("/"),d=i.length;return i.some(mc)&&(d+=xf),u&&(d+=mf),i.filter(f=>!mc(f)).reduce((f,x)=>f+(pf.test(x)?ff:x===""?hf:gf),d)}function vf(l,u){return l.length===u.length&&l.slice(0,-1).every((d,f)=>d===u[f])?l[l.length-1]-u[u.length-1]:0}function wf(l,u,i){let{routesMeta:d}=l,f={},x="/",h=[];for(let _=0;_<d.length;++_){let v=d[_],C=_===d.length-1,R=x==="/"?u:u.slice(x.length)||"/",N=bf({path:v.relativePath,caseSensitive:v.caseSensitive,end:C},R),M=v.route;if(!N)return null;Object.assign(f,N.params),h.push({params:f,pathname:nr([x,N.pathname]),pathnameBase:_f(nr([x,N.pathnameBase])),route:M}),N.pathnameBase!=="/"&&(x=nr([x,N.pathnameBase]))}return h}function bf(l,u){typeof l=="string"&&(l={path:l,caseSensitive:!1,end:!0});let[i,d]=kf(l.path,l.caseSensitive,l.end),f=u.match(i);if(!f)return null;let x=f[0],h=x.replace(/(.)\/+$/,"$1"),_=f.slice(1);return{params:d.reduce((C,R,N)=>{let{paramName:M,isOptional:q}=R;if(M==="*"){let b=_[N]||"";h=x.slice(0,x.length-b.length).replace(/(.)\/+$/,"$1")}const j=_[N];return q&&!j?C[M]=void 0:C[M]=(j||"").replace(/%2F/g,"/"),C},{}),pathname:x,pathnameBase:h,pattern:l}}function kf(l,u,i){u===void 0&&(u=!1),i===void 0&&(i=!0),no(l==="*"||!l.endsWith("*")||l.endsWith("/*"),'Route path "'+l+'" will be treated as if it were '+('"'+l.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+l.replace(/\*$/,"/*")+'".'));let d=[],f="^"+l.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(h,_,v)=>(d.push({paramName:_,isOptional:v!=null}),v?"/?([^\\/]+)?":"/([^\\/]+)"));return l.endsWith("*")?(d.push({paramName:"*"}),f+=l==="*"||l==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):i?f+="\\/*$":l!==""&&l!=="/"&&(f+="(?:(?=\\/|$))"),[new RegExp(f,u?void 0:"i"),d]}function Sf(l){try{return l.split("/").map(u=>decodeURIComponent(u).replace(/\//g,"%2F")).join("/")}catch(u){return no(!1,'The URL path "'+l+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+u+").")),l}}function so(l,u){if(u==="/")return l;if(!l.toLowerCase().startsWith(u.toLowerCase()))return null;let i=u.endsWith("/")?u.length-1:u.length,d=l.charAt(i);return d&&d!=="/"?null:l.slice(i)||"/"}const jf=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Nf=l=>jf.test(l);function Ef(l,u){u===void 0&&(u="/");let{pathname:i,search:d="",hash:f=""}=typeof l=="string"?Gr(l):l,x;if(i)if(Nf(i))x=i;else{if(i.includes("//")){let h=i;i=i.replace(/\/\/+/g,"/"),no(!1,"Pathnames cannot have embedded double slashes - normalizing "+(h+" -> "+i))}i.startsWith("/")?x=hc(i.substring(1),"/"):x=hc(i,u)}else x=u;return{pathname:x,search:Rf(d),hash:Tf(f)}}function hc(l,u){let i=u.replace(/\/+$/,"").split("/");return l.split("/").forEach(f=>{f===".."?i.length>1&&i.pop():f!=="."&&i.push(f)}),i.length>1?i.join("/"):"/"}function Xl(l,u,i,d){return"Cannot include a '"+l+"' character in a manually specified "+("`to."+u+"` field ["+JSON.stringify(d)+"].  Please separate it out to the ")+("`to."+i+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function Cf(l){return l.filter((u,i)=>i===0||u.route.path&&u.route.path.length>0)}function Ac(l,u){let i=Cf(l);return u?i.map((d,f)=>f===i.length-1?d.pathname:d.pathnameBase):i.map(d=>d.pathnameBase)}function Oc(l,u,i,d){d===void 0&&(d=!1);let f;typeof l=="string"?f=Gr(l):(f=On({},l),Ae(!f.pathname||!f.pathname.includes("?"),Xl("?","pathname","search",f)),Ae(!f.pathname||!f.pathname.includes("#"),Xl("#","pathname","hash",f)),Ae(!f.search||!f.search.includes("#"),Xl("#","search","hash",f)));let x=l===""||f.pathname==="",h=x?"/":f.pathname,_;if(h==null)_=i;else{let N=u.length-1;if(!d&&h.startsWith("..")){let M=h.split("/");for(;M[0]==="..";)M.shift(),N-=1;f.pathname=M.join("/")}_=N>=0?u[N]:"/"}let v=Ef(f,_),C=h&&h!=="/"&&h.endsWith("/"),R=(x||h===".")&&i.endsWith("/");return!v.pathname.endsWith("/")&&(C||R)&&(v.pathname+="/"),v}const nr=l=>l.join("/").replace(/\/\/+/g,"/"),_f=l=>l.replace(/\/+$/,"").replace(/^\/*/,"/"),Rf=l=>!l||l==="?"?"":l.startsWith("?")?l:"?"+l,Tf=l=>!l||l==="#"?"":l.startsWith("#")?l:"#"+l;function Lf(l){return l!=null&&typeof l.status=="number"&&typeof l.statusText=="string"&&typeof l.internal=="boolean"&&"data"in l}const Ic=["post","put","patch","delete"];new Set(Ic);const Pf=["get",...Ic];new Set(Pf);/**
 * React Router v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function In(){return In=Object.assign?Object.assign.bind():function(l){for(var u=1;u<arguments.length;u++){var i=arguments[u];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(l[d]=i[d])}return l},In.apply(this,arguments)}const ao=U.createContext(null),Af=U.createContext(null),yr=U.createContext(null),Zs=U.createContext(null),sr=U.createContext({outlet:null,matches:[],isDataRoute:!1}),Fc=U.createContext(null);function Of(l,u){let{relative:i}=u===void 0?{}:u;Fn()||Ae(!1);let{basename:d,navigator:f}=U.useContext(yr),{hash:x,pathname:h,search:_}=Mc(l,{relative:i}),v=h;return d!=="/"&&(v=h==="/"?d:nr([d,h])),f.createHref({pathname:v,search:_,hash:x})}function Fn(){return U.useContext(Zs)!=null}function vr(){return Fn()||Ae(!1),U.useContext(Zs).location}function Dc(l){U.useContext(yr).static||U.useLayoutEffect(l)}function If(){let{isDataRoute:l}=U.useContext(sr);return l?Yf():Ff()}function Ff(){Fn()||Ae(!1);let l=U.useContext(ao),{basename:u,future:i,navigator:d}=U.useContext(yr),{matches:f}=U.useContext(sr),{pathname:x}=vr(),h=JSON.stringify(Ac(f,i.v7_relativeSplatPath)),_=U.useRef(!1);return Dc(()=>{_.current=!0}),U.useCallback(function(C,R){if(R===void 0&&(R={}),!_.current)return;if(typeof C=="number"){d.go(C);return}let N=Oc(C,JSON.parse(h),x,R.relative==="path");l==null&&u!=="/"&&(N.pathname=N.pathname==="/"?u:nr([u,N.pathname])),(R.replace?d.replace:d.push)(N,R.state,R)},[u,d,h,x,l])}const Df=U.createContext(null);function Mf(l){let u=U.useContext(sr).outlet;return u&&U.createElement(Df.Provider,{value:l},u)}function Mc(l,u){let{relative:i}=u===void 0?{}:u,{future:d}=U.useContext(yr),{matches:f}=U.useContext(sr),{pathname:x}=vr(),h=JSON.stringify(Ac(f,d.v7_relativeSplatPath));return U.useMemo(()=>Oc(l,JSON.parse(h),x,i==="path"),[l,h,x,i])}function zf(l,u){return Bf(l,u)}function Bf(l,u,i,d){Fn()||Ae(!1);let{navigator:f}=U.useContext(yr),{matches:x}=U.useContext(sr),h=x[x.length-1],_=h?h.params:{};h&&h.pathname;let v=h?h.pathnameBase:"/";h&&h.route;let C=vr(),R;if(u){var N;let w=typeof u=="string"?Gr(u):u;v==="/"||(N=w.pathname)!=null&&N.startsWith(v)||Ae(!1),R=w}else R=C;let M=R.pathname||"/",q=M;if(v!=="/"){let w=v.replace(/^\//,"").split("/");q="/"+M.replace(/^\//,"").split("/").slice(w.length).join("/")}let j=uf(l,{pathname:q}),b=Hf(j&&j.map(w=>Object.assign({},w,{params:Object.assign({},_,w.params),pathname:nr([v,f.encodeLocation?f.encodeLocation(w.pathname).pathname:w.pathname]),pathnameBase:w.pathnameBase==="/"?v:nr([v,f.encodeLocation?f.encodeLocation(w.pathnameBase).pathname:w.pathnameBase])})),x,i,d);return u&&b?U.createElement(Zs.Provider,{value:{location:In({pathname:"/",search:"",hash:"",state:null,key:"default"},R),navigationType:rr.Pop}},b):b}function Uf(){let l=Kf(),u=Lf(l)?l.status+" "+l.statusText:l instanceof Error?l.message:JSON.stringify(l),i=l instanceof Error?l.stack:null,f={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return U.createElement(U.Fragment,null,U.createElement("h2",null,"Unexpected Application Error!"),U.createElement("h3",{style:{fontStyle:"italic"}},u),i?U.createElement("pre",{style:f},i):null,null)}const $f=U.createElement(Uf,null);class Vf extends U.Component{constructor(u){super(u),this.state={location:u.location,revalidation:u.revalidation,error:u.error}}static getDerivedStateFromError(u){return{error:u}}static getDerivedStateFromProps(u,i){return i.location!==u.location||i.revalidation!=="idle"&&u.revalidation==="idle"?{error:u.error,location:u.location,revalidation:u.revalidation}:{error:u.error!==void 0?u.error:i.error,location:i.location,revalidation:u.revalidation||i.revalidation}}componentDidCatch(u,i){console.error("React Router caught the following error during render",u,i)}render(){return this.state.error!==void 0?U.createElement(sr.Provider,{value:this.props.routeContext},U.createElement(Fc.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function Wf(l){let{routeContext:u,match:i,children:d}=l,f=U.useContext(ao);return f&&f.static&&f.staticContext&&(i.route.errorElement||i.route.ErrorBoundary)&&(f.staticContext._deepestRenderedBoundaryId=i.route.id),U.createElement(sr.Provider,{value:u},d)}function Hf(l,u,i,d){var f;if(u===void 0&&(u=[]),i===void 0&&(i=null),d===void 0&&(d=null),l==null){var x;if(!i)return null;if(i.errors)l=i.matches;else if((x=d)!=null&&x.v7_partialHydration&&u.length===0&&!i.initialized&&i.matches.length>0)l=i.matches;else return null}let h=l,_=(f=i)==null?void 0:f.errors;if(_!=null){let R=h.findIndex(N=>N.route.id&&(_==null?void 0:_[N.route.id])!==void 0);R>=0||Ae(!1),h=h.slice(0,Math.min(h.length,R+1))}let v=!1,C=-1;if(i&&d&&d.v7_partialHydration)for(let R=0;R<h.length;R++){let N=h[R];if((N.route.HydrateFallback||N.route.hydrateFallbackElement)&&(C=R),N.route.id){let{loaderData:M,errors:q}=i,j=N.route.loader&&M[N.route.id]===void 0&&(!q||q[N.route.id]===void 0);if(N.route.lazy||j){v=!0,C>=0?h=h.slice(0,C+1):h=[h[0]];break}}}return h.reduceRight((R,N,M)=>{let q,j=!1,b=null,w=null;i&&(q=_&&N.route.id?_[N.route.id]:void 0,b=N.route.errorElement||$f,v&&(C<0&&M===0?(Zf("route-fallback"),j=!0,w=null):C===M&&(j=!0,w=N.route.hydrateFallbackElement||null)));let I=u.concat(h.slice(0,M+1)),L=()=>{let F;return q?F=b:j?F=w:N.route.Component?F=U.createElement(N.route.Component,null):N.route.element?F=N.route.element:F=R,U.createElement(Wf,{match:N,routeContext:{outlet:R,matches:I,isDataRoute:i!=null},children:F})};return i&&(N.route.ErrorBoundary||N.route.errorElement||M===0)?U.createElement(Vf,{location:i.location,revalidation:i.revalidation,component:b,error:q,children:L(),routeContext:{outlet:null,matches:I,isDataRoute:!0}}):L()},null)}var zc=(function(l){return l.UseBlocker="useBlocker",l.UseRevalidator="useRevalidator",l.UseNavigateStable="useNavigate",l})(zc||{}),Bc=(function(l){return l.UseBlocker="useBlocker",l.UseLoaderData="useLoaderData",l.UseActionData="useActionData",l.UseRouteError="useRouteError",l.UseNavigation="useNavigation",l.UseRouteLoaderData="useRouteLoaderData",l.UseMatches="useMatches",l.UseRevalidator="useRevalidator",l.UseNavigateStable="useNavigate",l.UseRouteId="useRouteId",l})(Bc||{});function Gf(l){let u=U.useContext(ao);return u||Ae(!1),u}function qf(l){let u=U.useContext(Af);return u||Ae(!1),u}function Qf(l){let u=U.useContext(sr);return u||Ae(!1),u}function Uc(l){let u=Qf(),i=u.matches[u.matches.length-1];return i.route.id||Ae(!1),i.route.id}function Kf(){var l;let u=U.useContext(Fc),i=qf(),d=Uc();return u!==void 0?u:(l=i.errors)==null?void 0:l[d]}function Yf(){let{router:l}=Gf(zc.UseNavigateStable),u=Uc(Bc.UseNavigateStable),i=U.useRef(!1);return Dc(()=>{i.current=!0}),U.useCallback(function(f,x){x===void 0&&(x={}),i.current&&(typeof f=="number"?l.navigate(f):l.navigate(f,In({fromRouteId:u},x)))},[l,u])}const gc={};function Zf(l,u,i){gc[l]||(gc[l]=!0)}function Xf(l,u){l==null||l.v7_startTransition,l==null||l.v7_relativeSplatPath}function xc(l){return Mf(l.context)}function Ft(l){Ae(!1)}function Jf(l){let{basename:u="/",children:i=null,location:d,navigationType:f=rr.Pop,navigator:x,static:h=!1,future:_}=l;Fn()&&Ae(!1);let v=u.replace(/^\/*/,"/"),C=U.useMemo(()=>({basename:v,navigator:x,static:h,future:In({v7_relativeSplatPath:!1},_)}),[v,_,x,h]);typeof d=="string"&&(d=Gr(d));let{pathname:R="/",search:N="",hash:M="",state:q=null,key:j="default"}=d,b=U.useMemo(()=>{let w=so(R,v);return w==null?null:{location:{pathname:w,search:N,hash:M,state:q,key:j},navigationType:f}},[v,R,N,M,q,j,f]);return b==null?null:U.createElement(yr.Provider,{value:C},U.createElement(Zs.Provider,{children:i,value:b}))}function em(l){let{children:u,location:i}=l;return zf(eo(u),i)}new Promise(()=>{});function eo(l,u){u===void 0&&(u=[]);let i=[];return U.Children.forEach(l,(d,f)=>{if(!U.isValidElement(d))return;let x=[...u,f];if(d.type===U.Fragment){i.push.apply(i,eo(d.props.children,x));return}d.type!==Ft&&Ae(!1),!d.props.index||!d.props.children||Ae(!1);let h={id:d.props.id||x.join("-"),caseSensitive:d.props.caseSensitive,element:d.props.element,Component:d.props.Component,index:d.props.index,path:d.props.path,loader:d.props.loader,action:d.props.action,errorElement:d.props.errorElement,ErrorBoundary:d.props.ErrorBoundary,hasErrorBoundary:d.props.ErrorBoundary!=null||d.props.errorElement!=null,shouldRevalidate:d.props.shouldRevalidate,handle:d.props.handle,lazy:d.props.lazy};d.props.children&&(h.children=eo(d.props.children,x)),i.push(h)}),i}/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function to(){return to=Object.assign?Object.assign.bind():function(l){for(var u=1;u<arguments.length;u++){var i=arguments[u];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(l[d]=i[d])}return l},to.apply(this,arguments)}function tm(l,u){if(l==null)return{};var i={},d=Object.keys(l),f,x;for(x=0;x<d.length;x++)f=d[x],!(u.indexOf(f)>=0)&&(i[f]=l[f]);return i}function rm(l){return!!(l.metaKey||l.altKey||l.ctrlKey||l.shiftKey)}function nm(l,u){return l.button===0&&(!u||u==="_self")&&!rm(l)}const sm=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],am="6";try{window.__reactRouterVersion=am}catch{}const lm="startTransition",yc=Xp[lm];function om(l){let{basename:u,children:i,future:d,window:f}=l,x=U.useRef();x.current==null&&(x.current=af({window:f,v5Compat:!0}));let h=x.current,[_,v]=U.useState({action:h.action,location:h.location}),{v7_startTransition:C}=d||{},R=U.useCallback(N=>{C&&yc?yc(()=>v(N)):v(N)},[v,C]);return U.useLayoutEffect(()=>h.listen(R),[h,R]),U.useEffect(()=>Xf(d),[d]),U.createElement(Jf,{basename:u,children:i,location:_.location,navigationType:_.action,navigator:h,future:d})}const im=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",um=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Et=U.forwardRef(function(u,i){let{onClick:d,relative:f,reloadDocument:x,replace:h,state:_,target:v,to:C,preventScrollReset:R,viewTransition:N}=u,M=tm(u,sm),{basename:q}=U.useContext(yr),j,b=!1;if(typeof C=="string"&&um.test(C)&&(j=C,im))try{let F=new URL(window.location.href),Q=C.startsWith("//")?new URL(F.protocol+C):new URL(C),ee=so(Q.pathname,q);Q.origin===F.origin&&ee!=null?C=ee+Q.search+Q.hash:b=!0}catch{}let w=Of(C,{relative:f}),I=cm(C,{replace:h,state:_,target:v,preventScrollReset:R,relative:f,viewTransition:N});function L(F){d&&d(F),F.defaultPrevented||I(F)}return U.createElement("a",to({},M,{href:j||w,onClick:b||x?d:L,ref:i,target:v}))});var vc;(function(l){l.UseScrollRestoration="useScrollRestoration",l.UseSubmit="useSubmit",l.UseSubmitFetcher="useSubmitFetcher",l.UseFetcher="useFetcher",l.useViewTransitionState="useViewTransitionState"})(vc||(vc={}));var wc;(function(l){l.UseFetcher="useFetcher",l.UseFetchers="useFetchers",l.UseScrollRestoration="useScrollRestoration"})(wc||(wc={}));function cm(l,u){let{target:i,replace:d,state:f,preventScrollReset:x,relative:h,viewTransition:_}=u===void 0?{}:u,v=If(),C=vr(),R=Mc(l,{relative:h});return U.useCallback(N=>{if(nm(N,i)){N.preventDefault();let M=d!==void 0?d:Qs(C)===Qs(R);v(l,{replace:M,state:f,preventScrollReset:x,relative:h,viewTransition:_})}},[C,v,R,d,f,i,l,x,h,_])}/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dm=l=>l.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),$c=(...l)=>l.filter((u,i,d)=>!!u&&u.trim()!==""&&d.indexOf(u)===i).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var pm={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fm=U.forwardRef(({color:l="currentColor",size:u=24,strokeWidth:i=2,absoluteStrokeWidth:d,className:f="",children:x,iconNode:h,..._},v)=>U.createElement("svg",{ref:v,...pm,width:u,height:u,stroke:l,strokeWidth:d?Number(i)*24/Number(u):i,className:$c("lucide",f),..._},[...h.map(([C,R])=>U.createElement(C,R)),...Array.isArray(x)?x:[x]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=(l,u)=>{const i=U.forwardRef(({className:d,...f},x)=>U.createElement(fm,{ref:x,iconNode:u,className:$c(`lucide-${dm(l)}`,d),...f}));return i.displayName=`${l}`,i};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mm=Le("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hm=Le("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gm=Le("Box",[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xm=Le("ChartColumn",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bc=Le("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ym=Le("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vm=Le("Cloud",[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kc=Le("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vc=Le("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wm=Le("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ks=Le("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bm=Le("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const km=Le("Layers",[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sm=Le("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jm=Le("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nm=Le("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Em=Le("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cm=Le("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _m=Le("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rm=Le("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wc=Le("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);function Hc(l){var u,i,d="";if(typeof l=="string"||typeof l=="number")d+=l;else if(typeof l=="object")if(Array.isArray(l)){var f=l.length;for(u=0;u<f;u++)l[u]&&(i=Hc(l[u]))&&(d&&(d+=" "),d+=i)}else for(i in l)l[i]&&(d&&(d+=" "),d+=i);return d}function Hr(){for(var l,u,i=0,d="",f=arguments.length;i<f;i++)(l=arguments[i])&&(u=Hc(l))&&(d&&(d+=" "),d+=u);return d}const Gc=U.createContext(void 0);function Tm({children:l}){const[u,i]=U.useState(()=>{if(typeof window<"u"){const f=localStorage.getItem("theme");return f||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}return"dark"});U.useEffect(()=>{const f=document.documentElement;u==="dark"?f.classList.add("dark"):f.classList.remove("dark"),localStorage.setItem("theme",u)},[u]);const d=()=>{i(f=>f==="dark"?"light":"dark")};return a.jsx(Gc.Provider,{value:{theme:u,toggleTheme:d},children:l})}function Lm(){const l=U.useContext(Gc);if(!l)throw new Error("useTheme must be used within a ThemeProvider");return l}const Sc=[{href:"/docs/getting-started",label:"Docs"},{href:"/docs/core",label:"API"},{href:"/docs/orm",label:"ORM"},{href:"https://github.com/sitharaj88/vexorjs",label:"GitHub",external:!0}];function Pm(){const[l,u]=U.useState(!1),i=vr(),{theme:d,toggleTheme:f}=Lm();U.useEffect(()=>{u(!1)},[i.pathname]),U.useEffect(()=>(l?document.body.style.overflow="hidden":document.body.style.overflow="",()=>{document.body.style.overflow=""}),[l]);const x=()=>u(!1);return a.jsxs(a.Fragment,{children:[a.jsx("nav",{className:"fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50",children:a.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:a.jsxs("div",{className:"flex items-center justify-between h-16",children:[a.jsxs(Et,{to:"/",className:"flex items-center gap-3",children:[a.jsx("div",{className:"w-8 h-8 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded-lg flex items-center justify-center font-bold text-white",children:"V"}),a.jsx("span",{className:"text-xl font-bold text-slate-900 dark:text-white",children:"Vexor"}),a.jsx("span",{className:"hidden sm:inline text-xs bg-vexor-500/20 text-vexor-600 dark:text-vexor-400 px-2 py-0.5 rounded-full font-medium",children:"v1.0.0"})]}),a.jsx("div",{className:"hidden md:flex items-center gap-8",children:Sc.map(h=>h.external?a.jsxs("a",{href:h.href,target:"_blank",rel:"noopener noreferrer",className:"nav-link text-sm flex items-center gap-1",children:[h.label==="GitHub"&&a.jsx(Ks,{className:"w-4 h-4"}),h.label]},h.href):a.jsx(Et,{to:h.href,className:Hr("nav-link text-sm",i.pathname.startsWith(h.href)&&"active"),children:h.label},h.href))}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("button",{onClick:f,className:"p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors","aria-label":"Toggle theme",children:d==="dark"?a.jsx(Cm,{className:"w-5 h-5"}):a.jsx(Nm,{className:"w-5 h-5"})}),a.jsx("div",{className:"hidden md:flex items-center gap-4",children:a.jsx(Et,{to:"/docs/getting-started",className:"btn-primary text-sm py-2",children:"Get Started"})}),a.jsx("button",{onClick:()=>u(!l),className:"md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",children:l?a.jsx(Rm,{className:"w-6 h-6"}):a.jsx(jm,{className:"w-6 h-6"})})]})]})})}),l&&a.jsxs(a.Fragment,{children:[a.jsx("div",{className:"fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden",onClick:x}),a.jsx("div",{className:"fixed top-16 left-0 right-0 bottom-0 z-40 bg-white dark:bg-slate-900 md:hidden overflow-y-auto",children:a.jsxs("div",{className:"px-4 py-6 space-y-2",children:[Sc.map(h=>h.external?a.jsxs("a",{href:h.href,target:"_blank",rel:"noopener noreferrer",onClick:x,className:"flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors",children:[h.label==="GitHub"&&a.jsx(Ks,{className:"w-5 h-5"}),h.label]},h.href):a.jsx(Et,{to:h.href,onClick:x,className:Hr("block px-4 py-3 rounded-lg transition-colors",i.pathname.startsWith(h.href)?"text-vexor-600 dark:text-vexor-400 bg-vexor-50 dark:bg-vexor-500/10":"text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"),children:h.label},h.href)),a.jsx("div",{className:"pt-4",children:a.jsx(Et,{to:"/docs/getting-started",onClick:x,className:"block w-full btn-primary text-center",children:"Get Started"})})]})})]})]})}const Am=[{title:"Getting Started",links:[{href:"/docs/getting-started",label:"Introduction",icon:a.jsx(hm,{className:"w-4 h-4"})},{href:"/docs/getting-started#installation",label:"Installation"},{href:"/docs/getting-started#quick-start",label:"Quick Start"}]},{title:"Core Concepts",links:[{href:"/docs/core",label:"Overview",icon:a.jsx(gm,{className:"w-4 h-4"})},{href:"/docs/core#routing",label:"Routing"},{href:"/docs/core#context",label:"Context"},{href:"/docs/core#validation",label:"Validation"},{href:"/docs/core#authentication",label:"Authentication"}]},{title:"Vexor ORM",links:[{href:"/docs/orm",label:"Overview",icon:a.jsx(Vc,{className:"w-4 h-4"})},{href:"/docs/orm#schema",label:"Schema Definition"},{href:"/docs/orm#queries",label:"Query Builder"},{href:"/docs/orm#migrations",label:"Migrations"},{href:"/docs/orm#transactions",label:"Transactions"}]},{title:"Middleware",links:[{href:"/docs/middleware",label:"Overview",icon:a.jsx(km,{className:"w-4 h-4"})},{href:"/docs/middleware#cors",label:"CORS"},{href:"/docs/middleware#rate-limit",label:"Rate Limiting"},{href:"/docs/middleware#compression",label:"Compression"},{href:"/docs/middleware#upload",label:"File Upload"}]},{title:"Real-time",links:[{href:"/docs/realtime",label:"Overview",icon:a.jsx(Wc,{className:"w-4 h-4"})},{href:"/docs/realtime#websocket",label:"WebSocket"},{href:"/docs/realtime#sse",label:"Server-Sent Events"},{href:"/docs/realtime#pubsub",label:"Pub/Sub"}]},{title:"Deployment",links:[{href:"/docs/deployment",label:"Overview",icon:a.jsx(vm,{className:"w-4 h-4"})},{href:"/docs/deployment#node",label:"Node.js"},{href:"/docs/deployment#bun",label:"Bun"},{href:"/docs/deployment#lambda",label:"AWS Lambda"},{href:"/docs/deployment#cloudflare",label:"Cloudflare Workers"}]}];function Om(){const l=vr();return a.jsx("aside",{className:"hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800/50 overflow-y-auto scrollbar-hide",children:a.jsx("nav",{className:"p-4 space-y-6",children:Am.map(u=>a.jsxs("div",{children:[a.jsx("h3",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4",children:u.title}),a.jsx("ul",{className:"space-y-1",children:u.links.map(i=>{const d=l.pathname===i.href||l.pathname+l.hash===i.href;return a.jsx("li",{children:a.jsxs(Et,{to:i.href,className:Hr("sidebar-link flex items-center gap-2",d&&"active"),children:[i.icon,i.label]})},i.href)})})]},u.title))})})}function Im(){const l=vr(),u=l.pathname==="/"||l.pathname==="",i=l.pathname.startsWith("/docs");return a.jsxs("div",{className:"min-h-screen bg-white dark:bg-slate-950 transition-colors",children:[a.jsx(Pm,{}),i?a.jsxs("div",{className:"flex pt-16",children:[a.jsx(Om,{}),a.jsx("main",{className:"flex-1 md:ml-64 p-4 md:p-8",children:a.jsx("div",{className:"max-w-4xl mx-auto",children:a.jsx(xc,{})})})]}):a.jsx("main",{className:u?"":"pt-16",children:a.jsx(xc,{})})]})}var Fm=Object.create,Xs=Object.defineProperty,Dm=Object.defineProperties,Mm=Object.getOwnPropertyDescriptor,zm=Object.getOwnPropertyDescriptors,qc=Object.getOwnPropertyNames,Ys=Object.getOwnPropertySymbols,Bm=Object.getPrototypeOf,lo=Object.prototype.hasOwnProperty,Qc=Object.prototype.propertyIsEnumerable,jc=(l,u,i)=>u in l?Xs(l,u,{enumerable:!0,configurable:!0,writable:!0,value:i}):l[u]=i,Ct=(l,u)=>{for(var i in u||(u={}))lo.call(u,i)&&jc(l,i,u[i]);if(Ys)for(var i of Ys(u))Qc.call(u,i)&&jc(l,i,u[i]);return l},Js=(l,u)=>Dm(l,zm(u)),Kc=(l,u)=>{var i={};for(var d in l)lo.call(l,d)&&u.indexOf(d)<0&&(i[d]=l[d]);if(l!=null&&Ys)for(var d of Ys(l))u.indexOf(d)<0&&Qc.call(l,d)&&(i[d]=l[d]);return i},Um=(l,u)=>function(){return u||(0,l[qc(l)[0]])((u={exports:{}}).exports,u),u.exports},$m=(l,u)=>{for(var i in u)Xs(l,i,{get:u[i],enumerable:!0})},Vm=(l,u,i,d)=>{if(u&&typeof u=="object"||typeof u=="function")for(let f of qc(u))!lo.call(l,f)&&f!==i&&Xs(l,f,{get:()=>u[f],enumerable:!(d=Mm(u,f))||d.enumerable});return l},Wm=(l,u,i)=>(i=l!=null?Fm(Bm(l)):{},Vm(!l||!l.__esModule?Xs(i,"default",{value:l,enumerable:!0}):i,l)),Hm=Um({"../../node_modules/.pnpm/prismjs@1.29.0_patch_hash=vrxx3pzkik6jpmgpayxfjunetu/node_modules/prismjs/prism.js"(l,u){var i=(function(){var d=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,f=0,x={},h={util:{encode:function j(b){return b instanceof _?new _(b.type,j(b.content),b.alias):Array.isArray(b)?b.map(j):b.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(j){return Object.prototype.toString.call(j).slice(8,-1)},objId:function(j){return j.__id||Object.defineProperty(j,"__id",{value:++f}),j.__id},clone:function j(b,w){w=w||{};var I,L;switch(h.util.type(b)){case"Object":if(L=h.util.objId(b),w[L])return w[L];I={},w[L]=I;for(var F in b)b.hasOwnProperty(F)&&(I[F]=j(b[F],w));return I;case"Array":return L=h.util.objId(b),w[L]?w[L]:(I=[],w[L]=I,b.forEach(function(Q,ee){I[ee]=j(Q,w)}),I);default:return b}},getLanguage:function(j){for(;j;){var b=d.exec(j.className);if(b)return b[1].toLowerCase();j=j.parentElement}return"none"},setLanguage:function(j,b){j.className=j.className.replace(RegExp(d,"gi"),""),j.classList.add("language-"+b)},isActive:function(j,b,w){for(var I="no-"+b;j;){var L=j.classList;if(L.contains(b))return!0;if(L.contains(I))return!1;j=j.parentElement}return!!w}},languages:{plain:x,plaintext:x,text:x,txt:x,extend:function(j,b){var w=h.util.clone(h.languages[j]);for(var I in b)w[I]=b[I];return w},insertBefore:function(j,b,w,I){I=I||h.languages;var L=I[j],F={};for(var Q in L)if(L.hasOwnProperty(Q)){if(Q==b)for(var ee in w)w.hasOwnProperty(ee)&&(F[ee]=w[ee]);w.hasOwnProperty(Q)||(F[Q]=L[Q])}var ue=I[j];return I[j]=F,h.languages.DFS(h.languages,function(le,me){me===ue&&le!=j&&(this[le]=F)}),F},DFS:function j(b,w,I,L){L=L||{};var F=h.util.objId;for(var Q in b)if(b.hasOwnProperty(Q)){w.call(b,Q,b[Q],I||Q);var ee=b[Q],ue=h.util.type(ee);ue==="Object"&&!L[F(ee)]?(L[F(ee)]=!0,j(ee,w,null,L)):ue==="Array"&&!L[F(ee)]&&(L[F(ee)]=!0,j(ee,w,Q,L))}}},plugins:{},highlight:function(j,b,w){var I={code:j,grammar:b,language:w};if(h.hooks.run("before-tokenize",I),!I.grammar)throw new Error('The language "'+I.language+'" has no grammar.');return I.tokens=h.tokenize(I.code,I.grammar),h.hooks.run("after-tokenize",I),_.stringify(h.util.encode(I.tokens),I.language)},tokenize:function(j,b){var w=b.rest;if(w){for(var I in w)b[I]=w[I];delete b.rest}var L=new R;return N(L,L.head,j),C(j,L,b,L.head,0),q(L)},hooks:{all:{},add:function(j,b){var w=h.hooks.all;w[j]=w[j]||[],w[j].push(b)},run:function(j,b){var w=h.hooks.all[j];if(!(!w||!w.length))for(var I=0,L;L=w[I++];)L(b)}},Token:_};function _(j,b,w,I){this.type=j,this.content=b,this.alias=w,this.length=(I||"").length|0}_.stringify=function j(b,w){if(typeof b=="string")return b;if(Array.isArray(b)){var I="";return b.forEach(function(ue){I+=j(ue,w)}),I}var L={type:b.type,content:j(b.content,w),tag:"span",classes:["token",b.type],attributes:{},language:w},F=b.alias;F&&(Array.isArray(F)?Array.prototype.push.apply(L.classes,F):L.classes.push(F)),h.hooks.run("wrap",L);var Q="";for(var ee in L.attributes)Q+=" "+ee+'="'+(L.attributes[ee]||"").replace(/"/g,"&quot;")+'"';return"<"+L.tag+' class="'+L.classes.join(" ")+'"'+Q+">"+L.content+"</"+L.tag+">"};function v(j,b,w,I){j.lastIndex=b;var L=j.exec(w);if(L&&I&&L[1]){var F=L[1].length;L.index+=F,L[0]=L[0].slice(F)}return L}function C(j,b,w,I,L,F){for(var Q in w)if(!(!w.hasOwnProperty(Q)||!w[Q])){var ee=w[Q];ee=Array.isArray(ee)?ee:[ee];for(var ue=0;ue<ee.length;++ue){if(F&&F.cause==Q+","+ue)return;var le=ee[ue],me=le.inside,ke=!!le.lookbehind,Fe=!!le.greedy,Be=le.alias;if(Fe&&!le.pattern.global){var Ee=le.pattern.toString().match(/[imsuy]*$/)[0];le.pattern=RegExp(le.pattern.source,Ee+"g")}for(var Ve=le.pattern||le,he=I.next,Ce=L;he!==b.tail&&!(F&&Ce>=F.reach);Ce+=he.value.length,he=he.next){var _e=he.value;if(b.length>j.length)return;if(!(_e instanceof _)){var xe=1,B;if(Fe){if(B=v(Ve,Ce,j,ke),!B||B.index>=j.length)break;var P=B.index,J=B.index+B[0].length,$=Ce;for($+=he.value.length;P>=$;)he=he.next,$+=he.value.length;if($-=he.value.length,Ce=$,he.value instanceof _)continue;for(var y=he;y!==b.tail&&($<J||typeof y.value=="string");y=y.next)xe++,$+=y.value.length;xe--,_e=j.slice(Ce,$),B.index-=Ce}else if(B=v(Ve,0,_e,ke),!B)continue;var P=B.index,re=B[0],ne=_e.slice(0,P),oe=_e.slice(P+re.length),ae=Ce+_e.length;F&&ae>F.reach&&(F.reach=ae);var de=he.prev;ne&&(de=N(b,de,ne),Ce+=ne.length),M(b,de,xe);var pe=new _(Q,me?h.tokenize(re,me):re,Be,re);if(he=N(b,de,pe),oe&&N(b,he,oe),xe>1){var ge={cause:Q+","+ue,reach:ae};C(j,b,w,he.prev,Ce,ge),F&&ge.reach>F.reach&&(F.reach=ge.reach)}}}}}}function R(){var j={value:null,prev:null,next:null},b={value:null,prev:j,next:null};j.next=b,this.head=j,this.tail=b,this.length=0}function N(j,b,w){var I=b.next,L={value:w,prev:b,next:I};return b.next=L,I.prev=L,j.length++,L}function M(j,b,w){for(var I=b.next,L=0;L<w&&I!==j.tail;L++)I=I.next;b.next=I,I.prev=b,j.length-=L}function q(j){for(var b=[],w=j.head.next;w!==j.tail;)b.push(w.value),w=w.next;return b}return h})();u.exports=i,i.default=i}}),T=Wm(Hm());T.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},T.languages.markup.tag.inside["attr-value"].inside.entity=T.languages.markup.entity,T.languages.markup.doctype.inside["internal-subset"].inside=T.languages.markup,T.hooks.add("wrap",function(l){l.type==="entity"&&(l.attributes.title=l.content.replace(/&amp;/,"&"))}),Object.defineProperty(T.languages.markup.tag,"addInlined",{value:function(l,d){var i={},i=(i["language-"+d]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:T.languages[d]},i.cdata=/^<!\[CDATA\[|\]\]>$/i,{"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:i}}),d=(i["language-"+d]={pattern:/[\s\S]+/,inside:T.languages[d]},{});d[l]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return l}),"i"),lookbehind:!0,greedy:!0,inside:i},T.languages.insertBefore("markup","cdata",d)}}),Object.defineProperty(T.languages.markup.tag,"addAttribute",{value:function(l,u){T.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+l+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[u,"language-"+u],inside:T.languages[u]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),T.languages.html=T.languages.markup,T.languages.mathml=T.languages.markup,T.languages.svg=T.languages.markup,T.languages.xml=T.languages.extend("markup",{}),T.languages.ssml=T.languages.xml,T.languages.atom=T.languages.xml,T.languages.rss=T.languages.xml,(function(l){var u={pattern:/\\[\\(){}[\]^$+*?|.]/,alias:"escape"},i=/\\(?:x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]+\}|0[0-7]{0,2}|[123][0-7]{2}|c[a-zA-Z]|.)/,d="(?:[^\\\\-]|"+i.source+")",d=RegExp(d+"-"+d),f={pattern:/(<|')[^<>']+(?=[>']$)/,lookbehind:!0,alias:"variable"};l.languages.regex={"char-class":{pattern:/((?:^|[^\\])(?:\\\\)*)\[(?:[^\\\]]|\\[\s\S])*\]/,lookbehind:!0,inside:{"char-class-negation":{pattern:/(^\[)\^/,lookbehind:!0,alias:"operator"},"char-class-punctuation":{pattern:/^\[|\]$/,alias:"punctuation"},range:{pattern:d,inside:{escape:i,"range-punctuation":{pattern:/-/,alias:"operator"}}},"special-escape":u,"char-set":{pattern:/\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},escape:i}},"special-escape":u,"char-set":{pattern:/\.|\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},backreference:[{pattern:/\\(?![123][0-7]{2})[1-9]/,alias:"keyword"},{pattern:/\\k<[^<>']+>/,alias:"keyword",inside:{"group-name":f}}],anchor:{pattern:/[$^]|\\[ABbGZz]/,alias:"function"},escape:i,group:[{pattern:/\((?:\?(?:<[^<>']+>|'[^<>']+'|[>:]|<?[=!]|[idmnsuxU]+(?:-[idmnsuxU]+)?:?))?/,alias:"punctuation",inside:{"group-name":f}},{pattern:/\)/,alias:"punctuation"}],quantifier:{pattern:/(?:[+*?]|\{\d+(?:,\d*)?\})[?+]?/,alias:"number"},alternation:{pattern:/\|/,alias:"keyword"}}})(T),T.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},T.languages.javascript=T.languages.extend("clike",{"class-name":[T.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),T.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,T.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:T.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:T.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:T.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:T.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:T.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),T.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:T.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),T.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),T.languages.markup&&(T.languages.markup.tag.addInlined("script","javascript"),T.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),T.languages.js=T.languages.javascript,T.languages.actionscript=T.languages.extend("javascript",{keyword:/\b(?:as|break|case|catch|class|const|default|delete|do|dynamic|each|else|extends|final|finally|for|function|get|if|implements|import|in|include|instanceof|interface|internal|is|namespace|native|new|null|override|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|use|var|void|while|with)\b/,operator:/\+\+|--|(?:[+\-*\/%^]|&&?|\|\|?|<<?|>>?>?|[!=]=?)=?|[~?@]/}),T.languages.actionscript["class-name"].alias="function",delete T.languages.actionscript.parameter,delete T.languages.actionscript["literal-property"],T.languages.markup&&T.languages.insertBefore("actionscript","string",{xml:{pattern:/(^|[^.])<\/?\w+(?:\s+[^\s>\/=]+=("|')(?:\\[\s\S]|(?!\2)[^\\])*\2)*\s*\/?>/,lookbehind:!0,inside:T.languages.markup}}),(function(l){var u=/#(?!\{).+/,i={pattern:/#\{[^}]+\}/,alias:"variable"};l.languages.coffeescript=l.languages.extend("javascript",{comment:u,string:[{pattern:/'(?:\\[\s\S]|[^\\'])*'/,greedy:!0},{pattern:/"(?:\\[\s\S]|[^\\"])*"/,greedy:!0,inside:{interpolation:i}}],keyword:/\b(?:and|break|by|catch|class|continue|debugger|delete|do|each|else|extend|extends|false|finally|for|if|in|instanceof|is|isnt|let|loop|namespace|new|no|not|null|of|off|on|or|own|return|super|switch|then|this|throw|true|try|typeof|undefined|unless|until|when|while|window|with|yes|yield)\b/,"class-member":{pattern:/@(?!\d)\w+/,alias:"variable"}}),l.languages.insertBefore("coffeescript","comment",{"multiline-comment":{pattern:/###[\s\S]+?###/,alias:"comment"},"block-regex":{pattern:/\/{3}[\s\S]*?\/{3}/,alias:"regex",inside:{comment:u,interpolation:i}}}),l.languages.insertBefore("coffeescript","string",{"inline-javascript":{pattern:/`(?:\\[\s\S]|[^\\`])*`/,inside:{delimiter:{pattern:/^`|`$/,alias:"punctuation"},script:{pattern:/[\s\S]+/,alias:"language-javascript",inside:l.languages.javascript}}},"multiline-string":[{pattern:/'''[\s\S]*?'''/,greedy:!0,alias:"string"},{pattern:/"""[\s\S]*?"""/,greedy:!0,alias:"string",inside:{interpolation:i}}]}),l.languages.insertBefore("coffeescript","keyword",{property:/(?!\d)\w+(?=\s*:(?!:))/}),delete l.languages.coffeescript["template-string"],l.languages.coffee=l.languages.coffeescript})(T),(function(l){var u=l.languages.javadoclike={parameter:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*@(?:arg|arguments|param)\s+)\w+/m,lookbehind:!0},keyword:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,lookbehind:!0},punctuation:/[{}]/};Object.defineProperty(u,"addSupport",{value:function(i,d){(i=typeof i=="string"?[i]:i).forEach(function(f){var x=function(N){N.inside||(N.inside={}),N.inside.rest=d},h="doc-comment";if(_=l.languages[f]){var _,v=_[h];if((v=v||(_=l.languages.insertBefore(f,"comment",{"doc-comment":{pattern:/(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/,lookbehind:!0,alias:"comment"}}))[h])instanceof RegExp&&(v=_[h]={pattern:v}),Array.isArray(v))for(var C=0,R=v.length;C<R;C++)v[C]instanceof RegExp&&(v[C]={pattern:v[C]}),x(v[C]);else x(v)}})}}),u.addSupport(["java","javascript","php"],u)})(T),(function(l){var u=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/,u=(l.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+u.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+u.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+u.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+u.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:u,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},l.languages.css.atrule.inside.rest=l.languages.css,l.languages.markup);u&&(u.tag.addInlined("style","css"),u.tag.addAttribute("style","css"))})(T),(function(l){var u=/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,u=(l.languages.css.selector={pattern:l.languages.css.selector.pattern,lookbehind:!0,inside:u={"pseudo-element":/:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,"pseudo-class":/:[-\w]+/,class:/\.[-\w]+/,id:/#[-\w]+/,attribute:{pattern:RegExp(`\\[(?:[^[\\]"']|`+u.source+")*\\]"),greedy:!0,inside:{punctuation:/^\[|\]$/,"case-sensitivity":{pattern:/(\s)[si]$/i,lookbehind:!0,alias:"keyword"},namespace:{pattern:/^(\s*)(?:(?!\s)[-*\w\xA0-\uFFFF])*\|(?!=)/,lookbehind:!0,inside:{punctuation:/\|$/}},"attr-name":{pattern:/^(\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+/,lookbehind:!0},"attr-value":[u,{pattern:/(=\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+(?=\s*$)/,lookbehind:!0}],operator:/[|~*^$]?=/}},"n-th":[{pattern:/(\(\s*)[+-]?\d*[\dn](?:\s*[+-]\s*\d+)?(?=\s*\))/,lookbehind:!0,inside:{number:/[\dn]+/,operator:/[+-]/}},{pattern:/(\(\s*)(?:even|odd)(?=\s*\))/i,lookbehind:!0}],combinator:/>|\+|~|\|\|/,punctuation:/[(),]/}},l.languages.css.atrule.inside["selector-function-argument"].inside=u,l.languages.insertBefore("css","property",{variable:{pattern:/(^|[^-\w\xA0-\uFFFF])--(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*/i,lookbehind:!0}}),{pattern:/(\b\d+)(?:%|[a-z]+(?![\w-]))/,lookbehind:!0}),i={pattern:/(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/,lookbehind:!0};l.languages.insertBefore("css","function",{operator:{pattern:/(\s)[+\-*\/](?=\s)/,lookbehind:!0},hexcode:{pattern:/\B#[\da-f]{3,8}\b/i,alias:"color"},color:[{pattern:/(^|[^\w-])(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGr[ae]y|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGr[ae]y|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGr[ae]y|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gr[ae]y|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGr[ae]y|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGr[ae]y|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGr[ae]y|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Transparent|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)(?![\w-])/i,lookbehind:!0},{pattern:/\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,inside:{unit:u,number:i,function:/[\w-]+(?=\()/,punctuation:/[(),]/}}],entity:/\\[\da-f]{1,8}/i,unit:u,number:i})})(T),(function(l){var u=/[*&][^\s[\]{},]+/,i=/!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/,d="(?:"+i.source+"(?:[ 	]+"+u.source+")?|"+u.source+"(?:[ 	]+"+i.source+")?)",f=/(?:[^\s\x00-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source.replace(/<PLAIN>/g,function(){return/[^\s\x00-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/.source}),x=/"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source;function h(_,v){v=(v||"").replace(/m/g,"")+"m";var C=/([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:[\r\n]\s*)?#))/.source.replace(/<<prop>>/g,function(){return d}).replace(/<<value>>/g,function(){return _});return RegExp(C,v)}l.languages.yaml={scalar:{pattern:RegExp(/([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\S[^\r\n]*(?:\2[^\r\n]+)*)/.source.replace(/<<prop>>/g,function(){return d})),lookbehind:!0,alias:"string"},comment:/#.*/,key:{pattern:RegExp(/((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source.replace(/<<prop>>/g,function(){return d}).replace(/<<key>>/g,function(){return"(?:"+f+"|"+x+")"})),lookbehind:!0,greedy:!0,alias:"atrule"},directive:{pattern:/(^[ \t]*)%.+/m,lookbehind:!0,alias:"important"},datetime:{pattern:h(/\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source),lookbehind:!0,alias:"number"},boolean:{pattern:h(/false|true/.source,"i"),lookbehind:!0,alias:"important"},null:{pattern:h(/null|~/.source,"i"),lookbehind:!0,alias:"important"},string:{pattern:h(x),lookbehind:!0,greedy:!0},number:{pattern:h(/[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source,"i"),lookbehind:!0},tag:i,important:u,punctuation:/---|[:[\]{}\-,|>?]|\.\.\./},l.languages.yml=l.languages.yaml})(T),(function(l){var u=/(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;function i(C){return C=C.replace(/<inner>/g,function(){return u}),RegExp(/((?:^|[^\\])(?:\\{2})*)/.source+"(?:"+C+")")}var d=/(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source,f=/\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(/__/g,function(){return d}),x=/\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source,h=(l.languages.markdown=l.languages.extend("markup",{}),l.languages.insertBefore("markdown","prolog",{"front-matter-block":{pattern:/(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,lookbehind:!0,greedy:!0,inside:{punctuation:/^---|---$/,"front-matter":{pattern:/\S+(?:\s+\S+)*/,alias:["yaml","language-yaml"],inside:l.languages.yaml}}},blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},table:{pattern:RegExp("^"+f+x+"(?:"+f+")*","m"),inside:{"table-data-rows":{pattern:RegExp("^("+f+x+")(?:"+f+")*$"),lookbehind:!0,inside:{"table-data":{pattern:RegExp(d),inside:l.languages.markdown},punctuation:/\|/}},"table-line":{pattern:RegExp("^("+f+")"+x+"$"),lookbehind:!0,inside:{punctuation:/\||:?-{3,}:?/}},"table-header-row":{pattern:RegExp("^"+f+"$"),inside:{"table-header":{pattern:RegExp(d),alias:"important",inside:l.languages.markdown},punctuation:/\|/}}}},code:[{pattern:/((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,lookbehind:!0,alias:"keyword"},{pattern:/^```[\s\S]*?^```$/m,greedy:!0,inside:{"code-block":{pattern:/^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,lookbehind:!0},"code-language":{pattern:/^(```).+/,lookbehind:!0},punctuation:/```/}}],title:[{pattern:/\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:i(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^..)[\s\S]+(?=..$)/,lookbehind:!0,inside:{}},punctuation:/\*\*|__/}},italic:{pattern:i(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^.)[\s\S]+(?=.$)/,lookbehind:!0,inside:{}},punctuation:/[*_]/}},strike:{pattern:i(/(~~?)(?:(?!~)<inner>)+\2/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^~~?)[\s\S]+(?=\1$)/,lookbehind:!0,inside:{}},punctuation:/~~?/}},"code-snippet":{pattern:/(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,lookbehind:!0,greedy:!0,alias:["code","keyword"]},url:{pattern:i(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source),lookbehind:!0,greedy:!0,inside:{operator:/^!/,content:{pattern:/(^\[)[^\]]+(?=\])/,lookbehind:!0,inside:{}},variable:{pattern:/(^\][ \t]?\[)[^\]]+(?=\]$)/,lookbehind:!0},url:{pattern:/(^\]\()[^\s)]+/,lookbehind:!0},string:{pattern:/(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,lookbehind:!0}}}}),["url","bold","italic","strike"].forEach(function(C){["url","bold","italic","strike","code-snippet"].forEach(function(R){C!==R&&(l.languages.markdown[C].inside.content.inside[R]=l.languages.markdown[R])})}),l.hooks.add("after-tokenize",function(C){C.language!=="markdown"&&C.language!=="md"||(function R(N){if(N&&typeof N!="string")for(var M=0,q=N.length;M<q;M++){var j,b=N[M];b.type!=="code"?R(b.content):(j=b.content[1],b=b.content[3],j&&b&&j.type==="code-language"&&b.type==="code-block"&&typeof j.content=="string"&&(j=j.content.replace(/\b#/g,"sharp").replace(/\b\+\+/g,"pp"),j="language-"+(j=(/[a-z][\w-]*/i.exec(j)||[""])[0].toLowerCase()),b.alias?typeof b.alias=="string"?b.alias=[b.alias,j]:b.alias.push(j):b.alias=[j]))}})(C.tokens)}),l.hooks.add("wrap",function(C){if(C.type==="code-block"){for(var R="",N=0,M=C.classes.length;N<M;N++){var q=C.classes[N],q=/language-(.+)/.exec(q);if(q){R=q[1];break}}var j,b=l.languages[R];b?C.content=l.highlight((function(w){return w=w.replace(h,""),w=w.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi,function(I,L){var F;return(L=L.toLowerCase())[0]==="#"?(F=L[1]==="x"?parseInt(L.slice(2),16):Number(L.slice(1)),v(F)):_[L]||I})})(C.content),b,R):R&&R!=="none"&&l.plugins.autoloader&&(j="md-"+new Date().valueOf()+"-"+Math.floor(1e16*Math.random()),C.attributes.id=j,l.plugins.autoloader.loadLanguages(R,function(){var w=document.getElementById(j);w&&(w.innerHTML=l.highlight(w.textContent,l.languages[R],R))}))}}),RegExp(l.languages.markup.tag.pattern.source,"gi")),_={amp:"&",lt:"<",gt:">",quot:'"'},v=String.fromCodePoint||String.fromCharCode;l.languages.md=l.languages.markdown})(T),T.languages.graphql={comment:/#.*/,description:{pattern:/(?:"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*")(?=\s*[a-z_])/i,greedy:!0,alias:"string",inside:{"language-markdown":{pattern:/(^"(?:"")?)(?!\1)[\s\S]+(?=\1$)/,lookbehind:!0,inside:T.languages.markdown}}},string:{pattern:/"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*"/,greedy:!0},number:/(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,boolean:/\b(?:false|true)\b/,variable:/\$[a-z_]\w*/i,directive:{pattern:/@[a-z_]\w*/i,alias:"function"},"attr-name":{pattern:/\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i,greedy:!0},"atom-input":{pattern:/\b[A-Z]\w*Input\b/,alias:"class-name"},scalar:/\b(?:Boolean|Float|ID|Int|String)\b/,constant:/\b[A-Z][A-Z_\d]*\b/,"class-name":{pattern:/(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/,lookbehind:!0},fragment:{pattern:/(\bfragment\s+|\.{3}\s*(?!on\b))[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},"definition-mutation":{pattern:/(\bmutation\s+)[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},"definition-query":{pattern:/(\bquery\s+)[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},keyword:/\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/,operator:/[!=|&]|\.{3}/,"property-query":/\w+(?=\s*\()/,object:/\w+(?=\s*\{)/,punctuation:/[!(){}\[\]:=,]/,property:/\w+/},T.hooks.add("after-tokenize",function(l){if(l.language==="graphql")for(var u=l.tokens.filter(function(j){return typeof j!="string"&&j.type!=="comment"&&j.type!=="scalar"}),i=0;i<u.length;){var d=u[i++];if(d.type==="keyword"&&d.content==="mutation"){var f=[];if(N(["definition-mutation","punctuation"])&&R(1).content==="("){i+=2;var x=M(/^\($/,/^\)$/);if(x===-1)continue;for(;i<x;i++){var h=R(0);h.type==="variable"&&(q(h,"variable-input"),f.push(h.content))}i=x+1}if(N(["punctuation","property-query"])&&R(0).content==="{"&&(i++,q(R(0),"property-mutation"),0<f.length)){var _=M(/^\{$/,/^\}$/);if(_!==-1)for(var v=i;v<_;v++){var C=u[v];C.type==="variable"&&0<=f.indexOf(C.content)&&q(C,"variable-input")}}}}function R(j){return u[i+j]}function N(j,b){b=b||0;for(var w=0;w<j.length;w++){var I=R(w+b);if(!I||I.type!==j[w])return}return 1}function M(j,b){for(var w=1,I=i;I<u.length;I++){var L=u[I],F=L.content;if(L.type==="punctuation"&&typeof F=="string"){if(j.test(F))w++;else if(b.test(F)&&--w===0)return I}}return-1}function q(j,b){var w=j.alias;w?Array.isArray(w)||(j.alias=w=[w]):j.alias=w=[],w.push(b)}}),T.languages.sql={comment:{pattern:/(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,lookbehind:!0},variable:[{pattern:/@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,greedy:!0},/@[\w.$]+/],string:{pattern:/(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,greedy:!0,lookbehind:!0},identifier:{pattern:/(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,greedy:!0,lookbehind:!0,inside:{punctuation:/^`|`$/}},function:/\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i,keyword:/\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,boolean:/\b(?:FALSE|NULL|TRUE)\b/i,number:/\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,operator:/[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,punctuation:/[;[\]()`,.]/},(function(l){var u=l.languages.javascript["template-string"],i=u.pattern.source,d=u.inside.interpolation,f=d.inside["interpolation-punctuation"],x=d.pattern.source;function h(N,M){if(l.languages[N])return{pattern:RegExp("((?:"+M+")\\s*)"+i),lookbehind:!0,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},"embedded-code":{pattern:/[\s\S]+/,alias:N}}}}function _(N,M,q){return N={code:N,grammar:M,language:q},l.hooks.run("before-tokenize",N),N.tokens=l.tokenize(N.code,N.grammar),l.hooks.run("after-tokenize",N),N.tokens}function v(N,M,q){var w=l.tokenize(N,{interpolation:{pattern:RegExp(x),lookbehind:!0}}),j=0,b={},w=_(w.map(function(L){if(typeof L=="string")return L;for(var F,Q,L=L.content;N.indexOf((Q=j++,F="___"+q.toUpperCase()+"_"+Q+"___"))!==-1;);return b[F]=L,F}).join(""),M,q),I=Object.keys(b);return j=0,(function L(F){for(var Q=0;Q<F.length;Q++){if(j>=I.length)return;var ee,ue,le,me,ke,Fe,Be,Ee=F[Q];typeof Ee=="string"||typeof Ee.content=="string"?(ee=I[j],(Be=(Fe=typeof Ee=="string"?Ee:Ee.content).indexOf(ee))!==-1&&(++j,ue=Fe.substring(0,Be),ke=b[ee],le=void 0,(me={})["interpolation-punctuation"]=f,(me=l.tokenize(ke,me)).length===3&&((le=[1,1]).push.apply(le,_(me[1],l.languages.javascript,"javascript")),me.splice.apply(me,le)),le=new l.Token("interpolation",me,d.alias,ke),me=Fe.substring(Be+ee.length),ke=[],ue&&ke.push(ue),ke.push(le),me&&(L(Fe=[me]),ke.push.apply(ke,Fe)),typeof Ee=="string"?(F.splice.apply(F,[Q,1].concat(ke)),Q+=ke.length-1):Ee.content=ke)):(Be=Ee.content,Array.isArray(Be)?L(Be):L([Be]))}})(w),new l.Token(q,w,"language-"+q,N)}l.languages.javascript["template-string"]=[h("css",/\b(?:styled(?:\([^)]*\))?(?:\s*\.\s*\w+(?:\([^)]*\))*)*|css(?:\s*\.\s*(?:global|resolve))?|createGlobalStyle|keyframes)/.source),h("html",/\bhtml|\.\s*(?:inner|outer)HTML\s*\+?=/.source),h("svg",/\bsvg/.source),h("markdown",/\b(?:markdown|md)/.source),h("graphql",/\b(?:gql|graphql(?:\s*\.\s*experimental)?)/.source),h("sql",/\bsql/.source),u].filter(Boolean);var C={javascript:!0,js:!0,typescript:!0,ts:!0,jsx:!0,tsx:!0};function R(N){return typeof N=="string"?N:Array.isArray(N)?N.map(R).join(""):R(N.content)}l.hooks.add("after-tokenize",function(N){N.language in C&&(function M(q){for(var j=0,b=q.length;j<b;j++){var w,I,L,F=q[j];typeof F!="string"&&(w=F.content,Array.isArray(w)?F.type==="template-string"?(F=w[1],w.length===3&&typeof F!="string"&&F.type==="embedded-code"&&(I=R(F),F=F.alias,F=Array.isArray(F)?F[0]:F,L=l.languages[F])&&(w[1]=v(I,L,F))):M(w):typeof w!="string"&&M([w]))}})(N.tokens)})})(T),(function(l){l.languages.typescript=l.languages.extend("javascript",{"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,lookbehind:!0,greedy:!0,inside:null},builtin:/\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/}),l.languages.typescript.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/,/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,/\btype\b(?=\s*(?:[\{*]|$))/),delete l.languages.typescript.parameter,delete l.languages.typescript["literal-property"];var u=l.languages.extend("typescript",{});delete u["class-name"],l.languages.typescript["class-name"].inside=u,l.languages.insertBefore("typescript","function",{decorator:{pattern:/@[$\w\xA0-\uFFFF]+/,inside:{at:{pattern:/^@/,alias:"operator"},function:/^[\s\S]+/}},"generic-function":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,greedy:!0,inside:{function:/^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:u}}}}),l.languages.ts=l.languages.typescript})(T),(function(l){var u=l.languages.javascript,i=/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})+\}/.source,d="(@(?:arg|argument|param|property)\\s+(?:"+i+"\\s+)?)";l.languages.jsdoc=l.languages.extend("javadoclike",{parameter:{pattern:RegExp(d+/(?:(?!\s)[$\w\xA0-\uFFFF.])+(?=\s|$)/.source),lookbehind:!0,inside:{punctuation:/\./}}}),l.languages.insertBefore("jsdoc","keyword",{"optional-parameter":{pattern:RegExp(d+/\[(?:(?!\s)[$\w\xA0-\uFFFF.])+(?:=[^[\]]+)?\](?=\s|$)/.source),lookbehind:!0,inside:{parameter:{pattern:/(^\[)[$\w\xA0-\uFFFF\.]+/,lookbehind:!0,inside:{punctuation:/\./}},code:{pattern:/(=)[\s\S]*(?=\]$)/,lookbehind:!0,inside:u,alias:"language-javascript"},punctuation:/[=[\]]/}},"class-name":[{pattern:RegExp(/(@(?:augments|class|extends|interface|memberof!?|template|this|typedef)\s+(?:<TYPE>\s+)?)[A-Z]\w*(?:\.[A-Z]\w*)*/.source.replace(/<TYPE>/g,function(){return i})),lookbehind:!0,inside:{punctuation:/\./}},{pattern:RegExp("(@[a-z]+\\s+)"+i),lookbehind:!0,inside:{string:u.string,number:u.number,boolean:u.boolean,keyword:l.languages.typescript.keyword,operator:/=>|\.\.\.|[&|?:*]/,punctuation:/[.,;=<>{}()[\]]/}}],example:{pattern:/(@example\s+(?!\s))(?:[^@\s]|\s+(?!\s))+?(?=\s*(?:\*\s*)?(?:@\w|\*\/))/,lookbehind:!0,inside:{code:{pattern:/^([\t ]*(?:\*\s*)?)\S.*$/m,lookbehind:!0,inside:u,alias:"language-javascript"}}}}),l.languages.javadoclike.addSupport("javascript",l.languages.jsdoc)})(T),(function(l){l.languages.flow=l.languages.extend("javascript",{}),l.languages.insertBefore("flow","keyword",{type:[{pattern:/\b(?:[Bb]oolean|Function|[Nn]umber|[Ss]tring|[Ss]ymbol|any|mixed|null|void)\b/,alias:"class-name"}]}),l.languages.flow["function-variable"].pattern=/(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=\s*(?:function\b|(?:\([^()]*\)(?:\s*:\s*\w+)?|(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/i,delete l.languages.flow.parameter,l.languages.insertBefore("flow","operator",{"flow-punctuation":{pattern:/\{\||\|\}/,alias:"punctuation"}}),Array.isArray(l.languages.flow.keyword)||(l.languages.flow.keyword=[l.languages.flow.keyword]),l.languages.flow.keyword.unshift({pattern:/(^|[^$]\b)(?:Class|declare|opaque|type)\b(?!\$)/,lookbehind:!0},{pattern:/(^|[^$]\B)\$(?:Diff|Enum|Exact|Keys|ObjMap|PropertyType|Record|Shape|Subtype|Supertype|await)\b(?!\$)/,lookbehind:!0})})(T),T.languages.n4js=T.languages.extend("javascript",{keyword:/\b(?:Array|any|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|module|new|null|number|package|private|protected|public|return|set|static|string|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/}),T.languages.insertBefore("n4js","constant",{annotation:{pattern:/@+\w+/,alias:"operator"}}),T.languages.n4jsd=T.languages.n4js,(function(l){function u(h,_){return RegExp(h.replace(/<ID>/g,function(){return/(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/.source}),_)}l.languages.insertBefore("javascript","function-variable",{"method-variable":{pattern:RegExp("(\\.\\s*)"+l.languages.javascript["function-variable"].pattern.source),lookbehind:!0,alias:["function-variable","method","function","property-access"]}}),l.languages.insertBefore("javascript","function",{method:{pattern:RegExp("(\\.\\s*)"+l.languages.javascript.function.source),lookbehind:!0,alias:["function","property-access"]}}),l.languages.insertBefore("javascript","constant",{"known-class-name":[{pattern:/\b(?:(?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)?Array|ArrayBuffer|BigInt|Boolean|DataView|Date|Error|Function|Intl|JSON|(?:Weak)?(?:Map|Set)|Math|Number|Object|Promise|Proxy|Reflect|RegExp|String|Symbol|WebAssembly)\b/,alias:"class-name"},{pattern:/\b(?:[A-Z]\w*)Error\b/,alias:"class-name"}]}),l.languages.insertBefore("javascript","keyword",{imports:{pattern:u(/(\bimport\b\s*)(?:<ID>(?:\s*,\s*(?:\*\s*as\s+<ID>|\{[^{}]*\}))?|\*\s*as\s+<ID>|\{[^{}]*\})(?=\s*\bfrom\b)/.source),lookbehind:!0,inside:l.languages.javascript},exports:{pattern:u(/(\bexport\b\s*)(?:\*(?:\s*as\s+<ID>)?(?=\s*\bfrom\b)|\{[^{}]*\})/.source),lookbehind:!0,inside:l.languages.javascript}}),l.languages.javascript.keyword.unshift({pattern:/\b(?:as|default|export|from|import)\b/,alias:"module"},{pattern:/\b(?:await|break|catch|continue|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/,alias:"control-flow"},{pattern:/\bnull\b/,alias:["null","nil"]},{pattern:/\bundefined\b/,alias:"nil"}),l.languages.insertBefore("javascript","operator",{spread:{pattern:/\.{3}/,alias:"operator"},arrow:{pattern:/=>/,alias:"operator"}}),l.languages.insertBefore("javascript","punctuation",{"property-access":{pattern:u(/(\.\s*)#?<ID>/.source),lookbehind:!0},"maybe-class-name":{pattern:/(^|[^$\w\xA0-\uFFFF])[A-Z][$\w\xA0-\uFFFF]+/,lookbehind:!0},dom:{pattern:/\b(?:document|(?:local|session)Storage|location|navigator|performance|window)\b/,alias:"variable"},console:{pattern:/\bconsole(?=\s*\.)/,alias:"class-name"}});for(var i=["function","function-variable","method","method-variable","property-access"],d=0;d<i.length;d++){var x=i[d],f=l.languages.javascript[x],x=(f=l.util.type(f)==="RegExp"?l.languages.javascript[x]={pattern:f}:f).inside||{};(f.inside=x)["maybe-class-name"]=/^[A-Z][\s\S]*/}})(T),(function(l){var u=l.util.clone(l.languages.javascript),i=/(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source,d=/(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source,f=/(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;function x(v,C){return v=v.replace(/<S>/g,function(){return i}).replace(/<BRACES>/g,function(){return d}).replace(/<SPREAD>/g,function(){return f}),RegExp(v,C)}f=x(f).source,l.languages.jsx=l.languages.extend("markup",u),l.languages.jsx.tag.pattern=x(/<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/.source),l.languages.jsx.tag.inside.tag.pattern=/^<\/?[^\s>\/]*/,l.languages.jsx.tag.inside["attr-value"].pattern=/=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/,l.languages.jsx.tag.inside.tag.inside["class-name"]=/^[A-Z]\w*(?:\.[A-Z]\w*)*$/,l.languages.jsx.tag.inside.comment=u.comment,l.languages.insertBefore("inside","attr-name",{spread:{pattern:x(/<SPREAD>/.source),inside:l.languages.jsx}},l.languages.jsx.tag),l.languages.insertBefore("inside","special-attr",{script:{pattern:x(/=<BRACES>/.source),alias:"language-javascript",inside:{"script-punctuation":{pattern:/^=(?=\{)/,alias:"punctuation"},rest:l.languages.jsx}}},l.languages.jsx.tag);function h(v){for(var C=[],R=0;R<v.length;R++){var N=v[R],M=!1;typeof N!="string"&&(N.type==="tag"&&N.content[0]&&N.content[0].type==="tag"?N.content[0].content[0].content==="</"?0<C.length&&C[C.length-1].tagName===_(N.content[0].content[1])&&C.pop():N.content[N.content.length-1].content!=="/>"&&C.push({tagName:_(N.content[0].content[1]),openedBraces:0}):0<C.length&&N.type==="punctuation"&&N.content==="{"?C[C.length-1].openedBraces++:0<C.length&&0<C[C.length-1].openedBraces&&N.type==="punctuation"&&N.content==="}"?C[C.length-1].openedBraces--:M=!0),(M||typeof N=="string")&&0<C.length&&C[C.length-1].openedBraces===0&&(M=_(N),R<v.length-1&&(typeof v[R+1]=="string"||v[R+1].type==="plain-text")&&(M+=_(v[R+1]),v.splice(R+1,1)),0<R&&(typeof v[R-1]=="string"||v[R-1].type==="plain-text")&&(M=_(v[R-1])+M,v.splice(R-1,1),R--),v[R]=new l.Token("plain-text",M,null,M)),N.content&&typeof N.content!="string"&&h(N.content)}}var _=function(v){return v?typeof v=="string"?v:typeof v.content=="string"?v.content:v.content.map(_).join(""):""};l.hooks.add("after-tokenize",function(v){v.language!=="jsx"&&v.language!=="tsx"||h(v.tokens)})})(T),(function(l){var u=l.util.clone(l.languages.typescript),u=(l.languages.tsx=l.languages.extend("jsx",u),delete l.languages.tsx.parameter,delete l.languages.tsx["literal-property"],l.languages.tsx.tag);u.pattern=RegExp(/(^|[^\w$]|(?=<\/))/.source+"(?:"+u.pattern.source+")",u.pattern.flags),u.lookbehind=!0})(T),T.languages.swift={comment:{pattern:/(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/,lookbehind:!0,greedy:!0},"string-literal":[{pattern:RegExp(/(^|[^"#])/.source+"(?:"+/"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/.source+"|"+/"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/.source+")"+/(?!["#])/.source),lookbehind:!0,greedy:!0,inside:{interpolation:{pattern:/(\\\()(?:[^()]|\([^()]*\))*(?=\))/,lookbehind:!0,inside:null},"interpolation-punctuation":{pattern:/^\)|\\\($/,alias:"punctuation"},punctuation:/\\(?=[\r\n])/,string:/[\s\S]+/}},{pattern:RegExp(/(^|[^"#])(#+)/.source+"(?:"+/"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/.source+"|"+/"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source+")\\2"),lookbehind:!0,greedy:!0,inside:{interpolation:{pattern:/(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/,lookbehind:!0,inside:null},"interpolation-punctuation":{pattern:/^\)|\\#+\($/,alias:"punctuation"},string:/[\s\S]+/}}],directive:{pattern:RegExp(/#/.source+"(?:"+/(?:elseif|if)\b/.source+"(?:[ 	]*"+/(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/.source+")+|"+/(?:else|endif)\b/.source+")"),alias:"property",inside:{"directive-name":/^#\w+/,boolean:/\b(?:false|true)\b/,number:/\b\d+(?:\.\d+)*\b/,operator:/!|&&|\|\||[<>]=?/,punctuation:/[(),]/}},literal:{pattern:/#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/,alias:"constant"},"other-directive":{pattern:/#\w+\b/,alias:"property"},attribute:{pattern:/@\w+/,alias:"atrule"},"function-definition":{pattern:/(\bfunc\s+)\w+/,lookbehind:!0,alias:"function"},label:{pattern:/\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/,lookbehind:!0,alias:"important"},keyword:/\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,boolean:/\b(?:false|true)\b/,nil:{pattern:/\bnil\b/,alias:"constant"},"short-argument":/\$\d+\b/,omit:{pattern:/\b_\b/,alias:"keyword"},number:/\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,"class-name":/\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/,function:/\b[a-z_]\w*(?=\s*\()/i,constant:/\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,operator:/[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/,punctuation:/[{}[\]();,.:\\]/},T.languages.swift["string-literal"].forEach(function(l){l.inside.interpolation.inside=T.languages.swift}),(function(l){l.languages.kotlin=l.languages.extend("clike",{keyword:{pattern:/(^|[^.])\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/,lookbehind:!0},function:[{pattern:/(?:`[^\r\n`]+`|\b\w+)(?=\s*\()/,greedy:!0},{pattern:/(\.)(?:`[^\r\n`]+`|\w+)(?=\s*\{)/,lookbehind:!0,greedy:!0}],number:/\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/,operator:/\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/}),delete l.languages.kotlin["class-name"];var u={"interpolation-punctuation":{pattern:/^\$\{?|\}$/,alias:"punctuation"},expression:{pattern:/[\s\S]+/,inside:l.languages.kotlin}};l.languages.insertBefore("kotlin","string",{"string-literal":[{pattern:/"""(?:[^$]|\$(?:(?!\{)|\{[^{}]*\}))*?"""/,alias:"multiline",inside:{interpolation:{pattern:/\$(?:[a-z_]\w*|\{[^{}]*\})/i,inside:u},string:/[\s\S]+/}},{pattern:/"(?:[^"\\\r\n$]|\\.|\$(?:(?!\{)|\{[^{}]*\}))*"/,alias:"singleline",inside:{interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$(?:[a-z_]\w*|\{[^{}]*\})/i,lookbehind:!0,inside:u},string:/[\s\S]+/}}],char:{pattern:/'(?:[^'\\\r\n]|\\(?:.|u[a-fA-F0-9]{0,4}))'/,greedy:!0}}),delete l.languages.kotlin.string,l.languages.insertBefore("kotlin","keyword",{annotation:{pattern:/\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/,alias:"builtin"}}),l.languages.insertBefore("kotlin","function",{label:{pattern:/\b\w+@|@\w+\b/,alias:"symbol"}}),l.languages.kt=l.languages.kotlin,l.languages.kts=l.languages.kotlin})(T),T.languages.c=T.languages.extend("clike",{comment:{pattern:/\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},string:{pattern:/"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,greedy:!0},"class-name":{pattern:/(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,lookbehind:!0},keyword:/\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,function:/\b[a-z_]\w*(?=\s*\()/i,number:/(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,operator:/>>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/}),T.languages.insertBefore("c","string",{char:{pattern:/'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,greedy:!0}}),T.languages.insertBefore("c","string",{macro:{pattern:/(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,lookbehind:!0,greedy:!0,alias:"property",inside:{string:[{pattern:/^(#\s*include\s*)<[^>]+>/,lookbehind:!0},T.languages.c.string],char:T.languages.c.char,comment:T.languages.c.comment,"macro-name":[{pattern:/(^#\s*define\s+)\w+\b(?!\()/i,lookbehind:!0},{pattern:/(^#\s*define\s+)\w+\b(?=\()/i,lookbehind:!0,alias:"function"}],directive:{pattern:/^(#\s*)[a-z]+/,lookbehind:!0,alias:"keyword"},"directive-hash":/^#/,punctuation:/##|\\(?=[\r\n])/,expression:{pattern:/\S[\s\S]*/,inside:T.languages.c}}}}),T.languages.insertBefore("c","function",{constant:/\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/}),delete T.languages.c.boolean,T.languages.objectivec=T.languages.extend("c",{string:{pattern:/@?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,greedy:!0},keyword:/\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,operator:/-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/}),delete T.languages.objectivec["class-name"],T.languages.objc=T.languages.objectivec,T.languages.reason=T.languages.extend("clike",{string:{pattern:/"(?:\\(?:\r\n|[\s\S])|[^\\\r\n"])*"/,greedy:!0},"class-name":/\b[A-Z]\w*/,keyword:/\b(?:and|as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|sig|struct|switch|then|to|try|type|val|virtual|when|while|with)\b/,operator:/\.{3}|:[:=]|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/}),T.languages.insertBefore("reason","class-name",{char:{pattern:/'(?:\\x[\da-f]{2}|\\o[0-3][0-7][0-7]|\\\d{3}|\\.|[^'\\\r\n])'/,greedy:!0},constructor:/\b[A-Z]\w*\b(?!\s*\.)/,label:{pattern:/\b[a-z]\w*(?=::)/,alias:"symbol"}}),delete T.languages.reason.function,(function(l){for(var u=/\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source,i=0;i<2;i++)u=u.replace(/<self>/g,function(){return u});u=u.replace(/<self>/g,function(){return/[^\s\S]/.source}),l.languages.rust={comment:[{pattern:RegExp(/(^|[^\\])/.source+u),lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/,greedy:!0},char:{pattern:/b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,greedy:!0},attribute:{pattern:/#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/,greedy:!0,alias:"attr-name",inside:{string:null}},"closure-params":{pattern:/([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/,lookbehind:!0,greedy:!0,inside:{"closure-punctuation":{pattern:/^\||\|$/,alias:"punctuation"},rest:null}},"lifetime-annotation":{pattern:/'\w+/,alias:"symbol"},"fragment-specifier":{pattern:/(\$\w+:)[a-z]+/,lookbehind:!0,alias:"punctuation"},variable:/\$\w+/,"function-definition":{pattern:/(\bfn\s+)\w+/,lookbehind:!0,alias:"function"},"type-definition":{pattern:/(\b(?:enum|struct|trait|type|union)\s+)\w+/,lookbehind:!0,alias:"class-name"},"module-declaration":[{pattern:/(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/,lookbehind:!0,alias:"namespace"},{pattern:/(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/,lookbehind:!0,alias:"namespace",inside:{punctuation:/::/}}],keyword:[/\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,/\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/],function:/\b[a-z_]\w*(?=\s*(?:::\s*<|\())/,macro:{pattern:/\b\w+!/,alias:"property"},constant:/\b[A-Z_][A-Z_\d]+\b/,"class-name":/\b[A-Z]\w*\b/,namespace:{pattern:/(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/,inside:{punctuation:/::/}},number:/\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/,boolean:/\b(?:false|true)\b/,punctuation:/->|\.\.=|\.{1,3}|::|[{}[\];(),:]/,operator:/[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/},l.languages.rust["closure-params"].inside.rest=l.languages.rust,l.languages.rust.attribute.inside.string=l.languages.rust.string})(T),T.languages.go=T.languages.extend("clike",{string:{pattern:/(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/,lookbehind:!0,greedy:!0},keyword:/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,boolean:/\b(?:_|false|iota|nil|true)\b/,number:[/\b0(?:b[01_]+|o[0-7_]+)i?\b/i,/\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i,/(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i],operator:/[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,builtin:/\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/}),T.languages.insertBefore("go","string",{char:{pattern:/'(?:\\.|[^'\\\r\n]){0,10}'/,greedy:!0}}),delete T.languages.go["class-name"],(function(l){var u=/\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,i=/\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(/<keyword>/g,function(){return u.source});l.languages.cpp=l.languages.extend("c",{"class-name":[{pattern:RegExp(/(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source.replace(/<keyword>/g,function(){return u.source})),lookbehind:!0},/\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,/\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,/\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/],keyword:u,number:{pattern:/(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,greedy:!0},operator:/>>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,boolean:/\b(?:false|true)\b/}),l.languages.insertBefore("cpp","string",{module:{pattern:RegExp(/(\b(?:import|module)\s+)/.source+"(?:"+/"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source+"|"+/<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(/<mod-name>/g,function(){return i})+")"),lookbehind:!0,greedy:!0,inside:{string:/^[<"][\s\S]+/,operator:/:/,punctuation:/\./}},"raw-string":{pattern:/R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,alias:"string",greedy:!0}}),l.languages.insertBefore("cpp","keyword",{"generic-function":{pattern:/\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i,inside:{function:/^\w+/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:l.languages.cpp}}}}),l.languages.insertBefore("cpp","operator",{"double-colon":{pattern:/::/,alias:"punctuation"}}),l.languages.insertBefore("cpp","class-name",{"base-clause":{pattern:/(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,lookbehind:!0,greedy:!0,inside:l.languages.extend("cpp",{})}}),l.languages.insertBefore("inside","double-colon",{"class-name":/\b[a-z_]\w*\b(?!\s*::)/i},l.languages.cpp["base-clause"])})(T),T.languages.python={comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0,greedy:!0},"string-interpolation":{pattern:/(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,greedy:!0,inside:{interpolation:{pattern:/((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,lookbehind:!0,inside:{"format-spec":{pattern:/(:)[^:(){}]+(?=\}$)/,lookbehind:!0},"conversion-option":{pattern:/![sra](?=[:}]$)/,alias:"punctuation"},rest:null}},string:/[\s\S]+/}},"triple-quoted-string":{pattern:/(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,greedy:!0,alias:"string"},string:{pattern:/(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,greedy:!0},function:{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)\w+/i,lookbehind:!0},decorator:{pattern:/(^[\t ]*)@\w+(?:\.\w+)*/m,lookbehind:!0,alias:["annotation","punctuation"],inside:{punctuation:/\./}},keyword:/\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,builtin:/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,boolean:/\b(?:False|None|True)\b/,number:/\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,operator:/[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,punctuation:/[{}[\];(),.:]/},T.languages.python["string-interpolation"].inside.interpolation.inside.rest=T.languages.python,T.languages.py=T.languages.python,T.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},T.languages.webmanifest=T.languages.json;var Yc={};$m(Yc,{dracula:()=>qm,duotoneDark:()=>Km,duotoneLight:()=>Zm,github:()=>Jm,gruvboxMaterialDark:()=>_h,gruvboxMaterialLight:()=>Th,jettwaveDark:()=>wh,jettwaveLight:()=>kh,nightOwl:()=>th,nightOwlLight:()=>nh,oceanicNext:()=>ah,okaidia:()=>oh,oneDark:()=>jh,oneLight:()=>Eh,palenight:()=>uh,shadesOfPurple:()=>dh,synthwave84:()=>fh,ultramin:()=>hh,vsDark:()=>Zc,vsLight:()=>yh});var Gm={plain:{color:"#F8F8F2",backgroundColor:"#282A36"},styles:[{types:["prolog","constant","builtin"],style:{color:"rgb(189, 147, 249)"}},{types:["inserted","function"],style:{color:"rgb(80, 250, 123)"}},{types:["deleted"],style:{color:"rgb(255, 85, 85)"}},{types:["changed"],style:{color:"rgb(255, 184, 108)"}},{types:["punctuation","symbol"],style:{color:"rgb(248, 248, 242)"}},{types:["string","char","tag","selector"],style:{color:"rgb(255, 121, 198)"}},{types:["keyword","variable"],style:{color:"rgb(189, 147, 249)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(98, 114, 164)"}},{types:["attr-name"],style:{color:"rgb(241, 250, 140)"}}]},qm=Gm,Qm={plain:{backgroundColor:"#2a2734",color:"#9a86fd"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#6c6783"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#e09142"}},{types:["property","function"],style:{color:"#9a86fd"}},{types:["tag-id","selector","atrule-id"],style:{color:"#eeebff"}},{types:["attr-name"],style:{color:"#c4b9fe"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","atrule","placeholder","variable"],style:{color:"#ffcc99"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#c4b9fe"}}]},Km=Qm,Ym={plain:{backgroundColor:"#faf8f5",color:"#728fcb"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#b6ad9a"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#063289"}},{types:["property","function"],style:{color:"#b29762"}},{types:["tag-id","selector","atrule-id"],style:{color:"#2d2006"}},{types:["attr-name"],style:{color:"#896724"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","atrule"],style:{color:"#728fcb"}},{types:["placeholder","variable"],style:{color:"#93abdc"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#896724"}}]},Zm=Ym,Xm={plain:{color:"#393A34",backgroundColor:"#f6f8fa"},styles:[{types:["comment","prolog","doctype","cdata"],style:{color:"#999988",fontStyle:"italic"}},{types:["namespace"],style:{opacity:.7}},{types:["string","attr-value"],style:{color:"#e3116c"}},{types:["punctuation","operator"],style:{color:"#393A34"}},{types:["entity","url","symbol","number","boolean","variable","constant","property","regex","inserted"],style:{color:"#36acaa"}},{types:["atrule","keyword","attr-name","selector"],style:{color:"#00a4db"}},{types:["function","deleted","tag"],style:{color:"#d73a49"}},{types:["function-variable"],style:{color:"#6f42c1"}},{types:["tag","selector","keyword"],style:{color:"#00009f"}}]},Jm=Xm,eh={plain:{color:"#d6deeb",backgroundColor:"#011627"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)",fontStyle:"italic"}},{types:["inserted","attr-name"],style:{color:"rgb(173, 219, 103)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(99, 119, 119)",fontStyle:"italic"}},{types:["string","url"],style:{color:"rgb(173, 219, 103)"}},{types:["variable"],style:{color:"rgb(214, 222, 235)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation"],style:{color:"rgb(199, 146, 234)"}},{types:["selector","doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["class-name"],style:{color:"rgb(255, 203, 139)"}},{types:["tag","operator","keyword"],style:{color:"rgb(127, 219, 202)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["property"],style:{color:"rgb(128, 203, 196)"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}}]},th=eh,rh={plain:{color:"#403f53",backgroundColor:"#FBFBFB"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)",fontStyle:"italic"}},{types:["inserted","attr-name"],style:{color:"rgb(72, 118, 214)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(152, 159, 177)",fontStyle:"italic"}},{types:["string","builtin","char","constant","url"],style:{color:"rgb(72, 118, 214)"}},{types:["variable"],style:{color:"rgb(201, 103, 101)"}},{types:["number"],style:{color:"rgb(170, 9, 130)"}},{types:["punctuation"],style:{color:"rgb(153, 76, 195)"}},{types:["function","selector","doctype"],style:{color:"rgb(153, 76, 195)",fontStyle:"italic"}},{types:["class-name"],style:{color:"rgb(17, 17, 17)"}},{types:["tag"],style:{color:"rgb(153, 76, 195)"}},{types:["operator","property","keyword","namespace"],style:{color:"rgb(12, 150, 155)"}},{types:["boolean"],style:{color:"rgb(188, 84, 84)"}}]},nh=rh,ot={char:"#D8DEE9",comment:"#999999",keyword:"#c5a5c5",primitive:"#5a9bcf",string:"#8dc891",variable:"#d7deea",boolean:"#ff8b50",tag:"#fc929e",function:"#79b6f2",className:"#FAC863"},sh={plain:{backgroundColor:"#282c34",color:"#ffffff"},styles:[{types:["attr-name"],style:{color:ot.keyword}},{types:["attr-value"],style:{color:ot.string}},{types:["comment","block-comment","prolog","doctype","cdata","shebang"],style:{color:ot.comment}},{types:["property","number","function-name","constant","symbol","deleted"],style:{color:ot.primitive}},{types:["boolean"],style:{color:ot.boolean}},{types:["tag"],style:{color:ot.tag}},{types:["string"],style:{color:ot.string}},{types:["punctuation"],style:{color:ot.string}},{types:["selector","char","builtin","inserted"],style:{color:ot.char}},{types:["function"],style:{color:ot.function}},{types:["operator","entity","url","variable"],style:{color:ot.variable}},{types:["keyword"],style:{color:ot.keyword}},{types:["atrule","class-name"],style:{color:ot.className}},{types:["important"],style:{fontWeight:"400"}},{types:["bold"],style:{fontWeight:"bold"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["namespace"],style:{opacity:.7}}]},ah=sh,lh={plain:{color:"#f8f8f2",backgroundColor:"#272822"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"#f92672",fontStyle:"italic"}},{types:["inserted"],style:{color:"rgb(173, 219, 103)",fontStyle:"italic"}},{types:["comment"],style:{color:"#8292a2",fontStyle:"italic"}},{types:["string","url"],style:{color:"#a6e22e"}},{types:["variable"],style:{color:"#f8f8f2"}},{types:["number"],style:{color:"#ae81ff"}},{types:["builtin","char","constant","function","class-name"],style:{color:"#e6db74"}},{types:["punctuation"],style:{color:"#f8f8f2"}},{types:["selector","doctype"],style:{color:"#a6e22e",fontStyle:"italic"}},{types:["tag","operator","keyword"],style:{color:"#66d9ef"}},{types:["boolean"],style:{color:"#ae81ff"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)",opacity:.7}},{types:["tag","property"],style:{color:"#f92672"}},{types:["attr-name"],style:{color:"#a6e22e !important"}},{types:["doctype"],style:{color:"#8292a2"}},{types:["rule"],style:{color:"#e6db74"}}]},oh=lh,ih={plain:{color:"#bfc7d5",backgroundColor:"#292d3e"},styles:[{types:["comment"],style:{color:"rgb(105, 112, 152)",fontStyle:"italic"}},{types:["string","inserted"],style:{color:"rgb(195, 232, 141)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation","selector"],style:{color:"rgb(199, 146, 234)"}},{types:["variable"],style:{color:"rgb(191, 199, 213)"}},{types:["class-name","attr-name"],style:{color:"rgb(255, 203, 107)"}},{types:["tag","deleted"],style:{color:"rgb(255, 85, 114)"}},{types:["operator"],style:{color:"rgb(137, 221, 255)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["keyword"],style:{fontStyle:"italic"}},{types:["doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}},{types:["url"],style:{color:"rgb(221, 221, 221)"}}]},uh=ih,ch={plain:{color:"#9EFEFF",backgroundColor:"#2D2A55"},styles:[{types:["changed"],style:{color:"rgb(255, 238, 128)"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)"}},{types:["inserted"],style:{color:"rgb(173, 219, 103)"}},{types:["comment"],style:{color:"rgb(179, 98, 255)",fontStyle:"italic"}},{types:["punctuation"],style:{color:"rgb(255, 255, 255)"}},{types:["constant"],style:{color:"rgb(255, 98, 140)"}},{types:["string","url"],style:{color:"rgb(165, 255, 144)"}},{types:["variable"],style:{color:"rgb(255, 238, 128)"}},{types:["number","boolean"],style:{color:"rgb(255, 98, 140)"}},{types:["attr-name"],style:{color:"rgb(255, 180, 84)"}},{types:["keyword","operator","property","namespace","tag","selector","doctype"],style:{color:"rgb(255, 157, 0)"}},{types:["builtin","char","constant","function","class-name"],style:{color:"rgb(250, 208, 0)"}}]},dh=ch,ph={plain:{backgroundColor:"linear-gradient(to bottom, #2a2139 75%, #34294f)",backgroundImage:"#34294f",color:"#f92aad",textShadow:"0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"},styles:[{types:["comment","block-comment","prolog","doctype","cdata"],style:{color:"#495495",fontStyle:"italic"}},{types:["punctuation"],style:{color:"#ccc"}},{types:["tag","attr-name","namespace","number","unit","hexcode","deleted"],style:{color:"#e2777a"}},{types:["property","selector"],style:{color:"#72f1b8",textShadow:"0 0 2px #100c0f, 0 0 10px #257c5575, 0 0 35px #21272475"}},{types:["function-name"],style:{color:"#6196cc"}},{types:["boolean","selector-id","function"],style:{color:"#fdfdfd",textShadow:"0 0 2px #001716, 0 0 3px #03edf975, 0 0 5px #03edf975, 0 0 8px #03edf975"}},{types:["class-name","maybe-class-name","builtin"],style:{color:"#fff5f6",textShadow:"0 0 2px #000, 0 0 10px #fc1f2c75, 0 0 5px #fc1f2c75, 0 0 25px #fc1f2c75"}},{types:["constant","symbol"],style:{color:"#f92aad",textShadow:"0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"}},{types:["important","atrule","keyword","selector-class"],style:{color:"#f4eee4",textShadow:"0 0 2px #393a33, 0 0 8px #f39f0575, 0 0 2px #f39f0575"}},{types:["string","char","attr-value","regex","variable"],style:{color:"#f87c32"}},{types:["parameter"],style:{fontStyle:"italic"}},{types:["entity","url"],style:{color:"#67cdcc"}},{types:["operator"],style:{color:"ffffffee"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["entity"],style:{cursor:"help"}},{types:["inserted"],style:{color:"green"}}]},fh=ph,mh={plain:{color:"#282a2e",backgroundColor:"#ffffff"},styles:[{types:["comment"],style:{color:"rgb(197, 200, 198)"}},{types:["string","number","builtin","variable"],style:{color:"rgb(150, 152, 150)"}},{types:["class-name","function","tag","attr-name"],style:{color:"rgb(40, 42, 46)"}}]},hh=mh,gh={plain:{color:"#9CDCFE",backgroundColor:"#1E1E1E"},styles:[{types:["prolog"],style:{color:"rgb(0, 0, 128)"}},{types:["comment"],style:{color:"rgb(106, 153, 85)"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"rgb(86, 156, 214)"}},{types:["number","inserted"],style:{color:"rgb(181, 206, 168)"}},{types:["constant"],style:{color:"rgb(100, 102, 149)"}},{types:["attr-name","variable"],style:{color:"rgb(156, 220, 254)"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"rgb(206, 145, 120)"}},{types:["selector"],style:{color:"rgb(215, 186, 125)"}},{types:["tag"],style:{color:"rgb(78, 201, 176)"}},{types:["tag"],languages:["markup"],style:{color:"rgb(86, 156, 214)"}},{types:["punctuation","operator"],style:{color:"rgb(212, 212, 212)"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"rgb(220, 220, 170)"}},{types:["class-name"],style:{color:"rgb(78, 201, 176)"}},{types:["char"],style:{color:"rgb(209, 105, 105)"}}]},Zc=gh,xh={plain:{color:"#000000",backgroundColor:"#ffffff"},styles:[{types:["comment"],style:{color:"rgb(0, 128, 0)"}},{types:["builtin"],style:{color:"rgb(0, 112, 193)"}},{types:["number","variable","inserted"],style:{color:"rgb(9, 134, 88)"}},{types:["operator"],style:{color:"rgb(0, 0, 0)"}},{types:["constant","char"],style:{color:"rgb(129, 31, 63)"}},{types:["tag"],style:{color:"rgb(128, 0, 0)"}},{types:["attr-name"],style:{color:"rgb(255, 0, 0)"}},{types:["deleted","string"],style:{color:"rgb(163, 21, 21)"}},{types:["changed","punctuation"],style:{color:"rgb(4, 81, 165)"}},{types:["function","keyword"],style:{color:"rgb(0, 0, 255)"}},{types:["class-name"],style:{color:"rgb(38, 127, 153)"}}]},yh=xh,vh={plain:{color:"#f8fafc",backgroundColor:"#011627"},styles:[{types:["prolog"],style:{color:"#000080"}},{types:["comment"],style:{color:"#6A9955"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"#569CD6"}},{types:["number","inserted"],style:{color:"#B5CEA8"}},{types:["constant"],style:{color:"#f8fafc"}},{types:["attr-name","variable"],style:{color:"#9CDCFE"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"#cbd5e1"}},{types:["selector"],style:{color:"#D7BA7D"}},{types:["tag"],style:{color:"#0ea5e9"}},{types:["tag"],languages:["markup"],style:{color:"#0ea5e9"}},{types:["punctuation","operator"],style:{color:"#D4D4D4"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"#7dd3fc"}},{types:["class-name"],style:{color:"#0ea5e9"}},{types:["char"],style:{color:"#D16969"}}]},wh=vh,bh={plain:{color:"#0f172a",backgroundColor:"#f1f5f9"},styles:[{types:["prolog"],style:{color:"#000080"}},{types:["comment"],style:{color:"#6A9955"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"#0c4a6e"}},{types:["number","inserted"],style:{color:"#B5CEA8"}},{types:["constant"],style:{color:"#0f172a"}},{types:["attr-name","variable"],style:{color:"#0c4a6e"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"#64748b"}},{types:["selector"],style:{color:"#D7BA7D"}},{types:["tag"],style:{color:"#0ea5e9"}},{types:["tag"],languages:["markup"],style:{color:"#0ea5e9"}},{types:["punctuation","operator"],style:{color:"#475569"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"#0e7490"}},{types:["class-name"],style:{color:"#0ea5e9"}},{types:["char"],style:{color:"#D16969"}}]},kh=bh,Sh={plain:{backgroundColor:"hsl(220, 13%, 18%)",color:"hsl(220, 14%, 71%)",textShadow:"0 1px rgba(0, 0, 0, 0.3)"},styles:[{types:["comment","prolog","cdata"],style:{color:"hsl(220, 10%, 40%)"}},{types:["doctype","punctuation","entity"],style:{color:"hsl(220, 14%, 71%)"}},{types:["attr-name","class-name","maybe-class-name","boolean","constant","number","atrule"],style:{color:"hsl(29, 54%, 61%)"}},{types:["keyword"],style:{color:"hsl(286, 60%, 67%)"}},{types:["property","tag","symbol","deleted","important"],style:{color:"hsl(355, 65%, 65%)"}},{types:["selector","string","char","builtin","inserted","regex","attr-value"],style:{color:"hsl(95, 38%, 62%)"}},{types:["variable","operator","function"],style:{color:"hsl(207, 82%, 66%)"}},{types:["url"],style:{color:"hsl(187, 47%, 55%)"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"hsl(220, 14%, 71%)"}}]},jh=Sh,Nh={plain:{backgroundColor:"hsl(230, 1%, 98%)",color:"hsl(230, 8%, 24%)"},styles:[{types:["comment","prolog","cdata"],style:{color:"hsl(230, 4%, 64%)"}},{types:["doctype","punctuation","entity"],style:{color:"hsl(230, 8%, 24%)"}},{types:["attr-name","class-name","boolean","constant","number","atrule"],style:{color:"hsl(35, 99%, 36%)"}},{types:["keyword"],style:{color:"hsl(301, 63%, 40%)"}},{types:["property","tag","symbol","deleted","important"],style:{color:"hsl(5, 74%, 59%)"}},{types:["selector","string","char","builtin","inserted","regex","attr-value","punctuation"],style:{color:"hsl(119, 34%, 47%)"}},{types:["variable","operator","function"],style:{color:"hsl(221, 87%, 60%)"}},{types:["url"],style:{color:"hsl(198, 99%, 37%)"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"hsl(230, 8%, 24%)"}}]},Eh=Nh,Ch={plain:{color:"#ebdbb2",backgroundColor:"#292828"},styles:[{types:["imports","class-name","maybe-class-name","constant","doctype","builtin","function"],style:{color:"#d8a657"}},{types:["property-access"],style:{color:"#7daea3"}},{types:["tag"],style:{color:"#e78a4e"}},{types:["attr-name","char","url","regex"],style:{color:"#a9b665"}},{types:["attr-value","string"],style:{color:"#89b482"}},{types:["comment","prolog","cdata","operator","inserted"],style:{color:"#a89984"}},{types:["delimiter","boolean","keyword","selector","important","atrule","property","variable","deleted"],style:{color:"#ea6962"}},{types:["entity","number","symbol"],style:{color:"#d3869b"}}]},_h=Ch,Rh={plain:{color:"#654735",backgroundColor:"#f9f5d7"},styles:[{types:["delimiter","boolean","keyword","selector","important","atrule","property","variable","deleted"],style:{color:"#af2528"}},{types:["imports","class-name","maybe-class-name","constant","doctype","builtin"],style:{color:"#b4730e"}},{types:["string","attr-value"],style:{color:"#477a5b"}},{types:["property-access"],style:{color:"#266b79"}},{types:["function","attr-name","char","url"],style:{color:"#72761e"}},{types:["tag"],style:{color:"#b94c07"}},{types:["comment","prolog","cdata","operator","inserted"],style:{color:"#a89984"}},{types:["entity","number","symbol"],style:{color:"#924f79"}}]},Th=Rh,Lh=l=>U.useCallback(u=>{var i=u,{className:d,style:f,line:x}=i,h=Kc(i,["className","style","line"]);const _=Js(Ct({},h),{className:Hr("token-line",d)});return typeof l=="object"&&"plain"in l&&(_.style=l.plain),typeof f=="object"&&(_.style=Ct(Ct({},_.style||{}),f)),_},[l]),Ph=l=>{const u=U.useCallback(({types:i,empty:d})=>{if(l!=null){{if(i.length===1&&i[0]==="plain")return d!=null?{display:"inline-block"}:void 0;if(i.length===1&&d!=null)return l[i[0]]}return Object.assign(d!=null?{display:"inline-block"}:{},...i.map(f=>l[f]))}},[l]);return U.useCallback(i=>{var d=i,{token:f,className:x,style:h}=d,_=Kc(d,["token","className","style"]);const v=Js(Ct({},_),{className:Hr("token",...f.types,x),children:f.content,style:u(f)});return h!=null&&(v.style=Ct(Ct({},v.style||{}),h)),v},[u])},Ah=/\r\n|\r|\n/,Nc=l=>{l.length===0?l.push({types:["plain"],content:`
`,empty:!0}):l.length===1&&l[0].content===""&&(l[0].content=`
`,l[0].empty=!0)},Ec=(l,u)=>{const i=l.length;return i>0&&l[i-1]===u?l:l.concat(u)},Oh=l=>{const u=[[]],i=[l],d=[0],f=[l.length];let x=0,h=0,_=[];const v=[_];for(;h>-1;){for(;(x=d[h]++)<f[h];){let C,R=u[h];const M=i[h][x];if(typeof M=="string"?(R=h>0?R:["plain"],C=M):(R=Ec(R,M.type),M.alias&&(R=Ec(R,M.alias)),C=M.content),typeof C!="string"){h++,u.push(R),i.push(C),d.push(0),f.push(C.length);continue}const q=C.split(Ah),j=q.length;_.push({types:R,content:q[0]});for(let b=1;b<j;b++)Nc(_),v.push(_=[]),_.push({types:R,content:q[b]})}h--,u.pop(),i.pop(),d.pop(),f.pop()}return Nc(_),v},Cc=Oh,Ih=({prism:l,code:u,grammar:i,language:d})=>U.useMemo(()=>{if(i==null)return Cc([u]);const f={code:u,grammar:i,language:d,tokens:[]};return l.hooks.run("before-tokenize",f),f.tokens=l.tokenize(u,i),l.hooks.run("after-tokenize",f),Cc(f.tokens)},[u,i,d,l]),Fh=(l,u)=>{const{plain:i}=l,d=l.styles.reduce((f,x)=>{const{languages:h,style:_}=x;return h&&!h.includes(u)||x.types.forEach(v=>{const C=Ct(Ct({},f[v]),_);f[v]=C}),f},{});return d.root=i,d.plain=Js(Ct({},i),{backgroundColor:void 0}),d},Dh=Fh,Mh=({children:l,language:u,code:i,theme:d,prism:f})=>{const x=u.toLowerCase(),h=Dh(d,x),_=Lh(h),v=Ph(h),C=f.languages[x],R=Ih({prism:f,language:x,code:i,grammar:C});return l({tokens:R,className:`prism-code language-${x}`,style:h!=null?h.root:{},getLineProps:_,getTokenProps:v})},zh=l=>U.createElement(Mh,Js(Ct({},l),{prism:l.prism||T,theme:l.theme||Zc,code:l.code,language:l.language}));/*! Bundled license information:

prismjs/prism.js:
  (**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   *)
*/function Y({code:l,language:u="typescript",filename:i,showLineNumbers:d=!1}){const[f,x]=U.useState(!1),h=async()=>{await navigator.clipboard.writeText(l),x(!0),setTimeout(()=>x(!1),2e3)};return a.jsxs("div",{className:"code-block group",children:[i&&a.jsxs("div",{className:"flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50",children:[a.jsx("span",{className:"text-xs text-slate-500 font-mono",children:i}),a.jsx("button",{onClick:h,className:"opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all duration-200 flex items-center gap-1 text-xs",children:f?a.jsxs(a.Fragment,{children:[a.jsx(bc,{className:"w-3 h-3 text-green-400"}),a.jsx("span",{className:"text-green-400",children:"Copied!"})]}):a.jsxs(a.Fragment,{children:[a.jsx(kc,{className:"w-3 h-3"}),a.jsx("span",{children:"Copy"})]})})]}),a.jsxs("div",{className:"relative",children:[!i&&a.jsx("button",{onClick:h,className:"absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all duration-200 p-1.5 rounded bg-slate-800/80",children:f?a.jsx(bc,{className:"w-4 h-4 text-green-400"}):a.jsx(kc,{className:"w-4 h-4"})}),a.jsx(zh,{theme:Yc.nightOwl,code:l.trim(),language:u,children:({className:_,style:v,tokens:C,getLineProps:R,getTokenProps:N})=>a.jsx("pre",{className:Hr(_,"p-4 overflow-x-auto text-sm"),style:{...v,backgroundColor:"transparent"},children:C.map((M,q)=>a.jsxs("div",{...R({line:M}),children:[d&&a.jsx("span",{className:"inline-block w-8 text-slate-600 select-none text-right mr-4",children:q+1}),M.map((j,b)=>a.jsx("span",{...N({token:j})},b))]},q))})})]})]})}const Bh=`import { Vexor, Type } from '@vexorjs/core';

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

app.listen(3000);`,Uh=[{icon:a.jsx(Wc,{className:"w-6 h-6"}),title:"Blazing Fast",description:"50K+ requests/sec with Radix tree routing and JIT-compiled validators",color:"text-vexor-400",bg:"bg-vexor-500/10"},{icon:a.jsx(Vc,{className:"w-6 h-6"}),title:"Built-in ORM",description:"Type-safe query builder with PostgreSQL, MySQL, and SQLite support",color:"text-purple-400",bg:"bg-purple-500/10"},{icon:a.jsx(Em,{className:"w-6 h-6"}),title:"Type Safe",description:"End-to-end type inference from database to API response",color:"text-pink-400",bg:"bg-pink-500/10"},{icon:a.jsx(bm,{className:"w-6 h-6"}),title:"Multi-Runtime",description:"Run on Node.js, Bun, Deno, AWS Lambda, Cloudflare Workers",color:"text-green-400",bg:"bg-green-500/10"},{icon:a.jsx(_m,{className:"w-6 h-6"}),title:"Real-time",description:"WebSocket and Server-Sent Events with Pub/Sub support",color:"text-yellow-400",bg:"bg-yellow-500/10"},{icon:a.jsx(xm,{className:"w-6 h-6"}),title:"Observability",description:"OpenTelemetry tracing and Prometheus metrics built-in",color:"text-red-400",bg:"bg-red-500/10"}],$h=[{value:"50K+",label:"Requests/sec"},{value:"<10KB",label:"Edge Bundle"},{value:"100%",label:"Type Safe"},{value:"5+",label:"Runtimes"}],Vh=["CORS","Compression","Rate Limiting","File Upload","Caching","Health Check","Versioning","OAuth2"];function Wh(){return a.jsxs("div",{className:"pt-16",children:[a.jsx("section",{className:"relative py-20 hero-gradient overflow-hidden",children:a.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:a.jsxs("div",{className:"text-center max-w-4xl mx-auto",children:[a.jsxs("div",{className:"inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-4 py-2 mb-8",children:[a.jsxs("span",{className:"relative flex h-2 w-2",children:[a.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"}),a.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-green-500"})]}),a.jsx("span",{className:"text-sm text-slate-600 dark:text-slate-300",children:"Now with AWS Lambda & Edge Runtime Support"})]}),a.jsxs("h1",{className:"text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6",children:[a.jsx("span",{className:"gradient-text",children:"Build APIs"}),a.jsx("br",{}),a.jsx("span",{className:"text-slate-900 dark:text-white",children:"at Lightning Speed"})]}),a.jsx("p",{className:"text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed",children:"A blazing-fast, batteries-included, multi-runtime Node.js backend framework with its own ORM. Type-safe from database to API response."}),a.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-4 mb-16",children:[a.jsxs(Et,{to:"/docs/getting-started",className:"w-full sm:w-auto btn-primary flex items-center justify-center gap-2",children:["Get Started",a.jsx(mm,{className:"w-4 h-4"})]}),a.jsxs("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto btn-secondary flex items-center justify-center gap-2",children:[a.jsx(Ks,{className:"w-5 h-5"}),"Star on GitHub"]})]}),a.jsx("div",{className:"max-w-3xl mx-auto text-left",children:a.jsx(Y,{code:Bh,filename:"app.ts"})})]})})}),a.jsx("section",{className:"py-12 border-y border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30",children:a.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:a.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-8",children:$h.map(l=>a.jsxs("div",{className:"text-center",children:[a.jsx("div",{className:"text-4xl font-bold text-vexor-400 mb-2",children:l.value}),a.jsx("div",{className:"text-sm text-slate-500",children:l.label})]},l.label))})})}),a.jsx("section",{className:"py-24",children:a.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[a.jsxs("div",{className:"text-center mb-16",children:[a.jsx("h2",{className:"text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Everything You Need"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto",children:"A complete toolkit for building production-ready APIs without the boilerplate"})]}),a.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-6",children:Uh.map(l=>a.jsxs("div",{className:"feature-card",children:[a.jsx("div",{className:`w-12 h-12 ${l.bg} rounded-xl flex items-center justify-center mb-4 ${l.color}`,children:l.icon}),a.jsx("h3",{className:"text-lg font-semibold mb-2 text-slate-900 dark:text-white",children:l.title}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 text-sm",children:l.description})]},l.title))})]})}),a.jsx("section",{className:"py-24 bg-slate-50 dark:bg-slate-900/30",children:a.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[a.jsxs("div",{className:"text-center mb-16",children:[a.jsx("h2",{className:"text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Built-in Middleware"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Production-ready middleware out of the box"})]}),a.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto",children:Vh.map(l=>a.jsxs("div",{className:"flex items-center gap-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-lg px-4 py-3",children:[a.jsx(ym,{className:"w-4 h-4 text-vexor-400"}),a.jsx("span",{className:"text-sm text-slate-700 dark:text-slate-200",children:l})]},l))})]})}),a.jsx("section",{className:"py-24",children:a.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center",children:[a.jsx("h2",{className:"text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-white",children:"Ready to Build?"}),a.jsx("p",{className:"text-xl text-slate-600 dark:text-slate-400 mb-10",children:"Start building production-ready APIs in minutes with Vexor"}),a.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-4",children:[a.jsx(Et,{to:"/docs/getting-started",className:"w-full sm:w-auto btn-primary",children:"Get Started Now"}),a.jsx(Et,{to:"/docs/core",className:"w-full sm:w-auto btn-secondary",children:"Read the Docs"})]})]})}),a.jsx("footer",{className:"py-12 border-t border-slate-200 dark:border-slate-800/50",children:a.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:a.jsxs("div",{className:"flex flex-col gap-8",children:[a.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-6",children:[a.jsxs("div",{className:"flex items-center gap-3",children:[a.jsx("div",{className:"w-6 h-6 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded flex items-center justify-center font-bold text-white text-xs",children:"V"}),a.jsx("span",{className:"font-semibold text-slate-900 dark:text-white",children:"Vexor"}),a.jsx("span",{className:"text-slate-500 text-sm",children:"© 2024"})]}),a.jsxs("div",{className:"flex items-center gap-6",children:[a.jsx("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:a.jsx(Ks,{className:"w-5 h-5"})}),a.jsx("a",{href:"https://www.linkedin.com/in/sitharaj88",target:"_blank",rel:"noopener noreferrer",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:a.jsx(Sm,{className:"w-5 h-5"})}),a.jsx("a",{href:"https://sitharaj.in",target:"_blank",rel:"noopener noreferrer",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:a.jsx(wm,{className:"w-5 h-5"})})]})]}),a.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/50",children:[a.jsxs("div",{className:"flex items-center gap-6 text-sm",children:[a.jsx(Et,{to:"/docs/getting-started",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:"Documentation"}),a.jsx("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:"GitHub"})]}),a.jsxs("div",{className:"text-sm text-slate-500",children:["Built by"," ",a.jsx("a",{href:"https://sitharaj.in",target:"_blank",rel:"noopener noreferrer",className:"text-vexor-400 hover:text-vexor-300 transition-colors",children:"Sitharaj Seenivasan"})]})]})]})})})]})}const Hh="npm install @vexorjs/core @vexorjs/orm",Gh=`import { Vexor, Type, cors, rateLimit } from '@vexorjs/core';

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
});`,qh=`my-api/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Route handlers
│   │   ├── users.ts
│   │   └── products.ts
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── db/               # Database schema & queries
├── package.json
└── tsconfig.json`,Qh=`{
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
}`;function Kh(){return a.jsxs("div",{className:"space-y-12",children:[a.jsxs("div",{children:[a.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Getting Started"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Learn how to set up and build your first Vexor application in minutes."})]}),a.jsxs("section",{id:"installation",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Installation"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Install Vexor and its ORM using npm, yarn, or pnpm:"}),a.jsx(Y,{code:Hh,language:"bash"}),a.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:a.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[a.jsx("strong",{className:"text-vexor-400",children:"Note:"})," Vexor requires Node.js 18+ or Bun 1.0+. It also works with Deno using the npm: specifier."]})})]}),a.jsxs("section",{id:"quick-start",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Quick Start"}),a.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Create a new file ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"app.ts"})," and add the following code:"]}),a.jsx(Y,{code:Gh,filename:"app.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-6",children:[a.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Run Your Application"}),a.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Use ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"tsx"})," or ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"bun"})," to run your TypeScript file directly:"]}),a.jsx(Y,{code:`# With Node.js
npx tsx app.ts

# With Bun
bun run app.ts`,language:"bash"})]})]}),a.jsxs("section",{children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Recommended Project Structure"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For larger applications, we recommend organizing your code like this:"}),a.jsx(Y,{code:qh,language:"text"})]}),a.jsxs("section",{children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"TypeScript Configuration"}),a.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Here's a recommended ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"tsconfig.json"})," for Vexor projects:"]}),a.jsx(Y,{code:Qh,filename:"tsconfig.json",language:"json"})]}),a.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[a.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),a.jsxs("ul",{className:"space-y-3",children:[a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"1"}),a.jsxs("div",{children:[a.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Learn Core Concepts"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Understand routing, context, and request handling"})]})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"2"}),a.jsxs("div",{children:[a.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Set Up Database"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Connect to PostgreSQL, MySQL, or SQLite with Vexor ORM"})]})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"3"}),a.jsxs("div",{children:[a.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Add Authentication"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Implement JWT or OAuth2 authentication"})]})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"4"}),a.jsxs("div",{children:[a.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Deploy"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Deploy to Node.js, Bun, AWS Lambda, or Edge"})]})]})]})]})]})}const Yh=`import { Vexor, Type } from '@vexorjs/core';

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

app.listen(3000);`,Zh=`app.get('/example', async (ctx) => {
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
});`,Xh=`// JSON response
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
ctx.status(201).json({ created: true });`,Jh=`// Basic routes
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
});`,eg=`import { Type } from '@vexorjs/core';

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
Type.Record(Type.String(), Type.Number())  // { [key: string]: number }`,tg=`app.addHook('onRequest', async (ctx) => {
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
});`,rg=`// Global error handler
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
});`;function ng(){return a.jsxs("div",{className:"space-y-12",children:[a.jsxs("div",{children:[a.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Core Concepts"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Learn the fundamental concepts of building applications with Vexor."})]}),a.jsxs("section",{id:"application",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Application"}),a.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"Vexor"})," class is the core of your application. It handles routing, middleware, and server lifecycle."]}),a.jsx(Y,{code:Yh,filename:"app.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"context",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Request Context"}),a.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Every route handler receives a context object (",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"ctx"}),") that provides access to request data and response methods."]}),a.jsx(Y,{code:Zh,filename:"context.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Response Methods"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor provides fluent response methods for common response types:"}),a.jsx(Y,{code:Xh,showLineNumbers:!0})]})]}),a.jsxs("section",{id:"routing",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Routing"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor uses a high-performance radix tree router for lightning-fast route matching."}),a.jsx(Y,{code:Jh,filename:"routes.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Route Parameters"}),a.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:["Use ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:":param"})," for named parameters. Access via ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"ctx.params.param"}),"."]})]}),a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Wildcards"}),a.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:["Use ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"*"})," to match everything. Access via ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"ctx.params['*']"}),"."]})]})]})]}),a.jsxs("section",{id:"validation",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Schema Validation"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor includes a TypeBox-compatible schema system for runtime validation with full TypeScript inference."}),a.jsx(Y,{code:eg,filename:"schemas.ts",showLineNumbers:!0}),a.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:a.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[a.jsx("strong",{className:"text-vexor-400",children:"Type Inference:"})," All schemas automatically infer TypeScript types. When you define a body schema, ",a.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"ctx.body"})," is fully typed!"]})})]}),a.jsxs("section",{id:"hooks",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Lifecycle Hooks"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Hooks allow you to intercept requests at different stages of the request lifecycle."}),a.jsx(Y,{code:tg,filename:"hooks.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-6",children:[a.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Hook Execution Order"}),a.jsxs("div",{className:"flex flex-wrap items-center gap-2 text-sm",children:[a.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"onRequest"}),a.jsx("span",{className:"text-slate-500",children:"→"}),a.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"preValidation"}),a.jsx("span",{className:"text-slate-500",children:"→"}),a.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"preHandler"}),a.jsx("span",{className:"text-slate-500",children:"→"}),a.jsx("span",{className:"px-3 py-1 bg-vexor-500/20 text-vexor-400 rounded-full",children:"Handler"}),a.jsx("span",{className:"text-slate-500",children:"→"}),a.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"onSend"}),a.jsx("span",{className:"text-slate-500",children:"→"}),a.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"onResponse"})]})]})]}),a.jsxs("section",{id:"error-handling",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Error Handling"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor provides centralized error handling with custom error handlers."}),a.jsx(Y,{code:rg,filename:"errors.ts",showLineNumbers:!0})]}),a.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[a.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[a.jsxs("a",{href:"/vexorjs/docs/orm",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Vexor ORM →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Learn about database operations with the built-in ORM"})]}),a.jsxs("a",{href:"/vexorjs/docs/middleware",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Middleware →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Explore built-in middleware for CORS, rate limiting, and more"})]})]})]})]})}const sg=`import { Database, PostgresDriver } from '@vexorjs/orm';

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
});`,ag=`import { defineTable, column, sql } from '@vexorjs/orm';

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
});`,lg=`import { eq, and, or, like, gt, lt, isNull, inArray, desc, asc } from '@vexorjs/orm';

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
  .first();`,og=`// Inner join
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
.orderBy(desc(comments.createdAt));`,ig=`// Insert single record
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
  .returning({ id: users.id });`,ug=`// Update single record
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
  ));`,cg=`// Delete single record
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
  .where(lt(sessions.expiresAt, new Date()));`,dg=`// Basic transaction
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
});`,pg=`// migrations/001_create_users.ts
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
};`,fg=`# Run all pending migrations
npx vexor db:migrate

# Rollback last migration
npx vexor db:rollback

# Rollback all migrations
npx vexor db:rollback --all

# Check migration status
npx vexor db:status

# Generate new migration
npx vexor db:generate create_posts`;function mg(){return a.jsxs("div",{className:"space-y-12",children:[a.jsxs("div",{children:[a.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Vexor ORM"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"A blazing-fast, type-safe ORM designed for modern TypeScript applications."})]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("div",{className:"text-2xl mb-2",children:"⚡"}),a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"High Performance"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Prepared statements, connection pooling, and query optimization"})]}),a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("div",{className:"text-2xl mb-2",children:"🔒"}),a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Type Safe"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Full TypeScript inference from schema to query results"})]}),a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("div",{className:"text-2xl mb-2",children:"💾"}),a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Multi-Database"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"PostgreSQL, MySQL, and SQLite support"})]})]}),a.jsxs("section",{id:"connection",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Database Connection"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Connect to your database with built-in connection pooling and health checks."}),a.jsx(Y,{code:sg,filename:"db.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"schema",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Schema Definition"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Define your tables with full type inference. Column types are automatically inferred."}),a.jsx(Y,{code:ag,filename:"schema.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-6 overflow-x-auto",children:[a.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Column Types"}),a.jsxs("table",{className:"w-full text-sm",children:[a.jsx("thead",{children:a.jsxs("tr",{className:"border-b border-slate-800",children:[a.jsx("th",{className:"text-left py-2 px-4",children:"Method"}),a.jsx("th",{className:"text-left py-2 px-4",children:"SQL Type"}),a.jsx("th",{className:"text-left py-2 px-4",children:"TypeScript Type"})]})}),a.jsxs("tbody",{className:"text-slate-400",children:[a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"serial()"})}),a.jsx("td",{className:"py-2 px-4",children:"SERIAL"}),a.jsx("td",{className:"py-2 px-4",children:"number"})]}),a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"integer()"})}),a.jsx("td",{className:"py-2 px-4",children:"INTEGER"}),a.jsx("td",{className:"py-2 px-4",children:"number"})]}),a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"bigint()"})}),a.jsx("td",{className:"py-2 px-4",children:"BIGINT"}),a.jsx("td",{className:"py-2 px-4",children:"bigint"})]}),a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"varchar(n)"})}),a.jsx("td",{className:"py-2 px-4",children:"VARCHAR(n)"}),a.jsx("td",{className:"py-2 px-4",children:"string"})]}),a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"text()"})}),a.jsx("td",{className:"py-2 px-4",children:"TEXT"}),a.jsx("td",{className:"py-2 px-4",children:"string"})]}),a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"boolean()"})}),a.jsx("td",{className:"py-2 px-4",children:"BOOLEAN"}),a.jsx("td",{className:"py-2 px-4",children:"boolean"})]}),a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"timestamp()"})}),a.jsx("td",{className:"py-2 px-4",children:"TIMESTAMP"}),a.jsx("td",{className:"py-2 px-4",children:"Date"})]}),a.jsxs("tr",{className:"border-b border-slate-800/50",children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"jsonb<T>()"})}),a.jsx("td",{className:"py-2 px-4",children:"JSONB"}),a.jsx("td",{className:"py-2 px-4",children:"T"})]}),a.jsxs("tr",{children:[a.jsx("td",{className:"py-2 px-4",children:a.jsx("code",{children:"array(type)"})}),a.jsx("td",{className:"py-2 px-4",children:"type[]"}),a.jsx("td",{className:"py-2 px-4",children:"Type[]"})]})]})]})]})]}),a.jsxs("section",{id:"select",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"SELECT Queries"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Build type-safe SELECT queries with filtering, sorting, and pagination."}),a.jsx(Y,{code:lg,filename:"queries.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"joins",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"JOIN Queries"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Combine data from multiple tables with type-safe joins."}),a.jsx(Y,{code:og,filename:"joins.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"insert",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"INSERT Operations"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Insert single or multiple records with conflict handling."}),a.jsx(Y,{code:ig,filename:"insert.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"update",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"UPDATE Operations"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Update records with type-safe conditions and expressions."}),a.jsx(Y,{code:ug,filename:"update.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"delete",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"DELETE Operations"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Delete records with safe conditions."}),a.jsx(Y,{code:cg,filename:"delete.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"transactions",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Transactions"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Execute multiple operations atomically with full ACID compliance."}),a.jsx(Y,{code:dg,filename:"transactions.ts",showLineNumbers:!0}),a.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:a.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[a.jsx("strong",{className:"text-vexor-400",children:"Automatic Rollback:"})," If any operation throws an error, the entire transaction is automatically rolled back. No manual cleanup required."]})})]}),a.jsxs("section",{id:"migrations",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Migrations"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Version-controlled database schema changes with up/down migrations."}),a.jsx(Y,{code:pg,filename:"migrations/001_create_users.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-6",children:[a.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Migration CLI"}),a.jsx(Y,{code:fg,language:"bash"})]})]}),a.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[a.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[a.jsxs("a",{href:"/vexorjs/docs/middleware",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Middleware →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Add authentication, caching, and more with built-in middleware"})]}),a.jsxs("a",{href:"/vexorjs/docs/realtime",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Real-time →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Build WebSocket and SSE applications"})]})]})]})]})}const hg=`import { Vexor, cors } from '@vexorjs/core';

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
app.get('/public', cors({ origin: '*' }), handler);`,gg=`import { Vexor, rateLimit, slowDown } from '@vexorjs/core';

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
app.use('/api/*', rateLimit({ max: 100, windowMs: 60000 }));`,xg=`import { Vexor, JWT, createJWT, verifyJWT } from '@vexorjs/core';

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
});`,yg=`import { Vexor, SessionManager, MemorySessionStore } from '@vexorjs/core';

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
});`,vg=`import { Vexor, compression } from '@vexorjs/core';

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
app.get('/stream', { compress: false }, streamHandler);`,wg=`import { Vexor, cacheMiddleware, createMemoryCache, createRedisCache } from '@vexorjs/core';

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
});`,bg=`import { Vexor, upload, singleUpload, multiUpload } from '@vexorjs/core';

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
);`,kg=`import { Vexor, healthCheck, databaseCheck, redisCheck, memoryCheck } from '@vexorjs/core';

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
// }`,Sg=`import { Vexor, createLogger, createRequestLogger } from '@vexorjs/core';

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
// {"level":"info","time":1705312200050,"msg":"request completed","method":"GET","path":"/api/data","status":200,"duration":50}`,jg=`import { Vexor, versioning, createVersionRouter } from '@vexorjs/core';

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
);`;function Ng(){return a.jsxs("div",{className:"space-y-12",children:[a.jsxs("div",{children:[a.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Middleware"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Vexor includes a comprehensive set of production-ready middleware for common use cases."})]}),a.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[{name:"CORS",href:"#cors"},{name:"Rate Limiting",href:"#rate-limit"},{name:"JWT Auth",href:"#jwt"},{name:"Sessions",href:"#sessions"},{name:"Compression",href:"#compression"},{name:"Caching",href:"#caching"},{name:"File Upload",href:"#upload"},{name:"Health Check",href:"#health"},{name:"Logging",href:"#logging"},{name:"Versioning",href:"#versioning"}].map(l=>a.jsx("a",{href:l.href,className:"p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm",children:l.name},l.name))}),a.jsxs("section",{id:"cors",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"CORS"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Cross-Origin Resource Sharing middleware for handling browser security policies."}),a.jsx(Y,{code:hg,filename:"cors.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"rate-limit",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Rate Limiting"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Protect your API from abuse with flexible rate limiting strategies."}),a.jsx(Y,{code:gg,filename:"rate-limit.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"jwt",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"JWT Authentication"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"JSON Web Token authentication with support for access and refresh tokens."}),a.jsx(Y,{code:xg,filename:"jwt-auth.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"sessions",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Session Management"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Server-side session management with multiple storage backends."}),a.jsx(Y,{code:yg,filename:"sessions.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"compression",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Compression"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Automatic response compression with gzip, deflate, and Brotli support."}),a.jsx(Y,{code:vg,filename:"compression.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"caching",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Caching"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Response caching with in-memory and Redis backends."}),a.jsx(Y,{code:wg,filename:"caching.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"upload",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"File Upload"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Handle file uploads with validation, size limits, and storage options."}),a.jsx(Y,{code:bg,filename:"upload.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"health",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Health Checks"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Expose health endpoints for load balancers and monitoring systems."}),a.jsx(Y,{code:kg,filename:"health.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"logging",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Logging"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Structured logging with request tracing and custom formatters."}),a.jsx(Y,{code:Sg,filename:"logging.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"versioning",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"API Versioning"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Version your API with path, header, or query parameter strategies."}),a.jsx(Y,{code:jg,filename:"versioning.ts",showLineNumbers:!0})]}),a.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[a.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[a.jsxs("a",{href:"/vexorjs/docs/realtime",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Real-time →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Build WebSocket and SSE applications"})]}),a.jsxs("a",{href:"/vexorjs/docs/deployment",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Deployment →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Deploy to Node.js, Bun, Lambda, and Edge"})]})]})]})]})}const Eg=`import { Vexor, Type } from '@vexorjs/core';

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

app.listen(3000);`,Cg=`// WebSocket with rooms/channels
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
});`,_g=`// WebSocket with authentication
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
});`,Rg=`import { Vexor, SSEStream, createSSEStream } from '@vexorjs/core';

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
});`,Tg=`// Browser client for SSE
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
});`,Lg=`import { Vexor, createEventBus, MemoryPubSubAdapter } from '@vexorjs/core';

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
});`,Pg=`import { Vexor, createEventBus, createRedisPubSub } from '@vexorjs/core';

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
});`,Ag=`import { Vexor, CircuitBreaker, createCircuitBreaker, retry } from '@vexorjs/core';

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
});`,Og=`// Browser WebSocket client
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
}`;function Ig(){return a.jsxs("div",{className:"space-y-12",children:[a.jsxs("div",{children:[a.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Real-time Features"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Build real-time applications with WebSockets, Server-Sent Events, and Pub/Sub."})]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("div",{className:"text-2xl mb-2",children:"🔌"}),a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"WebSocket"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Bidirectional real-time communication with rooms and channels"})]}),a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("div",{className:"text-2xl mb-2",children:"📡"}),a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Server-Sent Events"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"One-way streaming from server to client"})]}),a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("div",{className:"text-2xl mb-2",children:"📨"}),a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Pub/Sub"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Event-driven architecture with memory or Redis backend"})]})]}),a.jsxs("section",{id:"websocket",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"WebSocket"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Create WebSocket endpoints with type-safe message validation and lifecycle hooks."}),a.jsx(Y,{code:Eg,filename:"websocket.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Rooms & Channels"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Organize connections into rooms for targeted broadcasting."}),a.jsx(Y,{code:Cg,filename:"rooms.ts",showLineNumbers:!0})]}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Authentication"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Authenticate WebSocket connections before they're established."}),a.jsx(Y,{code:_g,filename:"ws-auth.ts",showLineNumbers:!0})]}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Client Example"}),a.jsx(Y,{code:Og,filename:"client.js",language:"javascript",showLineNumbers:!0})]})]}),a.jsxs("section",{id:"sse",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Server-Sent Events (SSE)"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Stream events to clients for progress updates, notifications, and live data."}),a.jsx(Y,{code:Rg,filename:"sse.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Client Example"}),a.jsx(Y,{code:Tg,filename:"sse-client.js",language:"javascript",showLineNumbers:!0})]}),a.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:a.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[a.jsx("strong",{className:"text-vexor-400",children:"When to use SSE vs WebSocket:"})," Use SSE for one-way server-to-client streaming (notifications, live updates). Use WebSocket for bidirectional communication (chat, gaming, collaboration)."]})})]}),a.jsxs("section",{id:"pubsub",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Pub/Sub & Event Bus"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Decouple your application with event-driven architecture."}),a.jsx(Y,{code:Lg,filename:"pubsub.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Redis Pub/Sub (Distributed)"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Scale horizontally with Redis-backed pub/sub for multi-instance deployments."}),a.jsx(Y,{code:Pg,filename:"redis-pubsub.ts",showLineNumbers:!0})]})]}),a.jsxs("section",{id:"resilience",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Resilience Patterns"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Protect your application from cascading failures with circuit breakers and retries."}),a.jsx(Y,{code:Ag,filename:"resilience.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Circuit Breaker States"}),a.jsxs("ul",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[a.jsxs("li",{children:[a.jsx("strong",{className:"text-green-400",children:"Closed:"})," Normal operation, requests pass through"]}),a.jsxs("li",{children:[a.jsx("strong",{className:"text-yellow-400",children:"Open:"})," Failing, requests blocked, fallback used"]}),a.jsxs("li",{children:[a.jsx("strong",{className:"text-blue-400",children:"Half-Open:"})," Testing if service recovered"]})]})]}),a.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[a.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Retry Strategies"}),a.jsxs("ul",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[a.jsxs("li",{children:[a.jsx("strong",{children:"Exponential:"})," 1s, 2s, 4s, 8s..."]}),a.jsxs("li",{children:[a.jsx("strong",{children:"Linear:"})," 1s, 2s, 3s, 4s..."]}),a.jsxs("li",{children:[a.jsx("strong",{children:"Fixed:"})," 1s, 1s, 1s, 1s..."]})]})]})]})]}),a.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[a.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[a.jsxs("a",{href:"/vexorjs/docs/deployment",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Deployment →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Deploy to Node.js, Bun, Lambda, and Edge"})]}),a.jsxs("a",{href:"/vexorjs/docs/core",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[a.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Core Concepts →"}),a.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Review routing, context, and lifecycle hooks"})]})]})]})]})}const Fg=`// server.ts
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
});`,Dg=`# Build stage
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

CMD ["node", "dist/server.js"]`,Mg=`version: '3.8'

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
  redis_data:`,zg=`// server.ts (Bun)
import { Vexor } from '@vexorjs/core';
import { createApp } from './app';

const app = createApp();

const port = parseInt(Bun.env.PORT || '3000');

// Bun auto-detects and uses its native HTTP server
app.listen(port, () => {
  console.log(\`Bun server running on port \${port}\`);
});`,Bg=`FROM oven/bun:1-alpine AS builder

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

CMD ["bun", "run", "dist/server.js"]`,Ug=`// lambda.ts
import { Vexor, createLambdaHandler } from '@vexorjs/core';

const app = new Vexor();

app.get('/hello', (ctx) => {
  return ctx.json({ message: 'Hello from Lambda!' });
});

app.get('/users/:id', (ctx) => {
  return ctx.json({ userId: ctx.params.id });
});

// Export Lambda handler
export const handler = createLambdaHandler(app);`,$g=`// lambda-streaming.ts
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
export const handler = createStreamingLambdaHandler(app);`,Vg=`# template.yaml (AWS SAM)
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
    Value: !Sub "https://\${ServerlessHttpApi}.execute-api.\${AWS::Region}.amazonaws.com"`,Wg=`// worker.ts
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
};`,Hg=`# wrangler.toml
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
database_id = "your-d1-database-id"`,Gg=`// api/index.ts (Vercel Edge)
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

export default app.fetch;`,qg=`// vercel.json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "functions": {
    "api/index.ts": {
      "runtime": "edge"
    }
  }
}`,Qg=`# ecosystem.config.js (PM2)
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
# pm2 monit`,Kg=`# /etc/nginx/sites-available/vexor-api
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
}`,Yg=`# .env.example
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
LOG_LEVEL=info`;function Zg(){return a.jsxs("div",{className:"space-y-12",children:[a.jsxs("div",{children:[a.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Deployment"}),a.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Deploy Vexor applications to Node.js, Bun, AWS Lambda, Cloudflare Workers, and more."})]}),a.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[{name:"Node.js",href:"#nodejs"},{name:"Docker",href:"#docker"},{name:"Bun",href:"#bun"},{name:"AWS Lambda",href:"#lambda"},{name:"Cloudflare",href:"#cloudflare"},{name:"Vercel Edge",href:"#vercel"},{name:"PM2 Cluster",href:"#pm2"},{name:"Nginx",href:"#nginx"}].map(l=>a.jsx("a",{href:l.href,className:"p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm",children:l.name},l.name))}),a.jsxs("section",{id:"env",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Environment Variables"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Always use environment variables for configuration. Never commit secrets to version control."}),a.jsx(Y,{code:Yg,filename:".env.example",showLineNumbers:!0})]}),a.jsxs("section",{id:"nodejs",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Node.js Deployment"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Standard Node.js deployment with graceful shutdown handling."}),a.jsx(Y,{code:Fg,filename:"server.ts",showLineNumbers:!0})]}),a.jsxs("section",{id:"docker",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Docker"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Multi-stage Docker build for optimized production images."}),a.jsx(Y,{code:Dg,filename:"Dockerfile",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Docker Compose"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Full stack deployment with PostgreSQL and Redis."}),a.jsx(Y,{code:Mg,filename:"docker-compose.yml",showLineNumbers:!0})]})]}),a.jsxs("section",{id:"bun",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Bun Deployment"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor automatically uses Bun's native HTTP server for maximum performance."}),a.jsx(Y,{code:zg,filename:"server.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Bun Dockerfile"}),a.jsx(Y,{code:Bg,filename:"Dockerfile.bun",showLineNumbers:!0})]}),a.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:a.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[a.jsx("strong",{className:"text-vexor-400",children:"Performance Tip:"})," Bun's native HTTP server is significantly faster than Node.js. Expect 2-3x higher throughput for compute-bound workloads."]})})]}),a.jsxs("section",{id:"lambda",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"AWS Lambda"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Deploy as a serverless function with API Gateway."}),a.jsx(Y,{code:Ug,filename:"lambda.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Lambda Streaming"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Use response streaming for large responses or real-time data."}),a.jsx(Y,{code:$g,filename:"lambda-streaming.ts",showLineNumbers:!0})]}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"SAM Template"}),a.jsx(Y,{code:Vg,filename:"template.yaml",showLineNumbers:!0})]})]}),a.jsxs("section",{id:"cloudflare",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Cloudflare Workers"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Deploy to the edge for ultra-low latency worldwide."}),a.jsx(Y,{code:Wg,filename:"worker.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Wrangler Configuration"}),a.jsx(Y,{code:Hg,filename:"wrangler.toml",showLineNumbers:!0})]})]}),a.jsxs("section",{id:"vercel",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Vercel Edge"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Deploy to Vercel's edge network with zero configuration."}),a.jsx(Y,{code:Gg,filename:"api/index.ts",showLineNumbers:!0}),a.jsxs("div",{className:"mt-8",children:[a.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Vercel Configuration"}),a.jsx(Y,{code:qg,filename:"vercel.json",showLineNumbers:!0})]})]}),a.jsxs("section",{id:"pm2",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"PM2 Cluster Mode"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Run multiple instances with automatic load balancing and zero-downtime reloads."}),a.jsx(Y,{code:Qg,filename:"ecosystem.config.js",showLineNumbers:!0})]}),a.jsxs("section",{id:"nginx",children:[a.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Nginx Reverse Proxy"}),a.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Production-ready Nginx configuration with SSL and load balancing."}),a.jsx(Y,{code:Kg,filename:"nginx.conf",showLineNumbers:!0})]}),a.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[a.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Production Checklist"}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs("div",{children:[a.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Security"}),a.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Use HTTPS everywhere"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Set secure headers (CORS, CSP, HSTS)"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Rate limit API endpoints"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Validate all inputs"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Use environment variables for secrets"})]})]})]}),a.jsxs("div",{children:[a.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Performance"}),a.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Enable compression"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Use connection pooling for databases"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Implement caching strategies"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Monitor with health checks"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Set up logging and tracing"})]})]})]}),a.jsxs("div",{children:[a.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Reliability"}),a.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Handle graceful shutdown"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Use circuit breakers for external services"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Implement retry logic"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Set appropriate timeouts"})]})]})]}),a.jsxs("div",{children:[a.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Operations"}),a.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Set up CI/CD pipelines"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Configure alerts and monitoring"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Plan for database backups"})]}),a.jsxs("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),a.jsx("span",{children:"Document runbooks"})]})]})]})]})]})]})}function Xg(){return a.jsx(em,{children:a.jsxs(Ft,{path:"/",element:a.jsx(Im,{}),children:[a.jsx(Ft,{index:!0,element:a.jsx(Wh,{})}),a.jsx(Ft,{path:"docs/getting-started",element:a.jsx(Kh,{})}),a.jsx(Ft,{path:"docs/core",element:a.jsx(ng,{})}),a.jsx(Ft,{path:"docs/orm",element:a.jsx(mg,{})}),a.jsx(Ft,{path:"docs/middleware",element:a.jsx(Ng,{})}),a.jsx(Ft,{path:"docs/realtime",element:a.jsx(Ig,{})}),a.jsx(Ft,{path:"docs/deployment",element:a.jsx(Zg,{})})]})})}sf.createRoot(document.getElementById("root")).render(a.jsx(Rc.StrictMode,{children:a.jsx(Tm,{children:a.jsx(om,{basename:"/vexorjs",children:a.jsx(Xg,{})})})}));
