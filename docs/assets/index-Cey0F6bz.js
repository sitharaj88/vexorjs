function om(l,c){for(var i=0;i<c.length;i++){const d=c[i];if(typeof d!="string"&&!Array.isArray(d)){for(const m in d)if(m!=="default"&&!(m in l)){const g=Object.getOwnPropertyDescriptor(d,m);g&&Object.defineProperty(l,m,g.get?g:{enumerable:!0,get:()=>d[m]})}}}return Object.freeze(Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}))}(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const m of document.querySelectorAll('link[rel="modulepreload"]'))d(m);new MutationObserver(m=>{for(const g of m)if(g.type==="childList")for(const f of g.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&d(f)}).observe(document,{childList:!0,subtree:!0});function i(m){const g={};return m.integrity&&(g.integrity=m.integrity),m.referrerPolicy&&(g.referrerPolicy=m.referrerPolicy),m.crossOrigin==="use-credentials"?g.credentials="include":m.crossOrigin==="anonymous"?g.credentials="omit":g.credentials="same-origin",g}function d(m){if(m.ep)return;m.ep=!0;const g=i(m);fetch(m.href,g)}})();function Fu(l){return l&&l.__esModule&&Object.prototype.hasOwnProperty.call(l,"default")?l.default:l}var Jl={exports:{}},Pn={},Xl={exports:{}},se={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var du;function im(){if(du)return se;du=1;var l=Symbol.for("react.element"),c=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),d=Symbol.for("react.strict_mode"),m=Symbol.for("react.profiler"),g=Symbol.for("react.provider"),f=Symbol.for("react.context"),E=Symbol.for("react.forward_ref"),y=Symbol.for("react.suspense"),C=Symbol.for("react.memo"),R=Symbol.for("react.lazy"),j=Symbol.iterator;function z(v){return v===null||typeof v!="object"?null:(v=j&&v[j]||v["@@iterator"],typeof v=="function"?v:null)}var Q={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},S=Object.assign,w={};function b(v,A,re){this.props=v,this.context=A,this.refs=w,this.updater=re||Q}b.prototype.isReactComponent={},b.prototype.setState=function(v,A){if(typeof v!="object"&&typeof v!="function"&&v!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,v,A,"setState")},b.prototype.forceUpdate=function(v){this.updater.enqueueForceUpdate(this,v,"forceUpdate")};function O(){}O.prototype=b.prototype;function L(v,A,re){this.props=v,this.context=A,this.refs=w,this.updater=re||Q}var M=L.prototype=new O;M.constructor=L,S(M,b.prototype),M.isPureReactComponent=!0;var K=Array.isArray,ee=Object.prototype.hasOwnProperty,ue={current:null},oe={key:!0,ref:!0,__self:!0,__source:!0};function fe(v,A,re){var ne,ie={},le=null,pe=null;if(A!=null)for(ne in A.ref!==void 0&&(pe=A.ref),A.key!==void 0&&(le=""+A.key),A)ee.call(A,ne)&&!oe.hasOwnProperty(ne)&&(ie[ne]=A[ne]);var me=arguments.length-2;if(me===1)ie.children=re;else if(1<me){for(var ge=Array(me),nt=0;nt<me;nt++)ge[nt]=arguments[nt+2];ie.children=ge}if(v&&v.defaultProps)for(ne in me=v.defaultProps,me)ie[ne]===void 0&&(ie[ne]=me[ne]);return{$$typeof:l,type:v,key:le,ref:pe,props:ie,_owner:ue.current}}function je(v,A){return{$$typeof:l,type:v.type,key:A,ref:v.ref,props:v.props,_owner:v._owner}}function De(v){return typeof v=="object"&&v!==null&&v.$$typeof===l}function Be(v){var A={"=":"=0",":":"=2"};return"$"+v.replace(/[=:]/g,function(re){return A[re]})}var Ce=/\/+/g;function $e(v,A){return typeof v=="object"&&v!==null&&v.key!=null?Be(""+v.key):A.toString(36)}function xe(v,A,re,ne,ie){var le=typeof v;(le==="undefined"||le==="boolean")&&(v=null);var pe=!1;if(v===null)pe=!0;else switch(le){case"string":case"number":pe=!0;break;case"object":switch(v.$$typeof){case l:case c:pe=!0}}if(pe)return pe=v,ie=ie(pe),v=ne===""?"."+$e(pe,0):ne,K(ie)?(re="",v!=null&&(re=v.replace(Ce,"$&/")+"/"),xe(ie,A,re,"",function(nt){return nt})):ie!=null&&(De(ie)&&(ie=je(ie,re+(!ie.key||pe&&pe.key===ie.key?"":(""+ie.key).replace(Ce,"$&/")+"/")+v)),A.push(ie)),1;if(pe=0,ne=ne===""?".":ne+":",K(v))for(var me=0;me<v.length;me++){le=v[me];var ge=ne+$e(le,me);pe+=xe(le,A,re,ge,ie)}else if(ge=z(v),typeof ge=="function")for(v=ge.call(v),me=0;!(le=v.next()).done;)le=le.value,ge=ne+$e(le,me++),pe+=xe(le,A,re,ge,ie);else if(le==="object")throw A=String(v),Error("Objects are not valid as a React child (found: "+(A==="[object Object]"?"object with keys {"+Object.keys(v).join(", ")+"}":A)+"). If you meant to render a collection of children, use an array instead.");return pe}function Te(v,A,re){if(v==null)return v;var ne=[],ie=0;return xe(v,ne,"","",function(le){return A.call(re,le,ie++)}),ne}function Re(v){if(v._status===-1){var A=v._result;A=A(),A.then(function(re){(v._status===0||v._status===-1)&&(v._status=1,v._result=re)},function(re){(v._status===0||v._status===-1)&&(v._status=2,v._result=re)}),v._status===-1&&(v._status=0,v._result=A)}if(v._status===1)return v._result.default;throw v._result}var ye={current:null},V={transition:null},Z={ReactCurrentDispatcher:ye,ReactCurrentBatchConfig:V,ReactCurrentOwner:ue};function $(){throw Error("act(...) is not supported in production builds of React.")}return se.Children={map:Te,forEach:function(v,A,re){Te(v,function(){A.apply(this,arguments)},re)},count:function(v){var A=0;return Te(v,function(){A++}),A},toArray:function(v){return Te(v,function(A){return A})||[]},only:function(v){if(!De(v))throw Error("React.Children.only expected to receive a single React element child.");return v}},se.Component=b,se.Fragment=i,se.Profiler=m,se.PureComponent=L,se.StrictMode=d,se.Suspense=y,se.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Z,se.act=$,se.cloneElement=function(v,A,re){if(v==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+v+".");var ne=S({},v.props),ie=v.key,le=v.ref,pe=v._owner;if(A!=null){if(A.ref!==void 0&&(le=A.ref,pe=ue.current),A.key!==void 0&&(ie=""+A.key),v.type&&v.type.defaultProps)var me=v.type.defaultProps;for(ge in A)ee.call(A,ge)&&!oe.hasOwnProperty(ge)&&(ne[ge]=A[ge]===void 0&&me!==void 0?me[ge]:A[ge])}var ge=arguments.length-2;if(ge===1)ne.children=re;else if(1<ge){me=Array(ge);for(var nt=0;nt<ge;nt++)me[nt]=arguments[nt+2];ne.children=me}return{$$typeof:l,type:v.type,key:ie,ref:le,props:ne,_owner:pe}},se.createContext=function(v){return v={$$typeof:f,_currentValue:v,_currentValue2:v,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},v.Provider={$$typeof:g,_context:v},v.Consumer=v},se.createElement=fe,se.createFactory=function(v){var A=fe.bind(null,v);return A.type=v,A},se.createRef=function(){return{current:null}},se.forwardRef=function(v){return{$$typeof:E,render:v}},se.isValidElement=De,se.lazy=function(v){return{$$typeof:R,_payload:{_status:-1,_result:v},_init:Re}},se.memo=function(v,A){return{$$typeof:C,type:v,compare:A===void 0?null:A}},se.startTransition=function(v){var A=V.transition;V.transition={};try{v()}finally{V.transition=A}},se.unstable_act=$,se.useCallback=function(v,A){return ye.current.useCallback(v,A)},se.useContext=function(v){return ye.current.useContext(v)},se.useDebugValue=function(){},se.useDeferredValue=function(v){return ye.current.useDeferredValue(v)},se.useEffect=function(v,A){return ye.current.useEffect(v,A)},se.useId=function(){return ye.current.useId()},se.useImperativeHandle=function(v,A,re){return ye.current.useImperativeHandle(v,A,re)},se.useInsertionEffect=function(v,A){return ye.current.useInsertionEffect(v,A)},se.useLayoutEffect=function(v,A){return ye.current.useLayoutEffect(v,A)},se.useMemo=function(v,A){return ye.current.useMemo(v,A)},se.useReducer=function(v,A,re){return ye.current.useReducer(v,A,re)},se.useRef=function(v){return ye.current.useRef(v)},se.useState=function(v){return ye.current.useState(v)},se.useSyncExternalStore=function(v,A,re){return ye.current.useSyncExternalStore(v,A,re)},se.useTransition=function(){return ye.current.useTransition()},se.version="18.3.1",se}var pu;function co(){return pu||(pu=1,Xl.exports=im()),Xl.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var mu;function cm(){if(mu)return Pn;mu=1;var l=co(),c=Symbol.for("react.element"),i=Symbol.for("react.fragment"),d=Object.prototype.hasOwnProperty,m=l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,g={key:!0,ref:!0,__self:!0,__source:!0};function f(E,y,C){var R,j={},z=null,Q=null;C!==void 0&&(z=""+C),y.key!==void 0&&(z=""+y.key),y.ref!==void 0&&(Q=y.ref);for(R in y)d.call(y,R)&&!g.hasOwnProperty(R)&&(j[R]=y[R]);if(E&&E.defaultProps)for(R in y=E.defaultProps,y)j[R]===void 0&&(j[R]=y[R]);return{$$typeof:c,type:E,key:z,ref:Q,props:j,_owner:m.current}}return Pn.Fragment=i,Pn.jsx=f,Pn.jsxs=f,Pn}var hu;function um(){return hu||(hu=1,Jl.exports=cm()),Jl.exports}var n=um(),U=co();const zu=Fu(U),dm=om({__proto__:null,default:zu},[U]);var Gs={},Zl={exports:{}},rt={},eo={exports:{}},to={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var fu;function pm(){return fu||(fu=1,(function(l){function c(V,Z){var $=V.length;V.push(Z);e:for(;0<$;){var v=$-1>>>1,A=V[v];if(0<m(A,Z))V[v]=Z,V[$]=A,$=v;else break e}}function i(V){return V.length===0?null:V[0]}function d(V){if(V.length===0)return null;var Z=V[0],$=V.pop();if($!==Z){V[0]=$;e:for(var v=0,A=V.length,re=A>>>1;v<re;){var ne=2*(v+1)-1,ie=V[ne],le=ne+1,pe=V[le];if(0>m(ie,$))le<A&&0>m(pe,ie)?(V[v]=pe,V[le]=$,v=le):(V[v]=ie,V[ne]=$,v=ne);else if(le<A&&0>m(pe,$))V[v]=pe,V[le]=$,v=le;else break e}}return Z}function m(V,Z){var $=V.sortIndex-Z.sortIndex;return $!==0?$:V.id-Z.id}if(typeof performance=="object"&&typeof performance.now=="function"){var g=performance;l.unstable_now=function(){return g.now()}}else{var f=Date,E=f.now();l.unstable_now=function(){return f.now()-E}}var y=[],C=[],R=1,j=null,z=3,Q=!1,S=!1,w=!1,b=typeof setTimeout=="function"?setTimeout:null,O=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function M(V){for(var Z=i(C);Z!==null;){if(Z.callback===null)d(C);else if(Z.startTime<=V)d(C),Z.sortIndex=Z.expirationTime,c(y,Z);else break;Z=i(C)}}function K(V){if(w=!1,M(V),!S)if(i(y)!==null)S=!0,Re(ee);else{var Z=i(C);Z!==null&&ye(K,Z.startTime-V)}}function ee(V,Z){S=!1,w&&(w=!1,O(fe),fe=-1),Q=!0;var $=z;try{for(M(Z),j=i(y);j!==null&&(!(j.expirationTime>Z)||V&&!Be());){var v=j.callback;if(typeof v=="function"){j.callback=null,z=j.priorityLevel;var A=v(j.expirationTime<=Z);Z=l.unstable_now(),typeof A=="function"?j.callback=A:j===i(y)&&d(y),M(Z)}else d(y);j=i(y)}if(j!==null)var re=!0;else{var ne=i(C);ne!==null&&ye(K,ne.startTime-Z),re=!1}return re}finally{j=null,z=$,Q=!1}}var ue=!1,oe=null,fe=-1,je=5,De=-1;function Be(){return!(l.unstable_now()-De<je)}function Ce(){if(oe!==null){var V=l.unstable_now();De=V;var Z=!0;try{Z=oe(!0,V)}finally{Z?$e():(ue=!1,oe=null)}}else ue=!1}var $e;if(typeof L=="function")$e=function(){L(Ce)};else if(typeof MessageChannel<"u"){var xe=new MessageChannel,Te=xe.port2;xe.port1.onmessage=Ce,$e=function(){Te.postMessage(null)}}else $e=function(){b(Ce,0)};function Re(V){oe=V,ue||(ue=!0,$e())}function ye(V,Z){fe=b(function(){V(l.unstable_now())},Z)}l.unstable_IdlePriority=5,l.unstable_ImmediatePriority=1,l.unstable_LowPriority=4,l.unstable_NormalPriority=3,l.unstable_Profiling=null,l.unstable_UserBlockingPriority=2,l.unstable_cancelCallback=function(V){V.callback=null},l.unstable_continueExecution=function(){S||Q||(S=!0,Re(ee))},l.unstable_forceFrameRate=function(V){0>V||125<V?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):je=0<V?Math.floor(1e3/V):5},l.unstable_getCurrentPriorityLevel=function(){return z},l.unstable_getFirstCallbackNode=function(){return i(y)},l.unstable_next=function(V){switch(z){case 1:case 2:case 3:var Z=3;break;default:Z=z}var $=z;z=Z;try{return V()}finally{z=$}},l.unstable_pauseExecution=function(){},l.unstable_requestPaint=function(){},l.unstable_runWithPriority=function(V,Z){switch(V){case 1:case 2:case 3:case 4:case 5:break;default:V=3}var $=z;z=V;try{return Z()}finally{z=$}},l.unstable_scheduleCallback=function(V,Z,$){var v=l.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?v+$:v):$=v,V){case 1:var A=-1;break;case 2:A=250;break;case 5:A=1073741823;break;case 4:A=1e4;break;default:A=5e3}return A=$+A,V={id:R++,callback:Z,priorityLevel:V,startTime:$,expirationTime:A,sortIndex:-1},$>v?(V.sortIndex=$,c(C,V),i(y)===null&&V===i(C)&&(w?(O(fe),fe=-1):w=!0,ye(K,$-v))):(V.sortIndex=A,c(y,V),S||Q||(S=!0,Re(ee))),V},l.unstable_shouldYield=Be,l.unstable_wrapCallback=function(V){var Z=z;return function(){var $=z;z=Z;try{return V.apply(this,arguments)}finally{z=$}}}})(to)),to}var xu;function mm(){return xu||(xu=1,eo.exports=pm()),eo.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var gu;function hm(){if(gu)return rt;gu=1;var l=co(),c=mm();function i(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,r=1;r<arguments.length;r++)t+="&args[]="+encodeURIComponent(arguments[r]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var d=new Set,m={};function g(e,t){f(e,t),f(e+"Capture",t)}function f(e,t){for(m[e]=t,e=0;e<t.length;e++)d.add(t[e])}var E=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),y=Object.prototype.hasOwnProperty,C=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,R={},j={};function z(e){return y.call(j,e)?!0:y.call(R,e)?!1:C.test(e)?j[e]=!0:(R[e]=!0,!1)}function Q(e,t,r,s){if(r!==null&&r.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return s?!1:r!==null?!r.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function S(e,t,r,s){if(t===null||typeof t>"u"||Q(e,t,r,s))return!0;if(s)return!1;if(r!==null)switch(r.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function w(e,t,r,s,a,o,u){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=s,this.attributeNamespace=a,this.mustUseProperty=r,this.propertyName=e,this.type=t,this.sanitizeURL=o,this.removeEmptyString=u}var b={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){b[e]=new w(e,0,!1,e,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];b[t]=new w(t,1,!1,e[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(e){b[e]=new w(e,2,!1,e.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){b[e]=new w(e,2,!1,e,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){b[e]=new w(e,3,!1,e.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(e){b[e]=new w(e,3,!0,e,null,!1,!1)}),["capture","download"].forEach(function(e){b[e]=new w(e,4,!1,e,null,!1,!1)}),["cols","rows","size","span"].forEach(function(e){b[e]=new w(e,6,!1,e,null,!1,!1)}),["rowSpan","start"].forEach(function(e){b[e]=new w(e,5,!1,e.toLowerCase(),null,!1,!1)});var O=/[\-:]([a-z])/g;function L(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(O,L);b[t]=new w(t,1,!1,e,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(O,L);b[t]=new w(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(O,L);b[t]=new w(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(e){b[e]=new w(e,1,!1,e.toLowerCase(),null,!1,!1)}),b.xlinkHref=new w("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(e){b[e]=new w(e,1,!1,e.toLowerCase(),null,!0,!0)});function M(e,t,r,s){var a=b.hasOwnProperty(t)?b[t]:null;(a!==null?a.type!==0:s||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(S(t,r,a,s)&&(r=null),s||a===null?z(t)&&(r===null?e.removeAttribute(t):e.setAttribute(t,""+r)):a.mustUseProperty?e[a.propertyName]=r===null?a.type===3?!1:"":r:(t=a.attributeName,s=a.attributeNamespace,r===null?e.removeAttribute(t):(a=a.type,r=a===3||a===4&&r===!0?"":""+r,s?e.setAttributeNS(s,t,r):e.setAttribute(t,r))))}var K=l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ee=Symbol.for("react.element"),ue=Symbol.for("react.portal"),oe=Symbol.for("react.fragment"),fe=Symbol.for("react.strict_mode"),je=Symbol.for("react.profiler"),De=Symbol.for("react.provider"),Be=Symbol.for("react.context"),Ce=Symbol.for("react.forward_ref"),$e=Symbol.for("react.suspense"),xe=Symbol.for("react.suspense_list"),Te=Symbol.for("react.memo"),Re=Symbol.for("react.lazy"),ye=Symbol.for("react.offscreen"),V=Symbol.iterator;function Z(e){return e===null||typeof e!="object"?null:(e=V&&e[V]||e["@@iterator"],typeof e=="function"?e:null)}var $=Object.assign,v;function A(e){if(v===void 0)try{throw Error()}catch(r){var t=r.stack.trim().match(/\n( *(at )?)/);v=t&&t[1]||""}return`
`+v+e}var re=!1;function ne(e,t){if(!e||re)return"";re=!0;var r=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(T){var s=T}Reflect.construct(e,[],t)}else{try{t.call()}catch(T){s=T}e.call(t.prototype)}else{try{throw Error()}catch(T){s=T}e()}}catch(T){if(T&&s&&typeof T.stack=="string"){for(var a=T.stack.split(`
`),o=s.stack.split(`
`),u=a.length-1,p=o.length-1;1<=u&&0<=p&&a[u]!==o[p];)p--;for(;1<=u&&0<=p;u--,p--)if(a[u]!==o[p]){if(u!==1||p!==1)do if(u--,p--,0>p||a[u]!==o[p]){var h=`
`+a[u].replace(" at new "," at ");return e.displayName&&h.includes("<anonymous>")&&(h=h.replace("<anonymous>",e.displayName)),h}while(1<=u&&0<=p);break}}}finally{re=!1,Error.prepareStackTrace=r}return(e=e?e.displayName||e.name:"")?A(e):""}function ie(e){switch(e.tag){case 5:return A(e.type);case 16:return A("Lazy");case 13:return A("Suspense");case 19:return A("SuspenseList");case 0:case 2:case 15:return e=ne(e.type,!1),e;case 11:return e=ne(e.type.render,!1),e;case 1:return e=ne(e.type,!0),e;default:return""}}function le(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case oe:return"Fragment";case ue:return"Portal";case je:return"Profiler";case fe:return"StrictMode";case $e:return"Suspense";case xe:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Be:return(e.displayName||"Context")+".Consumer";case De:return(e._context.displayName||"Context")+".Provider";case Ce:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Te:return t=e.displayName||null,t!==null?t:le(e.type)||"Memo";case Re:t=e._payload,e=e._init;try{return le(e(t))}catch{}}return null}function pe(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return le(t);case 8:return t===fe?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function me(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ge(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function nt(e){var t=ge(e)?"checked":"value",r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),s=""+e[t];if(!e.hasOwnProperty(t)&&typeof r<"u"&&typeof r.get=="function"&&typeof r.set=="function"){var a=r.get,o=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return a.call(this)},set:function(u){s=""+u,o.call(this,u)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return s},setValue:function(u){s=""+u},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Mn(e){e._valueTracker||(e._valueTracker=nt(e))}function go(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var r=t.getValue(),s="";return e&&(s=ge(e)?e.checked?"true":"false":e.value),e=s,e!==r?(t.setValue(e),!0):!1}function Fn(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function sa(e,t){var r=t.checked;return $({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:r??e._wrapperState.initialChecked})}function yo(e,t){var r=t.defaultValue==null?"":t.defaultValue,s=t.checked!=null?t.checked:t.defaultChecked;r=me(t.value!=null?t.value:r),e._wrapperState={initialChecked:s,initialValue:r,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function vo(e,t){t=t.checked,t!=null&&M(e,"checked",t,!1)}function aa(e,t){vo(e,t);var r=me(t.value),s=t.type;if(r!=null)s==="number"?(r===0&&e.value===""||e.value!=r)&&(e.value=""+r):e.value!==""+r&&(e.value=""+r);else if(s==="submit"||s==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?la(e,t.type,r):t.hasOwnProperty("defaultValue")&&la(e,t.type,me(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function bo(e,t,r){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var s=t.type;if(!(s!=="submit"&&s!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,r||t===e.value||(e.value=t),e.defaultValue=t}r=e.name,r!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,r!==""&&(e.name=r)}function la(e,t,r){(t!=="number"||Fn(e.ownerDocument)!==e)&&(r==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+r&&(e.defaultValue=""+r))}var Gr=Array.isArray;function wr(e,t,r,s){if(e=e.options,t){t={};for(var a=0;a<r.length;a++)t["$"+r[a]]=!0;for(r=0;r<e.length;r++)a=t.hasOwnProperty("$"+e[r].value),e[r].selected!==a&&(e[r].selected=a),a&&s&&(e[r].defaultSelected=!0)}else{for(r=""+me(r),t=null,a=0;a<e.length;a++){if(e[a].value===r){e[a].selected=!0,s&&(e[a].defaultSelected=!0);return}t!==null||e[a].disabled||(t=e[a])}t!==null&&(t.selected=!0)}}function oa(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(i(91));return $({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function wo(e,t){var r=t.value;if(r==null){if(r=t.children,t=t.defaultValue,r!=null){if(t!=null)throw Error(i(92));if(Gr(r)){if(1<r.length)throw Error(i(93));r=r[0]}t=r}t==null&&(t=""),r=t}e._wrapperState={initialValue:me(r)}}function ko(e,t){var r=me(t.value),s=me(t.defaultValue);r!=null&&(r=""+r,r!==e.value&&(e.value=r),t.defaultValue==null&&e.defaultValue!==r&&(e.defaultValue=r)),s!=null&&(e.defaultValue=""+s)}function jo(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function No(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function ia(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?No(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var zn,So=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,r,s,a){MSApp.execUnsafeLocalFunction(function(){return e(t,r,s,a)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(zn=zn||document.createElement("div"),zn.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=zn.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Qr(e,t){if(t){var r=e.firstChild;if(r&&r===e.lastChild&&r.nodeType===3){r.nodeValue=t;return}}e.textContent=t}var Kr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},dd=["Webkit","ms","Moz","O"];Object.keys(Kr).forEach(function(e){dd.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Kr[t]=Kr[e]})});function Eo(e,t,r){return t==null||typeof t=="boolean"||t===""?"":r||typeof t!="number"||t===0||Kr.hasOwnProperty(e)&&Kr[e]?(""+t).trim():t+"px"}function Co(e,t){e=e.style;for(var r in t)if(t.hasOwnProperty(r)){var s=r.indexOf("--")===0,a=Eo(r,t[r],s);r==="float"&&(r="cssFloat"),s?e.setProperty(r,a):e[r]=a}}var pd=$({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function ca(e,t){if(t){if(pd[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(i(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(i(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(i(61))}if(t.style!=null&&typeof t.style!="object")throw Error(i(62))}}function ua(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var da=null;function pa(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var ma=null,kr=null,jr=null;function To(e){if(e=yn(e)){if(typeof ma!="function")throw Error(i(280));var t=e.stateNode;t&&(t=is(t),ma(e.stateNode,e.type,t))}}function Ro(e){kr?jr?jr.push(e):jr=[e]:kr=e}function _o(){if(kr){var e=kr,t=jr;if(jr=kr=null,To(e),t)for(e=0;e<t.length;e++)To(t[e])}}function Lo(e,t){return e(t)}function Ao(){}var ha=!1;function Po(e,t,r){if(ha)return e(t,r);ha=!0;try{return Lo(e,t,r)}finally{ha=!1,(kr!==null||jr!==null)&&(Ao(),_o())}}function Yr(e,t){var r=e.stateNode;if(r===null)return null;var s=is(r);if(s===null)return null;r=s[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(s=!s.disabled)||(e=e.type,s=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!s;break e;default:e=!1}if(e)return null;if(r&&typeof r!="function")throw Error(i(231,t,typeof r));return r}var fa=!1;if(E)try{var Jr={};Object.defineProperty(Jr,"passive",{get:function(){fa=!0}}),window.addEventListener("test",Jr,Jr),window.removeEventListener("test",Jr,Jr)}catch{fa=!1}function md(e,t,r,s,a,o,u,p,h){var T=Array.prototype.slice.call(arguments,3);try{t.apply(r,T)}catch(D){this.onError(D)}}var Xr=!1,Bn=null,Un=!1,xa=null,hd={onError:function(e){Xr=!0,Bn=e}};function fd(e,t,r,s,a,o,u,p,h){Xr=!1,Bn=null,md.apply(hd,arguments)}function xd(e,t,r,s,a,o,u,p,h){if(fd.apply(this,arguments),Xr){if(Xr){var T=Bn;Xr=!1,Bn=null}else throw Error(i(198));Un||(Un=!0,xa=T)}}function lr(e){var t=e,r=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(r=t.return),e=t.return;while(e)}return t.tag===3?r:null}function Io(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Oo(e){if(lr(e)!==e)throw Error(i(188))}function gd(e){var t=e.alternate;if(!t){if(t=lr(e),t===null)throw Error(i(188));return t!==e?null:e}for(var r=e,s=t;;){var a=r.return;if(a===null)break;var o=a.alternate;if(o===null){if(s=a.return,s!==null){r=s;continue}break}if(a.child===o.child){for(o=a.child;o;){if(o===r)return Oo(a),e;if(o===s)return Oo(a),t;o=o.sibling}throw Error(i(188))}if(r.return!==s.return)r=a,s=o;else{for(var u=!1,p=a.child;p;){if(p===r){u=!0,r=a,s=o;break}if(p===s){u=!0,s=a,r=o;break}p=p.sibling}if(!u){for(p=o.child;p;){if(p===r){u=!0,r=o,s=a;break}if(p===s){u=!0,s=o,r=a;break}p=p.sibling}if(!u)throw Error(i(189))}}if(r.alternate!==s)throw Error(i(190))}if(r.tag!==3)throw Error(i(188));return r.stateNode.current===r?e:t}function Do(e){return e=gd(e),e!==null?Mo(e):null}function Mo(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Mo(e);if(t!==null)return t;e=e.sibling}return null}var Fo=c.unstable_scheduleCallback,zo=c.unstable_cancelCallback,yd=c.unstable_shouldYield,vd=c.unstable_requestPaint,_e=c.unstable_now,bd=c.unstable_getCurrentPriorityLevel,ga=c.unstable_ImmediatePriority,Bo=c.unstable_UserBlockingPriority,Vn=c.unstable_NormalPriority,wd=c.unstable_LowPriority,Uo=c.unstable_IdlePriority,$n=null,jt=null;function kd(e){if(jt&&typeof jt.onCommitFiberRoot=="function")try{jt.onCommitFiberRoot($n,e,void 0,(e.current.flags&128)===128)}catch{}}var xt=Math.clz32?Math.clz32:Sd,jd=Math.log,Nd=Math.LN2;function Sd(e){return e>>>=0,e===0?32:31-(jd(e)/Nd|0)|0}var Hn=64,qn=4194304;function Zr(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Wn(e,t){var r=e.pendingLanes;if(r===0)return 0;var s=0,a=e.suspendedLanes,o=e.pingedLanes,u=r&268435455;if(u!==0){var p=u&~a;p!==0?s=Zr(p):(o&=u,o!==0&&(s=Zr(o)))}else u=r&~a,u!==0?s=Zr(u):o!==0&&(s=Zr(o));if(s===0)return 0;if(t!==0&&t!==s&&(t&a)===0&&(a=s&-s,o=t&-t,a>=o||a===16&&(o&4194240)!==0))return t;if((s&4)!==0&&(s|=r&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=s;0<t;)r=31-xt(t),a=1<<r,s|=e[r],t&=~a;return s}function Ed(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Cd(e,t){for(var r=e.suspendedLanes,s=e.pingedLanes,a=e.expirationTimes,o=e.pendingLanes;0<o;){var u=31-xt(o),p=1<<u,h=a[u];h===-1?((p&r)===0||(p&s)!==0)&&(a[u]=Ed(p,t)):h<=t&&(e.expiredLanes|=p),o&=~p}}function ya(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Vo(){var e=Hn;return Hn<<=1,(Hn&4194240)===0&&(Hn=64),e}function va(e){for(var t=[],r=0;31>r;r++)t.push(e);return t}function en(e,t,r){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-xt(t),e[t]=r}function Td(e,t){var r=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var s=e.eventTimes;for(e=e.expirationTimes;0<r;){var a=31-xt(r),o=1<<a;t[a]=0,s[a]=-1,e[a]=-1,r&=~o}}function ba(e,t){var r=e.entangledLanes|=t;for(e=e.entanglements;r;){var s=31-xt(r),a=1<<s;a&t|e[s]&t&&(e[s]|=t),r&=~a}}var he=0;function $o(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Ho,wa,qo,Wo,Go,ka=!1,Gn=[],Mt=null,Ft=null,zt=null,tn=new Map,rn=new Map,Bt=[],Rd="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Qo(e,t){switch(e){case"focusin":case"focusout":Mt=null;break;case"dragenter":case"dragleave":Ft=null;break;case"mouseover":case"mouseout":zt=null;break;case"pointerover":case"pointerout":tn.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":rn.delete(t.pointerId)}}function nn(e,t,r,s,a,o){return e===null||e.nativeEvent!==o?(e={blockedOn:t,domEventName:r,eventSystemFlags:s,nativeEvent:o,targetContainers:[a]},t!==null&&(t=yn(t),t!==null&&wa(t)),e):(e.eventSystemFlags|=s,t=e.targetContainers,a!==null&&t.indexOf(a)===-1&&t.push(a),e)}function _d(e,t,r,s,a){switch(t){case"focusin":return Mt=nn(Mt,e,t,r,s,a),!0;case"dragenter":return Ft=nn(Ft,e,t,r,s,a),!0;case"mouseover":return zt=nn(zt,e,t,r,s,a),!0;case"pointerover":var o=a.pointerId;return tn.set(o,nn(tn.get(o)||null,e,t,r,s,a)),!0;case"gotpointercapture":return o=a.pointerId,rn.set(o,nn(rn.get(o)||null,e,t,r,s,a)),!0}return!1}function Ko(e){var t=or(e.target);if(t!==null){var r=lr(t);if(r!==null){if(t=r.tag,t===13){if(t=Io(r),t!==null){e.blockedOn=t,Go(e.priority,function(){qo(r)});return}}else if(t===3&&r.stateNode.current.memoizedState.isDehydrated){e.blockedOn=r.tag===3?r.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Qn(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var r=Na(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(r===null){r=e.nativeEvent;var s=new r.constructor(r.type,r);da=s,r.target.dispatchEvent(s),da=null}else return t=yn(r),t!==null&&wa(t),e.blockedOn=r,!1;t.shift()}return!0}function Yo(e,t,r){Qn(e)&&r.delete(t)}function Ld(){ka=!1,Mt!==null&&Qn(Mt)&&(Mt=null),Ft!==null&&Qn(Ft)&&(Ft=null),zt!==null&&Qn(zt)&&(zt=null),tn.forEach(Yo),rn.forEach(Yo)}function sn(e,t){e.blockedOn===t&&(e.blockedOn=null,ka||(ka=!0,c.unstable_scheduleCallback(c.unstable_NormalPriority,Ld)))}function an(e){function t(a){return sn(a,e)}if(0<Gn.length){sn(Gn[0],e);for(var r=1;r<Gn.length;r++){var s=Gn[r];s.blockedOn===e&&(s.blockedOn=null)}}for(Mt!==null&&sn(Mt,e),Ft!==null&&sn(Ft,e),zt!==null&&sn(zt,e),tn.forEach(t),rn.forEach(t),r=0;r<Bt.length;r++)s=Bt[r],s.blockedOn===e&&(s.blockedOn=null);for(;0<Bt.length&&(r=Bt[0],r.blockedOn===null);)Ko(r),r.blockedOn===null&&Bt.shift()}var Nr=K.ReactCurrentBatchConfig,Kn=!0;function Ad(e,t,r,s){var a=he,o=Nr.transition;Nr.transition=null;try{he=1,ja(e,t,r,s)}finally{he=a,Nr.transition=o}}function Pd(e,t,r,s){var a=he,o=Nr.transition;Nr.transition=null;try{he=4,ja(e,t,r,s)}finally{he=a,Nr.transition=o}}function ja(e,t,r,s){if(Kn){var a=Na(e,t,r,s);if(a===null)Ua(e,t,s,Yn,r),Qo(e,s);else if(_d(a,e,t,r,s))s.stopPropagation();else if(Qo(e,s),t&4&&-1<Rd.indexOf(e)){for(;a!==null;){var o=yn(a);if(o!==null&&Ho(o),o=Na(e,t,r,s),o===null&&Ua(e,t,s,Yn,r),o===a)break;a=o}a!==null&&s.stopPropagation()}else Ua(e,t,s,null,r)}}var Yn=null;function Na(e,t,r,s){if(Yn=null,e=pa(s),e=or(e),e!==null)if(t=lr(e),t===null)e=null;else if(r=t.tag,r===13){if(e=Io(t),e!==null)return e;e=null}else if(r===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return Yn=e,null}function Jo(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(bd()){case ga:return 1;case Bo:return 4;case Vn:case wd:return 16;case Uo:return 536870912;default:return 16}default:return 16}}var Ut=null,Sa=null,Jn=null;function Xo(){if(Jn)return Jn;var e,t=Sa,r=t.length,s,a="value"in Ut?Ut.value:Ut.textContent,o=a.length;for(e=0;e<r&&t[e]===a[e];e++);var u=r-e;for(s=1;s<=u&&t[r-s]===a[o-s];s++);return Jn=a.slice(e,1<s?1-s:void 0)}function Xn(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Zn(){return!0}function Zo(){return!1}function st(e){function t(r,s,a,o,u){this._reactName=r,this._targetInst=a,this.type=s,this.nativeEvent=o,this.target=u,this.currentTarget=null;for(var p in e)e.hasOwnProperty(p)&&(r=e[p],this[p]=r?r(o):o[p]);return this.isDefaultPrevented=(o.defaultPrevented!=null?o.defaultPrevented:o.returnValue===!1)?Zn:Zo,this.isPropagationStopped=Zo,this}return $(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var r=this.nativeEvent;r&&(r.preventDefault?r.preventDefault():typeof r.returnValue!="unknown"&&(r.returnValue=!1),this.isDefaultPrevented=Zn)},stopPropagation:function(){var r=this.nativeEvent;r&&(r.stopPropagation?r.stopPropagation():typeof r.cancelBubble!="unknown"&&(r.cancelBubble=!0),this.isPropagationStopped=Zn)},persist:function(){},isPersistent:Zn}),t}var Sr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ea=st(Sr),ln=$({},Sr,{view:0,detail:0}),Id=st(ln),Ca,Ta,on,es=$({},ln,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:_a,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==on&&(on&&e.type==="mousemove"?(Ca=e.screenX-on.screenX,Ta=e.screenY-on.screenY):Ta=Ca=0,on=e),Ca)},movementY:function(e){return"movementY"in e?e.movementY:Ta}}),ei=st(es),Od=$({},es,{dataTransfer:0}),Dd=st(Od),Md=$({},ln,{relatedTarget:0}),Ra=st(Md),Fd=$({},Sr,{animationName:0,elapsedTime:0,pseudoElement:0}),zd=st(Fd),Bd=$({},Sr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Ud=st(Bd),Vd=$({},Sr,{data:0}),ti=st(Vd),$d={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Hd={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},qd={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Wd(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=qd[e])?!!t[e]:!1}function _a(){return Wd}var Gd=$({},ln,{key:function(e){if(e.key){var t=$d[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Xn(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Hd[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:_a,charCode:function(e){return e.type==="keypress"?Xn(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Xn(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Qd=st(Gd),Kd=$({},es,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),ri=st(Kd),Yd=$({},ln,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:_a}),Jd=st(Yd),Xd=$({},Sr,{propertyName:0,elapsedTime:0,pseudoElement:0}),Zd=st(Xd),ep=$({},es,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),tp=st(ep),rp=[9,13,27,32],La=E&&"CompositionEvent"in window,cn=null;E&&"documentMode"in document&&(cn=document.documentMode);var np=E&&"TextEvent"in window&&!cn,ni=E&&(!La||cn&&8<cn&&11>=cn),si=" ",ai=!1;function li(e,t){switch(e){case"keyup":return rp.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function oi(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Er=!1;function sp(e,t){switch(e){case"compositionend":return oi(t);case"keypress":return t.which!==32?null:(ai=!0,si);case"textInput":return e=t.data,e===si&&ai?null:e;default:return null}}function ap(e,t){if(Er)return e==="compositionend"||!La&&li(e,t)?(e=Xo(),Jn=Sa=Ut=null,Er=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return ni&&t.locale!=="ko"?null:t.data;default:return null}}var lp={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function ii(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!lp[e.type]:t==="textarea"}function ci(e,t,r,s){Ro(s),t=as(t,"onChange"),0<t.length&&(r=new Ea("onChange","change",null,r,s),e.push({event:r,listeners:t}))}var un=null,dn=null;function op(e){Ci(e,0)}function ts(e){var t=Lr(e);if(go(t))return e}function ip(e,t){if(e==="change")return t}var ui=!1;if(E){var Aa;if(E){var Pa="oninput"in document;if(!Pa){var di=document.createElement("div");di.setAttribute("oninput","return;"),Pa=typeof di.oninput=="function"}Aa=Pa}else Aa=!1;ui=Aa&&(!document.documentMode||9<document.documentMode)}function pi(){un&&(un.detachEvent("onpropertychange",mi),dn=un=null)}function mi(e){if(e.propertyName==="value"&&ts(dn)){var t=[];ci(t,dn,e,pa(e)),Po(op,t)}}function cp(e,t,r){e==="focusin"?(pi(),un=t,dn=r,un.attachEvent("onpropertychange",mi)):e==="focusout"&&pi()}function up(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ts(dn)}function dp(e,t){if(e==="click")return ts(t)}function pp(e,t){if(e==="input"||e==="change")return ts(t)}function mp(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var gt=typeof Object.is=="function"?Object.is:mp;function pn(e,t){if(gt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var r=Object.keys(e),s=Object.keys(t);if(r.length!==s.length)return!1;for(s=0;s<r.length;s++){var a=r[s];if(!y.call(t,a)||!gt(e[a],t[a]))return!1}return!0}function hi(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function fi(e,t){var r=hi(e);e=0;for(var s;r;){if(r.nodeType===3){if(s=e+r.textContent.length,e<=t&&s>=t)return{node:r,offset:t-e};e=s}e:{for(;r;){if(r.nextSibling){r=r.nextSibling;break e}r=r.parentNode}r=void 0}r=hi(r)}}function xi(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?xi(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function gi(){for(var e=window,t=Fn();t instanceof e.HTMLIFrameElement;){try{var r=typeof t.contentWindow.location.href=="string"}catch{r=!1}if(r)e=t.contentWindow;else break;t=Fn(e.document)}return t}function Ia(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function hp(e){var t=gi(),r=e.focusedElem,s=e.selectionRange;if(t!==r&&r&&r.ownerDocument&&xi(r.ownerDocument.documentElement,r)){if(s!==null&&Ia(r)){if(t=s.start,e=s.end,e===void 0&&(e=t),"selectionStart"in r)r.selectionStart=t,r.selectionEnd=Math.min(e,r.value.length);else if(e=(t=r.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var a=r.textContent.length,o=Math.min(s.start,a);s=s.end===void 0?o:Math.min(s.end,a),!e.extend&&o>s&&(a=s,s=o,o=a),a=fi(r,o);var u=fi(r,s);a&&u&&(e.rangeCount!==1||e.anchorNode!==a.node||e.anchorOffset!==a.offset||e.focusNode!==u.node||e.focusOffset!==u.offset)&&(t=t.createRange(),t.setStart(a.node,a.offset),e.removeAllRanges(),o>s?(e.addRange(t),e.extend(u.node,u.offset)):(t.setEnd(u.node,u.offset),e.addRange(t)))}}for(t=[],e=r;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof r.focus=="function"&&r.focus(),r=0;r<t.length;r++)e=t[r],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var fp=E&&"documentMode"in document&&11>=document.documentMode,Cr=null,Oa=null,mn=null,Da=!1;function yi(e,t,r){var s=r.window===r?r.document:r.nodeType===9?r:r.ownerDocument;Da||Cr==null||Cr!==Fn(s)||(s=Cr,"selectionStart"in s&&Ia(s)?s={start:s.selectionStart,end:s.selectionEnd}:(s=(s.ownerDocument&&s.ownerDocument.defaultView||window).getSelection(),s={anchorNode:s.anchorNode,anchorOffset:s.anchorOffset,focusNode:s.focusNode,focusOffset:s.focusOffset}),mn&&pn(mn,s)||(mn=s,s=as(Oa,"onSelect"),0<s.length&&(t=new Ea("onSelect","select",null,t,r),e.push({event:t,listeners:s}),t.target=Cr)))}function rs(e,t){var r={};return r[e.toLowerCase()]=t.toLowerCase(),r["Webkit"+e]="webkit"+t,r["Moz"+e]="moz"+t,r}var Tr={animationend:rs("Animation","AnimationEnd"),animationiteration:rs("Animation","AnimationIteration"),animationstart:rs("Animation","AnimationStart"),transitionend:rs("Transition","TransitionEnd")},Ma={},vi={};E&&(vi=document.createElement("div").style,"AnimationEvent"in window||(delete Tr.animationend.animation,delete Tr.animationiteration.animation,delete Tr.animationstart.animation),"TransitionEvent"in window||delete Tr.transitionend.transition);function ns(e){if(Ma[e])return Ma[e];if(!Tr[e])return e;var t=Tr[e],r;for(r in t)if(t.hasOwnProperty(r)&&r in vi)return Ma[e]=t[r];return e}var bi=ns("animationend"),wi=ns("animationiteration"),ki=ns("animationstart"),ji=ns("transitionend"),Ni=new Map,Si="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Vt(e,t){Ni.set(e,t),g(t,[e])}for(var Fa=0;Fa<Si.length;Fa++){var za=Si[Fa],xp=za.toLowerCase(),gp=za[0].toUpperCase()+za.slice(1);Vt(xp,"on"+gp)}Vt(bi,"onAnimationEnd"),Vt(wi,"onAnimationIteration"),Vt(ki,"onAnimationStart"),Vt("dblclick","onDoubleClick"),Vt("focusin","onFocus"),Vt("focusout","onBlur"),Vt(ji,"onTransitionEnd"),f("onMouseEnter",["mouseout","mouseover"]),f("onMouseLeave",["mouseout","mouseover"]),f("onPointerEnter",["pointerout","pointerover"]),f("onPointerLeave",["pointerout","pointerover"]),g("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),g("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),g("onBeforeInput",["compositionend","keypress","textInput","paste"]),g("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),g("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),g("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var hn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),yp=new Set("cancel close invalid load scroll toggle".split(" ").concat(hn));function Ei(e,t,r){var s=e.type||"unknown-event";e.currentTarget=r,xd(s,t,void 0,e),e.currentTarget=null}function Ci(e,t){t=(t&4)!==0;for(var r=0;r<e.length;r++){var s=e[r],a=s.event;s=s.listeners;e:{var o=void 0;if(t)for(var u=s.length-1;0<=u;u--){var p=s[u],h=p.instance,T=p.currentTarget;if(p=p.listener,h!==o&&a.isPropagationStopped())break e;Ei(a,p,T),o=h}else for(u=0;u<s.length;u++){if(p=s[u],h=p.instance,T=p.currentTarget,p=p.listener,h!==o&&a.isPropagationStopped())break e;Ei(a,p,T),o=h}}}if(Un)throw e=xa,Un=!1,xa=null,e}function be(e,t){var r=t[Ga];r===void 0&&(r=t[Ga]=new Set);var s=e+"__bubble";r.has(s)||(Ti(t,e,2,!1),r.add(s))}function Ba(e,t,r){var s=0;t&&(s|=4),Ti(r,e,s,t)}var ss="_reactListening"+Math.random().toString(36).slice(2);function fn(e){if(!e[ss]){e[ss]=!0,d.forEach(function(r){r!=="selectionchange"&&(yp.has(r)||Ba(r,!1,e),Ba(r,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[ss]||(t[ss]=!0,Ba("selectionchange",!1,t))}}function Ti(e,t,r,s){switch(Jo(t)){case 1:var a=Ad;break;case 4:a=Pd;break;default:a=ja}r=a.bind(null,t,r,e),a=void 0,!fa||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(a=!0),s?a!==void 0?e.addEventListener(t,r,{capture:!0,passive:a}):e.addEventListener(t,r,!0):a!==void 0?e.addEventListener(t,r,{passive:a}):e.addEventListener(t,r,!1)}function Ua(e,t,r,s,a){var o=s;if((t&1)===0&&(t&2)===0&&s!==null)e:for(;;){if(s===null)return;var u=s.tag;if(u===3||u===4){var p=s.stateNode.containerInfo;if(p===a||p.nodeType===8&&p.parentNode===a)break;if(u===4)for(u=s.return;u!==null;){var h=u.tag;if((h===3||h===4)&&(h=u.stateNode.containerInfo,h===a||h.nodeType===8&&h.parentNode===a))return;u=u.return}for(;p!==null;){if(u=or(p),u===null)return;if(h=u.tag,h===5||h===6){s=o=u;continue e}p=p.parentNode}}s=s.return}Po(function(){var T=o,D=pa(r),F=[];e:{var P=Ni.get(e);if(P!==void 0){var H=Ea,W=e;switch(e){case"keypress":if(Xn(r)===0)break e;case"keydown":case"keyup":H=Qd;break;case"focusin":W="focus",H=Ra;break;case"focusout":W="blur",H=Ra;break;case"beforeblur":case"afterblur":H=Ra;break;case"click":if(r.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":H=ei;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":H=Dd;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":H=Jd;break;case bi:case wi:case ki:H=zd;break;case ji:H=Zd;break;case"scroll":H=Id;break;case"wheel":H=tp;break;case"copy":case"cut":case"paste":H=Ud;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":H=ri}var G=(t&4)!==0,Le=!G&&e==="scroll",k=G?P!==null?P+"Capture":null:P;G=[];for(var x=T,N;x!==null;){N=x;var B=N.stateNode;if(N.tag===5&&B!==null&&(N=B,k!==null&&(B=Yr(x,k),B!=null&&G.push(xn(x,B,N)))),Le)break;x=x.return}0<G.length&&(P=new H(P,W,null,r,D),F.push({event:P,listeners:G}))}}if((t&7)===0){e:{if(P=e==="mouseover"||e==="pointerover",H=e==="mouseout"||e==="pointerout",P&&r!==da&&(W=r.relatedTarget||r.fromElement)&&(or(W)||W[Rt]))break e;if((H||P)&&(P=D.window===D?D:(P=D.ownerDocument)?P.defaultView||P.parentWindow:window,H?(W=r.relatedTarget||r.toElement,H=T,W=W?or(W):null,W!==null&&(Le=lr(W),W!==Le||W.tag!==5&&W.tag!==6)&&(W=null)):(H=null,W=T),H!==W)){if(G=ei,B="onMouseLeave",k="onMouseEnter",x="mouse",(e==="pointerout"||e==="pointerover")&&(G=ri,B="onPointerLeave",k="onPointerEnter",x="pointer"),Le=H==null?P:Lr(H),N=W==null?P:Lr(W),P=new G(B,x+"leave",H,r,D),P.target=Le,P.relatedTarget=N,B=null,or(D)===T&&(G=new G(k,x+"enter",W,r,D),G.target=N,G.relatedTarget=Le,B=G),Le=B,H&&W)t:{for(G=H,k=W,x=0,N=G;N;N=Rr(N))x++;for(N=0,B=k;B;B=Rr(B))N++;for(;0<x-N;)G=Rr(G),x--;for(;0<N-x;)k=Rr(k),N--;for(;x--;){if(G===k||k!==null&&G===k.alternate)break t;G=Rr(G),k=Rr(k)}G=null}else G=null;H!==null&&Ri(F,P,H,G,!1),W!==null&&Le!==null&&Ri(F,Le,W,G,!0)}}e:{if(P=T?Lr(T):window,H=P.nodeName&&P.nodeName.toLowerCase(),H==="select"||H==="input"&&P.type==="file")var Y=ip;else if(ii(P))if(ui)Y=pp;else{Y=up;var J=cp}else(H=P.nodeName)&&H.toLowerCase()==="input"&&(P.type==="checkbox"||P.type==="radio")&&(Y=dp);if(Y&&(Y=Y(e,T))){ci(F,Y,r,D);break e}J&&J(e,P,T),e==="focusout"&&(J=P._wrapperState)&&J.controlled&&P.type==="number"&&la(P,"number",P.value)}switch(J=T?Lr(T):window,e){case"focusin":(ii(J)||J.contentEditable==="true")&&(Cr=J,Oa=T,mn=null);break;case"focusout":mn=Oa=Cr=null;break;case"mousedown":Da=!0;break;case"contextmenu":case"mouseup":case"dragend":Da=!1,yi(F,r,D);break;case"selectionchange":if(fp)break;case"keydown":case"keyup":yi(F,r,D)}var X;if(La)e:{switch(e){case"compositionstart":var te="onCompositionStart";break e;case"compositionend":te="onCompositionEnd";break e;case"compositionupdate":te="onCompositionUpdate";break e}te=void 0}else Er?li(e,r)&&(te="onCompositionEnd"):e==="keydown"&&r.keyCode===229&&(te="onCompositionStart");te&&(ni&&r.locale!=="ko"&&(Er||te!=="onCompositionStart"?te==="onCompositionEnd"&&Er&&(X=Xo()):(Ut=D,Sa="value"in Ut?Ut.value:Ut.textContent,Er=!0)),J=as(T,te),0<J.length&&(te=new ti(te,e,null,r,D),F.push({event:te,listeners:J}),X?te.data=X:(X=oi(r),X!==null&&(te.data=X)))),(X=np?sp(e,r):ap(e,r))&&(T=as(T,"onBeforeInput"),0<T.length&&(D=new ti("onBeforeInput","beforeinput",null,r,D),F.push({event:D,listeners:T}),D.data=X))}Ci(F,t)})}function xn(e,t,r){return{instance:e,listener:t,currentTarget:r}}function as(e,t){for(var r=t+"Capture",s=[];e!==null;){var a=e,o=a.stateNode;a.tag===5&&o!==null&&(a=o,o=Yr(e,r),o!=null&&s.unshift(xn(e,o,a)),o=Yr(e,t),o!=null&&s.push(xn(e,o,a))),e=e.return}return s}function Rr(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function Ri(e,t,r,s,a){for(var o=t._reactName,u=[];r!==null&&r!==s;){var p=r,h=p.alternate,T=p.stateNode;if(h!==null&&h===s)break;p.tag===5&&T!==null&&(p=T,a?(h=Yr(r,o),h!=null&&u.unshift(xn(r,h,p))):a||(h=Yr(r,o),h!=null&&u.push(xn(r,h,p)))),r=r.return}u.length!==0&&e.push({event:t,listeners:u})}var vp=/\r\n?/g,bp=/\u0000|\uFFFD/g;function _i(e){return(typeof e=="string"?e:""+e).replace(vp,`
`).replace(bp,"")}function ls(e,t,r){if(t=_i(t),_i(e)!==t&&r)throw Error(i(425))}function os(){}var Va=null,$a=null;function Ha(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var qa=typeof setTimeout=="function"?setTimeout:void 0,wp=typeof clearTimeout=="function"?clearTimeout:void 0,Li=typeof Promise=="function"?Promise:void 0,kp=typeof queueMicrotask=="function"?queueMicrotask:typeof Li<"u"?function(e){return Li.resolve(null).then(e).catch(jp)}:qa;function jp(e){setTimeout(function(){throw e})}function Wa(e,t){var r=t,s=0;do{var a=r.nextSibling;if(e.removeChild(r),a&&a.nodeType===8)if(r=a.data,r==="/$"){if(s===0){e.removeChild(a),an(t);return}s--}else r!=="$"&&r!=="$?"&&r!=="$!"||s++;r=a}while(r);an(t)}function $t(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function Ai(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var r=e.data;if(r==="$"||r==="$!"||r==="$?"){if(t===0)return e;t--}else r==="/$"&&t++}e=e.previousSibling}return null}var _r=Math.random().toString(36).slice(2),Nt="__reactFiber$"+_r,gn="__reactProps$"+_r,Rt="__reactContainer$"+_r,Ga="__reactEvents$"+_r,Np="__reactListeners$"+_r,Sp="__reactHandles$"+_r;function or(e){var t=e[Nt];if(t)return t;for(var r=e.parentNode;r;){if(t=r[Rt]||r[Nt]){if(r=t.alternate,t.child!==null||r!==null&&r.child!==null)for(e=Ai(e);e!==null;){if(r=e[Nt])return r;e=Ai(e)}return t}e=r,r=e.parentNode}return null}function yn(e){return e=e[Nt]||e[Rt],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Lr(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(i(33))}function is(e){return e[gn]||null}var Qa=[],Ar=-1;function Ht(e){return{current:e}}function we(e){0>Ar||(e.current=Qa[Ar],Qa[Ar]=null,Ar--)}function ve(e,t){Ar++,Qa[Ar]=e.current,e.current=t}var qt={},He=Ht(qt),Je=Ht(!1),ir=qt;function Pr(e,t){var r=e.type.contextTypes;if(!r)return qt;var s=e.stateNode;if(s&&s.__reactInternalMemoizedUnmaskedChildContext===t)return s.__reactInternalMemoizedMaskedChildContext;var a={},o;for(o in r)a[o]=t[o];return s&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=a),a}function Xe(e){return e=e.childContextTypes,e!=null}function cs(){we(Je),we(He)}function Pi(e,t,r){if(He.current!==qt)throw Error(i(168));ve(He,t),ve(Je,r)}function Ii(e,t,r){var s=e.stateNode;if(t=t.childContextTypes,typeof s.getChildContext!="function")return r;s=s.getChildContext();for(var a in s)if(!(a in t))throw Error(i(108,pe(e)||"Unknown",a));return $({},r,s)}function us(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||qt,ir=He.current,ve(He,e),ve(Je,Je.current),!0}function Oi(e,t,r){var s=e.stateNode;if(!s)throw Error(i(169));r?(e=Ii(e,t,ir),s.__reactInternalMemoizedMergedChildContext=e,we(Je),we(He),ve(He,e)):we(Je),ve(Je,r)}var _t=null,ds=!1,Ka=!1;function Di(e){_t===null?_t=[e]:_t.push(e)}function Ep(e){ds=!0,Di(e)}function Wt(){if(!Ka&&_t!==null){Ka=!0;var e=0,t=he;try{var r=_t;for(he=1;e<r.length;e++){var s=r[e];do s=s(!0);while(s!==null)}_t=null,ds=!1}catch(a){throw _t!==null&&(_t=_t.slice(e+1)),Fo(ga,Wt),a}finally{he=t,Ka=!1}}return null}var Ir=[],Or=0,ps=null,ms=0,ut=[],dt=0,cr=null,Lt=1,At="";function ur(e,t){Ir[Or++]=ms,Ir[Or++]=ps,ps=e,ms=t}function Mi(e,t,r){ut[dt++]=Lt,ut[dt++]=At,ut[dt++]=cr,cr=e;var s=Lt;e=At;var a=32-xt(s)-1;s&=~(1<<a),r+=1;var o=32-xt(t)+a;if(30<o){var u=a-a%5;o=(s&(1<<u)-1).toString(32),s>>=u,a-=u,Lt=1<<32-xt(t)+a|r<<a|s,At=o+e}else Lt=1<<o|r<<a|s,At=e}function Ya(e){e.return!==null&&(ur(e,1),Mi(e,1,0))}function Ja(e){for(;e===ps;)ps=Ir[--Or],Ir[Or]=null,ms=Ir[--Or],Ir[Or]=null;for(;e===cr;)cr=ut[--dt],ut[dt]=null,At=ut[--dt],ut[dt]=null,Lt=ut[--dt],ut[dt]=null}var at=null,lt=null,ke=!1,yt=null;function Fi(e,t){var r=ft(5,null,null,0);r.elementType="DELETED",r.stateNode=t,r.return=e,t=e.deletions,t===null?(e.deletions=[r],e.flags|=16):t.push(r)}function zi(e,t){switch(e.tag){case 5:var r=e.type;return t=t.nodeType!==1||r.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,at=e,lt=$t(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,at=e,lt=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(r=cr!==null?{id:Lt,overflow:At}:null,e.memoizedState={dehydrated:t,treeContext:r,retryLane:1073741824},r=ft(18,null,null,0),r.stateNode=t,r.return=e,e.child=r,at=e,lt=null,!0):!1;default:return!1}}function Xa(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Za(e){if(ke){var t=lt;if(t){var r=t;if(!zi(e,t)){if(Xa(e))throw Error(i(418));t=$t(r.nextSibling);var s=at;t&&zi(e,t)?Fi(s,r):(e.flags=e.flags&-4097|2,ke=!1,at=e)}}else{if(Xa(e))throw Error(i(418));e.flags=e.flags&-4097|2,ke=!1,at=e}}}function Bi(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;at=e}function hs(e){if(e!==at)return!1;if(!ke)return Bi(e),ke=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!Ha(e.type,e.memoizedProps)),t&&(t=lt)){if(Xa(e))throw Ui(),Error(i(418));for(;t;)Fi(e,t),t=$t(t.nextSibling)}if(Bi(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(i(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var r=e.data;if(r==="/$"){if(t===0){lt=$t(e.nextSibling);break e}t--}else r!=="$"&&r!=="$!"&&r!=="$?"||t++}e=e.nextSibling}lt=null}}else lt=at?$t(e.stateNode.nextSibling):null;return!0}function Ui(){for(var e=lt;e;)e=$t(e.nextSibling)}function Dr(){lt=at=null,ke=!1}function el(e){yt===null?yt=[e]:yt.push(e)}var Cp=K.ReactCurrentBatchConfig;function vn(e,t,r){if(e=r.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(r._owner){if(r=r._owner,r){if(r.tag!==1)throw Error(i(309));var s=r.stateNode}if(!s)throw Error(i(147,e));var a=s,o=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===o?t.ref:(t=function(u){var p=a.refs;u===null?delete p[o]:p[o]=u},t._stringRef=o,t)}if(typeof e!="string")throw Error(i(284));if(!r._owner)throw Error(i(290,e))}return e}function fs(e,t){throw e=Object.prototype.toString.call(t),Error(i(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Vi(e){var t=e._init;return t(e._payload)}function $i(e){function t(k,x){if(e){var N=k.deletions;N===null?(k.deletions=[x],k.flags|=16):N.push(x)}}function r(k,x){if(!e)return null;for(;x!==null;)t(k,x),x=x.sibling;return null}function s(k,x){for(k=new Map;x!==null;)x.key!==null?k.set(x.key,x):k.set(x.index,x),x=x.sibling;return k}function a(k,x){return k=er(k,x),k.index=0,k.sibling=null,k}function o(k,x,N){return k.index=N,e?(N=k.alternate,N!==null?(N=N.index,N<x?(k.flags|=2,x):N):(k.flags|=2,x)):(k.flags|=1048576,x)}function u(k){return e&&k.alternate===null&&(k.flags|=2),k}function p(k,x,N,B){return x===null||x.tag!==6?(x=ql(N,k.mode,B),x.return=k,x):(x=a(x,N),x.return=k,x)}function h(k,x,N,B){var Y=N.type;return Y===oe?D(k,x,N.props.children,B,N.key):x!==null&&(x.elementType===Y||typeof Y=="object"&&Y!==null&&Y.$$typeof===Re&&Vi(Y)===x.type)?(B=a(x,N.props),B.ref=vn(k,x,N),B.return=k,B):(B=zs(N.type,N.key,N.props,null,k.mode,B),B.ref=vn(k,x,N),B.return=k,B)}function T(k,x,N,B){return x===null||x.tag!==4||x.stateNode.containerInfo!==N.containerInfo||x.stateNode.implementation!==N.implementation?(x=Wl(N,k.mode,B),x.return=k,x):(x=a(x,N.children||[]),x.return=k,x)}function D(k,x,N,B,Y){return x===null||x.tag!==7?(x=yr(N,k.mode,B,Y),x.return=k,x):(x=a(x,N),x.return=k,x)}function F(k,x,N){if(typeof x=="string"&&x!==""||typeof x=="number")return x=ql(""+x,k.mode,N),x.return=k,x;if(typeof x=="object"&&x!==null){switch(x.$$typeof){case ee:return N=zs(x.type,x.key,x.props,null,k.mode,N),N.ref=vn(k,null,x),N.return=k,N;case ue:return x=Wl(x,k.mode,N),x.return=k,x;case Re:var B=x._init;return F(k,B(x._payload),N)}if(Gr(x)||Z(x))return x=yr(x,k.mode,N,null),x.return=k,x;fs(k,x)}return null}function P(k,x,N,B){var Y=x!==null?x.key:null;if(typeof N=="string"&&N!==""||typeof N=="number")return Y!==null?null:p(k,x,""+N,B);if(typeof N=="object"&&N!==null){switch(N.$$typeof){case ee:return N.key===Y?h(k,x,N,B):null;case ue:return N.key===Y?T(k,x,N,B):null;case Re:return Y=N._init,P(k,x,Y(N._payload),B)}if(Gr(N)||Z(N))return Y!==null?null:D(k,x,N,B,null);fs(k,N)}return null}function H(k,x,N,B,Y){if(typeof B=="string"&&B!==""||typeof B=="number")return k=k.get(N)||null,p(x,k,""+B,Y);if(typeof B=="object"&&B!==null){switch(B.$$typeof){case ee:return k=k.get(B.key===null?N:B.key)||null,h(x,k,B,Y);case ue:return k=k.get(B.key===null?N:B.key)||null,T(x,k,B,Y);case Re:var J=B._init;return H(k,x,N,J(B._payload),Y)}if(Gr(B)||Z(B))return k=k.get(N)||null,D(x,k,B,Y,null);fs(x,B)}return null}function W(k,x,N,B){for(var Y=null,J=null,X=x,te=x=0,ze=null;X!==null&&te<N.length;te++){X.index>te?(ze=X,X=null):ze=X.sibling;var de=P(k,X,N[te],B);if(de===null){X===null&&(X=ze);break}e&&X&&de.alternate===null&&t(k,X),x=o(de,x,te),J===null?Y=de:J.sibling=de,J=de,X=ze}if(te===N.length)return r(k,X),ke&&ur(k,te),Y;if(X===null){for(;te<N.length;te++)X=F(k,N[te],B),X!==null&&(x=o(X,x,te),J===null?Y=X:J.sibling=X,J=X);return ke&&ur(k,te),Y}for(X=s(k,X);te<N.length;te++)ze=H(X,k,te,N[te],B),ze!==null&&(e&&ze.alternate!==null&&X.delete(ze.key===null?te:ze.key),x=o(ze,x,te),J===null?Y=ze:J.sibling=ze,J=ze);return e&&X.forEach(function(tr){return t(k,tr)}),ke&&ur(k,te),Y}function G(k,x,N,B){var Y=Z(N);if(typeof Y!="function")throw Error(i(150));if(N=Y.call(N),N==null)throw Error(i(151));for(var J=Y=null,X=x,te=x=0,ze=null,de=N.next();X!==null&&!de.done;te++,de=N.next()){X.index>te?(ze=X,X=null):ze=X.sibling;var tr=P(k,X,de.value,B);if(tr===null){X===null&&(X=ze);break}e&&X&&tr.alternate===null&&t(k,X),x=o(tr,x,te),J===null?Y=tr:J.sibling=tr,J=tr,X=ze}if(de.done)return r(k,X),ke&&ur(k,te),Y;if(X===null){for(;!de.done;te++,de=N.next())de=F(k,de.value,B),de!==null&&(x=o(de,x,te),J===null?Y=de:J.sibling=de,J=de);return ke&&ur(k,te),Y}for(X=s(k,X);!de.done;te++,de=N.next())de=H(X,k,te,de.value,B),de!==null&&(e&&de.alternate!==null&&X.delete(de.key===null?te:de.key),x=o(de,x,te),J===null?Y=de:J.sibling=de,J=de);return e&&X.forEach(function(lm){return t(k,lm)}),ke&&ur(k,te),Y}function Le(k,x,N,B){if(typeof N=="object"&&N!==null&&N.type===oe&&N.key===null&&(N=N.props.children),typeof N=="object"&&N!==null){switch(N.$$typeof){case ee:e:{for(var Y=N.key,J=x;J!==null;){if(J.key===Y){if(Y=N.type,Y===oe){if(J.tag===7){r(k,J.sibling),x=a(J,N.props.children),x.return=k,k=x;break e}}else if(J.elementType===Y||typeof Y=="object"&&Y!==null&&Y.$$typeof===Re&&Vi(Y)===J.type){r(k,J.sibling),x=a(J,N.props),x.ref=vn(k,J,N),x.return=k,k=x;break e}r(k,J);break}else t(k,J);J=J.sibling}N.type===oe?(x=yr(N.props.children,k.mode,B,N.key),x.return=k,k=x):(B=zs(N.type,N.key,N.props,null,k.mode,B),B.ref=vn(k,x,N),B.return=k,k=B)}return u(k);case ue:e:{for(J=N.key;x!==null;){if(x.key===J)if(x.tag===4&&x.stateNode.containerInfo===N.containerInfo&&x.stateNode.implementation===N.implementation){r(k,x.sibling),x=a(x,N.children||[]),x.return=k,k=x;break e}else{r(k,x);break}else t(k,x);x=x.sibling}x=Wl(N,k.mode,B),x.return=k,k=x}return u(k);case Re:return J=N._init,Le(k,x,J(N._payload),B)}if(Gr(N))return W(k,x,N,B);if(Z(N))return G(k,x,N,B);fs(k,N)}return typeof N=="string"&&N!==""||typeof N=="number"?(N=""+N,x!==null&&x.tag===6?(r(k,x.sibling),x=a(x,N),x.return=k,k=x):(r(k,x),x=ql(N,k.mode,B),x.return=k,k=x),u(k)):r(k,x)}return Le}var Mr=$i(!0),Hi=$i(!1),xs=Ht(null),gs=null,Fr=null,tl=null;function rl(){tl=Fr=gs=null}function nl(e){var t=xs.current;we(xs),e._currentValue=t}function sl(e,t,r){for(;e!==null;){var s=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,s!==null&&(s.childLanes|=t)):s!==null&&(s.childLanes&t)!==t&&(s.childLanes|=t),e===r)break;e=e.return}}function zr(e,t){gs=e,tl=Fr=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(Ze=!0),e.firstContext=null)}function pt(e){var t=e._currentValue;if(tl!==e)if(e={context:e,memoizedValue:t,next:null},Fr===null){if(gs===null)throw Error(i(308));Fr=e,gs.dependencies={lanes:0,firstContext:e}}else Fr=Fr.next=e;return t}var dr=null;function al(e){dr===null?dr=[e]:dr.push(e)}function qi(e,t,r,s){var a=t.interleaved;return a===null?(r.next=r,al(t)):(r.next=a.next,a.next=r),t.interleaved=r,Pt(e,s)}function Pt(e,t){e.lanes|=t;var r=e.alternate;for(r!==null&&(r.lanes|=t),r=e,e=e.return;e!==null;)e.childLanes|=t,r=e.alternate,r!==null&&(r.childLanes|=t),r=e,e=e.return;return r.tag===3?r.stateNode:null}var Gt=!1;function ll(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Wi(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function It(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function Qt(e,t,r){var s=e.updateQueue;if(s===null)return null;if(s=s.shared,(ce&2)!==0){var a=s.pending;return a===null?t.next=t:(t.next=a.next,a.next=t),s.pending=t,Pt(e,r)}return a=s.interleaved,a===null?(t.next=t,al(s)):(t.next=a.next,a.next=t),s.interleaved=t,Pt(e,r)}function ys(e,t,r){if(t=t.updateQueue,t!==null&&(t=t.shared,(r&4194240)!==0)){var s=t.lanes;s&=e.pendingLanes,r|=s,t.lanes=r,ba(e,r)}}function Gi(e,t){var r=e.updateQueue,s=e.alternate;if(s!==null&&(s=s.updateQueue,r===s)){var a=null,o=null;if(r=r.firstBaseUpdate,r!==null){do{var u={eventTime:r.eventTime,lane:r.lane,tag:r.tag,payload:r.payload,callback:r.callback,next:null};o===null?a=o=u:o=o.next=u,r=r.next}while(r!==null);o===null?a=o=t:o=o.next=t}else a=o=t;r={baseState:s.baseState,firstBaseUpdate:a,lastBaseUpdate:o,shared:s.shared,effects:s.effects},e.updateQueue=r;return}e=r.lastBaseUpdate,e===null?r.firstBaseUpdate=t:e.next=t,r.lastBaseUpdate=t}function vs(e,t,r,s){var a=e.updateQueue;Gt=!1;var o=a.firstBaseUpdate,u=a.lastBaseUpdate,p=a.shared.pending;if(p!==null){a.shared.pending=null;var h=p,T=h.next;h.next=null,u===null?o=T:u.next=T,u=h;var D=e.alternate;D!==null&&(D=D.updateQueue,p=D.lastBaseUpdate,p!==u&&(p===null?D.firstBaseUpdate=T:p.next=T,D.lastBaseUpdate=h))}if(o!==null){var F=a.baseState;u=0,D=T=h=null,p=o;do{var P=p.lane,H=p.eventTime;if((s&P)===P){D!==null&&(D=D.next={eventTime:H,lane:0,tag:p.tag,payload:p.payload,callback:p.callback,next:null});e:{var W=e,G=p;switch(P=t,H=r,G.tag){case 1:if(W=G.payload,typeof W=="function"){F=W.call(H,F,P);break e}F=W;break e;case 3:W.flags=W.flags&-65537|128;case 0:if(W=G.payload,P=typeof W=="function"?W.call(H,F,P):W,P==null)break e;F=$({},F,P);break e;case 2:Gt=!0}}p.callback!==null&&p.lane!==0&&(e.flags|=64,P=a.effects,P===null?a.effects=[p]:P.push(p))}else H={eventTime:H,lane:P,tag:p.tag,payload:p.payload,callback:p.callback,next:null},D===null?(T=D=H,h=F):D=D.next=H,u|=P;if(p=p.next,p===null){if(p=a.shared.pending,p===null)break;P=p,p=P.next,P.next=null,a.lastBaseUpdate=P,a.shared.pending=null}}while(!0);if(D===null&&(h=F),a.baseState=h,a.firstBaseUpdate=T,a.lastBaseUpdate=D,t=a.shared.interleaved,t!==null){a=t;do u|=a.lane,a=a.next;while(a!==t)}else o===null&&(a.shared.lanes=0);hr|=u,e.lanes=u,e.memoizedState=F}}function Qi(e,t,r){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var s=e[t],a=s.callback;if(a!==null){if(s.callback=null,s=r,typeof a!="function")throw Error(i(191,a));a.call(s)}}}var bn={},St=Ht(bn),wn=Ht(bn),kn=Ht(bn);function pr(e){if(e===bn)throw Error(i(174));return e}function ol(e,t){switch(ve(kn,t),ve(wn,e),ve(St,bn),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:ia(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=ia(t,e)}we(St),ve(St,t)}function Br(){we(St),we(wn),we(kn)}function Ki(e){pr(kn.current);var t=pr(St.current),r=ia(t,e.type);t!==r&&(ve(wn,e),ve(St,r))}function il(e){wn.current===e&&(we(St),we(wn))}var Ne=Ht(0);function bs(e){for(var t=e;t!==null;){if(t.tag===13){var r=t.memoizedState;if(r!==null&&(r=r.dehydrated,r===null||r.data==="$?"||r.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var cl=[];function ul(){for(var e=0;e<cl.length;e++)cl[e]._workInProgressVersionPrimary=null;cl.length=0}var ws=K.ReactCurrentDispatcher,dl=K.ReactCurrentBatchConfig,mr=0,Se=null,Ie=null,Me=null,ks=!1,jn=!1,Nn=0,Tp=0;function qe(){throw Error(i(321))}function pl(e,t){if(t===null)return!1;for(var r=0;r<t.length&&r<e.length;r++)if(!gt(e[r],t[r]))return!1;return!0}function ml(e,t,r,s,a,o){if(mr=o,Se=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,ws.current=e===null||e.memoizedState===null?Ap:Pp,e=r(s,a),jn){o=0;do{if(jn=!1,Nn=0,25<=o)throw Error(i(301));o+=1,Me=Ie=null,t.updateQueue=null,ws.current=Ip,e=r(s,a)}while(jn)}if(ws.current=Ss,t=Ie!==null&&Ie.next!==null,mr=0,Me=Ie=Se=null,ks=!1,t)throw Error(i(300));return e}function hl(){var e=Nn!==0;return Nn=0,e}function Et(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Me===null?Se.memoizedState=Me=e:Me=Me.next=e,Me}function mt(){if(Ie===null){var e=Se.alternate;e=e!==null?e.memoizedState:null}else e=Ie.next;var t=Me===null?Se.memoizedState:Me.next;if(t!==null)Me=t,Ie=e;else{if(e===null)throw Error(i(310));Ie=e,e={memoizedState:Ie.memoizedState,baseState:Ie.baseState,baseQueue:Ie.baseQueue,queue:Ie.queue,next:null},Me===null?Se.memoizedState=Me=e:Me=Me.next=e}return Me}function Sn(e,t){return typeof t=="function"?t(e):t}function fl(e){var t=mt(),r=t.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=e;var s=Ie,a=s.baseQueue,o=r.pending;if(o!==null){if(a!==null){var u=a.next;a.next=o.next,o.next=u}s.baseQueue=a=o,r.pending=null}if(a!==null){o=a.next,s=s.baseState;var p=u=null,h=null,T=o;do{var D=T.lane;if((mr&D)===D)h!==null&&(h=h.next={lane:0,action:T.action,hasEagerState:T.hasEagerState,eagerState:T.eagerState,next:null}),s=T.hasEagerState?T.eagerState:e(s,T.action);else{var F={lane:D,action:T.action,hasEagerState:T.hasEagerState,eagerState:T.eagerState,next:null};h===null?(p=h=F,u=s):h=h.next=F,Se.lanes|=D,hr|=D}T=T.next}while(T!==null&&T!==o);h===null?u=s:h.next=p,gt(s,t.memoizedState)||(Ze=!0),t.memoizedState=s,t.baseState=u,t.baseQueue=h,r.lastRenderedState=s}if(e=r.interleaved,e!==null){a=e;do o=a.lane,Se.lanes|=o,hr|=o,a=a.next;while(a!==e)}else a===null&&(r.lanes=0);return[t.memoizedState,r.dispatch]}function xl(e){var t=mt(),r=t.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=e;var s=r.dispatch,a=r.pending,o=t.memoizedState;if(a!==null){r.pending=null;var u=a=a.next;do o=e(o,u.action),u=u.next;while(u!==a);gt(o,t.memoizedState)||(Ze=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),r.lastRenderedState=o}return[o,s]}function Yi(){}function Ji(e,t){var r=Se,s=mt(),a=t(),o=!gt(s.memoizedState,a);if(o&&(s.memoizedState=a,Ze=!0),s=s.queue,gl(ec.bind(null,r,s,e),[e]),s.getSnapshot!==t||o||Me!==null&&Me.memoizedState.tag&1){if(r.flags|=2048,En(9,Zi.bind(null,r,s,a,t),void 0,null),Fe===null)throw Error(i(349));(mr&30)!==0||Xi(r,t,a)}return a}function Xi(e,t,r){e.flags|=16384,e={getSnapshot:t,value:r},t=Se.updateQueue,t===null?(t={lastEffect:null,stores:null},Se.updateQueue=t,t.stores=[e]):(r=t.stores,r===null?t.stores=[e]:r.push(e))}function Zi(e,t,r,s){t.value=r,t.getSnapshot=s,tc(t)&&rc(e)}function ec(e,t,r){return r(function(){tc(t)&&rc(e)})}function tc(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!gt(e,r)}catch{return!0}}function rc(e){var t=Pt(e,1);t!==null&&kt(t,e,1,-1)}function nc(e){var t=Et();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Sn,lastRenderedState:e},t.queue=e,e=e.dispatch=Lp.bind(null,Se,e),[t.memoizedState,e]}function En(e,t,r,s){return e={tag:e,create:t,destroy:r,deps:s,next:null},t=Se.updateQueue,t===null?(t={lastEffect:null,stores:null},Se.updateQueue=t,t.lastEffect=e.next=e):(r=t.lastEffect,r===null?t.lastEffect=e.next=e:(s=r.next,r.next=e,e.next=s,t.lastEffect=e)),e}function sc(){return mt().memoizedState}function js(e,t,r,s){var a=Et();Se.flags|=e,a.memoizedState=En(1|t,r,void 0,s===void 0?null:s)}function Ns(e,t,r,s){var a=mt();s=s===void 0?null:s;var o=void 0;if(Ie!==null){var u=Ie.memoizedState;if(o=u.destroy,s!==null&&pl(s,u.deps)){a.memoizedState=En(t,r,o,s);return}}Se.flags|=e,a.memoizedState=En(1|t,r,o,s)}function ac(e,t){return js(8390656,8,e,t)}function gl(e,t){return Ns(2048,8,e,t)}function lc(e,t){return Ns(4,2,e,t)}function oc(e,t){return Ns(4,4,e,t)}function ic(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function cc(e,t,r){return r=r!=null?r.concat([e]):null,Ns(4,4,ic.bind(null,t,e),r)}function yl(){}function uc(e,t){var r=mt();t=t===void 0?null:t;var s=r.memoizedState;return s!==null&&t!==null&&pl(t,s[1])?s[0]:(r.memoizedState=[e,t],e)}function dc(e,t){var r=mt();t=t===void 0?null:t;var s=r.memoizedState;return s!==null&&t!==null&&pl(t,s[1])?s[0]:(e=e(),r.memoizedState=[e,t],e)}function pc(e,t,r){return(mr&21)===0?(e.baseState&&(e.baseState=!1,Ze=!0),e.memoizedState=r):(gt(r,t)||(r=Vo(),Se.lanes|=r,hr|=r,e.baseState=!0),t)}function Rp(e,t){var r=he;he=r!==0&&4>r?r:4,e(!0);var s=dl.transition;dl.transition={};try{e(!1),t()}finally{he=r,dl.transition=s}}function mc(){return mt().memoizedState}function _p(e,t,r){var s=Xt(e);if(r={lane:s,action:r,hasEagerState:!1,eagerState:null,next:null},hc(e))fc(t,r);else if(r=qi(e,t,r,s),r!==null){var a=Ke();kt(r,e,s,a),xc(r,t,s)}}function Lp(e,t,r){var s=Xt(e),a={lane:s,action:r,hasEagerState:!1,eagerState:null,next:null};if(hc(e))fc(t,a);else{var o=e.alternate;if(e.lanes===0&&(o===null||o.lanes===0)&&(o=t.lastRenderedReducer,o!==null))try{var u=t.lastRenderedState,p=o(u,r);if(a.hasEagerState=!0,a.eagerState=p,gt(p,u)){var h=t.interleaved;h===null?(a.next=a,al(t)):(a.next=h.next,h.next=a),t.interleaved=a;return}}catch{}finally{}r=qi(e,t,a,s),r!==null&&(a=Ke(),kt(r,e,s,a),xc(r,t,s))}}function hc(e){var t=e.alternate;return e===Se||t!==null&&t===Se}function fc(e,t){jn=ks=!0;var r=e.pending;r===null?t.next=t:(t.next=r.next,r.next=t),e.pending=t}function xc(e,t,r){if((r&4194240)!==0){var s=t.lanes;s&=e.pendingLanes,r|=s,t.lanes=r,ba(e,r)}}var Ss={readContext:pt,useCallback:qe,useContext:qe,useEffect:qe,useImperativeHandle:qe,useInsertionEffect:qe,useLayoutEffect:qe,useMemo:qe,useReducer:qe,useRef:qe,useState:qe,useDebugValue:qe,useDeferredValue:qe,useTransition:qe,useMutableSource:qe,useSyncExternalStore:qe,useId:qe,unstable_isNewReconciler:!1},Ap={readContext:pt,useCallback:function(e,t){return Et().memoizedState=[e,t===void 0?null:t],e},useContext:pt,useEffect:ac,useImperativeHandle:function(e,t,r){return r=r!=null?r.concat([e]):null,js(4194308,4,ic.bind(null,t,e),r)},useLayoutEffect:function(e,t){return js(4194308,4,e,t)},useInsertionEffect:function(e,t){return js(4,2,e,t)},useMemo:function(e,t){var r=Et();return t=t===void 0?null:t,e=e(),r.memoizedState=[e,t],e},useReducer:function(e,t,r){var s=Et();return t=r!==void 0?r(t):t,s.memoizedState=s.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},s.queue=e,e=e.dispatch=_p.bind(null,Se,e),[s.memoizedState,e]},useRef:function(e){var t=Et();return e={current:e},t.memoizedState=e},useState:nc,useDebugValue:yl,useDeferredValue:function(e){return Et().memoizedState=e},useTransition:function(){var e=nc(!1),t=e[0];return e=Rp.bind(null,e[1]),Et().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,r){var s=Se,a=Et();if(ke){if(r===void 0)throw Error(i(407));r=r()}else{if(r=t(),Fe===null)throw Error(i(349));(mr&30)!==0||Xi(s,t,r)}a.memoizedState=r;var o={value:r,getSnapshot:t};return a.queue=o,ac(ec.bind(null,s,o,e),[e]),s.flags|=2048,En(9,Zi.bind(null,s,o,r,t),void 0,null),r},useId:function(){var e=Et(),t=Fe.identifierPrefix;if(ke){var r=At,s=Lt;r=(s&~(1<<32-xt(s)-1)).toString(32)+r,t=":"+t+"R"+r,r=Nn++,0<r&&(t+="H"+r.toString(32)),t+=":"}else r=Tp++,t=":"+t+"r"+r.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Pp={readContext:pt,useCallback:uc,useContext:pt,useEffect:gl,useImperativeHandle:cc,useInsertionEffect:lc,useLayoutEffect:oc,useMemo:dc,useReducer:fl,useRef:sc,useState:function(){return fl(Sn)},useDebugValue:yl,useDeferredValue:function(e){var t=mt();return pc(t,Ie.memoizedState,e)},useTransition:function(){var e=fl(Sn)[0],t=mt().memoizedState;return[e,t]},useMutableSource:Yi,useSyncExternalStore:Ji,useId:mc,unstable_isNewReconciler:!1},Ip={readContext:pt,useCallback:uc,useContext:pt,useEffect:gl,useImperativeHandle:cc,useInsertionEffect:lc,useLayoutEffect:oc,useMemo:dc,useReducer:xl,useRef:sc,useState:function(){return xl(Sn)},useDebugValue:yl,useDeferredValue:function(e){var t=mt();return Ie===null?t.memoizedState=e:pc(t,Ie.memoizedState,e)},useTransition:function(){var e=xl(Sn)[0],t=mt().memoizedState;return[e,t]},useMutableSource:Yi,useSyncExternalStore:Ji,useId:mc,unstable_isNewReconciler:!1};function vt(e,t){if(e&&e.defaultProps){t=$({},t),e=e.defaultProps;for(var r in e)t[r]===void 0&&(t[r]=e[r]);return t}return t}function vl(e,t,r,s){t=e.memoizedState,r=r(s,t),r=r==null?t:$({},t,r),e.memoizedState=r,e.lanes===0&&(e.updateQueue.baseState=r)}var Es={isMounted:function(e){return(e=e._reactInternals)?lr(e)===e:!1},enqueueSetState:function(e,t,r){e=e._reactInternals;var s=Ke(),a=Xt(e),o=It(s,a);o.payload=t,r!=null&&(o.callback=r),t=Qt(e,o,a),t!==null&&(kt(t,e,a,s),ys(t,e,a))},enqueueReplaceState:function(e,t,r){e=e._reactInternals;var s=Ke(),a=Xt(e),o=It(s,a);o.tag=1,o.payload=t,r!=null&&(o.callback=r),t=Qt(e,o,a),t!==null&&(kt(t,e,a,s),ys(t,e,a))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var r=Ke(),s=Xt(e),a=It(r,s);a.tag=2,t!=null&&(a.callback=t),t=Qt(e,a,s),t!==null&&(kt(t,e,s,r),ys(t,e,s))}};function gc(e,t,r,s,a,o,u){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(s,o,u):t.prototype&&t.prototype.isPureReactComponent?!pn(r,s)||!pn(a,o):!0}function yc(e,t,r){var s=!1,a=qt,o=t.contextType;return typeof o=="object"&&o!==null?o=pt(o):(a=Xe(t)?ir:He.current,s=t.contextTypes,o=(s=s!=null)?Pr(e,a):qt),t=new t(r,o),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Es,e.stateNode=t,t._reactInternals=e,s&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=a,e.__reactInternalMemoizedMaskedChildContext=o),t}function vc(e,t,r,s){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(r,s),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(r,s),t.state!==e&&Es.enqueueReplaceState(t,t.state,null)}function bl(e,t,r,s){var a=e.stateNode;a.props=r,a.state=e.memoizedState,a.refs={},ll(e);var o=t.contextType;typeof o=="object"&&o!==null?a.context=pt(o):(o=Xe(t)?ir:He.current,a.context=Pr(e,o)),a.state=e.memoizedState,o=t.getDerivedStateFromProps,typeof o=="function"&&(vl(e,t,o,r),a.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(t=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),t!==a.state&&Es.enqueueReplaceState(a,a.state,null),vs(e,r,a,s),a.state=e.memoizedState),typeof a.componentDidMount=="function"&&(e.flags|=4194308)}function Ur(e,t){try{var r="",s=t;do r+=ie(s),s=s.return;while(s);var a=r}catch(o){a=`
Error generating stack: `+o.message+`
`+o.stack}return{value:e,source:t,stack:a,digest:null}}function wl(e,t,r){return{value:e,source:null,stack:r??null,digest:t??null}}function kl(e,t){try{console.error(t.value)}catch(r){setTimeout(function(){throw r})}}var Op=typeof WeakMap=="function"?WeakMap:Map;function bc(e,t,r){r=It(-1,r),r.tag=3,r.payload={element:null};var s=t.value;return r.callback=function(){Ps||(Ps=!0,Ml=s),kl(e,t)},r}function wc(e,t,r){r=It(-1,r),r.tag=3;var s=e.type.getDerivedStateFromError;if(typeof s=="function"){var a=t.value;r.payload=function(){return s(a)},r.callback=function(){kl(e,t)}}var o=e.stateNode;return o!==null&&typeof o.componentDidCatch=="function"&&(r.callback=function(){kl(e,t),typeof s!="function"&&(Yt===null?Yt=new Set([this]):Yt.add(this));var u=t.stack;this.componentDidCatch(t.value,{componentStack:u!==null?u:""})}),r}function kc(e,t,r){var s=e.pingCache;if(s===null){s=e.pingCache=new Op;var a=new Set;s.set(t,a)}else a=s.get(t),a===void 0&&(a=new Set,s.set(t,a));a.has(r)||(a.add(r),e=Kp.bind(null,e,t,r),t.then(e,e))}function jc(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function Nc(e,t,r,s,a){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,r.flags|=131072,r.flags&=-52805,r.tag===1&&(r.alternate===null?r.tag=17:(t=It(-1,1),t.tag=2,Qt(r,t,1))),r.lanes|=1),e):(e.flags|=65536,e.lanes=a,e)}var Dp=K.ReactCurrentOwner,Ze=!1;function Qe(e,t,r,s){t.child=e===null?Hi(t,null,r,s):Mr(t,e.child,r,s)}function Sc(e,t,r,s,a){r=r.render;var o=t.ref;return zr(t,a),s=ml(e,t,r,s,o,a),r=hl(),e!==null&&!Ze?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a,Ot(e,t,a)):(ke&&r&&Ya(t),t.flags|=1,Qe(e,t,s,a),t.child)}function Ec(e,t,r,s,a){if(e===null){var o=r.type;return typeof o=="function"&&!Hl(o)&&o.defaultProps===void 0&&r.compare===null&&r.defaultProps===void 0?(t.tag=15,t.type=o,Cc(e,t,o,s,a)):(e=zs(r.type,null,s,t,t.mode,a),e.ref=t.ref,e.return=t,t.child=e)}if(o=e.child,(e.lanes&a)===0){var u=o.memoizedProps;if(r=r.compare,r=r!==null?r:pn,r(u,s)&&e.ref===t.ref)return Ot(e,t,a)}return t.flags|=1,e=er(o,s),e.ref=t.ref,e.return=t,t.child=e}function Cc(e,t,r,s,a){if(e!==null){var o=e.memoizedProps;if(pn(o,s)&&e.ref===t.ref)if(Ze=!1,t.pendingProps=s=o,(e.lanes&a)!==0)(e.flags&131072)!==0&&(Ze=!0);else return t.lanes=e.lanes,Ot(e,t,a)}return jl(e,t,r,s,a)}function Tc(e,t,r){var s=t.pendingProps,a=s.children,o=e!==null?e.memoizedState:null;if(s.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},ve($r,ot),ot|=r;else{if((r&1073741824)===0)return e=o!==null?o.baseLanes|r:r,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,ve($r,ot),ot|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},s=o!==null?o.baseLanes:r,ve($r,ot),ot|=s}else o!==null?(s=o.baseLanes|r,t.memoizedState=null):s=r,ve($r,ot),ot|=s;return Qe(e,t,a,r),t.child}function Rc(e,t){var r=t.ref;(e===null&&r!==null||e!==null&&e.ref!==r)&&(t.flags|=512,t.flags|=2097152)}function jl(e,t,r,s,a){var o=Xe(r)?ir:He.current;return o=Pr(t,o),zr(t,a),r=ml(e,t,r,s,o,a),s=hl(),e!==null&&!Ze?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a,Ot(e,t,a)):(ke&&s&&Ya(t),t.flags|=1,Qe(e,t,r,a),t.child)}function _c(e,t,r,s,a){if(Xe(r)){var o=!0;us(t)}else o=!1;if(zr(t,a),t.stateNode===null)Ts(e,t),yc(t,r,s),bl(t,r,s,a),s=!0;else if(e===null){var u=t.stateNode,p=t.memoizedProps;u.props=p;var h=u.context,T=r.contextType;typeof T=="object"&&T!==null?T=pt(T):(T=Xe(r)?ir:He.current,T=Pr(t,T));var D=r.getDerivedStateFromProps,F=typeof D=="function"||typeof u.getSnapshotBeforeUpdate=="function";F||typeof u.UNSAFE_componentWillReceiveProps!="function"&&typeof u.componentWillReceiveProps!="function"||(p!==s||h!==T)&&vc(t,u,s,T),Gt=!1;var P=t.memoizedState;u.state=P,vs(t,s,u,a),h=t.memoizedState,p!==s||P!==h||Je.current||Gt?(typeof D=="function"&&(vl(t,r,D,s),h=t.memoizedState),(p=Gt||gc(t,r,p,s,P,h,T))?(F||typeof u.UNSAFE_componentWillMount!="function"&&typeof u.componentWillMount!="function"||(typeof u.componentWillMount=="function"&&u.componentWillMount(),typeof u.UNSAFE_componentWillMount=="function"&&u.UNSAFE_componentWillMount()),typeof u.componentDidMount=="function"&&(t.flags|=4194308)):(typeof u.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=s,t.memoizedState=h),u.props=s,u.state=h,u.context=T,s=p):(typeof u.componentDidMount=="function"&&(t.flags|=4194308),s=!1)}else{u=t.stateNode,Wi(e,t),p=t.memoizedProps,T=t.type===t.elementType?p:vt(t.type,p),u.props=T,F=t.pendingProps,P=u.context,h=r.contextType,typeof h=="object"&&h!==null?h=pt(h):(h=Xe(r)?ir:He.current,h=Pr(t,h));var H=r.getDerivedStateFromProps;(D=typeof H=="function"||typeof u.getSnapshotBeforeUpdate=="function")||typeof u.UNSAFE_componentWillReceiveProps!="function"&&typeof u.componentWillReceiveProps!="function"||(p!==F||P!==h)&&vc(t,u,s,h),Gt=!1,P=t.memoizedState,u.state=P,vs(t,s,u,a);var W=t.memoizedState;p!==F||P!==W||Je.current||Gt?(typeof H=="function"&&(vl(t,r,H,s),W=t.memoizedState),(T=Gt||gc(t,r,T,s,P,W,h)||!1)?(D||typeof u.UNSAFE_componentWillUpdate!="function"&&typeof u.componentWillUpdate!="function"||(typeof u.componentWillUpdate=="function"&&u.componentWillUpdate(s,W,h),typeof u.UNSAFE_componentWillUpdate=="function"&&u.UNSAFE_componentWillUpdate(s,W,h)),typeof u.componentDidUpdate=="function"&&(t.flags|=4),typeof u.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof u.componentDidUpdate!="function"||p===e.memoizedProps&&P===e.memoizedState||(t.flags|=4),typeof u.getSnapshotBeforeUpdate!="function"||p===e.memoizedProps&&P===e.memoizedState||(t.flags|=1024),t.memoizedProps=s,t.memoizedState=W),u.props=s,u.state=W,u.context=h,s=T):(typeof u.componentDidUpdate!="function"||p===e.memoizedProps&&P===e.memoizedState||(t.flags|=4),typeof u.getSnapshotBeforeUpdate!="function"||p===e.memoizedProps&&P===e.memoizedState||(t.flags|=1024),s=!1)}return Nl(e,t,r,s,o,a)}function Nl(e,t,r,s,a,o){Rc(e,t);var u=(t.flags&128)!==0;if(!s&&!u)return a&&Oi(t,r,!1),Ot(e,t,o);s=t.stateNode,Dp.current=t;var p=u&&typeof r.getDerivedStateFromError!="function"?null:s.render();return t.flags|=1,e!==null&&u?(t.child=Mr(t,e.child,null,o),t.child=Mr(t,null,p,o)):Qe(e,t,p,o),t.memoizedState=s.state,a&&Oi(t,r,!0),t.child}function Lc(e){var t=e.stateNode;t.pendingContext?Pi(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Pi(e,t.context,!1),ol(e,t.containerInfo)}function Ac(e,t,r,s,a){return Dr(),el(a),t.flags|=256,Qe(e,t,r,s),t.child}var Sl={dehydrated:null,treeContext:null,retryLane:0};function El(e){return{baseLanes:e,cachePool:null,transitions:null}}function Pc(e,t,r){var s=t.pendingProps,a=Ne.current,o=!1,u=(t.flags&128)!==0,p;if((p=u)||(p=e!==null&&e.memoizedState===null?!1:(a&2)!==0),p?(o=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(a|=1),ve(Ne,a&1),e===null)return Za(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(u=s.children,e=s.fallback,o?(s=t.mode,o=t.child,u={mode:"hidden",children:u},(s&1)===0&&o!==null?(o.childLanes=0,o.pendingProps=u):o=Bs(u,s,0,null),e=yr(e,s,r,null),o.return=t,e.return=t,o.sibling=e,t.child=o,t.child.memoizedState=El(r),t.memoizedState=Sl,e):Cl(t,u));if(a=e.memoizedState,a!==null&&(p=a.dehydrated,p!==null))return Mp(e,t,u,s,p,a,r);if(o){o=s.fallback,u=t.mode,a=e.child,p=a.sibling;var h={mode:"hidden",children:s.children};return(u&1)===0&&t.child!==a?(s=t.child,s.childLanes=0,s.pendingProps=h,t.deletions=null):(s=er(a,h),s.subtreeFlags=a.subtreeFlags&14680064),p!==null?o=er(p,o):(o=yr(o,u,r,null),o.flags|=2),o.return=t,s.return=t,s.sibling=o,t.child=s,s=o,o=t.child,u=e.child.memoizedState,u=u===null?El(r):{baseLanes:u.baseLanes|r,cachePool:null,transitions:u.transitions},o.memoizedState=u,o.childLanes=e.childLanes&~r,t.memoizedState=Sl,s}return o=e.child,e=o.sibling,s=er(o,{mode:"visible",children:s.children}),(t.mode&1)===0&&(s.lanes=r),s.return=t,s.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=s,t.memoizedState=null,s}function Cl(e,t){return t=Bs({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Cs(e,t,r,s){return s!==null&&el(s),Mr(t,e.child,null,r),e=Cl(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Mp(e,t,r,s,a,o,u){if(r)return t.flags&256?(t.flags&=-257,s=wl(Error(i(422))),Cs(e,t,u,s)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(o=s.fallback,a=t.mode,s=Bs({mode:"visible",children:s.children},a,0,null),o=yr(o,a,u,null),o.flags|=2,s.return=t,o.return=t,s.sibling=o,t.child=s,(t.mode&1)!==0&&Mr(t,e.child,null,u),t.child.memoizedState=El(u),t.memoizedState=Sl,o);if((t.mode&1)===0)return Cs(e,t,u,null);if(a.data==="$!"){if(s=a.nextSibling&&a.nextSibling.dataset,s)var p=s.dgst;return s=p,o=Error(i(419)),s=wl(o,s,void 0),Cs(e,t,u,s)}if(p=(u&e.childLanes)!==0,Ze||p){if(s=Fe,s!==null){switch(u&-u){case 4:a=2;break;case 16:a=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:a=32;break;case 536870912:a=268435456;break;default:a=0}a=(a&(s.suspendedLanes|u))!==0?0:a,a!==0&&a!==o.retryLane&&(o.retryLane=a,Pt(e,a),kt(s,e,a,-1))}return $l(),s=wl(Error(i(421))),Cs(e,t,u,s)}return a.data==="$?"?(t.flags|=128,t.child=e.child,t=Yp.bind(null,e),a._reactRetry=t,null):(e=o.treeContext,lt=$t(a.nextSibling),at=t,ke=!0,yt=null,e!==null&&(ut[dt++]=Lt,ut[dt++]=At,ut[dt++]=cr,Lt=e.id,At=e.overflow,cr=t),t=Cl(t,s.children),t.flags|=4096,t)}function Ic(e,t,r){e.lanes|=t;var s=e.alternate;s!==null&&(s.lanes|=t),sl(e.return,t,r)}function Tl(e,t,r,s,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:s,tail:r,tailMode:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=s,o.tail=r,o.tailMode=a)}function Oc(e,t,r){var s=t.pendingProps,a=s.revealOrder,o=s.tail;if(Qe(e,t,s.children,r),s=Ne.current,(s&2)!==0)s=s&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Ic(e,r,t);else if(e.tag===19)Ic(e,r,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}s&=1}if(ve(Ne,s),(t.mode&1)===0)t.memoizedState=null;else switch(a){case"forwards":for(r=t.child,a=null;r!==null;)e=r.alternate,e!==null&&bs(e)===null&&(a=r),r=r.sibling;r=a,r===null?(a=t.child,t.child=null):(a=r.sibling,r.sibling=null),Tl(t,!1,a,r,o);break;case"backwards":for(r=null,a=t.child,t.child=null;a!==null;){if(e=a.alternate,e!==null&&bs(e)===null){t.child=a;break}e=a.sibling,a.sibling=r,r=a,a=e}Tl(t,!0,r,null,o);break;case"together":Tl(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Ts(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Ot(e,t,r){if(e!==null&&(t.dependencies=e.dependencies),hr|=t.lanes,(r&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,r=er(e,e.pendingProps),t.child=r,r.return=t;e.sibling!==null;)e=e.sibling,r=r.sibling=er(e,e.pendingProps),r.return=t;r.sibling=null}return t.child}function Fp(e,t,r){switch(t.tag){case 3:Lc(t),Dr();break;case 5:Ki(t);break;case 1:Xe(t.type)&&us(t);break;case 4:ol(t,t.stateNode.containerInfo);break;case 10:var s=t.type._context,a=t.memoizedProps.value;ve(xs,s._currentValue),s._currentValue=a;break;case 13:if(s=t.memoizedState,s!==null)return s.dehydrated!==null?(ve(Ne,Ne.current&1),t.flags|=128,null):(r&t.child.childLanes)!==0?Pc(e,t,r):(ve(Ne,Ne.current&1),e=Ot(e,t,r),e!==null?e.sibling:null);ve(Ne,Ne.current&1);break;case 19:if(s=(r&t.childLanes)!==0,(e.flags&128)!==0){if(s)return Oc(e,t,r);t.flags|=128}if(a=t.memoizedState,a!==null&&(a.rendering=null,a.tail=null,a.lastEffect=null),ve(Ne,Ne.current),s)break;return null;case 22:case 23:return t.lanes=0,Tc(e,t,r)}return Ot(e,t,r)}var Dc,Rl,Mc,Fc;Dc=function(e,t){for(var r=t.child;r!==null;){if(r.tag===5||r.tag===6)e.appendChild(r.stateNode);else if(r.tag!==4&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break;for(;r.sibling===null;){if(r.return===null||r.return===t)return;r=r.return}r.sibling.return=r.return,r=r.sibling}},Rl=function(){},Mc=function(e,t,r,s){var a=e.memoizedProps;if(a!==s){e=t.stateNode,pr(St.current);var o=null;switch(r){case"input":a=sa(e,a),s=sa(e,s),o=[];break;case"select":a=$({},a,{value:void 0}),s=$({},s,{value:void 0}),o=[];break;case"textarea":a=oa(e,a),s=oa(e,s),o=[];break;default:typeof a.onClick!="function"&&typeof s.onClick=="function"&&(e.onclick=os)}ca(r,s);var u;r=null;for(T in a)if(!s.hasOwnProperty(T)&&a.hasOwnProperty(T)&&a[T]!=null)if(T==="style"){var p=a[T];for(u in p)p.hasOwnProperty(u)&&(r||(r={}),r[u]="")}else T!=="dangerouslySetInnerHTML"&&T!=="children"&&T!=="suppressContentEditableWarning"&&T!=="suppressHydrationWarning"&&T!=="autoFocus"&&(m.hasOwnProperty(T)?o||(o=[]):(o=o||[]).push(T,null));for(T in s){var h=s[T];if(p=a!=null?a[T]:void 0,s.hasOwnProperty(T)&&h!==p&&(h!=null||p!=null))if(T==="style")if(p){for(u in p)!p.hasOwnProperty(u)||h&&h.hasOwnProperty(u)||(r||(r={}),r[u]="");for(u in h)h.hasOwnProperty(u)&&p[u]!==h[u]&&(r||(r={}),r[u]=h[u])}else r||(o||(o=[]),o.push(T,r)),r=h;else T==="dangerouslySetInnerHTML"?(h=h?h.__html:void 0,p=p?p.__html:void 0,h!=null&&p!==h&&(o=o||[]).push(T,h)):T==="children"?typeof h!="string"&&typeof h!="number"||(o=o||[]).push(T,""+h):T!=="suppressContentEditableWarning"&&T!=="suppressHydrationWarning"&&(m.hasOwnProperty(T)?(h!=null&&T==="onScroll"&&be("scroll",e),o||p===h||(o=[])):(o=o||[]).push(T,h))}r&&(o=o||[]).push("style",r);var T=o;(t.updateQueue=T)&&(t.flags|=4)}},Fc=function(e,t,r,s){r!==s&&(t.flags|=4)};function Cn(e,t){if(!ke)switch(e.tailMode){case"hidden":t=e.tail;for(var r=null;t!==null;)t.alternate!==null&&(r=t),t=t.sibling;r===null?e.tail=null:r.sibling=null;break;case"collapsed":r=e.tail;for(var s=null;r!==null;)r.alternate!==null&&(s=r),r=r.sibling;s===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:s.sibling=null}}function We(e){var t=e.alternate!==null&&e.alternate.child===e.child,r=0,s=0;if(t)for(var a=e.child;a!==null;)r|=a.lanes|a.childLanes,s|=a.subtreeFlags&14680064,s|=a.flags&14680064,a.return=e,a=a.sibling;else for(a=e.child;a!==null;)r|=a.lanes|a.childLanes,s|=a.subtreeFlags,s|=a.flags,a.return=e,a=a.sibling;return e.subtreeFlags|=s,e.childLanes=r,t}function zp(e,t,r){var s=t.pendingProps;switch(Ja(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return We(t),null;case 1:return Xe(t.type)&&cs(),We(t),null;case 3:return s=t.stateNode,Br(),we(Je),we(He),ul(),s.pendingContext&&(s.context=s.pendingContext,s.pendingContext=null),(e===null||e.child===null)&&(hs(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,yt!==null&&(Bl(yt),yt=null))),Rl(e,t),We(t),null;case 5:il(t);var a=pr(kn.current);if(r=t.type,e!==null&&t.stateNode!=null)Mc(e,t,r,s,a),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!s){if(t.stateNode===null)throw Error(i(166));return We(t),null}if(e=pr(St.current),hs(t)){s=t.stateNode,r=t.type;var o=t.memoizedProps;switch(s[Nt]=t,s[gn]=o,e=(t.mode&1)!==0,r){case"dialog":be("cancel",s),be("close",s);break;case"iframe":case"object":case"embed":be("load",s);break;case"video":case"audio":for(a=0;a<hn.length;a++)be(hn[a],s);break;case"source":be("error",s);break;case"img":case"image":case"link":be("error",s),be("load",s);break;case"details":be("toggle",s);break;case"input":yo(s,o),be("invalid",s);break;case"select":s._wrapperState={wasMultiple:!!o.multiple},be("invalid",s);break;case"textarea":wo(s,o),be("invalid",s)}ca(r,o),a=null;for(var u in o)if(o.hasOwnProperty(u)){var p=o[u];u==="children"?typeof p=="string"?s.textContent!==p&&(o.suppressHydrationWarning!==!0&&ls(s.textContent,p,e),a=["children",p]):typeof p=="number"&&s.textContent!==""+p&&(o.suppressHydrationWarning!==!0&&ls(s.textContent,p,e),a=["children",""+p]):m.hasOwnProperty(u)&&p!=null&&u==="onScroll"&&be("scroll",s)}switch(r){case"input":Mn(s),bo(s,o,!0);break;case"textarea":Mn(s),jo(s);break;case"select":case"option":break;default:typeof o.onClick=="function"&&(s.onclick=os)}s=a,t.updateQueue=s,s!==null&&(t.flags|=4)}else{u=a.nodeType===9?a:a.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=No(r)),e==="http://www.w3.org/1999/xhtml"?r==="script"?(e=u.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof s.is=="string"?e=u.createElement(r,{is:s.is}):(e=u.createElement(r),r==="select"&&(u=e,s.multiple?u.multiple=!0:s.size&&(u.size=s.size))):e=u.createElementNS(e,r),e[Nt]=t,e[gn]=s,Dc(e,t,!1,!1),t.stateNode=e;e:{switch(u=ua(r,s),r){case"dialog":be("cancel",e),be("close",e),a=s;break;case"iframe":case"object":case"embed":be("load",e),a=s;break;case"video":case"audio":for(a=0;a<hn.length;a++)be(hn[a],e);a=s;break;case"source":be("error",e),a=s;break;case"img":case"image":case"link":be("error",e),be("load",e),a=s;break;case"details":be("toggle",e),a=s;break;case"input":yo(e,s),a=sa(e,s),be("invalid",e);break;case"option":a=s;break;case"select":e._wrapperState={wasMultiple:!!s.multiple},a=$({},s,{value:void 0}),be("invalid",e);break;case"textarea":wo(e,s),a=oa(e,s),be("invalid",e);break;default:a=s}ca(r,a),p=a;for(o in p)if(p.hasOwnProperty(o)){var h=p[o];o==="style"?Co(e,h):o==="dangerouslySetInnerHTML"?(h=h?h.__html:void 0,h!=null&&So(e,h)):o==="children"?typeof h=="string"?(r!=="textarea"||h!=="")&&Qr(e,h):typeof h=="number"&&Qr(e,""+h):o!=="suppressContentEditableWarning"&&o!=="suppressHydrationWarning"&&o!=="autoFocus"&&(m.hasOwnProperty(o)?h!=null&&o==="onScroll"&&be("scroll",e):h!=null&&M(e,o,h,u))}switch(r){case"input":Mn(e),bo(e,s,!1);break;case"textarea":Mn(e),jo(e);break;case"option":s.value!=null&&e.setAttribute("value",""+me(s.value));break;case"select":e.multiple=!!s.multiple,o=s.value,o!=null?wr(e,!!s.multiple,o,!1):s.defaultValue!=null&&wr(e,!!s.multiple,s.defaultValue,!0);break;default:typeof a.onClick=="function"&&(e.onclick=os)}switch(r){case"button":case"input":case"select":case"textarea":s=!!s.autoFocus;break e;case"img":s=!0;break e;default:s=!1}}s&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return We(t),null;case 6:if(e&&t.stateNode!=null)Fc(e,t,e.memoizedProps,s);else{if(typeof s!="string"&&t.stateNode===null)throw Error(i(166));if(r=pr(kn.current),pr(St.current),hs(t)){if(s=t.stateNode,r=t.memoizedProps,s[Nt]=t,(o=s.nodeValue!==r)&&(e=at,e!==null))switch(e.tag){case 3:ls(s.nodeValue,r,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&ls(s.nodeValue,r,(e.mode&1)!==0)}o&&(t.flags|=4)}else s=(r.nodeType===9?r:r.ownerDocument).createTextNode(s),s[Nt]=t,t.stateNode=s}return We(t),null;case 13:if(we(Ne),s=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(ke&&lt!==null&&(t.mode&1)!==0&&(t.flags&128)===0)Ui(),Dr(),t.flags|=98560,o=!1;else if(o=hs(t),s!==null&&s.dehydrated!==null){if(e===null){if(!o)throw Error(i(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(i(317));o[Nt]=t}else Dr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;We(t),o=!1}else yt!==null&&(Bl(yt),yt=null),o=!0;if(!o)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=r,t):(s=s!==null,s!==(e!==null&&e.memoizedState!==null)&&s&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Ne.current&1)!==0?Oe===0&&(Oe=3):$l())),t.updateQueue!==null&&(t.flags|=4),We(t),null);case 4:return Br(),Rl(e,t),e===null&&fn(t.stateNode.containerInfo),We(t),null;case 10:return nl(t.type._context),We(t),null;case 17:return Xe(t.type)&&cs(),We(t),null;case 19:if(we(Ne),o=t.memoizedState,o===null)return We(t),null;if(s=(t.flags&128)!==0,u=o.rendering,u===null)if(s)Cn(o,!1);else{if(Oe!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(u=bs(e),u!==null){for(t.flags|=128,Cn(o,!1),s=u.updateQueue,s!==null&&(t.updateQueue=s,t.flags|=4),t.subtreeFlags=0,s=r,r=t.child;r!==null;)o=r,e=s,o.flags&=14680066,u=o.alternate,u===null?(o.childLanes=0,o.lanes=e,o.child=null,o.subtreeFlags=0,o.memoizedProps=null,o.memoizedState=null,o.updateQueue=null,o.dependencies=null,o.stateNode=null):(o.childLanes=u.childLanes,o.lanes=u.lanes,o.child=u.child,o.subtreeFlags=0,o.deletions=null,o.memoizedProps=u.memoizedProps,o.memoizedState=u.memoizedState,o.updateQueue=u.updateQueue,o.type=u.type,e=u.dependencies,o.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),r=r.sibling;return ve(Ne,Ne.current&1|2),t.child}e=e.sibling}o.tail!==null&&_e()>Hr&&(t.flags|=128,s=!0,Cn(o,!1),t.lanes=4194304)}else{if(!s)if(e=bs(u),e!==null){if(t.flags|=128,s=!0,r=e.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),Cn(o,!0),o.tail===null&&o.tailMode==="hidden"&&!u.alternate&&!ke)return We(t),null}else 2*_e()-o.renderingStartTime>Hr&&r!==1073741824&&(t.flags|=128,s=!0,Cn(o,!1),t.lanes=4194304);o.isBackwards?(u.sibling=t.child,t.child=u):(r=o.last,r!==null?r.sibling=u:t.child=u,o.last=u)}return o.tail!==null?(t=o.tail,o.rendering=t,o.tail=t.sibling,o.renderingStartTime=_e(),t.sibling=null,r=Ne.current,ve(Ne,s?r&1|2:r&1),t):(We(t),null);case 22:case 23:return Vl(),s=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==s&&(t.flags|=8192),s&&(t.mode&1)!==0?(ot&1073741824)!==0&&(We(t),t.subtreeFlags&6&&(t.flags|=8192)):We(t),null;case 24:return null;case 25:return null}throw Error(i(156,t.tag))}function Bp(e,t){switch(Ja(t),t.tag){case 1:return Xe(t.type)&&cs(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Br(),we(Je),we(He),ul(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return il(t),null;case 13:if(we(Ne),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Dr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return we(Ne),null;case 4:return Br(),null;case 10:return nl(t.type._context),null;case 22:case 23:return Vl(),null;case 24:return null;default:return null}}var Rs=!1,Ge=!1,Up=typeof WeakSet=="function"?WeakSet:Set,q=null;function Vr(e,t){var r=e.ref;if(r!==null)if(typeof r=="function")try{r(null)}catch(s){Ee(e,t,s)}else r.current=null}function _l(e,t,r){try{r()}catch(s){Ee(e,t,s)}}var zc=!1;function Vp(e,t){if(Va=Kn,e=gi(),Ia(e)){if("selectionStart"in e)var r={start:e.selectionStart,end:e.selectionEnd};else e:{r=(r=e.ownerDocument)&&r.defaultView||window;var s=r.getSelection&&r.getSelection();if(s&&s.rangeCount!==0){r=s.anchorNode;var a=s.anchorOffset,o=s.focusNode;s=s.focusOffset;try{r.nodeType,o.nodeType}catch{r=null;break e}var u=0,p=-1,h=-1,T=0,D=0,F=e,P=null;t:for(;;){for(var H;F!==r||a!==0&&F.nodeType!==3||(p=u+a),F!==o||s!==0&&F.nodeType!==3||(h=u+s),F.nodeType===3&&(u+=F.nodeValue.length),(H=F.firstChild)!==null;)P=F,F=H;for(;;){if(F===e)break t;if(P===r&&++T===a&&(p=u),P===o&&++D===s&&(h=u),(H=F.nextSibling)!==null)break;F=P,P=F.parentNode}F=H}r=p===-1||h===-1?null:{start:p,end:h}}else r=null}r=r||{start:0,end:0}}else r=null;for($a={focusedElem:e,selectionRange:r},Kn=!1,q=t;q!==null;)if(t=q,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,q=e;else for(;q!==null;){t=q;try{var W=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(W!==null){var G=W.memoizedProps,Le=W.memoizedState,k=t.stateNode,x=k.getSnapshotBeforeUpdate(t.elementType===t.type?G:vt(t.type,G),Le);k.__reactInternalSnapshotBeforeUpdate=x}break;case 3:var N=t.stateNode.containerInfo;N.nodeType===1?N.textContent="":N.nodeType===9&&N.documentElement&&N.removeChild(N.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(i(163))}}catch(B){Ee(t,t.return,B)}if(e=t.sibling,e!==null){e.return=t.return,q=e;break}q=t.return}return W=zc,zc=!1,W}function Tn(e,t,r){var s=t.updateQueue;if(s=s!==null?s.lastEffect:null,s!==null){var a=s=s.next;do{if((a.tag&e)===e){var o=a.destroy;a.destroy=void 0,o!==void 0&&_l(t,r,o)}a=a.next}while(a!==s)}}function _s(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var r=t=t.next;do{if((r.tag&e)===e){var s=r.create;r.destroy=s()}r=r.next}while(r!==t)}}function Ll(e){var t=e.ref;if(t!==null){var r=e.stateNode;switch(e.tag){case 5:e=r;break;default:e=r}typeof t=="function"?t(e):t.current=e}}function Bc(e){var t=e.alternate;t!==null&&(e.alternate=null,Bc(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[Nt],delete t[gn],delete t[Ga],delete t[Np],delete t[Sp])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Uc(e){return e.tag===5||e.tag===3||e.tag===4}function Vc(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Uc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Al(e,t,r){var s=e.tag;if(s===5||s===6)e=e.stateNode,t?r.nodeType===8?r.parentNode.insertBefore(e,t):r.insertBefore(e,t):(r.nodeType===8?(t=r.parentNode,t.insertBefore(e,r)):(t=r,t.appendChild(e)),r=r._reactRootContainer,r!=null||t.onclick!==null||(t.onclick=os));else if(s!==4&&(e=e.child,e!==null))for(Al(e,t,r),e=e.sibling;e!==null;)Al(e,t,r),e=e.sibling}function Pl(e,t,r){var s=e.tag;if(s===5||s===6)e=e.stateNode,t?r.insertBefore(e,t):r.appendChild(e);else if(s!==4&&(e=e.child,e!==null))for(Pl(e,t,r),e=e.sibling;e!==null;)Pl(e,t,r),e=e.sibling}var Ue=null,bt=!1;function Kt(e,t,r){for(r=r.child;r!==null;)$c(e,t,r),r=r.sibling}function $c(e,t,r){if(jt&&typeof jt.onCommitFiberUnmount=="function")try{jt.onCommitFiberUnmount($n,r)}catch{}switch(r.tag){case 5:Ge||Vr(r,t);case 6:var s=Ue,a=bt;Ue=null,Kt(e,t,r),Ue=s,bt=a,Ue!==null&&(bt?(e=Ue,r=r.stateNode,e.nodeType===8?e.parentNode.removeChild(r):e.removeChild(r)):Ue.removeChild(r.stateNode));break;case 18:Ue!==null&&(bt?(e=Ue,r=r.stateNode,e.nodeType===8?Wa(e.parentNode,r):e.nodeType===1&&Wa(e,r),an(e)):Wa(Ue,r.stateNode));break;case 4:s=Ue,a=bt,Ue=r.stateNode.containerInfo,bt=!0,Kt(e,t,r),Ue=s,bt=a;break;case 0:case 11:case 14:case 15:if(!Ge&&(s=r.updateQueue,s!==null&&(s=s.lastEffect,s!==null))){a=s=s.next;do{var o=a,u=o.destroy;o=o.tag,u!==void 0&&((o&2)!==0||(o&4)!==0)&&_l(r,t,u),a=a.next}while(a!==s)}Kt(e,t,r);break;case 1:if(!Ge&&(Vr(r,t),s=r.stateNode,typeof s.componentWillUnmount=="function"))try{s.props=r.memoizedProps,s.state=r.memoizedState,s.componentWillUnmount()}catch(p){Ee(r,t,p)}Kt(e,t,r);break;case 21:Kt(e,t,r);break;case 22:r.mode&1?(Ge=(s=Ge)||r.memoizedState!==null,Kt(e,t,r),Ge=s):Kt(e,t,r);break;default:Kt(e,t,r)}}function Hc(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var r=e.stateNode;r===null&&(r=e.stateNode=new Up),t.forEach(function(s){var a=Jp.bind(null,e,s);r.has(s)||(r.add(s),s.then(a,a))})}}function wt(e,t){var r=t.deletions;if(r!==null)for(var s=0;s<r.length;s++){var a=r[s];try{var o=e,u=t,p=u;e:for(;p!==null;){switch(p.tag){case 5:Ue=p.stateNode,bt=!1;break e;case 3:Ue=p.stateNode.containerInfo,bt=!0;break e;case 4:Ue=p.stateNode.containerInfo,bt=!0;break e}p=p.return}if(Ue===null)throw Error(i(160));$c(o,u,a),Ue=null,bt=!1;var h=a.alternate;h!==null&&(h.return=null),a.return=null}catch(T){Ee(a,t,T)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)qc(t,e),t=t.sibling}function qc(e,t){var r=e.alternate,s=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(wt(t,e),Ct(e),s&4){try{Tn(3,e,e.return),_s(3,e)}catch(G){Ee(e,e.return,G)}try{Tn(5,e,e.return)}catch(G){Ee(e,e.return,G)}}break;case 1:wt(t,e),Ct(e),s&512&&r!==null&&Vr(r,r.return);break;case 5:if(wt(t,e),Ct(e),s&512&&r!==null&&Vr(r,r.return),e.flags&32){var a=e.stateNode;try{Qr(a,"")}catch(G){Ee(e,e.return,G)}}if(s&4&&(a=e.stateNode,a!=null)){var o=e.memoizedProps,u=r!==null?r.memoizedProps:o,p=e.type,h=e.updateQueue;if(e.updateQueue=null,h!==null)try{p==="input"&&o.type==="radio"&&o.name!=null&&vo(a,o),ua(p,u);var T=ua(p,o);for(u=0;u<h.length;u+=2){var D=h[u],F=h[u+1];D==="style"?Co(a,F):D==="dangerouslySetInnerHTML"?So(a,F):D==="children"?Qr(a,F):M(a,D,F,T)}switch(p){case"input":aa(a,o);break;case"textarea":ko(a,o);break;case"select":var P=a._wrapperState.wasMultiple;a._wrapperState.wasMultiple=!!o.multiple;var H=o.value;H!=null?wr(a,!!o.multiple,H,!1):P!==!!o.multiple&&(o.defaultValue!=null?wr(a,!!o.multiple,o.defaultValue,!0):wr(a,!!o.multiple,o.multiple?[]:"",!1))}a[gn]=o}catch(G){Ee(e,e.return,G)}}break;case 6:if(wt(t,e),Ct(e),s&4){if(e.stateNode===null)throw Error(i(162));a=e.stateNode,o=e.memoizedProps;try{a.nodeValue=o}catch(G){Ee(e,e.return,G)}}break;case 3:if(wt(t,e),Ct(e),s&4&&r!==null&&r.memoizedState.isDehydrated)try{an(t.containerInfo)}catch(G){Ee(e,e.return,G)}break;case 4:wt(t,e),Ct(e);break;case 13:wt(t,e),Ct(e),a=e.child,a.flags&8192&&(o=a.memoizedState!==null,a.stateNode.isHidden=o,!o||a.alternate!==null&&a.alternate.memoizedState!==null||(Dl=_e())),s&4&&Hc(e);break;case 22:if(D=r!==null&&r.memoizedState!==null,e.mode&1?(Ge=(T=Ge)||D,wt(t,e),Ge=T):wt(t,e),Ct(e),s&8192){if(T=e.memoizedState!==null,(e.stateNode.isHidden=T)&&!D&&(e.mode&1)!==0)for(q=e,D=e.child;D!==null;){for(F=q=D;q!==null;){switch(P=q,H=P.child,P.tag){case 0:case 11:case 14:case 15:Tn(4,P,P.return);break;case 1:Vr(P,P.return);var W=P.stateNode;if(typeof W.componentWillUnmount=="function"){s=P,r=P.return;try{t=s,W.props=t.memoizedProps,W.state=t.memoizedState,W.componentWillUnmount()}catch(G){Ee(s,r,G)}}break;case 5:Vr(P,P.return);break;case 22:if(P.memoizedState!==null){Qc(F);continue}}H!==null?(H.return=P,q=H):Qc(F)}D=D.sibling}e:for(D=null,F=e;;){if(F.tag===5){if(D===null){D=F;try{a=F.stateNode,T?(o=a.style,typeof o.setProperty=="function"?o.setProperty("display","none","important"):o.display="none"):(p=F.stateNode,h=F.memoizedProps.style,u=h!=null&&h.hasOwnProperty("display")?h.display:null,p.style.display=Eo("display",u))}catch(G){Ee(e,e.return,G)}}}else if(F.tag===6){if(D===null)try{F.stateNode.nodeValue=T?"":F.memoizedProps}catch(G){Ee(e,e.return,G)}}else if((F.tag!==22&&F.tag!==23||F.memoizedState===null||F===e)&&F.child!==null){F.child.return=F,F=F.child;continue}if(F===e)break e;for(;F.sibling===null;){if(F.return===null||F.return===e)break e;D===F&&(D=null),F=F.return}D===F&&(D=null),F.sibling.return=F.return,F=F.sibling}}break;case 19:wt(t,e),Ct(e),s&4&&Hc(e);break;case 21:break;default:wt(t,e),Ct(e)}}function Ct(e){var t=e.flags;if(t&2){try{e:{for(var r=e.return;r!==null;){if(Uc(r)){var s=r;break e}r=r.return}throw Error(i(160))}switch(s.tag){case 5:var a=s.stateNode;s.flags&32&&(Qr(a,""),s.flags&=-33);var o=Vc(e);Pl(e,o,a);break;case 3:case 4:var u=s.stateNode.containerInfo,p=Vc(e);Al(e,p,u);break;default:throw Error(i(161))}}catch(h){Ee(e,e.return,h)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function $p(e,t,r){q=e,Wc(e)}function Wc(e,t,r){for(var s=(e.mode&1)!==0;q!==null;){var a=q,o=a.child;if(a.tag===22&&s){var u=a.memoizedState!==null||Rs;if(!u){var p=a.alternate,h=p!==null&&p.memoizedState!==null||Ge;p=Rs;var T=Ge;if(Rs=u,(Ge=h)&&!T)for(q=a;q!==null;)u=q,h=u.child,u.tag===22&&u.memoizedState!==null?Kc(a):h!==null?(h.return=u,q=h):Kc(a);for(;o!==null;)q=o,Wc(o),o=o.sibling;q=a,Rs=p,Ge=T}Gc(e)}else(a.subtreeFlags&8772)!==0&&o!==null?(o.return=a,q=o):Gc(e)}}function Gc(e){for(;q!==null;){var t=q;if((t.flags&8772)!==0){var r=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:Ge||_s(5,t);break;case 1:var s=t.stateNode;if(t.flags&4&&!Ge)if(r===null)s.componentDidMount();else{var a=t.elementType===t.type?r.memoizedProps:vt(t.type,r.memoizedProps);s.componentDidUpdate(a,r.memoizedState,s.__reactInternalSnapshotBeforeUpdate)}var o=t.updateQueue;o!==null&&Qi(t,o,s);break;case 3:var u=t.updateQueue;if(u!==null){if(r=null,t.child!==null)switch(t.child.tag){case 5:r=t.child.stateNode;break;case 1:r=t.child.stateNode}Qi(t,u,r)}break;case 5:var p=t.stateNode;if(r===null&&t.flags&4){r=p;var h=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":h.autoFocus&&r.focus();break;case"img":h.src&&(r.src=h.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var T=t.alternate;if(T!==null){var D=T.memoizedState;if(D!==null){var F=D.dehydrated;F!==null&&an(F)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(i(163))}Ge||t.flags&512&&Ll(t)}catch(P){Ee(t,t.return,P)}}if(t===e){q=null;break}if(r=t.sibling,r!==null){r.return=t.return,q=r;break}q=t.return}}function Qc(e){for(;q!==null;){var t=q;if(t===e){q=null;break}var r=t.sibling;if(r!==null){r.return=t.return,q=r;break}q=t.return}}function Kc(e){for(;q!==null;){var t=q;try{switch(t.tag){case 0:case 11:case 15:var r=t.return;try{_s(4,t)}catch(h){Ee(t,r,h)}break;case 1:var s=t.stateNode;if(typeof s.componentDidMount=="function"){var a=t.return;try{s.componentDidMount()}catch(h){Ee(t,a,h)}}var o=t.return;try{Ll(t)}catch(h){Ee(t,o,h)}break;case 5:var u=t.return;try{Ll(t)}catch(h){Ee(t,u,h)}}}catch(h){Ee(t,t.return,h)}if(t===e){q=null;break}var p=t.sibling;if(p!==null){p.return=t.return,q=p;break}q=t.return}}var Hp=Math.ceil,Ls=K.ReactCurrentDispatcher,Il=K.ReactCurrentOwner,ht=K.ReactCurrentBatchConfig,ce=0,Fe=null,Ae=null,Ve=0,ot=0,$r=Ht(0),Oe=0,Rn=null,hr=0,As=0,Ol=0,_n=null,et=null,Dl=0,Hr=1/0,Dt=null,Ps=!1,Ml=null,Yt=null,Is=!1,Jt=null,Os=0,Ln=0,Fl=null,Ds=-1,Ms=0;function Ke(){return(ce&6)!==0?_e():Ds!==-1?Ds:Ds=_e()}function Xt(e){return(e.mode&1)===0?1:(ce&2)!==0&&Ve!==0?Ve&-Ve:Cp.transition!==null?(Ms===0&&(Ms=Vo()),Ms):(e=he,e!==0||(e=window.event,e=e===void 0?16:Jo(e.type)),e)}function kt(e,t,r,s){if(50<Ln)throw Ln=0,Fl=null,Error(i(185));en(e,r,s),((ce&2)===0||e!==Fe)&&(e===Fe&&((ce&2)===0&&(As|=r),Oe===4&&Zt(e,Ve)),tt(e,s),r===1&&ce===0&&(t.mode&1)===0&&(Hr=_e()+500,ds&&Wt()))}function tt(e,t){var r=e.callbackNode;Cd(e,t);var s=Wn(e,e===Fe?Ve:0);if(s===0)r!==null&&zo(r),e.callbackNode=null,e.callbackPriority=0;else if(t=s&-s,e.callbackPriority!==t){if(r!=null&&zo(r),t===1)e.tag===0?Ep(Jc.bind(null,e)):Di(Jc.bind(null,e)),kp(function(){(ce&6)===0&&Wt()}),r=null;else{switch($o(s)){case 1:r=ga;break;case 4:r=Bo;break;case 16:r=Vn;break;case 536870912:r=Uo;break;default:r=Vn}r=au(r,Yc.bind(null,e))}e.callbackPriority=t,e.callbackNode=r}}function Yc(e,t){if(Ds=-1,Ms=0,(ce&6)!==0)throw Error(i(327));var r=e.callbackNode;if(qr()&&e.callbackNode!==r)return null;var s=Wn(e,e===Fe?Ve:0);if(s===0)return null;if((s&30)!==0||(s&e.expiredLanes)!==0||t)t=Fs(e,s);else{t=s;var a=ce;ce|=2;var o=Zc();(Fe!==e||Ve!==t)&&(Dt=null,Hr=_e()+500,xr(e,t));do try{Gp();break}catch(p){Xc(e,p)}while(!0);rl(),Ls.current=o,ce=a,Ae!==null?t=0:(Fe=null,Ve=0,t=Oe)}if(t!==0){if(t===2&&(a=ya(e),a!==0&&(s=a,t=zl(e,a))),t===1)throw r=Rn,xr(e,0),Zt(e,s),tt(e,_e()),r;if(t===6)Zt(e,s);else{if(a=e.current.alternate,(s&30)===0&&!qp(a)&&(t=Fs(e,s),t===2&&(o=ya(e),o!==0&&(s=o,t=zl(e,o))),t===1))throw r=Rn,xr(e,0),Zt(e,s),tt(e,_e()),r;switch(e.finishedWork=a,e.finishedLanes=s,t){case 0:case 1:throw Error(i(345));case 2:gr(e,et,Dt);break;case 3:if(Zt(e,s),(s&130023424)===s&&(t=Dl+500-_e(),10<t)){if(Wn(e,0)!==0)break;if(a=e.suspendedLanes,(a&s)!==s){Ke(),e.pingedLanes|=e.suspendedLanes&a;break}e.timeoutHandle=qa(gr.bind(null,e,et,Dt),t);break}gr(e,et,Dt);break;case 4:if(Zt(e,s),(s&4194240)===s)break;for(t=e.eventTimes,a=-1;0<s;){var u=31-xt(s);o=1<<u,u=t[u],u>a&&(a=u),s&=~o}if(s=a,s=_e()-s,s=(120>s?120:480>s?480:1080>s?1080:1920>s?1920:3e3>s?3e3:4320>s?4320:1960*Hp(s/1960))-s,10<s){e.timeoutHandle=qa(gr.bind(null,e,et,Dt),s);break}gr(e,et,Dt);break;case 5:gr(e,et,Dt);break;default:throw Error(i(329))}}}return tt(e,_e()),e.callbackNode===r?Yc.bind(null,e):null}function zl(e,t){var r=_n;return e.current.memoizedState.isDehydrated&&(xr(e,t).flags|=256),e=Fs(e,t),e!==2&&(t=et,et=r,t!==null&&Bl(t)),e}function Bl(e){et===null?et=e:et.push.apply(et,e)}function qp(e){for(var t=e;;){if(t.flags&16384){var r=t.updateQueue;if(r!==null&&(r=r.stores,r!==null))for(var s=0;s<r.length;s++){var a=r[s],o=a.getSnapshot;a=a.value;try{if(!gt(o(),a))return!1}catch{return!1}}}if(r=t.child,t.subtreeFlags&16384&&r!==null)r.return=t,t=r;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Zt(e,t){for(t&=~Ol,t&=~As,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var r=31-xt(t),s=1<<r;e[r]=-1,t&=~s}}function Jc(e){if((ce&6)!==0)throw Error(i(327));qr();var t=Wn(e,0);if((t&1)===0)return tt(e,_e()),null;var r=Fs(e,t);if(e.tag!==0&&r===2){var s=ya(e);s!==0&&(t=s,r=zl(e,s))}if(r===1)throw r=Rn,xr(e,0),Zt(e,t),tt(e,_e()),r;if(r===6)throw Error(i(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,gr(e,et,Dt),tt(e,_e()),null}function Ul(e,t){var r=ce;ce|=1;try{return e(t)}finally{ce=r,ce===0&&(Hr=_e()+500,ds&&Wt())}}function fr(e){Jt!==null&&Jt.tag===0&&(ce&6)===0&&qr();var t=ce;ce|=1;var r=ht.transition,s=he;try{if(ht.transition=null,he=1,e)return e()}finally{he=s,ht.transition=r,ce=t,(ce&6)===0&&Wt()}}function Vl(){ot=$r.current,we($r)}function xr(e,t){e.finishedWork=null,e.finishedLanes=0;var r=e.timeoutHandle;if(r!==-1&&(e.timeoutHandle=-1,wp(r)),Ae!==null)for(r=Ae.return;r!==null;){var s=r;switch(Ja(s),s.tag){case 1:s=s.type.childContextTypes,s!=null&&cs();break;case 3:Br(),we(Je),we(He),ul();break;case 5:il(s);break;case 4:Br();break;case 13:we(Ne);break;case 19:we(Ne);break;case 10:nl(s.type._context);break;case 22:case 23:Vl()}r=r.return}if(Fe=e,Ae=e=er(e.current,null),Ve=ot=t,Oe=0,Rn=null,Ol=As=hr=0,et=_n=null,dr!==null){for(t=0;t<dr.length;t++)if(r=dr[t],s=r.interleaved,s!==null){r.interleaved=null;var a=s.next,o=r.pending;if(o!==null){var u=o.next;o.next=a,s.next=u}r.pending=s}dr=null}return e}function Xc(e,t){do{var r=Ae;try{if(rl(),ws.current=Ss,ks){for(var s=Se.memoizedState;s!==null;){var a=s.queue;a!==null&&(a.pending=null),s=s.next}ks=!1}if(mr=0,Me=Ie=Se=null,jn=!1,Nn=0,Il.current=null,r===null||r.return===null){Oe=1,Rn=t,Ae=null;break}e:{var o=e,u=r.return,p=r,h=t;if(t=Ve,p.flags|=32768,h!==null&&typeof h=="object"&&typeof h.then=="function"){var T=h,D=p,F=D.tag;if((D.mode&1)===0&&(F===0||F===11||F===15)){var P=D.alternate;P?(D.updateQueue=P.updateQueue,D.memoizedState=P.memoizedState,D.lanes=P.lanes):(D.updateQueue=null,D.memoizedState=null)}var H=jc(u);if(H!==null){H.flags&=-257,Nc(H,u,p,o,t),H.mode&1&&kc(o,T,t),t=H,h=T;var W=t.updateQueue;if(W===null){var G=new Set;G.add(h),t.updateQueue=G}else W.add(h);break e}else{if((t&1)===0){kc(o,T,t),$l();break e}h=Error(i(426))}}else if(ke&&p.mode&1){var Le=jc(u);if(Le!==null){(Le.flags&65536)===0&&(Le.flags|=256),Nc(Le,u,p,o,t),el(Ur(h,p));break e}}o=h=Ur(h,p),Oe!==4&&(Oe=2),_n===null?_n=[o]:_n.push(o),o=u;do{switch(o.tag){case 3:o.flags|=65536,t&=-t,o.lanes|=t;var k=bc(o,h,t);Gi(o,k);break e;case 1:p=h;var x=o.type,N=o.stateNode;if((o.flags&128)===0&&(typeof x.getDerivedStateFromError=="function"||N!==null&&typeof N.componentDidCatch=="function"&&(Yt===null||!Yt.has(N)))){o.flags|=65536,t&=-t,o.lanes|=t;var B=wc(o,p,t);Gi(o,B);break e}}o=o.return}while(o!==null)}tu(r)}catch(Y){t=Y,Ae===r&&r!==null&&(Ae=r=r.return);continue}break}while(!0)}function Zc(){var e=Ls.current;return Ls.current=Ss,e===null?Ss:e}function $l(){(Oe===0||Oe===3||Oe===2)&&(Oe=4),Fe===null||(hr&268435455)===0&&(As&268435455)===0||Zt(Fe,Ve)}function Fs(e,t){var r=ce;ce|=2;var s=Zc();(Fe!==e||Ve!==t)&&(Dt=null,xr(e,t));do try{Wp();break}catch(a){Xc(e,a)}while(!0);if(rl(),ce=r,Ls.current=s,Ae!==null)throw Error(i(261));return Fe=null,Ve=0,Oe}function Wp(){for(;Ae!==null;)eu(Ae)}function Gp(){for(;Ae!==null&&!yd();)eu(Ae)}function eu(e){var t=su(e.alternate,e,ot);e.memoizedProps=e.pendingProps,t===null?tu(e):Ae=t,Il.current=null}function tu(e){var t=e;do{var r=t.alternate;if(e=t.return,(t.flags&32768)===0){if(r=zp(r,t,ot),r!==null){Ae=r;return}}else{if(r=Bp(r,t),r!==null){r.flags&=32767,Ae=r;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{Oe=6,Ae=null;return}}if(t=t.sibling,t!==null){Ae=t;return}Ae=t=e}while(t!==null);Oe===0&&(Oe=5)}function gr(e,t,r){var s=he,a=ht.transition;try{ht.transition=null,he=1,Qp(e,t,r,s)}finally{ht.transition=a,he=s}return null}function Qp(e,t,r,s){do qr();while(Jt!==null);if((ce&6)!==0)throw Error(i(327));r=e.finishedWork;var a=e.finishedLanes;if(r===null)return null;if(e.finishedWork=null,e.finishedLanes=0,r===e.current)throw Error(i(177));e.callbackNode=null,e.callbackPriority=0;var o=r.lanes|r.childLanes;if(Td(e,o),e===Fe&&(Ae=Fe=null,Ve=0),(r.subtreeFlags&2064)===0&&(r.flags&2064)===0||Is||(Is=!0,au(Vn,function(){return qr(),null})),o=(r.flags&15990)!==0,(r.subtreeFlags&15990)!==0||o){o=ht.transition,ht.transition=null;var u=he;he=1;var p=ce;ce|=4,Il.current=null,Vp(e,r),qc(r,e),hp($a),Kn=!!Va,$a=Va=null,e.current=r,$p(r),vd(),ce=p,he=u,ht.transition=o}else e.current=r;if(Is&&(Is=!1,Jt=e,Os=a),o=e.pendingLanes,o===0&&(Yt=null),kd(r.stateNode),tt(e,_e()),t!==null)for(s=e.onRecoverableError,r=0;r<t.length;r++)a=t[r],s(a.value,{componentStack:a.stack,digest:a.digest});if(Ps)throw Ps=!1,e=Ml,Ml=null,e;return(Os&1)!==0&&e.tag!==0&&qr(),o=e.pendingLanes,(o&1)!==0?e===Fl?Ln++:(Ln=0,Fl=e):Ln=0,Wt(),null}function qr(){if(Jt!==null){var e=$o(Os),t=ht.transition,r=he;try{if(ht.transition=null,he=16>e?16:e,Jt===null)var s=!1;else{if(e=Jt,Jt=null,Os=0,(ce&6)!==0)throw Error(i(331));var a=ce;for(ce|=4,q=e.current;q!==null;){var o=q,u=o.child;if((q.flags&16)!==0){var p=o.deletions;if(p!==null){for(var h=0;h<p.length;h++){var T=p[h];for(q=T;q!==null;){var D=q;switch(D.tag){case 0:case 11:case 15:Tn(8,D,o)}var F=D.child;if(F!==null)F.return=D,q=F;else for(;q!==null;){D=q;var P=D.sibling,H=D.return;if(Bc(D),D===T){q=null;break}if(P!==null){P.return=H,q=P;break}q=H}}}var W=o.alternate;if(W!==null){var G=W.child;if(G!==null){W.child=null;do{var Le=G.sibling;G.sibling=null,G=Le}while(G!==null)}}q=o}}if((o.subtreeFlags&2064)!==0&&u!==null)u.return=o,q=u;else e:for(;q!==null;){if(o=q,(o.flags&2048)!==0)switch(o.tag){case 0:case 11:case 15:Tn(9,o,o.return)}var k=o.sibling;if(k!==null){k.return=o.return,q=k;break e}q=o.return}}var x=e.current;for(q=x;q!==null;){u=q;var N=u.child;if((u.subtreeFlags&2064)!==0&&N!==null)N.return=u,q=N;else e:for(u=x;q!==null;){if(p=q,(p.flags&2048)!==0)try{switch(p.tag){case 0:case 11:case 15:_s(9,p)}}catch(Y){Ee(p,p.return,Y)}if(p===u){q=null;break e}var B=p.sibling;if(B!==null){B.return=p.return,q=B;break e}q=p.return}}if(ce=a,Wt(),jt&&typeof jt.onPostCommitFiberRoot=="function")try{jt.onPostCommitFiberRoot($n,e)}catch{}s=!0}return s}finally{he=r,ht.transition=t}}return!1}function ru(e,t,r){t=Ur(r,t),t=bc(e,t,1),e=Qt(e,t,1),t=Ke(),e!==null&&(en(e,1,t),tt(e,t))}function Ee(e,t,r){if(e.tag===3)ru(e,e,r);else for(;t!==null;){if(t.tag===3){ru(t,e,r);break}else if(t.tag===1){var s=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof s.componentDidCatch=="function"&&(Yt===null||!Yt.has(s))){e=Ur(r,e),e=wc(t,e,1),t=Qt(t,e,1),e=Ke(),t!==null&&(en(t,1,e),tt(t,e));break}}t=t.return}}function Kp(e,t,r){var s=e.pingCache;s!==null&&s.delete(t),t=Ke(),e.pingedLanes|=e.suspendedLanes&r,Fe===e&&(Ve&r)===r&&(Oe===4||Oe===3&&(Ve&130023424)===Ve&&500>_e()-Dl?xr(e,0):Ol|=r),tt(e,t)}function nu(e,t){t===0&&((e.mode&1)===0?t=1:(t=qn,qn<<=1,(qn&130023424)===0&&(qn=4194304)));var r=Ke();e=Pt(e,t),e!==null&&(en(e,t,r),tt(e,r))}function Yp(e){var t=e.memoizedState,r=0;t!==null&&(r=t.retryLane),nu(e,r)}function Jp(e,t){var r=0;switch(e.tag){case 13:var s=e.stateNode,a=e.memoizedState;a!==null&&(r=a.retryLane);break;case 19:s=e.stateNode;break;default:throw Error(i(314))}s!==null&&s.delete(t),nu(e,r)}var su;su=function(e,t,r){if(e!==null)if(e.memoizedProps!==t.pendingProps||Je.current)Ze=!0;else{if((e.lanes&r)===0&&(t.flags&128)===0)return Ze=!1,Fp(e,t,r);Ze=(e.flags&131072)!==0}else Ze=!1,ke&&(t.flags&1048576)!==0&&Mi(t,ms,t.index);switch(t.lanes=0,t.tag){case 2:var s=t.type;Ts(e,t),e=t.pendingProps;var a=Pr(t,He.current);zr(t,r),a=ml(null,t,s,e,a,r);var o=hl();return t.flags|=1,typeof a=="object"&&a!==null&&typeof a.render=="function"&&a.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Xe(s)?(o=!0,us(t)):o=!1,t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,ll(t),a.updater=Es,t.stateNode=a,a._reactInternals=t,bl(t,s,e,r),t=Nl(null,t,s,!0,o,r)):(t.tag=0,ke&&o&&Ya(t),Qe(null,t,a,r),t=t.child),t;case 16:s=t.elementType;e:{switch(Ts(e,t),e=t.pendingProps,a=s._init,s=a(s._payload),t.type=s,a=t.tag=Zp(s),e=vt(s,e),a){case 0:t=jl(null,t,s,e,r);break e;case 1:t=_c(null,t,s,e,r);break e;case 11:t=Sc(null,t,s,e,r);break e;case 14:t=Ec(null,t,s,vt(s.type,e),r);break e}throw Error(i(306,s,""))}return t;case 0:return s=t.type,a=t.pendingProps,a=t.elementType===s?a:vt(s,a),jl(e,t,s,a,r);case 1:return s=t.type,a=t.pendingProps,a=t.elementType===s?a:vt(s,a),_c(e,t,s,a,r);case 3:e:{if(Lc(t),e===null)throw Error(i(387));s=t.pendingProps,o=t.memoizedState,a=o.element,Wi(e,t),vs(t,s,null,r);var u=t.memoizedState;if(s=u.element,o.isDehydrated)if(o={element:s,isDehydrated:!1,cache:u.cache,pendingSuspenseBoundaries:u.pendingSuspenseBoundaries,transitions:u.transitions},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){a=Ur(Error(i(423)),t),t=Ac(e,t,s,r,a);break e}else if(s!==a){a=Ur(Error(i(424)),t),t=Ac(e,t,s,r,a);break e}else for(lt=$t(t.stateNode.containerInfo.firstChild),at=t,ke=!0,yt=null,r=Hi(t,null,s,r),t.child=r;r;)r.flags=r.flags&-3|4096,r=r.sibling;else{if(Dr(),s===a){t=Ot(e,t,r);break e}Qe(e,t,s,r)}t=t.child}return t;case 5:return Ki(t),e===null&&Za(t),s=t.type,a=t.pendingProps,o=e!==null?e.memoizedProps:null,u=a.children,Ha(s,a)?u=null:o!==null&&Ha(s,o)&&(t.flags|=32),Rc(e,t),Qe(e,t,u,r),t.child;case 6:return e===null&&Za(t),null;case 13:return Pc(e,t,r);case 4:return ol(t,t.stateNode.containerInfo),s=t.pendingProps,e===null?t.child=Mr(t,null,s,r):Qe(e,t,s,r),t.child;case 11:return s=t.type,a=t.pendingProps,a=t.elementType===s?a:vt(s,a),Sc(e,t,s,a,r);case 7:return Qe(e,t,t.pendingProps,r),t.child;case 8:return Qe(e,t,t.pendingProps.children,r),t.child;case 12:return Qe(e,t,t.pendingProps.children,r),t.child;case 10:e:{if(s=t.type._context,a=t.pendingProps,o=t.memoizedProps,u=a.value,ve(xs,s._currentValue),s._currentValue=u,o!==null)if(gt(o.value,u)){if(o.children===a.children&&!Je.current){t=Ot(e,t,r);break e}}else for(o=t.child,o!==null&&(o.return=t);o!==null;){var p=o.dependencies;if(p!==null){u=o.child;for(var h=p.firstContext;h!==null;){if(h.context===s){if(o.tag===1){h=It(-1,r&-r),h.tag=2;var T=o.updateQueue;if(T!==null){T=T.shared;var D=T.pending;D===null?h.next=h:(h.next=D.next,D.next=h),T.pending=h}}o.lanes|=r,h=o.alternate,h!==null&&(h.lanes|=r),sl(o.return,r,t),p.lanes|=r;break}h=h.next}}else if(o.tag===10)u=o.type===t.type?null:o.child;else if(o.tag===18){if(u=o.return,u===null)throw Error(i(341));u.lanes|=r,p=u.alternate,p!==null&&(p.lanes|=r),sl(u,r,t),u=o.sibling}else u=o.child;if(u!==null)u.return=o;else for(u=o;u!==null;){if(u===t){u=null;break}if(o=u.sibling,o!==null){o.return=u.return,u=o;break}u=u.return}o=u}Qe(e,t,a.children,r),t=t.child}return t;case 9:return a=t.type,s=t.pendingProps.children,zr(t,r),a=pt(a),s=s(a),t.flags|=1,Qe(e,t,s,r),t.child;case 14:return s=t.type,a=vt(s,t.pendingProps),a=vt(s.type,a),Ec(e,t,s,a,r);case 15:return Cc(e,t,t.type,t.pendingProps,r);case 17:return s=t.type,a=t.pendingProps,a=t.elementType===s?a:vt(s,a),Ts(e,t),t.tag=1,Xe(s)?(e=!0,us(t)):e=!1,zr(t,r),yc(t,s,a),bl(t,s,a,r),Nl(null,t,s,!0,e,r);case 19:return Oc(e,t,r);case 22:return Tc(e,t,r)}throw Error(i(156,t.tag))};function au(e,t){return Fo(e,t)}function Xp(e,t,r,s){this.tag=e,this.key=r,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=s,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ft(e,t,r,s){return new Xp(e,t,r,s)}function Hl(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Zp(e){if(typeof e=="function")return Hl(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Ce)return 11;if(e===Te)return 14}return 2}function er(e,t){var r=e.alternate;return r===null?(r=ft(e.tag,t,e.key,e.mode),r.elementType=e.elementType,r.type=e.type,r.stateNode=e.stateNode,r.alternate=e,e.alternate=r):(r.pendingProps=t,r.type=e.type,r.flags=0,r.subtreeFlags=0,r.deletions=null),r.flags=e.flags&14680064,r.childLanes=e.childLanes,r.lanes=e.lanes,r.child=e.child,r.memoizedProps=e.memoizedProps,r.memoizedState=e.memoizedState,r.updateQueue=e.updateQueue,t=e.dependencies,r.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},r.sibling=e.sibling,r.index=e.index,r.ref=e.ref,r}function zs(e,t,r,s,a,o){var u=2;if(s=e,typeof e=="function")Hl(e)&&(u=1);else if(typeof e=="string")u=5;else e:switch(e){case oe:return yr(r.children,a,o,t);case fe:u=8,a|=8;break;case je:return e=ft(12,r,t,a|2),e.elementType=je,e.lanes=o,e;case $e:return e=ft(13,r,t,a),e.elementType=$e,e.lanes=o,e;case xe:return e=ft(19,r,t,a),e.elementType=xe,e.lanes=o,e;case ye:return Bs(r,a,o,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case De:u=10;break e;case Be:u=9;break e;case Ce:u=11;break e;case Te:u=14;break e;case Re:u=16,s=null;break e}throw Error(i(130,e==null?e:typeof e,""))}return t=ft(u,r,t,a),t.elementType=e,t.type=s,t.lanes=o,t}function yr(e,t,r,s){return e=ft(7,e,s,t),e.lanes=r,e}function Bs(e,t,r,s){return e=ft(22,e,s,t),e.elementType=ye,e.lanes=r,e.stateNode={isHidden:!1},e}function ql(e,t,r){return e=ft(6,e,null,t),e.lanes=r,e}function Wl(e,t,r){return t=ft(4,e.children!==null?e.children:[],e.key,t),t.lanes=r,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function em(e,t,r,s,a){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=va(0),this.expirationTimes=va(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=va(0),this.identifierPrefix=s,this.onRecoverableError=a,this.mutableSourceEagerHydrationData=null}function Gl(e,t,r,s,a,o,u,p,h){return e=new em(e,t,r,p,h),t===1?(t=1,o===!0&&(t|=8)):t=0,o=ft(3,null,null,t),e.current=o,o.stateNode=e,o.memoizedState={element:s,isDehydrated:r,cache:null,transitions:null,pendingSuspenseBoundaries:null},ll(o),e}function tm(e,t,r){var s=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ue,key:s==null?null:""+s,children:e,containerInfo:t,implementation:r}}function lu(e){if(!e)return qt;e=e._reactInternals;e:{if(lr(e)!==e||e.tag!==1)throw Error(i(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Xe(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(i(171))}if(e.tag===1){var r=e.type;if(Xe(r))return Ii(e,r,t)}return t}function ou(e,t,r,s,a,o,u,p,h){return e=Gl(r,s,!0,e,a,o,u,p,h),e.context=lu(null),r=e.current,s=Ke(),a=Xt(r),o=It(s,a),o.callback=t??null,Qt(r,o,a),e.current.lanes=a,en(e,a,s),tt(e,s),e}function Us(e,t,r,s){var a=t.current,o=Ke(),u=Xt(a);return r=lu(r),t.context===null?t.context=r:t.pendingContext=r,t=It(o,u),t.payload={element:e},s=s===void 0?null:s,s!==null&&(t.callback=s),e=Qt(a,t,u),e!==null&&(kt(e,a,u,o),ys(e,a,u)),u}function Vs(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function iu(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var r=e.retryLane;e.retryLane=r!==0&&r<t?r:t}}function Ql(e,t){iu(e,t),(e=e.alternate)&&iu(e,t)}function rm(){return null}var cu=typeof reportError=="function"?reportError:function(e){console.error(e)};function Kl(e){this._internalRoot=e}$s.prototype.render=Kl.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));Us(e,t,null,null)},$s.prototype.unmount=Kl.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;fr(function(){Us(null,e,null,null)}),t[Rt]=null}};function $s(e){this._internalRoot=e}$s.prototype.unstable_scheduleHydration=function(e){if(e){var t=Wo();e={blockedOn:null,target:e,priority:t};for(var r=0;r<Bt.length&&t!==0&&t<Bt[r].priority;r++);Bt.splice(r,0,e),r===0&&Ko(e)}};function Yl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Hs(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function uu(){}function nm(e,t,r,s,a){if(a){if(typeof s=="function"){var o=s;s=function(){var T=Vs(u);o.call(T)}}var u=ou(t,s,e,0,null,!1,!1,"",uu);return e._reactRootContainer=u,e[Rt]=u.current,fn(e.nodeType===8?e.parentNode:e),fr(),u}for(;a=e.lastChild;)e.removeChild(a);if(typeof s=="function"){var p=s;s=function(){var T=Vs(h);p.call(T)}}var h=Gl(e,0,!1,null,null,!1,!1,"",uu);return e._reactRootContainer=h,e[Rt]=h.current,fn(e.nodeType===8?e.parentNode:e),fr(function(){Us(t,h,r,s)}),h}function qs(e,t,r,s,a){var o=r._reactRootContainer;if(o){var u=o;if(typeof a=="function"){var p=a;a=function(){var h=Vs(u);p.call(h)}}Us(t,u,e,a)}else u=nm(r,t,e,a,s);return Vs(u)}Ho=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var r=Zr(t.pendingLanes);r!==0&&(ba(t,r|1),tt(t,_e()),(ce&6)===0&&(Hr=_e()+500,Wt()))}break;case 13:fr(function(){var s=Pt(e,1);if(s!==null){var a=Ke();kt(s,e,1,a)}}),Ql(e,1)}},wa=function(e){if(e.tag===13){var t=Pt(e,134217728);if(t!==null){var r=Ke();kt(t,e,134217728,r)}Ql(e,134217728)}},qo=function(e){if(e.tag===13){var t=Xt(e),r=Pt(e,t);if(r!==null){var s=Ke();kt(r,e,t,s)}Ql(e,t)}},Wo=function(){return he},Go=function(e,t){var r=he;try{return he=e,t()}finally{he=r}},ma=function(e,t,r){switch(t){case"input":if(aa(e,r),t=r.name,r.type==="radio"&&t!=null){for(r=e;r.parentNode;)r=r.parentNode;for(r=r.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<r.length;t++){var s=r[t];if(s!==e&&s.form===e.form){var a=is(s);if(!a)throw Error(i(90));go(s),aa(s,a)}}}break;case"textarea":ko(e,r);break;case"select":t=r.value,t!=null&&wr(e,!!r.multiple,t,!1)}},Lo=Ul,Ao=fr;var sm={usingClientEntryPoint:!1,Events:[yn,Lr,is,Ro,_o,Ul]},An={findFiberByHostInstance:or,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},am={bundleType:An.bundleType,version:An.version,rendererPackageName:An.rendererPackageName,rendererConfig:An.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:K.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Do(e),e===null?null:e.stateNode},findFiberByHostInstance:An.findFiberByHostInstance||rm,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Ws=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Ws.isDisabled&&Ws.supportsFiber)try{$n=Ws.inject(am),jt=Ws}catch{}}return rt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=sm,rt.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Yl(t))throw Error(i(200));return tm(e,t,null,r)},rt.createRoot=function(e,t){if(!Yl(e))throw Error(i(299));var r=!1,s="",a=cu;return t!=null&&(t.unstable_strictMode===!0&&(r=!0),t.identifierPrefix!==void 0&&(s=t.identifierPrefix),t.onRecoverableError!==void 0&&(a=t.onRecoverableError)),t=Gl(e,1,!1,null,null,r,!1,s,a),e[Rt]=t.current,fn(e.nodeType===8?e.parentNode:e),new Kl(t)},rt.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(i(188)):(e=Object.keys(e).join(","),Error(i(268,e)));return e=Do(t),e=e===null?null:e.stateNode,e},rt.flushSync=function(e){return fr(e)},rt.hydrate=function(e,t,r){if(!Hs(t))throw Error(i(200));return qs(null,e,t,!0,r)},rt.hydrateRoot=function(e,t,r){if(!Yl(e))throw Error(i(405));var s=r!=null&&r.hydratedSources||null,a=!1,o="",u=cu;if(r!=null&&(r.unstable_strictMode===!0&&(a=!0),r.identifierPrefix!==void 0&&(o=r.identifierPrefix),r.onRecoverableError!==void 0&&(u=r.onRecoverableError)),t=ou(t,null,e,1,r??null,a,!1,o,u),e[Rt]=t.current,fn(e),s)for(e=0;e<s.length;e++)r=s[e],a=r._getVersion,a=a(r._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[r,a]:t.mutableSourceEagerHydrationData.push(r,a);return new $s(t)},rt.render=function(e,t,r){if(!Hs(t))throw Error(i(200));return qs(null,e,t,!1,r)},rt.unmountComponentAtNode=function(e){if(!Hs(e))throw Error(i(40));return e._reactRootContainer?(fr(function(){qs(null,null,e,!1,function(){e._reactRootContainer=null,e[Rt]=null})}),!0):!1},rt.unstable_batchedUpdates=Ul,rt.unstable_renderSubtreeIntoContainer=function(e,t,r,s){if(!Hs(r))throw Error(i(200));if(e==null||e._reactInternals===void 0)throw Error(i(38));return qs(e,t,r,!1,s)},rt.version="18.3.1-next-f1338f8080-20240426",rt}var yu;function Bu(){if(yu)return Zl.exports;yu=1;function l(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l)}catch(c){console.error(c)}}return l(),Zl.exports=hm(),Zl.exports}var vu;function fm(){if(vu)return Gs;vu=1;var l=Bu();return Gs.createRoot=l.createRoot,Gs.hydrateRoot=l.hydrateRoot,Gs}var xm=fm();const gm=Fu(xm);Bu();/**
 * @remix-run/router v1.23.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function In(){return In=Object.assign?Object.assign.bind():function(l){for(var c=1;c<arguments.length;c++){var i=arguments[c];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(l[d]=i[d])}return l},In.apply(this,arguments)}var rr;(function(l){l.Pop="POP",l.Push="PUSH",l.Replace="REPLACE"})(rr||(rr={}));const bu="popstate";function ym(l){l===void 0&&(l={});function c(d,m){let{pathname:g,search:f,hash:E}=d.location;return so("",{pathname:g,search:f,hash:E},m.state&&m.state.usr||null,m.state&&m.state.key||"default")}function i(d,m){return typeof m=="string"?m:Qs(m)}return bm(c,i,null,l)}function Pe(l,c){if(l===!1||l===null||typeof l>"u")throw new Error(c)}function uo(l,c){if(!l){typeof console<"u"&&console.warn(c);try{throw new Error(c)}catch{}}}function vm(){return Math.random().toString(36).substr(2,8)}function wu(l,c){return{usr:l.state,key:l.key,idx:c}}function so(l,c,i,d){return i===void 0&&(i=null),In({pathname:typeof l=="string"?l:l.pathname,search:"",hash:""},typeof c=="string"?Wr(c):c,{state:i,key:c&&c.key||d||vm()})}function Qs(l){let{pathname:c="/",search:i="",hash:d=""}=l;return i&&i!=="?"&&(c+=i.charAt(0)==="?"?i:"?"+i),d&&d!=="#"&&(c+=d.charAt(0)==="#"?d:"#"+d),c}function Wr(l){let c={};if(l){let i=l.indexOf("#");i>=0&&(c.hash=l.substr(i),l=l.substr(0,i));let d=l.indexOf("?");d>=0&&(c.search=l.substr(d),l=l.substr(0,d)),l&&(c.pathname=l)}return c}function bm(l,c,i,d){d===void 0&&(d={});let{window:m=document.defaultView,v5Compat:g=!1}=d,f=m.history,E=rr.Pop,y=null,C=R();C==null&&(C=0,f.replaceState(In({},f.state,{idx:C}),""));function R(){return(f.state||{idx:null}).idx}function j(){E=rr.Pop;let b=R(),O=b==null?null:b-C;C=b,y&&y({action:E,location:w.location,delta:O})}function z(b,O){E=rr.Push;let L=so(w.location,b,O);C=R()+1;let M=wu(L,C),K=w.createHref(L);try{f.pushState(M,"",K)}catch(ee){if(ee instanceof DOMException&&ee.name==="DataCloneError")throw ee;m.location.assign(K)}g&&y&&y({action:E,location:w.location,delta:1})}function Q(b,O){E=rr.Replace;let L=so(w.location,b,O);C=R();let M=wu(L,C),K=w.createHref(L);f.replaceState(M,"",K),g&&y&&y({action:E,location:w.location,delta:0})}function S(b){let O=m.location.origin!=="null"?m.location.origin:m.location.href,L=typeof b=="string"?b:Qs(b);return L=L.replace(/ $/,"%20"),Pe(O,"No window.location.(origin|href) available to create URL for href: "+L),new URL(L,O)}let w={get action(){return E},get location(){return l(m,f)},listen(b){if(y)throw new Error("A history only accepts one active listener");return m.addEventListener(bu,j),y=b,()=>{m.removeEventListener(bu,j),y=null}},createHref(b){return c(m,b)},createURL:S,encodeLocation(b){let O=S(b);return{pathname:O.pathname,search:O.search,hash:O.hash}},push:z,replace:Q,go(b){return f.go(b)}};return w}var ku;(function(l){l.data="data",l.deferred="deferred",l.redirect="redirect",l.error="error"})(ku||(ku={}));function wm(l,c,i){return i===void 0&&(i="/"),km(l,c,i)}function km(l,c,i,d){let m=typeof c=="string"?Wr(c):c,g=po(m.pathname||"/",i);if(g==null)return null;let f=Uu(l);jm(f);let E=null;for(let y=0;E==null&&y<f.length;++y){let C=Om(g);E=Am(f[y],C)}return E}function Uu(l,c,i,d){c===void 0&&(c=[]),i===void 0&&(i=[]),d===void 0&&(d="");let m=(g,f,E)=>{let y={relativePath:E===void 0?g.path||"":E,caseSensitive:g.caseSensitive===!0,childrenIndex:f,route:g};y.relativePath.startsWith("/")&&(Pe(y.relativePath.startsWith(d),'Absolute route path "'+y.relativePath+'" nested under path '+('"'+d+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),y.relativePath=y.relativePath.slice(d.length));let C=nr([d,y.relativePath]),R=i.concat(y);g.children&&g.children.length>0&&(Pe(g.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+C+'".')),Uu(g.children,c,R,C)),!(g.path==null&&!g.index)&&c.push({path:C,score:_m(C,g.index),routesMeta:R})};return l.forEach((g,f)=>{var E;if(g.path===""||!((E=g.path)!=null&&E.includes("?")))m(g,f);else for(let y of Vu(g.path))m(g,f,y)}),c}function Vu(l){let c=l.split("/");if(c.length===0)return[];let[i,...d]=c,m=i.endsWith("?"),g=i.replace(/\?$/,"");if(d.length===0)return m?[g,""]:[g];let f=Vu(d.join("/")),E=[];return E.push(...f.map(y=>y===""?g:[g,y].join("/"))),m&&E.push(...f),E.map(y=>l.startsWith("/")&&y===""?"/":y)}function jm(l){l.sort((c,i)=>c.score!==i.score?i.score-c.score:Lm(c.routesMeta.map(d=>d.childrenIndex),i.routesMeta.map(d=>d.childrenIndex)))}const Nm=/^:[\w-]+$/,Sm=3,Em=2,Cm=1,Tm=10,Rm=-2,ju=l=>l==="*";function _m(l,c){let i=l.split("/"),d=i.length;return i.some(ju)&&(d+=Rm),c&&(d+=Em),i.filter(m=>!ju(m)).reduce((m,g)=>m+(Nm.test(g)?Sm:g===""?Cm:Tm),d)}function Lm(l,c){return l.length===c.length&&l.slice(0,-1).every((d,m)=>d===c[m])?l[l.length-1]-c[c.length-1]:0}function Am(l,c,i){let{routesMeta:d}=l,m={},g="/",f=[];for(let E=0;E<d.length;++E){let y=d[E],C=E===d.length-1,R=g==="/"?c:c.slice(g.length)||"/",j=Pm({path:y.relativePath,caseSensitive:y.caseSensitive,end:C},R),z=y.route;if(!j)return null;Object.assign(m,j.params),f.push({params:m,pathname:nr([g,j.pathname]),pathnameBase:Bm(nr([g,j.pathnameBase])),route:z}),j.pathnameBase!=="/"&&(g=nr([g,j.pathnameBase]))}return f}function Pm(l,c){typeof l=="string"&&(l={path:l,caseSensitive:!1,end:!0});let[i,d]=Im(l.path,l.caseSensitive,l.end),m=c.match(i);if(!m)return null;let g=m[0],f=g.replace(/(.)\/+$/,"$1"),E=m.slice(1);return{params:d.reduce((C,R,j)=>{let{paramName:z,isOptional:Q}=R;if(z==="*"){let w=E[j]||"";f=g.slice(0,g.length-w.length).replace(/(.)\/+$/,"$1")}const S=E[j];return Q&&!S?C[z]=void 0:C[z]=(S||"").replace(/%2F/g,"/"),C},{}),pathname:g,pathnameBase:f,pattern:l}}function Im(l,c,i){c===void 0&&(c=!1),i===void 0&&(i=!0),uo(l==="*"||!l.endsWith("*")||l.endsWith("/*"),'Route path "'+l+'" will be treated as if it were '+('"'+l.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+l.replace(/\*$/,"/*")+'".'));let d=[],m="^"+l.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(f,E,y)=>(d.push({paramName:E,isOptional:y!=null}),y?"/?([^\\/]+)?":"/([^\\/]+)"));return l.endsWith("*")?(d.push({paramName:"*"}),m+=l==="*"||l==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):i?m+="\\/*$":l!==""&&l!=="/"&&(m+="(?:(?=\\/|$))"),[new RegExp(m,c?void 0:"i"),d]}function Om(l){try{return l.split("/").map(c=>decodeURIComponent(c).replace(/\//g,"%2F")).join("/")}catch(c){return uo(!1,'The URL path "'+l+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+c+").")),l}}function po(l,c){if(c==="/")return l;if(!l.toLowerCase().startsWith(c.toLowerCase()))return null;let i=c.endsWith("/")?c.length-1:c.length,d=l.charAt(i);return d&&d!=="/"?null:l.slice(i)||"/"}const Dm=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Mm=l=>Dm.test(l);function Fm(l,c){c===void 0&&(c="/");let{pathname:i,search:d="",hash:m=""}=typeof l=="string"?Wr(l):l,g;if(i)if(Mm(i))g=i;else{if(i.includes("//")){let f=i;i=i.replace(/\/\/+/g,"/"),uo(!1,"Pathnames cannot have embedded double slashes - normalizing "+(f+" -> "+i))}i.startsWith("/")?g=Nu(i.substring(1),"/"):g=Nu(i,c)}else g=c;return{pathname:g,search:Um(d),hash:Vm(m)}}function Nu(l,c){let i=c.replace(/\/+$/,"").split("/");return l.split("/").forEach(m=>{m===".."?i.length>1&&i.pop():m!=="."&&i.push(m)}),i.length>1?i.join("/"):"/"}function ro(l,c,i,d){return"Cannot include a '"+l+"' character in a manually specified "+("`to."+c+"` field ["+JSON.stringify(d)+"].  Please separate it out to the ")+("`to."+i+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function zm(l){return l.filter((c,i)=>i===0||c.route.path&&c.route.path.length>0)}function $u(l,c){let i=zm(l);return c?i.map((d,m)=>m===i.length-1?d.pathname:d.pathnameBase):i.map(d=>d.pathnameBase)}function Hu(l,c,i,d){d===void 0&&(d=!1);let m;typeof l=="string"?m=Wr(l):(m=In({},l),Pe(!m.pathname||!m.pathname.includes("?"),ro("?","pathname","search",m)),Pe(!m.pathname||!m.pathname.includes("#"),ro("#","pathname","hash",m)),Pe(!m.search||!m.search.includes("#"),ro("#","search","hash",m)));let g=l===""||m.pathname==="",f=g?"/":m.pathname,E;if(f==null)E=i;else{let j=c.length-1;if(!d&&f.startsWith("..")){let z=f.split("/");for(;z[0]==="..";)z.shift(),j-=1;m.pathname=z.join("/")}E=j>=0?c[j]:"/"}let y=Fm(m,E),C=f&&f!=="/"&&f.endsWith("/"),R=(g||f===".")&&i.endsWith("/");return!y.pathname.endsWith("/")&&(C||R)&&(y.pathname+="/"),y}const nr=l=>l.join("/").replace(/\/\/+/g,"/"),Bm=l=>l.replace(/\/+$/,"").replace(/^\/*/,"/"),Um=l=>!l||l==="?"?"":l.startsWith("?")?l:"?"+l,Vm=l=>!l||l==="#"?"":l.startsWith("#")?l:"#"+l;function $m(l){return l!=null&&typeof l.status=="number"&&typeof l.statusText=="string"&&typeof l.internal=="boolean"&&"data"in l}const qu=["post","put","patch","delete"];new Set(qu);const Hm=["get",...qu];new Set(Hm);/**
 * React Router v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function On(){return On=Object.assign?Object.assign.bind():function(l){for(var c=1;c<arguments.length;c++){var i=arguments[c];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(l[d]=i[d])}return l},On.apply(this,arguments)}const mo=U.createContext(null),qm=U.createContext(null),vr=U.createContext(null),ta=U.createContext(null),ar=U.createContext({outlet:null,matches:[],isDataRoute:!1}),Wu=U.createContext(null);function Wm(l,c){let{relative:i}=c===void 0?{}:c;Dn()||Pe(!1);let{basename:d,navigator:m}=U.useContext(vr),{hash:g,pathname:f,search:E}=Ku(l,{relative:i}),y=f;return d!=="/"&&(y=f==="/"?d:nr([d,f])),m.createHref({pathname:y,search:E,hash:g})}function Dn(){return U.useContext(ta)!=null}function br(){return Dn()||Pe(!1),U.useContext(ta).location}function Gu(l){U.useContext(vr).static||U.useLayoutEffect(l)}function Qu(){let{isDataRoute:l}=U.useContext(ar);return l?oh():Gm()}function Gm(){Dn()||Pe(!1);let l=U.useContext(mo),{basename:c,future:i,navigator:d}=U.useContext(vr),{matches:m}=U.useContext(ar),{pathname:g}=br(),f=JSON.stringify($u(m,i.v7_relativeSplatPath)),E=U.useRef(!1);return Gu(()=>{E.current=!0}),U.useCallback(function(C,R){if(R===void 0&&(R={}),!E.current)return;if(typeof C=="number"){d.go(C);return}let j=Hu(C,JSON.parse(f),g,R.relative==="path");l==null&&c!=="/"&&(j.pathname=j.pathname==="/"?c:nr([c,j.pathname])),(R.replace?d.replace:d.push)(j,R.state,R)},[c,d,f,g,l])}const Qm=U.createContext(null);function Km(l){let c=U.useContext(ar).outlet;return c&&U.createElement(Qm.Provider,{value:l},c)}function Ku(l,c){let{relative:i}=c===void 0?{}:c,{future:d}=U.useContext(vr),{matches:m}=U.useContext(ar),{pathname:g}=br(),f=JSON.stringify($u(m,d.v7_relativeSplatPath));return U.useMemo(()=>Hu(l,JSON.parse(f),g,i==="path"),[l,f,g,i])}function Ym(l,c){return Jm(l,c)}function Jm(l,c,i,d){Dn()||Pe(!1);let{navigator:m}=U.useContext(vr),{matches:g}=U.useContext(ar),f=g[g.length-1],E=f?f.params:{};f&&f.pathname;let y=f?f.pathnameBase:"/";f&&f.route;let C=br(),R;if(c){var j;let b=typeof c=="string"?Wr(c):c;y==="/"||(j=b.pathname)!=null&&j.startsWith(y)||Pe(!1),R=b}else R=C;let z=R.pathname||"/",Q=z;if(y!=="/"){let b=y.replace(/^\//,"").split("/");Q="/"+z.replace(/^\//,"").split("/").slice(b.length).join("/")}let S=wm(l,{pathname:Q}),w=rh(S&&S.map(b=>Object.assign({},b,{params:Object.assign({},E,b.params),pathname:nr([y,m.encodeLocation?m.encodeLocation(b.pathname).pathname:b.pathname]),pathnameBase:b.pathnameBase==="/"?y:nr([y,m.encodeLocation?m.encodeLocation(b.pathnameBase).pathname:b.pathnameBase])})),g,i,d);return c&&w?U.createElement(ta.Provider,{value:{location:On({pathname:"/",search:"",hash:"",state:null,key:"default"},R),navigationType:rr.Pop}},w):w}function Xm(){let l=lh(),c=$m(l)?l.status+" "+l.statusText:l instanceof Error?l.message:JSON.stringify(l),i=l instanceof Error?l.stack:null,m={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return U.createElement(U.Fragment,null,U.createElement("h2",null,"Unexpected Application Error!"),U.createElement("h3",{style:{fontStyle:"italic"}},c),i?U.createElement("pre",{style:m},i):null,null)}const Zm=U.createElement(Xm,null);class eh extends U.Component{constructor(c){super(c),this.state={location:c.location,revalidation:c.revalidation,error:c.error}}static getDerivedStateFromError(c){return{error:c}}static getDerivedStateFromProps(c,i){return i.location!==c.location||i.revalidation!=="idle"&&c.revalidation==="idle"?{error:c.error,location:c.location,revalidation:c.revalidation}:{error:c.error!==void 0?c.error:i.error,location:i.location,revalidation:c.revalidation||i.revalidation}}componentDidCatch(c,i){console.error("React Router caught the following error during render",c,i)}render(){return this.state.error!==void 0?U.createElement(ar.Provider,{value:this.props.routeContext},U.createElement(Wu.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function th(l){let{routeContext:c,match:i,children:d}=l,m=U.useContext(mo);return m&&m.static&&m.staticContext&&(i.route.errorElement||i.route.ErrorBoundary)&&(m.staticContext._deepestRenderedBoundaryId=i.route.id),U.createElement(ar.Provider,{value:c},d)}function rh(l,c,i,d){var m;if(c===void 0&&(c=[]),i===void 0&&(i=null),d===void 0&&(d=null),l==null){var g;if(!i)return null;if(i.errors)l=i.matches;else if((g=d)!=null&&g.v7_partialHydration&&c.length===0&&!i.initialized&&i.matches.length>0)l=i.matches;else return null}let f=l,E=(m=i)==null?void 0:m.errors;if(E!=null){let R=f.findIndex(j=>j.route.id&&(E==null?void 0:E[j.route.id])!==void 0);R>=0||Pe(!1),f=f.slice(0,Math.min(f.length,R+1))}let y=!1,C=-1;if(i&&d&&d.v7_partialHydration)for(let R=0;R<f.length;R++){let j=f[R];if((j.route.HydrateFallback||j.route.hydrateFallbackElement)&&(C=R),j.route.id){let{loaderData:z,errors:Q}=i,S=j.route.loader&&z[j.route.id]===void 0&&(!Q||Q[j.route.id]===void 0);if(j.route.lazy||S){y=!0,C>=0?f=f.slice(0,C+1):f=[f[0]];break}}}return f.reduceRight((R,j,z)=>{let Q,S=!1,w=null,b=null;i&&(Q=E&&j.route.id?E[j.route.id]:void 0,w=j.route.errorElement||Zm,y&&(C<0&&z===0?(ih("route-fallback"),S=!0,b=null):C===z&&(S=!0,b=j.route.hydrateFallbackElement||null)));let O=c.concat(f.slice(0,z+1)),L=()=>{let M;return Q?M=w:S?M=b:j.route.Component?M=U.createElement(j.route.Component,null):j.route.element?M=j.route.element:M=R,U.createElement(th,{match:j,routeContext:{outlet:R,matches:O,isDataRoute:i!=null},children:M})};return i&&(j.route.ErrorBoundary||j.route.errorElement||z===0)?U.createElement(eh,{location:i.location,revalidation:i.revalidation,component:w,error:Q,children:L(),routeContext:{outlet:null,matches:O,isDataRoute:!0}}):L()},null)}var Yu=(function(l){return l.UseBlocker="useBlocker",l.UseRevalidator="useRevalidator",l.UseNavigateStable="useNavigate",l})(Yu||{}),Ju=(function(l){return l.UseBlocker="useBlocker",l.UseLoaderData="useLoaderData",l.UseActionData="useActionData",l.UseRouteError="useRouteError",l.UseNavigation="useNavigation",l.UseRouteLoaderData="useRouteLoaderData",l.UseMatches="useMatches",l.UseRevalidator="useRevalidator",l.UseNavigateStable="useNavigate",l.UseRouteId="useRouteId",l})(Ju||{});function nh(l){let c=U.useContext(mo);return c||Pe(!1),c}function sh(l){let c=U.useContext(qm);return c||Pe(!1),c}function ah(l){let c=U.useContext(ar);return c||Pe(!1),c}function Xu(l){let c=ah(),i=c.matches[c.matches.length-1];return i.route.id||Pe(!1),i.route.id}function lh(){var l;let c=U.useContext(Wu),i=sh(),d=Xu();return c!==void 0?c:(l=i.errors)==null?void 0:l[d]}function oh(){let{router:l}=nh(Yu.UseNavigateStable),c=Xu(Ju.UseNavigateStable),i=U.useRef(!1);return Gu(()=>{i.current=!0}),U.useCallback(function(m,g){g===void 0&&(g={}),i.current&&(typeof m=="number"?l.navigate(m):l.navigate(m,On({fromRouteId:c},g)))},[l,c])}const Su={};function ih(l,c,i){Su[l]||(Su[l]=!0)}function ch(l,c){l==null||l.v7_startTransition,l==null||l.v7_relativeSplatPath}function Eu(l){return Km(l.context)}function Ye(l){Pe(!1)}function uh(l){let{basename:c="/",children:i=null,location:d,navigationType:m=rr.Pop,navigator:g,static:f=!1,future:E}=l;Dn()&&Pe(!1);let y=c.replace(/^\/*/,"/"),C=U.useMemo(()=>({basename:y,navigator:g,static:f,future:On({v7_relativeSplatPath:!1},E)}),[y,E,g,f]);typeof d=="string"&&(d=Wr(d));let{pathname:R="/",search:j="",hash:z="",state:Q=null,key:S="default"}=d,w=U.useMemo(()=>{let b=po(R,y);return b==null?null:{location:{pathname:b,search:j,hash:z,state:Q,key:S},navigationType:m}},[y,R,j,z,Q,S,m]);return w==null?null:U.createElement(vr.Provider,{value:C},U.createElement(ta.Provider,{children:i,value:w}))}function dh(l){let{children:c,location:i}=l;return Ym(ao(c),i)}new Promise(()=>{});function ao(l,c){c===void 0&&(c=[]);let i=[];return U.Children.forEach(l,(d,m)=>{if(!U.isValidElement(d))return;let g=[...c,m];if(d.type===U.Fragment){i.push.apply(i,ao(d.props.children,g));return}d.type!==Ye&&Pe(!1),!d.props.index||!d.props.children||Pe(!1);let f={id:d.props.id||g.join("-"),caseSensitive:d.props.caseSensitive,element:d.props.element,Component:d.props.Component,index:d.props.index,path:d.props.path,loader:d.props.loader,action:d.props.action,errorElement:d.props.errorElement,ErrorBoundary:d.props.ErrorBoundary,hasErrorBoundary:d.props.ErrorBoundary!=null||d.props.errorElement!=null,shouldRevalidate:d.props.shouldRevalidate,handle:d.props.handle,lazy:d.props.lazy};d.props.children&&(f.children=ao(d.props.children,g)),i.push(f)}),i}/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function lo(){return lo=Object.assign?Object.assign.bind():function(l){for(var c=1;c<arguments.length;c++){var i=arguments[c];for(var d in i)Object.prototype.hasOwnProperty.call(i,d)&&(l[d]=i[d])}return l},lo.apply(this,arguments)}function ph(l,c){if(l==null)return{};var i={},d=Object.keys(l),m,g;for(g=0;g<d.length;g++)m=d[g],!(c.indexOf(m)>=0)&&(i[m]=l[m]);return i}function mh(l){return!!(l.metaKey||l.altKey||l.ctrlKey||l.shiftKey)}function hh(l,c){return l.button===0&&(!c||c==="_self")&&!mh(l)}const fh=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],xh="6";try{window.__reactRouterVersion=xh}catch{}const gh="startTransition",Cu=dm[gh];function yh(l){let{basename:c,children:i,future:d,window:m}=l,g=U.useRef();g.current==null&&(g.current=ym({window:m,v5Compat:!0}));let f=g.current,[E,y]=U.useState({action:f.action,location:f.location}),{v7_startTransition:C}=d||{},R=U.useCallback(j=>{C&&Cu?Cu(()=>y(j)):y(j)},[y,C]);return U.useLayoutEffect(()=>f.listen(R),[f,R]),U.useEffect(()=>ch(d),[d]),U.createElement(uh,{basename:c,children:i,location:E.location,navigationType:E.action,navigator:f,future:d})}const vh=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",bh=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,ct=U.forwardRef(function(c,i){let{onClick:d,relative:m,reloadDocument:g,replace:f,state:E,target:y,to:C,preventScrollReset:R,viewTransition:j}=c,z=ph(c,fh),{basename:Q}=U.useContext(vr),S,w=!1;if(typeof C=="string"&&bh.test(C)&&(S=C,vh))try{let M=new URL(window.location.href),K=C.startsWith("//")?new URL(M.protocol+C):new URL(C),ee=po(K.pathname,Q);K.origin===M.origin&&ee!=null?C=ee+K.search+K.hash:w=!0}catch{}let b=Wm(C,{relative:m}),O=wh(C,{replace:f,state:E,target:y,preventScrollReset:R,relative:m,viewTransition:j});function L(M){d&&d(M),M.defaultPrevented||O(M)}return U.createElement("a",lo({},z,{href:S||b,onClick:w||g?d:L,ref:i,target:y}))});var Tu;(function(l){l.UseScrollRestoration="useScrollRestoration",l.UseSubmit="useSubmit",l.UseSubmitFetcher="useSubmitFetcher",l.UseFetcher="useFetcher",l.useViewTransitionState="useViewTransitionState"})(Tu||(Tu={}));var Ru;(function(l){l.UseFetcher="useFetcher",l.UseFetchers="useFetchers",l.UseScrollRestoration="useScrollRestoration"})(Ru||(Ru={}));function wh(l,c){let{target:i,replace:d,state:m,preventScrollReset:g,relative:f,viewTransition:E}=c===void 0?{}:c,y=Qu(),C=br(),R=Ku(l,{relative:f});return U.useCallback(j=>{if(hh(j,i)){j.preventDefault();let z=d!==void 0?d:Qs(C)===Qs(R);y(l,{replace:z,state:m,preventScrollReset:g,relative:f,viewTransition:E})}},[C,y,R,d,m,i,l,g,f,E])}/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kh=l=>l.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Zu=(...l)=>l.filter((c,i,d)=>!!c&&c.trim()!==""&&d.indexOf(c)===i).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var jh={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nh=U.forwardRef(({color:l="currentColor",size:c=24,strokeWidth:i=2,absoluteStrokeWidth:d,className:m="",children:g,iconNode:f,...E},y)=>U.createElement("svg",{ref:y,...jh,width:c,height:c,stroke:l,strokeWidth:d?Number(i)*24/Number(c):i,className:Zu("lucide",m),...E},[...f.map(([C,R])=>U.createElement(C,R)),...Array.isArray(g)?g:[g]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=(l,c)=>{const i=U.forwardRef(({className:d,...m},g)=>U.createElement(Nh,{ref:g,iconNode:c,className:Zu(`lucide-${kh(l)}`,d),...m}));return i.displayName=`${l}`,i};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sh=ae("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Eh=ae("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ho=ae("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ch=ae("Box",[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Th=ae("ChartColumn",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _u=ae("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ks=ae("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rh=ae("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _h=ae("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lh=ae("Cloud",[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oo=ae("CodeXml",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ah=ae("Container",[["path",{d:"M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z",key:"1t2lqe"}],["path",{d:"M10 21.9V14L2.1 9.1",key:"o7czzq"}],["path",{d:"m10 14 11.9-6.9",key:"zm5e20"}],["path",{d:"M14 19.8v-8.1",key:"159ecu"}],["path",{d:"M18 17.5V9.4",key:"11uown"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lu=ae("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ys=ae("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ph=ae("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Au=ae("Gauge",[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ih=ae("GitBranch",[["line",{x1:"6",x2:"6",y1:"3",y2:"15",key:"17qcm7"}],["circle",{cx:"18",cy:"6",r:"3",key:"1h7g24"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["path",{d:"M18 9a9 9 0 0 1-9 9",key:"n2h4wq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Js=ae("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ed=ae("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fo=ae("GraduationCap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const td=ae("Layers",[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oh=ae("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dh=ae("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mh=ae("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fh=ae("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xs=ae("Network",[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rd=ae("Rocket",[["path",{d:"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",key:"m3kijz"}],["path",{d:"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",key:"1fmvmk"}],["path",{d:"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",key:"1f8sc4"}],["path",{d:"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",key:"qeys4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pu=ae("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zh=ae("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const io=ae("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bh=ae("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nd=ae("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uh=ae("TestTube",[["path",{d:"M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2",key:"125lnx"}],["path",{d:"M8.5 2h7",key:"csnxdl"}],["path",{d:"M14.5 16h-5",key:"1ox875"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vh=ae("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $h=ae("Workflow",[["rect",{width:"8",height:"8",x:"3",y:"3",rx:"2",key:"by2w9f"}],["path",{d:"M7 11v4a2 2 0 0 0 2 2h4",key:"xkn7yn"}],["rect",{width:"8",height:"8",x:"13",y:"13",rx:"2",key:"1cgmvn"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hh=ae("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zs=ae("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);function sd(l){var c,i,d="";if(typeof l=="string"||typeof l=="number")d+=l;else if(typeof l=="object")if(Array.isArray(l)){var m=l.length;for(c=0;c<m;c++)l[c]&&(i=sd(l[c]))&&(d&&(d+=" "),d+=i)}else for(i in l)l[i]&&(d&&(d+=" "),d+=i);return d}function sr(){for(var l,c,i=0,d="",m=arguments.length;i<m;i++)(l=arguments[i])&&(c=sd(l))&&(d&&(d+=" "),d+=c);return d}const ad=U.createContext(void 0);function qh({children:l}){const[c,i]=U.useState(()=>{if(typeof window<"u"){const m=localStorage.getItem("theme");return m||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}return"dark"});U.useEffect(()=>{const m=document.documentElement;c==="dark"?m.classList.add("dark"):m.classList.remove("dark"),localStorage.setItem("theme",c)},[c]);const d=()=>{i(m=>m==="dark"?"light":"dark")};return n.jsx(ad.Provider,{value:{theme:c,toggleTheme:d},children:l})}function Wh(){const l=U.useContext(ad);if(!l)throw new Error("useTheme must be used within a ThemeProvider");return l}const Gh=[{href:"/docs/getting-started",label:"Docs"},{href:"/docs/cli",label:"CLI"},{href:"/docs/orm",label:"ORM"},{href:"/learn",label:"Learn"}];function Qh(){const l=br(),{theme:c,toggleTheme:i}=Wh();return n.jsx("nav",{className:"fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50",children:n.jsx("div",{className:"max-w-7xl mx-auto px-4",children:n.jsxs("div",{className:"flex items-center justify-between h-14 sm:h-16",children:[n.jsxs(ct,{to:"/",className:"flex items-center gap-2 sm:gap-3 flex-shrink-0",children:[n.jsx("div",{className:"w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded-lg flex items-center justify-center font-bold text-white text-sm sm:text-base",children:"V"}),n.jsx("span",{className:"text-lg sm:text-xl font-bold text-slate-900 dark:text-white",children:"Vexor"})]}),n.jsxs("div",{className:"hidden sm:flex items-center gap-6",children:[Gh.map(d=>n.jsx(ct,{to:d.href,className:sr("nav-link text-sm",(d.href==="/learn"?l.pathname.startsWith("/learn"):l.pathname.startsWith(d.href))&&"active"),children:d.label},d.href)),n.jsxs("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"nav-link text-sm flex items-center gap-1",children:[n.jsx(Js,{className:"w-4 h-4"}),"GitHub"]})]}),n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("button",{onClick:i,className:"p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors","aria-label":"Toggle theme",children:c==="dark"?n.jsx(Bh,{className:"w-5 h-5"}):n.jsx(Fh,{className:"w-5 h-5"})}),n.jsx("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"sm:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",children:n.jsx(Js,{className:"w-5 h-5"})}),n.jsx(ct,{to:"/docs/getting-started",className:"hidden sm:inline-flex btn-primary text-sm py-2 px-4",children:"Get Started"})]})]})})})}const Kh=[{title:"Getting Started",links:[{href:"/docs/getting-started",label:"Introduction",icon:n.jsx(ho,{className:"w-4 h-4"})},{href:"/docs/getting-started#installation",label:"Installation"},{href:"/docs/getting-started#quick-start",label:"Quick Start"}]},{title:"CLI",links:[{href:"/docs/cli",label:"Overview",icon:n.jsx(nd,{className:"w-4 h-4"})},{href:"/docs/cli#new",label:"Create Project"},{href:"/docs/cli#generate",label:"Code Generation"},{href:"/docs/cli#add",label:"Add Integrations"},{href:"/docs/cli#db",label:"Database Commands"},{href:"/docs/cli#config",label:"Configuration"}]},{title:"Core Concepts",links:[{href:"/docs/core",label:"Overview",icon:n.jsx(Ch,{className:"w-4 h-4"})},{href:"/docs/core#routing",label:"Routing"},{href:"/docs/core#context",label:"Context"},{href:"/docs/core#validation",label:"Validation"}]},{title:"Vexor ORM",links:[{href:"/docs/orm",label:"Overview",icon:n.jsx(Ys,{className:"w-4 h-4"})},{href:"/docs/orm#schema",label:"Schema Definition"},{href:"/docs/orm#queries",label:"Query Builder"},{href:"/docs/orm#migrations",label:"Migrations"}]},{title:"Middleware",links:[{href:"/docs/middleware",label:"Overview",icon:n.jsx(td,{className:"w-4 h-4"})},{href:"/docs/middleware#cors",label:"CORS"},{href:"/docs/middleware#rate-limit",label:"Rate Limiting"}]},{title:"Real-time",links:[{href:"/docs/realtime",label:"Overview",icon:n.jsx(Zs,{className:"w-4 h-4"})},{href:"/docs/realtime#websocket",label:"WebSocket"},{href:"/docs/realtime#sse",label:"Server-Sent Events"}]},{title:"Deployment",links:[{href:"/docs/deployment",label:"Overview",icon:n.jsx(Lh,{className:"w-4 h-4"})},{href:"/docs/deployment#node",label:"Node.js"},{href:"/docs/deployment#bun",label:"Bun"},{href:"/docs/deployment#lambda",label:"AWS Lambda"}]},{title:"Learn: Fundamentals",links:[{href:"/learn/fundamentals",label:"Beginner Guide",icon:n.jsx(fo,{className:"w-4 h-4"})},{href:"/learn/fundamentals#http-basics",label:"HTTP & REST Basics"},{href:"/learn/fundamentals#typescript",label:"TypeScript Essentials"},{href:"/learn/fundamentals#first-api",label:"Your First API"},{href:"/learn/fundamentals#request-response",label:"Request & Response"},{href:"/learn/fundamentals#json",label:"Working with JSON"},{href:"/learn/fundamentals#restful-crud",label:"RESTful CRUD API"}]},{title:"Learn: Building APIs",links:[{href:"/learn/building-apis",label:"Intermediate Guide",icon:n.jsx(oo,{className:"w-4 h-4"})},{href:"/learn/building-apis#authentication",label:"Authentication & JWT"},{href:"/learn/building-apis#database",label:"Database Patterns"},{href:"/learn/building-apis#error-handling",label:"Error Handling"},{href:"/learn/building-apis#validation",label:"Input Validation"},{href:"/learn/building-apis#file-uploads",label:"File Uploads"},{href:"/learn/building-apis#testing",label:"Testing APIs"}]},{title:"Learn: Architecture",links:[{href:"/learn/architecture",label:"Advanced Guide",icon:n.jsx(Xs,{className:"w-4 h-4"})},{href:"/learn/architecture#system-design",label:"System Design"},{href:"/learn/architecture#microservices",label:"Microservices"},{href:"/learn/architecture#event-driven",label:"Event-Driven"},{href:"/learn/architecture#caching",label:"Caching Strategies"},{href:"/learn/architecture#performance",label:"Performance"}]},{title:"Learn: Production",links:[{href:"/learn/production",label:"Expert Guide",icon:n.jsx(rd,{className:"w-4 h-4"})},{href:"/learn/production#docker",label:"Docker & Containers"},{href:"/learn/production#monitoring",label:"Monitoring & Logging"},{href:"/learn/production#security",label:"Security Hardening"},{href:"/learn/production#cicd",label:"CI/CD Pipelines"},{href:"/learn/production#scaling",label:"Scaling & Clustering"},{href:"/learn/production#config",label:"Environment Config"}]}];function Yh({isOpen:l=!1,onClose:c}){const i=br(),d=Qu(),m=U.useCallback((f,E)=>{f.preventDefault();const[y,C]=E.split("#"),R=i.pathname;c==null||c(),C?y===R?setTimeout(()=>{const j=document.getElementById(C);j&&(j.scrollIntoView({behavior:"smooth",block:"start"}),window.history.pushState(null,"",E))},100):(d(y),setTimeout(()=>{const j=document.getElementById(C);j&&j.scrollIntoView({behavior:"smooth",block:"start"}),window.history.replaceState(null,"",E)},200)):(d(E),window.scrollTo({top:0,behavior:"smooth"}))},[i.pathname,d,c]);U.useEffect(()=>{if(i.hash){const f=i.hash.slice(1);setTimeout(()=>{const E=document.getElementById(f);E&&E.scrollIntoView({behavior:"smooth",block:"start"})},200)}},[i.pathname,i.hash]);const g=n.jsx("nav",{className:"p-3 sm:p-4 space-y-4 sm:space-y-6",children:Kh.map(f=>n.jsxs("div",{children:[n.jsx("h3",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3",children:f.title}),n.jsx("ul",{className:"space-y-0.5",children:f.links.map(E=>{const[y,C]=E.href.split("#"),R=C?i.pathname===y&&i.hash===`#${C}`:i.pathname===y&&!i.hash;return n.jsx("li",{children:n.jsxs("a",{href:E.href,onClick:j=>m(j,E.href),className:sr("flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",R?"text-vexor-600 bg-vexor-50 dark:text-vexor-400 dark:bg-vexor-500/10 font-medium":"text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"),children:[E.icon&&n.jsx("span",{className:"flex-shrink-0",children:E.icon}),n.jsx("span",{className:"truncate",children:E.label}),R&&n.jsx(Ks,{className:"w-3 h-3 ml-auto flex-shrink-0"})]})},E.href)})})]},f.title))});return n.jsxs(n.Fragment,{children:[n.jsx("aside",{className:"hidden lg:block fixed left-0 top-14 sm:top-16 bottom-0 w-64 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800/50 overflow-y-auto",children:g}),n.jsxs("div",{className:sr("fixed inset-0 z-50 lg:hidden transition-opacity duration-300",l?"opacity-100 pointer-events-auto":"opacity-0 pointer-events-none"),children:[n.jsx("div",{className:"absolute inset-0 bg-black/50 backdrop-blur-sm",onClick:c}),n.jsxs("aside",{className:sr("absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-out overflow-y-auto",l?"translate-x-0":"-translate-x-full"),children:[n.jsxs("div",{className:"sticky top-0 flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800",children:[n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("div",{className:"w-6 h-6 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded flex items-center justify-center font-bold text-white text-xs",children:"V"}),n.jsx("span",{className:"font-semibold text-slate-900 dark:text-white",children:"Documentation"})]}),n.jsx("button",{onClick:c,className:"p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",children:n.jsx(Hh,{className:"w-5 h-5"})})]}),g]})]})]})}function Jh(){const l=br(),[c,i]=U.useState(!1),d=l.pathname==="/"||l.pathname==="",m=l.pathname.startsWith("/docs")||l.pathname.startsWith("/learn");U.useEffect(()=>{i(!1),l.hash||window.scrollTo({top:0})},[l.pathname]),U.useEffect(()=>(c?document.body.style.overflow="hidden":document.body.style.overflow="",()=>{document.body.style.overflow=""}),[c]);const g=()=>{const f=l.pathname;return f.includes("/getting-started")?"Getting Started":f.includes("/cli")?"CLI":f.includes("/core")?"Core":f.includes("/orm")?"ORM":f.includes("/middleware")?"Middleware":f.includes("/realtime")?"Real-time":f.includes("/deployment")?"Deployment":f==="/learn"?"Learning Center":f.includes("/learn/fundamentals")?"Fundamentals":f.includes("/learn/building-apis")?"Building APIs":f.includes("/learn/architecture")?"Architecture":f.includes("/learn/production")?"Production":"Docs"};return n.jsxs("div",{className:"min-h-screen bg-white dark:bg-slate-950 transition-colors",children:[n.jsx(Qh,{}),m?n.jsx("div",{className:"pt-14 sm:pt-16",children:n.jsxs("div",{className:"flex",children:[n.jsx(Yh,{isOpen:c,onClose:()=>i(!1)}),n.jsxs("main",{className:"flex-1 lg:ml-64 min-w-0",children:[n.jsx("div",{className:"sticky top-14 sm:top-16 z-30 lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800",children:n.jsxs("div",{className:"flex items-center gap-3 px-4 py-3",children:[n.jsx("button",{onClick:()=>i(!0),className:"flex items-center justify-center w-9 h-9 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors","aria-label":"Open menu",children:n.jsx(Mh,{className:"w-5 h-5"})}),n.jsxs("div",{className:"flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400",children:[n.jsx("span",{children:l.pathname.startsWith("/learn")?"Learn":"Docs"}),n.jsx(Ks,{className:"w-4 h-4"}),n.jsx("span",{className:"font-medium text-slate-900 dark:text-white",children:g()})]})]})}),n.jsx("div",{className:"px-4 py-6 sm:px-6 sm:py-8 lg:px-8",children:n.jsx("div",{className:"max-w-4xl mx-auto",children:n.jsx(Eu,{})})})]})]})}):n.jsx("main",{className:d?"":"pt-14 sm:pt-16",children:n.jsx(Eu,{})})]})}var Xh=Object.create,ra=Object.defineProperty,Zh=Object.defineProperties,ef=Object.getOwnPropertyDescriptor,tf=Object.getOwnPropertyDescriptors,ld=Object.getOwnPropertyNames,ea=Object.getOwnPropertySymbols,rf=Object.getPrototypeOf,xo=Object.prototype.hasOwnProperty,od=Object.prototype.propertyIsEnumerable,Iu=(l,c,i)=>c in l?ra(l,c,{enumerable:!0,configurable:!0,writable:!0,value:i}):l[c]=i,Tt=(l,c)=>{for(var i in c||(c={}))xo.call(c,i)&&Iu(l,i,c[i]);if(ea)for(var i of ea(c))od.call(c,i)&&Iu(l,i,c[i]);return l},na=(l,c)=>Zh(l,tf(c)),id=(l,c)=>{var i={};for(var d in l)xo.call(l,d)&&c.indexOf(d)<0&&(i[d]=l[d]);if(l!=null&&ea)for(var d of ea(l))c.indexOf(d)<0&&od.call(l,d)&&(i[d]=l[d]);return i},nf=(l,c)=>function(){return c||(0,l[ld(l)[0]])((c={exports:{}}).exports,c),c.exports},sf=(l,c)=>{for(var i in c)ra(l,i,{get:c[i],enumerable:!0})},af=(l,c,i,d)=>{if(c&&typeof c=="object"||typeof c=="function")for(let m of ld(c))!xo.call(l,m)&&m!==i&&ra(l,m,{get:()=>c[m],enumerable:!(d=ef(c,m))||d.enumerable});return l},lf=(l,c,i)=>(i=l!=null?Xh(rf(l)):{},af(!l||!l.__esModule?ra(i,"default",{value:l,enumerable:!0}):i,l)),of=nf({"../../node_modules/.pnpm/prismjs@1.29.0_patch_hash=vrxx3pzkik6jpmgpayxfjunetu/node_modules/prismjs/prism.js"(l,c){var i=(function(){var d=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,m=0,g={},f={util:{encode:function S(w){return w instanceof E?new E(w.type,S(w.content),w.alias):Array.isArray(w)?w.map(S):w.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(S){return Object.prototype.toString.call(S).slice(8,-1)},objId:function(S){return S.__id||Object.defineProperty(S,"__id",{value:++m}),S.__id},clone:function S(w,b){b=b||{};var O,L;switch(f.util.type(w)){case"Object":if(L=f.util.objId(w),b[L])return b[L];O={},b[L]=O;for(var M in w)w.hasOwnProperty(M)&&(O[M]=S(w[M],b));return O;case"Array":return L=f.util.objId(w),b[L]?b[L]:(O=[],b[L]=O,w.forEach(function(K,ee){O[ee]=S(K,b)}),O);default:return w}},getLanguage:function(S){for(;S;){var w=d.exec(S.className);if(w)return w[1].toLowerCase();S=S.parentElement}return"none"},setLanguage:function(S,w){S.className=S.className.replace(RegExp(d,"gi"),""),S.classList.add("language-"+w)},isActive:function(S,w,b){for(var O="no-"+w;S;){var L=S.classList;if(L.contains(w))return!0;if(L.contains(O))return!1;S=S.parentElement}return!!b}},languages:{plain:g,plaintext:g,text:g,txt:g,extend:function(S,w){var b=f.util.clone(f.languages[S]);for(var O in w)b[O]=w[O];return b},insertBefore:function(S,w,b,O){O=O||f.languages;var L=O[S],M={};for(var K in L)if(L.hasOwnProperty(K)){if(K==w)for(var ee in b)b.hasOwnProperty(ee)&&(M[ee]=b[ee]);b.hasOwnProperty(K)||(M[K]=L[K])}var ue=O[S];return O[S]=M,f.languages.DFS(f.languages,function(oe,fe){fe===ue&&oe!=S&&(this[oe]=M)}),M},DFS:function S(w,b,O,L){L=L||{};var M=f.util.objId;for(var K in w)if(w.hasOwnProperty(K)){b.call(w,K,w[K],O||K);var ee=w[K],ue=f.util.type(ee);ue==="Object"&&!L[M(ee)]?(L[M(ee)]=!0,S(ee,b,null,L)):ue==="Array"&&!L[M(ee)]&&(L[M(ee)]=!0,S(ee,b,K,L))}}},plugins:{},highlight:function(S,w,b){var O={code:S,grammar:w,language:b};if(f.hooks.run("before-tokenize",O),!O.grammar)throw new Error('The language "'+O.language+'" has no grammar.');return O.tokens=f.tokenize(O.code,O.grammar),f.hooks.run("after-tokenize",O),E.stringify(f.util.encode(O.tokens),O.language)},tokenize:function(S,w){var b=w.rest;if(b){for(var O in b)w[O]=b[O];delete w.rest}var L=new R;return j(L,L.head,S),C(S,L,w,L.head,0),Q(L)},hooks:{all:{},add:function(S,w){var b=f.hooks.all;b[S]=b[S]||[],b[S].push(w)},run:function(S,w){var b=f.hooks.all[S];if(!(!b||!b.length))for(var O=0,L;L=b[O++];)L(w)}},Token:E};function E(S,w,b,O){this.type=S,this.content=w,this.alias=b,this.length=(O||"").length|0}E.stringify=function S(w,b){if(typeof w=="string")return w;if(Array.isArray(w)){var O="";return w.forEach(function(ue){O+=S(ue,b)}),O}var L={type:w.type,content:S(w.content,b),tag:"span",classes:["token",w.type],attributes:{},language:b},M=w.alias;M&&(Array.isArray(M)?Array.prototype.push.apply(L.classes,M):L.classes.push(M)),f.hooks.run("wrap",L);var K="";for(var ee in L.attributes)K+=" "+ee+'="'+(L.attributes[ee]||"").replace(/"/g,"&quot;")+'"';return"<"+L.tag+' class="'+L.classes.join(" ")+'"'+K+">"+L.content+"</"+L.tag+">"};function y(S,w,b,O){S.lastIndex=w;var L=S.exec(b);if(L&&O&&L[1]){var M=L[1].length;L.index+=M,L[0]=L[0].slice(M)}return L}function C(S,w,b,O,L,M){for(var K in b)if(!(!b.hasOwnProperty(K)||!b[K])){var ee=b[K];ee=Array.isArray(ee)?ee:[ee];for(var ue=0;ue<ee.length;++ue){if(M&&M.cause==K+","+ue)return;var oe=ee[ue],fe=oe.inside,je=!!oe.lookbehind,De=!!oe.greedy,Be=oe.alias;if(De&&!oe.pattern.global){var Ce=oe.pattern.toString().match(/[imsuy]*$/)[0];oe.pattern=RegExp(oe.pattern.source,Ce+"g")}for(var $e=oe.pattern||oe,xe=O.next,Te=L;xe!==w.tail&&!(M&&Te>=M.reach);Te+=xe.value.length,xe=xe.next){var Re=xe.value;if(w.length>S.length)return;if(!(Re instanceof E)){var ye=1,V;if(De){if(V=y($e,Te,S,je),!V||V.index>=S.length)break;var A=V.index,Z=V.index+V[0].length,$=Te;for($+=xe.value.length;A>=$;)xe=xe.next,$+=xe.value.length;if($-=xe.value.length,Te=$,xe.value instanceof E)continue;for(var v=xe;v!==w.tail&&($<Z||typeof v.value=="string");v=v.next)ye++,$+=v.value.length;ye--,Re=S.slice(Te,$),V.index-=Te}else if(V=y($e,0,Re,je),!V)continue;var A=V.index,re=V[0],ne=Re.slice(0,A),ie=Re.slice(A+re.length),le=Te+Re.length;M&&le>M.reach&&(M.reach=le);var pe=xe.prev;ne&&(pe=j(w,pe,ne),Te+=ne.length),z(w,pe,ye);var me=new E(K,fe?f.tokenize(re,fe):re,Be,re);if(xe=j(w,pe,me),ie&&j(w,xe,ie),ye>1){var ge={cause:K+","+ue,reach:le};C(S,w,b,xe.prev,Te,ge),M&&ge.reach>M.reach&&(M.reach=ge.reach)}}}}}}function R(){var S={value:null,prev:null,next:null},w={value:null,prev:S,next:null};S.next=w,this.head=S,this.tail=w,this.length=0}function j(S,w,b){var O=w.next,L={value:b,prev:w,next:O};return w.next=L,O.prev=L,S.length++,L}function z(S,w,b){for(var O=w.next,L=0;L<b&&O!==S.tail;L++)O=O.next;w.next=O,O.prev=w,S.length-=L}function Q(S){for(var w=[],b=S.head.next;b!==S.tail;)w.push(b.value),b=b.next;return w}return f})();c.exports=i,i.default=i}}),_=lf(of());_.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},_.languages.markup.tag.inside["attr-value"].inside.entity=_.languages.markup.entity,_.languages.markup.doctype.inside["internal-subset"].inside=_.languages.markup,_.hooks.add("wrap",function(l){l.type==="entity"&&(l.attributes.title=l.content.replace(/&amp;/,"&"))}),Object.defineProperty(_.languages.markup.tag,"addInlined",{value:function(l,d){var i={},i=(i["language-"+d]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:_.languages[d]},i.cdata=/^<!\[CDATA\[|\]\]>$/i,{"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:i}}),d=(i["language-"+d]={pattern:/[\s\S]+/,inside:_.languages[d]},{});d[l]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return l}),"i"),lookbehind:!0,greedy:!0,inside:i},_.languages.insertBefore("markup","cdata",d)}}),Object.defineProperty(_.languages.markup.tag,"addAttribute",{value:function(l,c){_.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+l+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[c,"language-"+c],inside:_.languages[c]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),_.languages.html=_.languages.markup,_.languages.mathml=_.languages.markup,_.languages.svg=_.languages.markup,_.languages.xml=_.languages.extend("markup",{}),_.languages.ssml=_.languages.xml,_.languages.atom=_.languages.xml,_.languages.rss=_.languages.xml,(function(l){var c={pattern:/\\[\\(){}[\]^$+*?|.]/,alias:"escape"},i=/\\(?:x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]+\}|0[0-7]{0,2}|[123][0-7]{2}|c[a-zA-Z]|.)/,d="(?:[^\\\\-]|"+i.source+")",d=RegExp(d+"-"+d),m={pattern:/(<|')[^<>']+(?=[>']$)/,lookbehind:!0,alias:"variable"};l.languages.regex={"char-class":{pattern:/((?:^|[^\\])(?:\\\\)*)\[(?:[^\\\]]|\\[\s\S])*\]/,lookbehind:!0,inside:{"char-class-negation":{pattern:/(^\[)\^/,lookbehind:!0,alias:"operator"},"char-class-punctuation":{pattern:/^\[|\]$/,alias:"punctuation"},range:{pattern:d,inside:{escape:i,"range-punctuation":{pattern:/-/,alias:"operator"}}},"special-escape":c,"char-set":{pattern:/\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},escape:i}},"special-escape":c,"char-set":{pattern:/\.|\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},backreference:[{pattern:/\\(?![123][0-7]{2})[1-9]/,alias:"keyword"},{pattern:/\\k<[^<>']+>/,alias:"keyword",inside:{"group-name":m}}],anchor:{pattern:/[$^]|\\[ABbGZz]/,alias:"function"},escape:i,group:[{pattern:/\((?:\?(?:<[^<>']+>|'[^<>']+'|[>:]|<?[=!]|[idmnsuxU]+(?:-[idmnsuxU]+)?:?))?/,alias:"punctuation",inside:{"group-name":m}},{pattern:/\)/,alias:"punctuation"}],quantifier:{pattern:/(?:[+*?]|\{\d+(?:,\d*)?\})[?+]?/,alias:"number"},alternation:{pattern:/\|/,alias:"keyword"}}})(_),_.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},_.languages.javascript=_.languages.extend("clike",{"class-name":[_.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),_.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,_.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:_.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:_.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:_.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:_.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:_.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),_.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:_.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),_.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),_.languages.markup&&(_.languages.markup.tag.addInlined("script","javascript"),_.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),_.languages.js=_.languages.javascript,_.languages.actionscript=_.languages.extend("javascript",{keyword:/\b(?:as|break|case|catch|class|const|default|delete|do|dynamic|each|else|extends|final|finally|for|function|get|if|implements|import|in|include|instanceof|interface|internal|is|namespace|native|new|null|override|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|use|var|void|while|with)\b/,operator:/\+\+|--|(?:[+\-*\/%^]|&&?|\|\|?|<<?|>>?>?|[!=]=?)=?|[~?@]/}),_.languages.actionscript["class-name"].alias="function",delete _.languages.actionscript.parameter,delete _.languages.actionscript["literal-property"],_.languages.markup&&_.languages.insertBefore("actionscript","string",{xml:{pattern:/(^|[^.])<\/?\w+(?:\s+[^\s>\/=]+=("|')(?:\\[\s\S]|(?!\2)[^\\])*\2)*\s*\/?>/,lookbehind:!0,inside:_.languages.markup}}),(function(l){var c=/#(?!\{).+/,i={pattern:/#\{[^}]+\}/,alias:"variable"};l.languages.coffeescript=l.languages.extend("javascript",{comment:c,string:[{pattern:/'(?:\\[\s\S]|[^\\'])*'/,greedy:!0},{pattern:/"(?:\\[\s\S]|[^\\"])*"/,greedy:!0,inside:{interpolation:i}}],keyword:/\b(?:and|break|by|catch|class|continue|debugger|delete|do|each|else|extend|extends|false|finally|for|if|in|instanceof|is|isnt|let|loop|namespace|new|no|not|null|of|off|on|or|own|return|super|switch|then|this|throw|true|try|typeof|undefined|unless|until|when|while|window|with|yes|yield)\b/,"class-member":{pattern:/@(?!\d)\w+/,alias:"variable"}}),l.languages.insertBefore("coffeescript","comment",{"multiline-comment":{pattern:/###[\s\S]+?###/,alias:"comment"},"block-regex":{pattern:/\/{3}[\s\S]*?\/{3}/,alias:"regex",inside:{comment:c,interpolation:i}}}),l.languages.insertBefore("coffeescript","string",{"inline-javascript":{pattern:/`(?:\\[\s\S]|[^\\`])*`/,inside:{delimiter:{pattern:/^`|`$/,alias:"punctuation"},script:{pattern:/[\s\S]+/,alias:"language-javascript",inside:l.languages.javascript}}},"multiline-string":[{pattern:/'''[\s\S]*?'''/,greedy:!0,alias:"string"},{pattern:/"""[\s\S]*?"""/,greedy:!0,alias:"string",inside:{interpolation:i}}]}),l.languages.insertBefore("coffeescript","keyword",{property:/(?!\d)\w+(?=\s*:(?!:))/}),delete l.languages.coffeescript["template-string"],l.languages.coffee=l.languages.coffeescript})(_),(function(l){var c=l.languages.javadoclike={parameter:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*@(?:arg|arguments|param)\s+)\w+/m,lookbehind:!0},keyword:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,lookbehind:!0},punctuation:/[{}]/};Object.defineProperty(c,"addSupport",{value:function(i,d){(i=typeof i=="string"?[i]:i).forEach(function(m){var g=function(j){j.inside||(j.inside={}),j.inside.rest=d},f="doc-comment";if(E=l.languages[m]){var E,y=E[f];if((y=y||(E=l.languages.insertBefore(m,"comment",{"doc-comment":{pattern:/(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/,lookbehind:!0,alias:"comment"}}))[f])instanceof RegExp&&(y=E[f]={pattern:y}),Array.isArray(y))for(var C=0,R=y.length;C<R;C++)y[C]instanceof RegExp&&(y[C]={pattern:y[C]}),g(y[C]);else g(y)}})}}),c.addSupport(["java","javascript","php"],c)})(_),(function(l){var c=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/,c=(l.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+c.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+c.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+c.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+c.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:c,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},l.languages.css.atrule.inside.rest=l.languages.css,l.languages.markup);c&&(c.tag.addInlined("style","css"),c.tag.addAttribute("style","css"))})(_),(function(l){var c=/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,c=(l.languages.css.selector={pattern:l.languages.css.selector.pattern,lookbehind:!0,inside:c={"pseudo-element":/:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,"pseudo-class":/:[-\w]+/,class:/\.[-\w]+/,id:/#[-\w]+/,attribute:{pattern:RegExp(`\\[(?:[^[\\]"']|`+c.source+")*\\]"),greedy:!0,inside:{punctuation:/^\[|\]$/,"case-sensitivity":{pattern:/(\s)[si]$/i,lookbehind:!0,alias:"keyword"},namespace:{pattern:/^(\s*)(?:(?!\s)[-*\w\xA0-\uFFFF])*\|(?!=)/,lookbehind:!0,inside:{punctuation:/\|$/}},"attr-name":{pattern:/^(\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+/,lookbehind:!0},"attr-value":[c,{pattern:/(=\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+(?=\s*$)/,lookbehind:!0}],operator:/[|~*^$]?=/}},"n-th":[{pattern:/(\(\s*)[+-]?\d*[\dn](?:\s*[+-]\s*\d+)?(?=\s*\))/,lookbehind:!0,inside:{number:/[\dn]+/,operator:/[+-]/}},{pattern:/(\(\s*)(?:even|odd)(?=\s*\))/i,lookbehind:!0}],combinator:/>|\+|~|\|\|/,punctuation:/[(),]/}},l.languages.css.atrule.inside["selector-function-argument"].inside=c,l.languages.insertBefore("css","property",{variable:{pattern:/(^|[^-\w\xA0-\uFFFF])--(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*/i,lookbehind:!0}}),{pattern:/(\b\d+)(?:%|[a-z]+(?![\w-]))/,lookbehind:!0}),i={pattern:/(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/,lookbehind:!0};l.languages.insertBefore("css","function",{operator:{pattern:/(\s)[+\-*\/](?=\s)/,lookbehind:!0},hexcode:{pattern:/\B#[\da-f]{3,8}\b/i,alias:"color"},color:[{pattern:/(^|[^\w-])(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGr[ae]y|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGr[ae]y|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGr[ae]y|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gr[ae]y|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGr[ae]y|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGr[ae]y|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGr[ae]y|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Transparent|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)(?![\w-])/i,lookbehind:!0},{pattern:/\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,inside:{unit:c,number:i,function:/[\w-]+(?=\()/,punctuation:/[(),]/}}],entity:/\\[\da-f]{1,8}/i,unit:c,number:i})})(_),(function(l){var c=/[*&][^\s[\]{},]+/,i=/!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/,d="(?:"+i.source+"(?:[ 	]+"+c.source+")?|"+c.source+"(?:[ 	]+"+i.source+")?)",m=/(?:[^\s\x00-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source.replace(/<PLAIN>/g,function(){return/[^\s\x00-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/.source}),g=/"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source;function f(E,y){y=(y||"").replace(/m/g,"")+"m";var C=/([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:[\r\n]\s*)?#))/.source.replace(/<<prop>>/g,function(){return d}).replace(/<<value>>/g,function(){return E});return RegExp(C,y)}l.languages.yaml={scalar:{pattern:RegExp(/([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\S[^\r\n]*(?:\2[^\r\n]+)*)/.source.replace(/<<prop>>/g,function(){return d})),lookbehind:!0,alias:"string"},comment:/#.*/,key:{pattern:RegExp(/((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source.replace(/<<prop>>/g,function(){return d}).replace(/<<key>>/g,function(){return"(?:"+m+"|"+g+")"})),lookbehind:!0,greedy:!0,alias:"atrule"},directive:{pattern:/(^[ \t]*)%.+/m,lookbehind:!0,alias:"important"},datetime:{pattern:f(/\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source),lookbehind:!0,alias:"number"},boolean:{pattern:f(/false|true/.source,"i"),lookbehind:!0,alias:"important"},null:{pattern:f(/null|~/.source,"i"),lookbehind:!0,alias:"important"},string:{pattern:f(g),lookbehind:!0,greedy:!0},number:{pattern:f(/[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source,"i"),lookbehind:!0},tag:i,important:c,punctuation:/---|[:[\]{}\-,|>?]|\.\.\./},l.languages.yml=l.languages.yaml})(_),(function(l){var c=/(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;function i(C){return C=C.replace(/<inner>/g,function(){return c}),RegExp(/((?:^|[^\\])(?:\\{2})*)/.source+"(?:"+C+")")}var d=/(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source,m=/\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(/__/g,function(){return d}),g=/\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source,f=(l.languages.markdown=l.languages.extend("markup",{}),l.languages.insertBefore("markdown","prolog",{"front-matter-block":{pattern:/(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,lookbehind:!0,greedy:!0,inside:{punctuation:/^---|---$/,"front-matter":{pattern:/\S+(?:\s+\S+)*/,alias:["yaml","language-yaml"],inside:l.languages.yaml}}},blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},table:{pattern:RegExp("^"+m+g+"(?:"+m+")*","m"),inside:{"table-data-rows":{pattern:RegExp("^("+m+g+")(?:"+m+")*$"),lookbehind:!0,inside:{"table-data":{pattern:RegExp(d),inside:l.languages.markdown},punctuation:/\|/}},"table-line":{pattern:RegExp("^("+m+")"+g+"$"),lookbehind:!0,inside:{punctuation:/\||:?-{3,}:?/}},"table-header-row":{pattern:RegExp("^"+m+"$"),inside:{"table-header":{pattern:RegExp(d),alias:"important",inside:l.languages.markdown},punctuation:/\|/}}}},code:[{pattern:/((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,lookbehind:!0,alias:"keyword"},{pattern:/^```[\s\S]*?^```$/m,greedy:!0,inside:{"code-block":{pattern:/^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,lookbehind:!0},"code-language":{pattern:/^(```).+/,lookbehind:!0},punctuation:/```/}}],title:[{pattern:/\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:i(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^..)[\s\S]+(?=..$)/,lookbehind:!0,inside:{}},punctuation:/\*\*|__/}},italic:{pattern:i(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^.)[\s\S]+(?=.$)/,lookbehind:!0,inside:{}},punctuation:/[*_]/}},strike:{pattern:i(/(~~?)(?:(?!~)<inner>)+\2/.source),lookbehind:!0,greedy:!0,inside:{content:{pattern:/(^~~?)[\s\S]+(?=\1$)/,lookbehind:!0,inside:{}},punctuation:/~~?/}},"code-snippet":{pattern:/(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,lookbehind:!0,greedy:!0,alias:["code","keyword"]},url:{pattern:i(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source),lookbehind:!0,greedy:!0,inside:{operator:/^!/,content:{pattern:/(^\[)[^\]]+(?=\])/,lookbehind:!0,inside:{}},variable:{pattern:/(^\][ \t]?\[)[^\]]+(?=\]$)/,lookbehind:!0},url:{pattern:/(^\]\()[^\s)]+/,lookbehind:!0},string:{pattern:/(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,lookbehind:!0}}}}),["url","bold","italic","strike"].forEach(function(C){["url","bold","italic","strike","code-snippet"].forEach(function(R){C!==R&&(l.languages.markdown[C].inside.content.inside[R]=l.languages.markdown[R])})}),l.hooks.add("after-tokenize",function(C){C.language!=="markdown"&&C.language!=="md"||(function R(j){if(j&&typeof j!="string")for(var z=0,Q=j.length;z<Q;z++){var S,w=j[z];w.type!=="code"?R(w.content):(S=w.content[1],w=w.content[3],S&&w&&S.type==="code-language"&&w.type==="code-block"&&typeof S.content=="string"&&(S=S.content.replace(/\b#/g,"sharp").replace(/\b\+\+/g,"pp"),S="language-"+(S=(/[a-z][\w-]*/i.exec(S)||[""])[0].toLowerCase()),w.alias?typeof w.alias=="string"?w.alias=[w.alias,S]:w.alias.push(S):w.alias=[S]))}})(C.tokens)}),l.hooks.add("wrap",function(C){if(C.type==="code-block"){for(var R="",j=0,z=C.classes.length;j<z;j++){var Q=C.classes[j],Q=/language-(.+)/.exec(Q);if(Q){R=Q[1];break}}var S,w=l.languages[R];w?C.content=l.highlight((function(b){return b=b.replace(f,""),b=b.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi,function(O,L){var M;return(L=L.toLowerCase())[0]==="#"?(M=L[1]==="x"?parseInt(L.slice(2),16):Number(L.slice(1)),y(M)):E[L]||O})})(C.content),w,R):R&&R!=="none"&&l.plugins.autoloader&&(S="md-"+new Date().valueOf()+"-"+Math.floor(1e16*Math.random()),C.attributes.id=S,l.plugins.autoloader.loadLanguages(R,function(){var b=document.getElementById(S);b&&(b.innerHTML=l.highlight(b.textContent,l.languages[R],R))}))}}),RegExp(l.languages.markup.tag.pattern.source,"gi")),E={amp:"&",lt:"<",gt:">",quot:'"'},y=String.fromCodePoint||String.fromCharCode;l.languages.md=l.languages.markdown})(_),_.languages.graphql={comment:/#.*/,description:{pattern:/(?:"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*")(?=\s*[a-z_])/i,greedy:!0,alias:"string",inside:{"language-markdown":{pattern:/(^"(?:"")?)(?!\1)[\s\S]+(?=\1$)/,lookbehind:!0,inside:_.languages.markdown}}},string:{pattern:/"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*"/,greedy:!0},number:/(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,boolean:/\b(?:false|true)\b/,variable:/\$[a-z_]\w*/i,directive:{pattern:/@[a-z_]\w*/i,alias:"function"},"attr-name":{pattern:/\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i,greedy:!0},"atom-input":{pattern:/\b[A-Z]\w*Input\b/,alias:"class-name"},scalar:/\b(?:Boolean|Float|ID|Int|String)\b/,constant:/\b[A-Z][A-Z_\d]*\b/,"class-name":{pattern:/(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/,lookbehind:!0},fragment:{pattern:/(\bfragment\s+|\.{3}\s*(?!on\b))[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},"definition-mutation":{pattern:/(\bmutation\s+)[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},"definition-query":{pattern:/(\bquery\s+)[a-zA-Z_]\w*/,lookbehind:!0,alias:"function"},keyword:/\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/,operator:/[!=|&]|\.{3}/,"property-query":/\w+(?=\s*\()/,object:/\w+(?=\s*\{)/,punctuation:/[!(){}\[\]:=,]/,property:/\w+/},_.hooks.add("after-tokenize",function(l){if(l.language==="graphql")for(var c=l.tokens.filter(function(S){return typeof S!="string"&&S.type!=="comment"&&S.type!=="scalar"}),i=0;i<c.length;){var d=c[i++];if(d.type==="keyword"&&d.content==="mutation"){var m=[];if(j(["definition-mutation","punctuation"])&&R(1).content==="("){i+=2;var g=z(/^\($/,/^\)$/);if(g===-1)continue;for(;i<g;i++){var f=R(0);f.type==="variable"&&(Q(f,"variable-input"),m.push(f.content))}i=g+1}if(j(["punctuation","property-query"])&&R(0).content==="{"&&(i++,Q(R(0),"property-mutation"),0<m.length)){var E=z(/^\{$/,/^\}$/);if(E!==-1)for(var y=i;y<E;y++){var C=c[y];C.type==="variable"&&0<=m.indexOf(C.content)&&Q(C,"variable-input")}}}}function R(S){return c[i+S]}function j(S,w){w=w||0;for(var b=0;b<S.length;b++){var O=R(b+w);if(!O||O.type!==S[b])return}return 1}function z(S,w){for(var b=1,O=i;O<c.length;O++){var L=c[O],M=L.content;if(L.type==="punctuation"&&typeof M=="string"){if(S.test(M))b++;else if(w.test(M)&&--b===0)return O}}return-1}function Q(S,w){var b=S.alias;b?Array.isArray(b)||(S.alias=b=[b]):S.alias=b=[],b.push(w)}}),_.languages.sql={comment:{pattern:/(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,lookbehind:!0},variable:[{pattern:/@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,greedy:!0},/@[\w.$]+/],string:{pattern:/(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,greedy:!0,lookbehind:!0},identifier:{pattern:/(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,greedy:!0,lookbehind:!0,inside:{punctuation:/^`|`$/}},function:/\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i,keyword:/\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,boolean:/\b(?:FALSE|NULL|TRUE)\b/i,number:/\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,operator:/[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,punctuation:/[;[\]()`,.]/},(function(l){var c=l.languages.javascript["template-string"],i=c.pattern.source,d=c.inside.interpolation,m=d.inside["interpolation-punctuation"],g=d.pattern.source;function f(j,z){if(l.languages[j])return{pattern:RegExp("((?:"+z+")\\s*)"+i),lookbehind:!0,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},"embedded-code":{pattern:/[\s\S]+/,alias:j}}}}function E(j,z,Q){return j={code:j,grammar:z,language:Q},l.hooks.run("before-tokenize",j),j.tokens=l.tokenize(j.code,j.grammar),l.hooks.run("after-tokenize",j),j.tokens}function y(j,z,Q){var b=l.tokenize(j,{interpolation:{pattern:RegExp(g),lookbehind:!0}}),S=0,w={},b=E(b.map(function(L){if(typeof L=="string")return L;for(var M,K,L=L.content;j.indexOf((K=S++,M="___"+Q.toUpperCase()+"_"+K+"___"))!==-1;);return w[M]=L,M}).join(""),z,Q),O=Object.keys(w);return S=0,(function L(M){for(var K=0;K<M.length;K++){if(S>=O.length)return;var ee,ue,oe,fe,je,De,Be,Ce=M[K];typeof Ce=="string"||typeof Ce.content=="string"?(ee=O[S],(Be=(De=typeof Ce=="string"?Ce:Ce.content).indexOf(ee))!==-1&&(++S,ue=De.substring(0,Be),je=w[ee],oe=void 0,(fe={})["interpolation-punctuation"]=m,(fe=l.tokenize(je,fe)).length===3&&((oe=[1,1]).push.apply(oe,E(fe[1],l.languages.javascript,"javascript")),fe.splice.apply(fe,oe)),oe=new l.Token("interpolation",fe,d.alias,je),fe=De.substring(Be+ee.length),je=[],ue&&je.push(ue),je.push(oe),fe&&(L(De=[fe]),je.push.apply(je,De)),typeof Ce=="string"?(M.splice.apply(M,[K,1].concat(je)),K+=je.length-1):Ce.content=je)):(Be=Ce.content,Array.isArray(Be)?L(Be):L([Be]))}})(b),new l.Token(Q,b,"language-"+Q,j)}l.languages.javascript["template-string"]=[f("css",/\b(?:styled(?:\([^)]*\))?(?:\s*\.\s*\w+(?:\([^)]*\))*)*|css(?:\s*\.\s*(?:global|resolve))?|createGlobalStyle|keyframes)/.source),f("html",/\bhtml|\.\s*(?:inner|outer)HTML\s*\+?=/.source),f("svg",/\bsvg/.source),f("markdown",/\b(?:markdown|md)/.source),f("graphql",/\b(?:gql|graphql(?:\s*\.\s*experimental)?)/.source),f("sql",/\bsql/.source),c].filter(Boolean);var C={javascript:!0,js:!0,typescript:!0,ts:!0,jsx:!0,tsx:!0};function R(j){return typeof j=="string"?j:Array.isArray(j)?j.map(R).join(""):R(j.content)}l.hooks.add("after-tokenize",function(j){j.language in C&&(function z(Q){for(var S=0,w=Q.length;S<w;S++){var b,O,L,M=Q[S];typeof M!="string"&&(b=M.content,Array.isArray(b)?M.type==="template-string"?(M=b[1],b.length===3&&typeof M!="string"&&M.type==="embedded-code"&&(O=R(M),M=M.alias,M=Array.isArray(M)?M[0]:M,L=l.languages[M])&&(b[1]=y(O,L,M))):z(b):typeof b!="string"&&z([b]))}})(j.tokens)})})(_),(function(l){l.languages.typescript=l.languages.extend("javascript",{"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,lookbehind:!0,greedy:!0,inside:null},builtin:/\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/}),l.languages.typescript.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/,/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,/\btype\b(?=\s*(?:[\{*]|$))/),delete l.languages.typescript.parameter,delete l.languages.typescript["literal-property"];var c=l.languages.extend("typescript",{});delete c["class-name"],l.languages.typescript["class-name"].inside=c,l.languages.insertBefore("typescript","function",{decorator:{pattern:/@[$\w\xA0-\uFFFF]+/,inside:{at:{pattern:/^@/,alias:"operator"},function:/^[\s\S]+/}},"generic-function":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,greedy:!0,inside:{function:/^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:c}}}}),l.languages.ts=l.languages.typescript})(_),(function(l){var c=l.languages.javascript,i=/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})+\}/.source,d="(@(?:arg|argument|param|property)\\s+(?:"+i+"\\s+)?)";l.languages.jsdoc=l.languages.extend("javadoclike",{parameter:{pattern:RegExp(d+/(?:(?!\s)[$\w\xA0-\uFFFF.])+(?=\s|$)/.source),lookbehind:!0,inside:{punctuation:/\./}}}),l.languages.insertBefore("jsdoc","keyword",{"optional-parameter":{pattern:RegExp(d+/\[(?:(?!\s)[$\w\xA0-\uFFFF.])+(?:=[^[\]]+)?\](?=\s|$)/.source),lookbehind:!0,inside:{parameter:{pattern:/(^\[)[$\w\xA0-\uFFFF\.]+/,lookbehind:!0,inside:{punctuation:/\./}},code:{pattern:/(=)[\s\S]*(?=\]$)/,lookbehind:!0,inside:c,alias:"language-javascript"},punctuation:/[=[\]]/}},"class-name":[{pattern:RegExp(/(@(?:augments|class|extends|interface|memberof!?|template|this|typedef)\s+(?:<TYPE>\s+)?)[A-Z]\w*(?:\.[A-Z]\w*)*/.source.replace(/<TYPE>/g,function(){return i})),lookbehind:!0,inside:{punctuation:/\./}},{pattern:RegExp("(@[a-z]+\\s+)"+i),lookbehind:!0,inside:{string:c.string,number:c.number,boolean:c.boolean,keyword:l.languages.typescript.keyword,operator:/=>|\.\.\.|[&|?:*]/,punctuation:/[.,;=<>{}()[\]]/}}],example:{pattern:/(@example\s+(?!\s))(?:[^@\s]|\s+(?!\s))+?(?=\s*(?:\*\s*)?(?:@\w|\*\/))/,lookbehind:!0,inside:{code:{pattern:/^([\t ]*(?:\*\s*)?)\S.*$/m,lookbehind:!0,inside:c,alias:"language-javascript"}}}}),l.languages.javadoclike.addSupport("javascript",l.languages.jsdoc)})(_),(function(l){l.languages.flow=l.languages.extend("javascript",{}),l.languages.insertBefore("flow","keyword",{type:[{pattern:/\b(?:[Bb]oolean|Function|[Nn]umber|[Ss]tring|[Ss]ymbol|any|mixed|null|void)\b/,alias:"class-name"}]}),l.languages.flow["function-variable"].pattern=/(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=\s*(?:function\b|(?:\([^()]*\)(?:\s*:\s*\w+)?|(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/i,delete l.languages.flow.parameter,l.languages.insertBefore("flow","operator",{"flow-punctuation":{pattern:/\{\||\|\}/,alias:"punctuation"}}),Array.isArray(l.languages.flow.keyword)||(l.languages.flow.keyword=[l.languages.flow.keyword]),l.languages.flow.keyword.unshift({pattern:/(^|[^$]\b)(?:Class|declare|opaque|type)\b(?!\$)/,lookbehind:!0},{pattern:/(^|[^$]\B)\$(?:Diff|Enum|Exact|Keys|ObjMap|PropertyType|Record|Shape|Subtype|Supertype|await)\b(?!\$)/,lookbehind:!0})})(_),_.languages.n4js=_.languages.extend("javascript",{keyword:/\b(?:Array|any|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|module|new|null|number|package|private|protected|public|return|set|static|string|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/}),_.languages.insertBefore("n4js","constant",{annotation:{pattern:/@+\w+/,alias:"operator"}}),_.languages.n4jsd=_.languages.n4js,(function(l){function c(f,E){return RegExp(f.replace(/<ID>/g,function(){return/(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/.source}),E)}l.languages.insertBefore("javascript","function-variable",{"method-variable":{pattern:RegExp("(\\.\\s*)"+l.languages.javascript["function-variable"].pattern.source),lookbehind:!0,alias:["function-variable","method","function","property-access"]}}),l.languages.insertBefore("javascript","function",{method:{pattern:RegExp("(\\.\\s*)"+l.languages.javascript.function.source),lookbehind:!0,alias:["function","property-access"]}}),l.languages.insertBefore("javascript","constant",{"known-class-name":[{pattern:/\b(?:(?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)?Array|ArrayBuffer|BigInt|Boolean|DataView|Date|Error|Function|Intl|JSON|(?:Weak)?(?:Map|Set)|Math|Number|Object|Promise|Proxy|Reflect|RegExp|String|Symbol|WebAssembly)\b/,alias:"class-name"},{pattern:/\b(?:[A-Z]\w*)Error\b/,alias:"class-name"}]}),l.languages.insertBefore("javascript","keyword",{imports:{pattern:c(/(\bimport\b\s*)(?:<ID>(?:\s*,\s*(?:\*\s*as\s+<ID>|\{[^{}]*\}))?|\*\s*as\s+<ID>|\{[^{}]*\})(?=\s*\bfrom\b)/.source),lookbehind:!0,inside:l.languages.javascript},exports:{pattern:c(/(\bexport\b\s*)(?:\*(?:\s*as\s+<ID>)?(?=\s*\bfrom\b)|\{[^{}]*\})/.source),lookbehind:!0,inside:l.languages.javascript}}),l.languages.javascript.keyword.unshift({pattern:/\b(?:as|default|export|from|import)\b/,alias:"module"},{pattern:/\b(?:await|break|catch|continue|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/,alias:"control-flow"},{pattern:/\bnull\b/,alias:["null","nil"]},{pattern:/\bundefined\b/,alias:"nil"}),l.languages.insertBefore("javascript","operator",{spread:{pattern:/\.{3}/,alias:"operator"},arrow:{pattern:/=>/,alias:"operator"}}),l.languages.insertBefore("javascript","punctuation",{"property-access":{pattern:c(/(\.\s*)#?<ID>/.source),lookbehind:!0},"maybe-class-name":{pattern:/(^|[^$\w\xA0-\uFFFF])[A-Z][$\w\xA0-\uFFFF]+/,lookbehind:!0},dom:{pattern:/\b(?:document|(?:local|session)Storage|location|navigator|performance|window)\b/,alias:"variable"},console:{pattern:/\bconsole(?=\s*\.)/,alias:"class-name"}});for(var i=["function","function-variable","method","method-variable","property-access"],d=0;d<i.length;d++){var g=i[d],m=l.languages.javascript[g],g=(m=l.util.type(m)==="RegExp"?l.languages.javascript[g]={pattern:m}:m).inside||{};(m.inside=g)["maybe-class-name"]=/^[A-Z][\s\S]*/}})(_),(function(l){var c=l.util.clone(l.languages.javascript),i=/(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source,d=/(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source,m=/(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;function g(y,C){return y=y.replace(/<S>/g,function(){return i}).replace(/<BRACES>/g,function(){return d}).replace(/<SPREAD>/g,function(){return m}),RegExp(y,C)}m=g(m).source,l.languages.jsx=l.languages.extend("markup",c),l.languages.jsx.tag.pattern=g(/<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/.source),l.languages.jsx.tag.inside.tag.pattern=/^<\/?[^\s>\/]*/,l.languages.jsx.tag.inside["attr-value"].pattern=/=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/,l.languages.jsx.tag.inside.tag.inside["class-name"]=/^[A-Z]\w*(?:\.[A-Z]\w*)*$/,l.languages.jsx.tag.inside.comment=c.comment,l.languages.insertBefore("inside","attr-name",{spread:{pattern:g(/<SPREAD>/.source),inside:l.languages.jsx}},l.languages.jsx.tag),l.languages.insertBefore("inside","special-attr",{script:{pattern:g(/=<BRACES>/.source),alias:"language-javascript",inside:{"script-punctuation":{pattern:/^=(?=\{)/,alias:"punctuation"},rest:l.languages.jsx}}},l.languages.jsx.tag);function f(y){for(var C=[],R=0;R<y.length;R++){var j=y[R],z=!1;typeof j!="string"&&(j.type==="tag"&&j.content[0]&&j.content[0].type==="tag"?j.content[0].content[0].content==="</"?0<C.length&&C[C.length-1].tagName===E(j.content[0].content[1])&&C.pop():j.content[j.content.length-1].content!=="/>"&&C.push({tagName:E(j.content[0].content[1]),openedBraces:0}):0<C.length&&j.type==="punctuation"&&j.content==="{"?C[C.length-1].openedBraces++:0<C.length&&0<C[C.length-1].openedBraces&&j.type==="punctuation"&&j.content==="}"?C[C.length-1].openedBraces--:z=!0),(z||typeof j=="string")&&0<C.length&&C[C.length-1].openedBraces===0&&(z=E(j),R<y.length-1&&(typeof y[R+1]=="string"||y[R+1].type==="plain-text")&&(z+=E(y[R+1]),y.splice(R+1,1)),0<R&&(typeof y[R-1]=="string"||y[R-1].type==="plain-text")&&(z=E(y[R-1])+z,y.splice(R-1,1),R--),y[R]=new l.Token("plain-text",z,null,z)),j.content&&typeof j.content!="string"&&f(j.content)}}var E=function(y){return y?typeof y=="string"?y:typeof y.content=="string"?y.content:y.content.map(E).join(""):""};l.hooks.add("after-tokenize",function(y){y.language!=="jsx"&&y.language!=="tsx"||f(y.tokens)})})(_),(function(l){var c=l.util.clone(l.languages.typescript),c=(l.languages.tsx=l.languages.extend("jsx",c),delete l.languages.tsx.parameter,delete l.languages.tsx["literal-property"],l.languages.tsx.tag);c.pattern=RegExp(/(^|[^\w$]|(?=<\/))/.source+"(?:"+c.pattern.source+")",c.pattern.flags),c.lookbehind=!0})(_),_.languages.swift={comment:{pattern:/(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/,lookbehind:!0,greedy:!0},"string-literal":[{pattern:RegExp(/(^|[^"#])/.source+"(?:"+/"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/.source+"|"+/"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/.source+")"+/(?!["#])/.source),lookbehind:!0,greedy:!0,inside:{interpolation:{pattern:/(\\\()(?:[^()]|\([^()]*\))*(?=\))/,lookbehind:!0,inside:null},"interpolation-punctuation":{pattern:/^\)|\\\($/,alias:"punctuation"},punctuation:/\\(?=[\r\n])/,string:/[\s\S]+/}},{pattern:RegExp(/(^|[^"#])(#+)/.source+"(?:"+/"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/.source+"|"+/"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source+")\\2"),lookbehind:!0,greedy:!0,inside:{interpolation:{pattern:/(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/,lookbehind:!0,inside:null},"interpolation-punctuation":{pattern:/^\)|\\#+\($/,alias:"punctuation"},string:/[\s\S]+/}}],directive:{pattern:RegExp(/#/.source+"(?:"+/(?:elseif|if)\b/.source+"(?:[ 	]*"+/(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/.source+")+|"+/(?:else|endif)\b/.source+")"),alias:"property",inside:{"directive-name":/^#\w+/,boolean:/\b(?:false|true)\b/,number:/\b\d+(?:\.\d+)*\b/,operator:/!|&&|\|\||[<>]=?/,punctuation:/[(),]/}},literal:{pattern:/#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/,alias:"constant"},"other-directive":{pattern:/#\w+\b/,alias:"property"},attribute:{pattern:/@\w+/,alias:"atrule"},"function-definition":{pattern:/(\bfunc\s+)\w+/,lookbehind:!0,alias:"function"},label:{pattern:/\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/,lookbehind:!0,alias:"important"},keyword:/\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,boolean:/\b(?:false|true)\b/,nil:{pattern:/\bnil\b/,alias:"constant"},"short-argument":/\$\d+\b/,omit:{pattern:/\b_\b/,alias:"keyword"},number:/\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,"class-name":/\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/,function:/\b[a-z_]\w*(?=\s*\()/i,constant:/\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,operator:/[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/,punctuation:/[{}[\]();,.:\\]/},_.languages.swift["string-literal"].forEach(function(l){l.inside.interpolation.inside=_.languages.swift}),(function(l){l.languages.kotlin=l.languages.extend("clike",{keyword:{pattern:/(^|[^.])\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/,lookbehind:!0},function:[{pattern:/(?:`[^\r\n`]+`|\b\w+)(?=\s*\()/,greedy:!0},{pattern:/(\.)(?:`[^\r\n`]+`|\w+)(?=\s*\{)/,lookbehind:!0,greedy:!0}],number:/\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/,operator:/\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/}),delete l.languages.kotlin["class-name"];var c={"interpolation-punctuation":{pattern:/^\$\{?|\}$/,alias:"punctuation"},expression:{pattern:/[\s\S]+/,inside:l.languages.kotlin}};l.languages.insertBefore("kotlin","string",{"string-literal":[{pattern:/"""(?:[^$]|\$(?:(?!\{)|\{[^{}]*\}))*?"""/,alias:"multiline",inside:{interpolation:{pattern:/\$(?:[a-z_]\w*|\{[^{}]*\})/i,inside:c},string:/[\s\S]+/}},{pattern:/"(?:[^"\\\r\n$]|\\.|\$(?:(?!\{)|\{[^{}]*\}))*"/,alias:"singleline",inside:{interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$(?:[a-z_]\w*|\{[^{}]*\})/i,lookbehind:!0,inside:c},string:/[\s\S]+/}}],char:{pattern:/'(?:[^'\\\r\n]|\\(?:.|u[a-fA-F0-9]{0,4}))'/,greedy:!0}}),delete l.languages.kotlin.string,l.languages.insertBefore("kotlin","keyword",{annotation:{pattern:/\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/,alias:"builtin"}}),l.languages.insertBefore("kotlin","function",{label:{pattern:/\b\w+@|@\w+\b/,alias:"symbol"}}),l.languages.kt=l.languages.kotlin,l.languages.kts=l.languages.kotlin})(_),_.languages.c=_.languages.extend("clike",{comment:{pattern:/\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},string:{pattern:/"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,greedy:!0},"class-name":{pattern:/(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,lookbehind:!0},keyword:/\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,function:/\b[a-z_]\w*(?=\s*\()/i,number:/(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,operator:/>>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/}),_.languages.insertBefore("c","string",{char:{pattern:/'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,greedy:!0}}),_.languages.insertBefore("c","string",{macro:{pattern:/(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,lookbehind:!0,greedy:!0,alias:"property",inside:{string:[{pattern:/^(#\s*include\s*)<[^>]+>/,lookbehind:!0},_.languages.c.string],char:_.languages.c.char,comment:_.languages.c.comment,"macro-name":[{pattern:/(^#\s*define\s+)\w+\b(?!\()/i,lookbehind:!0},{pattern:/(^#\s*define\s+)\w+\b(?=\()/i,lookbehind:!0,alias:"function"}],directive:{pattern:/^(#\s*)[a-z]+/,lookbehind:!0,alias:"keyword"},"directive-hash":/^#/,punctuation:/##|\\(?=[\r\n])/,expression:{pattern:/\S[\s\S]*/,inside:_.languages.c}}}}),_.languages.insertBefore("c","function",{constant:/\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/}),delete _.languages.c.boolean,_.languages.objectivec=_.languages.extend("c",{string:{pattern:/@?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,greedy:!0},keyword:/\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,operator:/-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/}),delete _.languages.objectivec["class-name"],_.languages.objc=_.languages.objectivec,_.languages.reason=_.languages.extend("clike",{string:{pattern:/"(?:\\(?:\r\n|[\s\S])|[^\\\r\n"])*"/,greedy:!0},"class-name":/\b[A-Z]\w*/,keyword:/\b(?:and|as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|sig|struct|switch|then|to|try|type|val|virtual|when|while|with)\b/,operator:/\.{3}|:[:=]|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/}),_.languages.insertBefore("reason","class-name",{char:{pattern:/'(?:\\x[\da-f]{2}|\\o[0-3][0-7][0-7]|\\\d{3}|\\.|[^'\\\r\n])'/,greedy:!0},constructor:/\b[A-Z]\w*\b(?!\s*\.)/,label:{pattern:/\b[a-z]\w*(?=::)/,alias:"symbol"}}),delete _.languages.reason.function,(function(l){for(var c=/\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source,i=0;i<2;i++)c=c.replace(/<self>/g,function(){return c});c=c.replace(/<self>/g,function(){return/[^\s\S]/.source}),l.languages.rust={comment:[{pattern:RegExp(/(^|[^\\])/.source+c),lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/,greedy:!0},char:{pattern:/b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,greedy:!0},attribute:{pattern:/#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/,greedy:!0,alias:"attr-name",inside:{string:null}},"closure-params":{pattern:/([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/,lookbehind:!0,greedy:!0,inside:{"closure-punctuation":{pattern:/^\||\|$/,alias:"punctuation"},rest:null}},"lifetime-annotation":{pattern:/'\w+/,alias:"symbol"},"fragment-specifier":{pattern:/(\$\w+:)[a-z]+/,lookbehind:!0,alias:"punctuation"},variable:/\$\w+/,"function-definition":{pattern:/(\bfn\s+)\w+/,lookbehind:!0,alias:"function"},"type-definition":{pattern:/(\b(?:enum|struct|trait|type|union)\s+)\w+/,lookbehind:!0,alias:"class-name"},"module-declaration":[{pattern:/(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/,lookbehind:!0,alias:"namespace"},{pattern:/(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/,lookbehind:!0,alias:"namespace",inside:{punctuation:/::/}}],keyword:[/\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,/\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/],function:/\b[a-z_]\w*(?=\s*(?:::\s*<|\())/,macro:{pattern:/\b\w+!/,alias:"property"},constant:/\b[A-Z_][A-Z_\d]+\b/,"class-name":/\b[A-Z]\w*\b/,namespace:{pattern:/(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/,inside:{punctuation:/::/}},number:/\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/,boolean:/\b(?:false|true)\b/,punctuation:/->|\.\.=|\.{1,3}|::|[{}[\];(),:]/,operator:/[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/},l.languages.rust["closure-params"].inside.rest=l.languages.rust,l.languages.rust.attribute.inside.string=l.languages.rust.string})(_),_.languages.go=_.languages.extend("clike",{string:{pattern:/(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/,lookbehind:!0,greedy:!0},keyword:/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,boolean:/\b(?:_|false|iota|nil|true)\b/,number:[/\b0(?:b[01_]+|o[0-7_]+)i?\b/i,/\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i,/(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i],operator:/[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,builtin:/\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/}),_.languages.insertBefore("go","string",{char:{pattern:/'(?:\\.|[^'\\\r\n]){0,10}'/,greedy:!0}}),delete _.languages.go["class-name"],(function(l){var c=/\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,i=/\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(/<keyword>/g,function(){return c.source});l.languages.cpp=l.languages.extend("c",{"class-name":[{pattern:RegExp(/(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source.replace(/<keyword>/g,function(){return c.source})),lookbehind:!0},/\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,/\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,/\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/],keyword:c,number:{pattern:/(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,greedy:!0},operator:/>>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,boolean:/\b(?:false|true)\b/}),l.languages.insertBefore("cpp","string",{module:{pattern:RegExp(/(\b(?:import|module)\s+)/.source+"(?:"+/"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source+"|"+/<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(/<mod-name>/g,function(){return i})+")"),lookbehind:!0,greedy:!0,inside:{string:/^[<"][\s\S]+/,operator:/:/,punctuation:/\./}},"raw-string":{pattern:/R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,alias:"string",greedy:!0}}),l.languages.insertBefore("cpp","keyword",{"generic-function":{pattern:/\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i,inside:{function:/^\w+/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:l.languages.cpp}}}}),l.languages.insertBefore("cpp","operator",{"double-colon":{pattern:/::/,alias:"punctuation"}}),l.languages.insertBefore("cpp","class-name",{"base-clause":{pattern:/(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,lookbehind:!0,greedy:!0,inside:l.languages.extend("cpp",{})}}),l.languages.insertBefore("inside","double-colon",{"class-name":/\b[a-z_]\w*\b(?!\s*::)/i},l.languages.cpp["base-clause"])})(_),_.languages.python={comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0,greedy:!0},"string-interpolation":{pattern:/(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,greedy:!0,inside:{interpolation:{pattern:/((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,lookbehind:!0,inside:{"format-spec":{pattern:/(:)[^:(){}]+(?=\}$)/,lookbehind:!0},"conversion-option":{pattern:/![sra](?=[:}]$)/,alias:"punctuation"},rest:null}},string:/[\s\S]+/}},"triple-quoted-string":{pattern:/(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,greedy:!0,alias:"string"},string:{pattern:/(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,greedy:!0},function:{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)\w+/i,lookbehind:!0},decorator:{pattern:/(^[\t ]*)@\w+(?:\.\w+)*/m,lookbehind:!0,alias:["annotation","punctuation"],inside:{punctuation:/\./}},keyword:/\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,builtin:/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,boolean:/\b(?:False|None|True)\b/,number:/\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,operator:/[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,punctuation:/[{}[\];(),.:]/},_.languages.python["string-interpolation"].inside.interpolation.inside.rest=_.languages.python,_.languages.py=_.languages.python,_.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},_.languages.webmanifest=_.languages.json;var cd={};sf(cd,{dracula:()=>uf,duotoneDark:()=>pf,duotoneLight:()=>hf,github:()=>xf,gruvboxMaterialDark:()=>qf,gruvboxMaterialLight:()=>Gf,jettwaveDark:()=>Mf,jettwaveLight:()=>zf,nightOwl:()=>yf,nightOwlLight:()=>bf,oceanicNext:()=>kf,okaidia:()=>Nf,oneDark:()=>Uf,oneLight:()=>$f,palenight:()=>Ef,shadesOfPurple:()=>Tf,synthwave84:()=>_f,ultramin:()=>Af,vsDark:()=>ud,vsLight:()=>Of});var cf={plain:{color:"#F8F8F2",backgroundColor:"#282A36"},styles:[{types:["prolog","constant","builtin"],style:{color:"rgb(189, 147, 249)"}},{types:["inserted","function"],style:{color:"rgb(80, 250, 123)"}},{types:["deleted"],style:{color:"rgb(255, 85, 85)"}},{types:["changed"],style:{color:"rgb(255, 184, 108)"}},{types:["punctuation","symbol"],style:{color:"rgb(248, 248, 242)"}},{types:["string","char","tag","selector"],style:{color:"rgb(255, 121, 198)"}},{types:["keyword","variable"],style:{color:"rgb(189, 147, 249)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(98, 114, 164)"}},{types:["attr-name"],style:{color:"rgb(241, 250, 140)"}}]},uf=cf,df={plain:{backgroundColor:"#2a2734",color:"#9a86fd"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#6c6783"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#e09142"}},{types:["property","function"],style:{color:"#9a86fd"}},{types:["tag-id","selector","atrule-id"],style:{color:"#eeebff"}},{types:["attr-name"],style:{color:"#c4b9fe"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","atrule","placeholder","variable"],style:{color:"#ffcc99"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#c4b9fe"}}]},pf=df,mf={plain:{backgroundColor:"#faf8f5",color:"#728fcb"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#b6ad9a"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#063289"}},{types:["property","function"],style:{color:"#b29762"}},{types:["tag-id","selector","atrule-id"],style:{color:"#2d2006"}},{types:["attr-name"],style:{color:"#896724"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","atrule"],style:{color:"#728fcb"}},{types:["placeholder","variable"],style:{color:"#93abdc"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#896724"}}]},hf=mf,ff={plain:{color:"#393A34",backgroundColor:"#f6f8fa"},styles:[{types:["comment","prolog","doctype","cdata"],style:{color:"#999988",fontStyle:"italic"}},{types:["namespace"],style:{opacity:.7}},{types:["string","attr-value"],style:{color:"#e3116c"}},{types:["punctuation","operator"],style:{color:"#393A34"}},{types:["entity","url","symbol","number","boolean","variable","constant","property","regex","inserted"],style:{color:"#36acaa"}},{types:["atrule","keyword","attr-name","selector"],style:{color:"#00a4db"}},{types:["function","deleted","tag"],style:{color:"#d73a49"}},{types:["function-variable"],style:{color:"#6f42c1"}},{types:["tag","selector","keyword"],style:{color:"#00009f"}}]},xf=ff,gf={plain:{color:"#d6deeb",backgroundColor:"#011627"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)",fontStyle:"italic"}},{types:["inserted","attr-name"],style:{color:"rgb(173, 219, 103)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(99, 119, 119)",fontStyle:"italic"}},{types:["string","url"],style:{color:"rgb(173, 219, 103)"}},{types:["variable"],style:{color:"rgb(214, 222, 235)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation"],style:{color:"rgb(199, 146, 234)"}},{types:["selector","doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["class-name"],style:{color:"rgb(255, 203, 139)"}},{types:["tag","operator","keyword"],style:{color:"rgb(127, 219, 202)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["property"],style:{color:"rgb(128, 203, 196)"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}}]},yf=gf,vf={plain:{color:"#403f53",backgroundColor:"#FBFBFB"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)",fontStyle:"italic"}},{types:["inserted","attr-name"],style:{color:"rgb(72, 118, 214)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(152, 159, 177)",fontStyle:"italic"}},{types:["string","builtin","char","constant","url"],style:{color:"rgb(72, 118, 214)"}},{types:["variable"],style:{color:"rgb(201, 103, 101)"}},{types:["number"],style:{color:"rgb(170, 9, 130)"}},{types:["punctuation"],style:{color:"rgb(153, 76, 195)"}},{types:["function","selector","doctype"],style:{color:"rgb(153, 76, 195)",fontStyle:"italic"}},{types:["class-name"],style:{color:"rgb(17, 17, 17)"}},{types:["tag"],style:{color:"rgb(153, 76, 195)"}},{types:["operator","property","keyword","namespace"],style:{color:"rgb(12, 150, 155)"}},{types:["boolean"],style:{color:"rgb(188, 84, 84)"}}]},bf=vf,it={char:"#D8DEE9",comment:"#999999",keyword:"#c5a5c5",primitive:"#5a9bcf",string:"#8dc891",variable:"#d7deea",boolean:"#ff8b50",tag:"#fc929e",function:"#79b6f2",className:"#FAC863"},wf={plain:{backgroundColor:"#282c34",color:"#ffffff"},styles:[{types:["attr-name"],style:{color:it.keyword}},{types:["attr-value"],style:{color:it.string}},{types:["comment","block-comment","prolog","doctype","cdata","shebang"],style:{color:it.comment}},{types:["property","number","function-name","constant","symbol","deleted"],style:{color:it.primitive}},{types:["boolean"],style:{color:it.boolean}},{types:["tag"],style:{color:it.tag}},{types:["string"],style:{color:it.string}},{types:["punctuation"],style:{color:it.string}},{types:["selector","char","builtin","inserted"],style:{color:it.char}},{types:["function"],style:{color:it.function}},{types:["operator","entity","url","variable"],style:{color:it.variable}},{types:["keyword"],style:{color:it.keyword}},{types:["atrule","class-name"],style:{color:it.className}},{types:["important"],style:{fontWeight:"400"}},{types:["bold"],style:{fontWeight:"bold"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["namespace"],style:{opacity:.7}}]},kf=wf,jf={plain:{color:"#f8f8f2",backgroundColor:"#272822"},styles:[{types:["changed"],style:{color:"rgb(162, 191, 252)",fontStyle:"italic"}},{types:["deleted"],style:{color:"#f92672",fontStyle:"italic"}},{types:["inserted"],style:{color:"rgb(173, 219, 103)",fontStyle:"italic"}},{types:["comment"],style:{color:"#8292a2",fontStyle:"italic"}},{types:["string","url"],style:{color:"#a6e22e"}},{types:["variable"],style:{color:"#f8f8f2"}},{types:["number"],style:{color:"#ae81ff"}},{types:["builtin","char","constant","function","class-name"],style:{color:"#e6db74"}},{types:["punctuation"],style:{color:"#f8f8f2"}},{types:["selector","doctype"],style:{color:"#a6e22e",fontStyle:"italic"}},{types:["tag","operator","keyword"],style:{color:"#66d9ef"}},{types:["boolean"],style:{color:"#ae81ff"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)",opacity:.7}},{types:["tag","property"],style:{color:"#f92672"}},{types:["attr-name"],style:{color:"#a6e22e !important"}},{types:["doctype"],style:{color:"#8292a2"}},{types:["rule"],style:{color:"#e6db74"}}]},Nf=jf,Sf={plain:{color:"#bfc7d5",backgroundColor:"#292d3e"},styles:[{types:["comment"],style:{color:"rgb(105, 112, 152)",fontStyle:"italic"}},{types:["string","inserted"],style:{color:"rgb(195, 232, 141)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation","selector"],style:{color:"rgb(199, 146, 234)"}},{types:["variable"],style:{color:"rgb(191, 199, 213)"}},{types:["class-name","attr-name"],style:{color:"rgb(255, 203, 107)"}},{types:["tag","deleted"],style:{color:"rgb(255, 85, 114)"}},{types:["operator"],style:{color:"rgb(137, 221, 255)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["keyword"],style:{fontStyle:"italic"}},{types:["doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}},{types:["url"],style:{color:"rgb(221, 221, 221)"}}]},Ef=Sf,Cf={plain:{color:"#9EFEFF",backgroundColor:"#2D2A55"},styles:[{types:["changed"],style:{color:"rgb(255, 238, 128)"}},{types:["deleted"],style:{color:"rgba(239, 83, 80, 0.56)"}},{types:["inserted"],style:{color:"rgb(173, 219, 103)"}},{types:["comment"],style:{color:"rgb(179, 98, 255)",fontStyle:"italic"}},{types:["punctuation"],style:{color:"rgb(255, 255, 255)"}},{types:["constant"],style:{color:"rgb(255, 98, 140)"}},{types:["string","url"],style:{color:"rgb(165, 255, 144)"}},{types:["variable"],style:{color:"rgb(255, 238, 128)"}},{types:["number","boolean"],style:{color:"rgb(255, 98, 140)"}},{types:["attr-name"],style:{color:"rgb(255, 180, 84)"}},{types:["keyword","operator","property","namespace","tag","selector","doctype"],style:{color:"rgb(255, 157, 0)"}},{types:["builtin","char","constant","function","class-name"],style:{color:"rgb(250, 208, 0)"}}]},Tf=Cf,Rf={plain:{backgroundColor:"linear-gradient(to bottom, #2a2139 75%, #34294f)",backgroundImage:"#34294f",color:"#f92aad",textShadow:"0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"},styles:[{types:["comment","block-comment","prolog","doctype","cdata"],style:{color:"#495495",fontStyle:"italic"}},{types:["punctuation"],style:{color:"#ccc"}},{types:["tag","attr-name","namespace","number","unit","hexcode","deleted"],style:{color:"#e2777a"}},{types:["property","selector"],style:{color:"#72f1b8",textShadow:"0 0 2px #100c0f, 0 0 10px #257c5575, 0 0 35px #21272475"}},{types:["function-name"],style:{color:"#6196cc"}},{types:["boolean","selector-id","function"],style:{color:"#fdfdfd",textShadow:"0 0 2px #001716, 0 0 3px #03edf975, 0 0 5px #03edf975, 0 0 8px #03edf975"}},{types:["class-name","maybe-class-name","builtin"],style:{color:"#fff5f6",textShadow:"0 0 2px #000, 0 0 10px #fc1f2c75, 0 0 5px #fc1f2c75, 0 0 25px #fc1f2c75"}},{types:["constant","symbol"],style:{color:"#f92aad",textShadow:"0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"}},{types:["important","atrule","keyword","selector-class"],style:{color:"#f4eee4",textShadow:"0 0 2px #393a33, 0 0 8px #f39f0575, 0 0 2px #f39f0575"}},{types:["string","char","attr-value","regex","variable"],style:{color:"#f87c32"}},{types:["parameter"],style:{fontStyle:"italic"}},{types:["entity","url"],style:{color:"#67cdcc"}},{types:["operator"],style:{color:"ffffffee"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["entity"],style:{cursor:"help"}},{types:["inserted"],style:{color:"green"}}]},_f=Rf,Lf={plain:{color:"#282a2e",backgroundColor:"#ffffff"},styles:[{types:["comment"],style:{color:"rgb(197, 200, 198)"}},{types:["string","number","builtin","variable"],style:{color:"rgb(150, 152, 150)"}},{types:["class-name","function","tag","attr-name"],style:{color:"rgb(40, 42, 46)"}}]},Af=Lf,Pf={plain:{color:"#9CDCFE",backgroundColor:"#1E1E1E"},styles:[{types:["prolog"],style:{color:"rgb(0, 0, 128)"}},{types:["comment"],style:{color:"rgb(106, 153, 85)"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"rgb(86, 156, 214)"}},{types:["number","inserted"],style:{color:"rgb(181, 206, 168)"}},{types:["constant"],style:{color:"rgb(100, 102, 149)"}},{types:["attr-name","variable"],style:{color:"rgb(156, 220, 254)"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"rgb(206, 145, 120)"}},{types:["selector"],style:{color:"rgb(215, 186, 125)"}},{types:["tag"],style:{color:"rgb(78, 201, 176)"}},{types:["tag"],languages:["markup"],style:{color:"rgb(86, 156, 214)"}},{types:["punctuation","operator"],style:{color:"rgb(212, 212, 212)"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"rgb(220, 220, 170)"}},{types:["class-name"],style:{color:"rgb(78, 201, 176)"}},{types:["char"],style:{color:"rgb(209, 105, 105)"}}]},ud=Pf,If={plain:{color:"#000000",backgroundColor:"#ffffff"},styles:[{types:["comment"],style:{color:"rgb(0, 128, 0)"}},{types:["builtin"],style:{color:"rgb(0, 112, 193)"}},{types:["number","variable","inserted"],style:{color:"rgb(9, 134, 88)"}},{types:["operator"],style:{color:"rgb(0, 0, 0)"}},{types:["constant","char"],style:{color:"rgb(129, 31, 63)"}},{types:["tag"],style:{color:"rgb(128, 0, 0)"}},{types:["attr-name"],style:{color:"rgb(255, 0, 0)"}},{types:["deleted","string"],style:{color:"rgb(163, 21, 21)"}},{types:["changed","punctuation"],style:{color:"rgb(4, 81, 165)"}},{types:["function","keyword"],style:{color:"rgb(0, 0, 255)"}},{types:["class-name"],style:{color:"rgb(38, 127, 153)"}}]},Of=If,Df={plain:{color:"#f8fafc",backgroundColor:"#011627"},styles:[{types:["prolog"],style:{color:"#000080"}},{types:["comment"],style:{color:"#6A9955"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"#569CD6"}},{types:["number","inserted"],style:{color:"#B5CEA8"}},{types:["constant"],style:{color:"#f8fafc"}},{types:["attr-name","variable"],style:{color:"#9CDCFE"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"#cbd5e1"}},{types:["selector"],style:{color:"#D7BA7D"}},{types:["tag"],style:{color:"#0ea5e9"}},{types:["tag"],languages:["markup"],style:{color:"#0ea5e9"}},{types:["punctuation","operator"],style:{color:"#D4D4D4"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"#7dd3fc"}},{types:["class-name"],style:{color:"#0ea5e9"}},{types:["char"],style:{color:"#D16969"}}]},Mf=Df,Ff={plain:{color:"#0f172a",backgroundColor:"#f1f5f9"},styles:[{types:["prolog"],style:{color:"#000080"}},{types:["comment"],style:{color:"#6A9955"}},{types:["builtin","changed","keyword","interpolation-punctuation"],style:{color:"#0c4a6e"}},{types:["number","inserted"],style:{color:"#B5CEA8"}},{types:["constant"],style:{color:"#0f172a"}},{types:["attr-name","variable"],style:{color:"#0c4a6e"}},{types:["deleted","string","attr-value","template-punctuation"],style:{color:"#64748b"}},{types:["selector"],style:{color:"#D7BA7D"}},{types:["tag"],style:{color:"#0ea5e9"}},{types:["tag"],languages:["markup"],style:{color:"#0ea5e9"}},{types:["punctuation","operator"],style:{color:"#475569"}},{types:["punctuation"],languages:["markup"],style:{color:"#808080"}},{types:["function"],style:{color:"#0e7490"}},{types:["class-name"],style:{color:"#0ea5e9"}},{types:["char"],style:{color:"#D16969"}}]},zf=Ff,Bf={plain:{backgroundColor:"hsl(220, 13%, 18%)",color:"hsl(220, 14%, 71%)",textShadow:"0 1px rgba(0, 0, 0, 0.3)"},styles:[{types:["comment","prolog","cdata"],style:{color:"hsl(220, 10%, 40%)"}},{types:["doctype","punctuation","entity"],style:{color:"hsl(220, 14%, 71%)"}},{types:["attr-name","class-name","maybe-class-name","boolean","constant","number","atrule"],style:{color:"hsl(29, 54%, 61%)"}},{types:["keyword"],style:{color:"hsl(286, 60%, 67%)"}},{types:["property","tag","symbol","deleted","important"],style:{color:"hsl(355, 65%, 65%)"}},{types:["selector","string","char","builtin","inserted","regex","attr-value"],style:{color:"hsl(95, 38%, 62%)"}},{types:["variable","operator","function"],style:{color:"hsl(207, 82%, 66%)"}},{types:["url"],style:{color:"hsl(187, 47%, 55%)"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"hsl(220, 14%, 71%)"}}]},Uf=Bf,Vf={plain:{backgroundColor:"hsl(230, 1%, 98%)",color:"hsl(230, 8%, 24%)"},styles:[{types:["comment","prolog","cdata"],style:{color:"hsl(230, 4%, 64%)"}},{types:["doctype","punctuation","entity"],style:{color:"hsl(230, 8%, 24%)"}},{types:["attr-name","class-name","boolean","constant","number","atrule"],style:{color:"hsl(35, 99%, 36%)"}},{types:["keyword"],style:{color:"hsl(301, 63%, 40%)"}},{types:["property","tag","symbol","deleted","important"],style:{color:"hsl(5, 74%, 59%)"}},{types:["selector","string","char","builtin","inserted","regex","attr-value","punctuation"],style:{color:"hsl(119, 34%, 47%)"}},{types:["variable","operator","function"],style:{color:"hsl(221, 87%, 60%)"}},{types:["url"],style:{color:"hsl(198, 99%, 37%)"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"hsl(230, 8%, 24%)"}}]},$f=Vf,Hf={plain:{color:"#ebdbb2",backgroundColor:"#292828"},styles:[{types:["imports","class-name","maybe-class-name","constant","doctype","builtin","function"],style:{color:"#d8a657"}},{types:["property-access"],style:{color:"#7daea3"}},{types:["tag"],style:{color:"#e78a4e"}},{types:["attr-name","char","url","regex"],style:{color:"#a9b665"}},{types:["attr-value","string"],style:{color:"#89b482"}},{types:["comment","prolog","cdata","operator","inserted"],style:{color:"#a89984"}},{types:["delimiter","boolean","keyword","selector","important","atrule","property","variable","deleted"],style:{color:"#ea6962"}},{types:["entity","number","symbol"],style:{color:"#d3869b"}}]},qf=Hf,Wf={plain:{color:"#654735",backgroundColor:"#f9f5d7"},styles:[{types:["delimiter","boolean","keyword","selector","important","atrule","property","variable","deleted"],style:{color:"#af2528"}},{types:["imports","class-name","maybe-class-name","constant","doctype","builtin"],style:{color:"#b4730e"}},{types:["string","attr-value"],style:{color:"#477a5b"}},{types:["property-access"],style:{color:"#266b79"}},{types:["function","attr-name","char","url"],style:{color:"#72761e"}},{types:["tag"],style:{color:"#b94c07"}},{types:["comment","prolog","cdata","operator","inserted"],style:{color:"#a89984"}},{types:["entity","number","symbol"],style:{color:"#924f79"}}]},Gf=Wf,Qf=l=>U.useCallback(c=>{var i=c,{className:d,style:m,line:g}=i,f=id(i,["className","style","line"]);const E=na(Tt({},f),{className:sr("token-line",d)});return typeof l=="object"&&"plain"in l&&(E.style=l.plain),typeof m=="object"&&(E.style=Tt(Tt({},E.style||{}),m)),E},[l]),Kf=l=>{const c=U.useCallback(({types:i,empty:d})=>{if(l!=null){{if(i.length===1&&i[0]==="plain")return d!=null?{display:"inline-block"}:void 0;if(i.length===1&&d!=null)return l[i[0]]}return Object.assign(d!=null?{display:"inline-block"}:{},...i.map(m=>l[m]))}},[l]);return U.useCallback(i=>{var d=i,{token:m,className:g,style:f}=d,E=id(d,["token","className","style"]);const y=na(Tt({},E),{className:sr("token",...m.types,g),children:m.content,style:c(m)});return f!=null&&(y.style=Tt(Tt({},y.style||{}),f)),y},[c])},Yf=/\r\n|\r|\n/,Ou=l=>{l.length===0?l.push({types:["plain"],content:`
`,empty:!0}):l.length===1&&l[0].content===""&&(l[0].content=`
`,l[0].empty=!0)},Du=(l,c)=>{const i=l.length;return i>0&&l[i-1]===c?l:l.concat(c)},Jf=l=>{const c=[[]],i=[l],d=[0],m=[l.length];let g=0,f=0,E=[];const y=[E];for(;f>-1;){for(;(g=d[f]++)<m[f];){let C,R=c[f];const z=i[f][g];if(typeof z=="string"?(R=f>0?R:["plain"],C=z):(R=Du(R,z.type),z.alias&&(R=Du(R,z.alias)),C=z.content),typeof C!="string"){f++,c.push(R),i.push(C),d.push(0),m.push(C.length);continue}const Q=C.split(Yf),S=Q.length;E.push({types:R,content:Q[0]});for(let w=1;w<S;w++)Ou(E),y.push(E=[]),E.push({types:R,content:Q[w]})}f--,c.pop(),i.pop(),d.pop(),m.pop()}return Ou(E),y},Mu=Jf,Xf=({prism:l,code:c,grammar:i,language:d})=>U.useMemo(()=>{if(i==null)return Mu([c]);const m={code:c,grammar:i,language:d,tokens:[]};return l.hooks.run("before-tokenize",m),m.tokens=l.tokenize(c,i),l.hooks.run("after-tokenize",m),Mu(m.tokens)},[c,i,d,l]),Zf=(l,c)=>{const{plain:i}=l,d=l.styles.reduce((m,g)=>{const{languages:f,style:E}=g;return f&&!f.includes(c)||g.types.forEach(y=>{const C=Tt(Tt({},m[y]),E);m[y]=C}),m},{});return d.root=i,d.plain=na(Tt({},i),{backgroundColor:void 0}),d},ex=Zf,tx=({children:l,language:c,code:i,theme:d,prism:m})=>{const g=c.toLowerCase(),f=ex(d,g),E=Qf(f),y=Kf(f),C=m.languages[g],R=Xf({prism:m,language:g,code:i,grammar:C});return l({tokens:R,className:`prism-code language-${g}`,style:f!=null?f.root:{},getLineProps:E,getTokenProps:y})},rx=l=>U.createElement(tx,na(Tt({},l),{prism:l.prism||_,theme:l.theme||ud,code:l.code,language:l.language}));/*! Bundled license information:

prismjs/prism.js:
  (**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   *)
*/const nx={typescript:"typescript",ts:"typescript",javascript:"javascript",js:"javascript",jsx:"jsx",tsx:"tsx",bash:"bash",shell:"bash",sh:"bash",json:"json",css:"css",html:"markup",xml:"markup",markdown:"markdown",md:"markdown",sql:"sql",yaml:"yaml",yml:"yaml",python:"python",py:"python",go:"go",rust:"rust",java:"java",c:"c",cpp:"cpp",diff:"diff"};function I({code:l,language:c="typescript",filename:i,showLineNumbers:d=!1}){const[m,g]=U.useState(!1),f=nx[c.toLowerCase()]||"typescript",E=async()=>{await navigator.clipboard.writeText(l),g(!0),setTimeout(()=>g(!1),2e3)};return n.jsxs("div",{className:"code-block group relative",children:[i&&n.jsxs("div",{className:"flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-800 border-b border-slate-700/50",children:[n.jsx("span",{className:"text-xs text-slate-400 font-mono",children:i}),n.jsx("button",{onClick:E,className:"text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs",children:m?n.jsxs(n.Fragment,{children:[n.jsx(_u,{className:"w-3.5 h-3.5 text-green-400"}),n.jsx("span",{className:"text-green-400 hidden sm:inline",children:"Copied!"})]}):n.jsxs(n.Fragment,{children:[n.jsx(Lu,{className:"w-3.5 h-3.5"}),n.jsx("span",{className:"hidden sm:inline",children:"Copy"})]})})]}),n.jsxs("div",{className:"relative",children:[!i&&n.jsx("button",{onClick:E,className:"absolute right-2 top-2 sm:right-3 sm:top-3 z-10 text-slate-400 hover:text-white transition-colors p-1.5 rounded bg-slate-800/90 hover:bg-slate-700","aria-label":"Copy code",children:m?n.jsx(_u,{className:"w-4 h-4 text-green-400"}):n.jsx(Lu,{className:"w-4 h-4"})}),n.jsx(rx,{theme:cd.nightOwl,code:l.trim(),language:f,children:({className:y,style:C,tokens:R,getLineProps:j,getTokenProps:z})=>n.jsx("pre",{className:sr(y,"p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed"),style:{...C,backgroundColor:"#011627"},children:n.jsx("code",{children:R.map((Q,S)=>{const w=j({line:Q});return n.jsxs("div",{...w,className:sr(w.className,"table-row"),children:[d&&n.jsx("span",{className:"table-cell w-8 sm:w-10 text-slate-500 select-none text-right pr-3 sm:pr-4 sticky left-0 bg-[#011627]",children:S+1}),n.jsx("span",{className:"table-cell",children:Q.map((b,O)=>n.jsx("span",{...z({token:b})},O))})]},S)})})})})]})]})}const sx=`import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Type-safe schema validation
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: 'email' })
});

// Auto-validated routes
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

app.listen(3000);`,ax=[{icon:n.jsx(Zs,{className:"w-5 h-5 sm:w-6 sm:h-6"}),title:"Blazing Fast",description:"50K+ requests/sec with Radix tree routing",color:"text-vexor-400",bg:"bg-vexor-500/10"},{icon:n.jsx(Ys,{className:"w-5 h-5 sm:w-6 sm:h-6"}),title:"Built-in ORM",description:"Type-safe query builder for PostgreSQL, MySQL, SQLite",color:"text-purple-400",bg:"bg-purple-500/10"},{icon:n.jsx(io,{className:"w-5 h-5 sm:w-6 sm:h-6"}),title:"Type Safe",description:"End-to-end type inference from database to API",color:"text-pink-400",bg:"bg-pink-500/10"},{icon:n.jsx(ed,{className:"w-5 h-5 sm:w-6 sm:h-6"}),title:"Multi-Runtime",description:"Node.js, Bun, Deno, Lambda, Cloudflare Workers",color:"text-green-400",bg:"bg-green-500/10"},{icon:n.jsx(nd,{className:"w-5 h-5 sm:w-6 sm:h-6"}),title:"Real-time",description:"WebSocket and SSE with Pub/Sub support",color:"text-yellow-400",bg:"bg-yellow-500/10"},{icon:n.jsx(Th,{className:"w-5 h-5 sm:w-6 sm:h-6"}),title:"Observability",description:"OpenTelemetry tracing and Prometheus metrics",color:"text-red-400",bg:"bg-red-500/10"}],lx=[{value:"50K+",label:"Requests/sec"},{value:"<10KB",label:"Edge Bundle"},{value:"100%",label:"Type Safe"},{value:"5+",label:"Runtimes"}],ox=["CORS","Compression","Rate Limiting","File Upload","Caching","Health Check","Versioning","OAuth2"];function ix(){return n.jsxs("div",{className:"pt-14 sm:pt-16",children:[n.jsx("section",{className:"relative py-12 sm:py-16 lg:py-20 hero-gradient overflow-hidden",children:n.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:n.jsxs("div",{className:"text-center max-w-4xl mx-auto",children:[n.jsxs("div",{className:"inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8",children:[n.jsxs("span",{className:"relative flex h-2 w-2",children:[n.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"}),n.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-green-500"})]}),n.jsx("span",{className:"text-xs sm:text-sm text-slate-600 dark:text-slate-300",children:"AWS Lambda & Edge Runtime Support"})]}),n.jsxs("h1",{className:"text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6",children:[n.jsx("span",{className:"gradient-text",children:"Build APIs"}),n.jsx("br",{}),n.jsx("span",{className:"text-slate-900 dark:text-white",children:"at Lightning Speed"})]}),n.jsx("p",{className:"text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2",children:"A blazing-fast, batteries-included Node.js backend framework with its own ORM. Type-safe from database to API response."}),n.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 px-4 sm:px-0",children:[n.jsxs(ct,{to:"/docs/getting-started",className:"w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm sm:text-base",children:["Get Started",n.jsx(Eh,{className:"w-4 h-4"})]}),n.jsxs("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base",children:[n.jsx(Js,{className:"w-4 h-4 sm:w-5 sm:h-5"}),"Star on GitHub"]})]}),n.jsx("div",{className:"max-w-3xl mx-auto text-left",children:n.jsx(I,{code:sx,filename:"app.ts"})})]})})}),n.jsx("section",{className:"py-8 sm:py-12 border-y border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30",children:n.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:n.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8",children:lx.map(l=>n.jsxs("div",{className:"text-center",children:[n.jsx("div",{className:"text-2xl sm:text-3xl lg:text-4xl font-bold text-vexor-400 mb-1",children:l.value}),n.jsx("div",{className:"text-xs sm:text-sm text-slate-500",children:l.label})]},l.label))})})}),n.jsx("section",{className:"py-12 sm:py-16 lg:py-24",children:n.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[n.jsxs("div",{className:"text-center mb-10 sm:mb-16",children:[n.jsx("h2",{className:"text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Everything You Need"}),n.jsx("p",{className:"text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4",children:"A complete toolkit for building production-ready APIs"})]}),n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",children:ax.map(l=>n.jsxs("div",{className:"feature-card",children:[n.jsx("div",{className:`w-10 h-10 sm:w-12 sm:h-12 ${l.bg} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${l.color}`,children:l.icon}),n.jsx("h3",{className:"text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 text-slate-900 dark:text-white",children:l.title}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:l.description})]},l.title))})]})}),n.jsx("section",{className:"py-12 sm:py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/30",children:n.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[n.jsxs("div",{className:"text-center mb-10 sm:mb-16",children:[n.jsx("h2",{className:"text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Built-in Middleware"}),n.jsx("p",{className:"text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400",children:"Production-ready middleware out of the box"})]}),n.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto",children:ox.map(l=>n.jsxs("div",{className:"flex items-center gap-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-lg px-3 py-2 sm:px-4 sm:py-3",children:[n.jsx(Rh,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4 text-vexor-400 flex-shrink-0"}),n.jsx("span",{className:"text-xs sm:text-sm text-slate-700 dark:text-slate-200 truncate",children:l})]},l))})]})}),n.jsx("section",{className:"py-12 sm:py-16 lg:py-24",children:n.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center",children:[n.jsx("h2",{className:"text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-white",children:"Ready to Build?"}),n.jsx("p",{className:"text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-10",children:"Start building production-ready APIs in minutes"}),n.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0",children:[n.jsx(ct,{to:"/docs/getting-started",className:"w-full sm:w-auto btn-primary text-sm sm:text-base",children:"Get Started Now"}),n.jsx(ct,{to:"/docs/core",className:"w-full sm:w-auto btn-secondary text-sm sm:text-base",children:"Read the Docs"})]})]})}),n.jsx("footer",{className:"py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800/50",children:n.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:n.jsxs("div",{className:"flex flex-col gap-6 sm:gap-8",children:[n.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6",children:[n.jsxs("div",{className:"flex items-center gap-3",children:[n.jsx("div",{className:"w-6 h-6 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded flex items-center justify-center font-bold text-white text-xs",children:"V"}),n.jsx("span",{className:"font-semibold text-slate-900 dark:text-white",children:"Vexor"}),n.jsx("span",{className:"text-slate-500 text-sm",children:"© 2024"})]}),n.jsxs("div",{className:"flex items-center gap-4 sm:gap-6",children:[n.jsx("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:n.jsx(Js,{className:"w-5 h-5"})}),n.jsx("a",{href:"https://www.linkedin.com/in/sitharaj88",target:"_blank",rel:"noopener noreferrer",className:"p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:n.jsx(Oh,{className:"w-5 h-5"})}),n.jsx("a",{href:"https://sitharaj.in",target:"_blank",rel:"noopener noreferrer",className:"p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:n.jsx(Ph,{className:"w-5 h-5"})})]})]}),n.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800/50",children:[n.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm",children:[n.jsx(ct,{to:"/docs/getting-started",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:"Documentation"}),n.jsx(ct,{to:"/docs/cli",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:"CLI"}),n.jsx("a",{href:"https://github.com/sitharaj88/vexorjs",target:"_blank",rel:"noopener noreferrer",className:"text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors",children:"GitHub"})]}),n.jsxs("div",{className:"text-sm text-slate-500",children:["Built by"," ",n.jsx("a",{href:"https://sitharaj.in",target:"_blank",rel:"noopener noreferrer",className:"text-vexor-400 hover:text-vexor-300 transition-colors",children:"Sitharaj Seenivasan"})]})]})]})})})]})}const cx="npm install @vexorjs/core @vexorjs/orm",ux=`import { Vexor, Type, cors, rateLimit } from '@vexorjs/core';

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
});`,dx=`my-api/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Route handlers
│   │   ├── users.ts
│   │   └── products.ts
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── db/               # Database schema & queries
├── package.json
└── tsconfig.json`,px=`{
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
}`;function mx(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Getting Started"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Learn how to set up and build your first Vexor application in minutes."})]}),n.jsxs("section",{id:"installation",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Installation"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Install Vexor and its ORM using npm, yarn, or pnpm:"}),n.jsx(I,{code:cx,language:"bash"}),n.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-vexor-400",children:"Note:"})," Vexor requires Node.js 18+ or Bun 1.0+. It also works with Deno using the npm: specifier."]})})]}),n.jsxs("section",{id:"quick-start",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Quick Start"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Create a new file ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"app.ts"})," and add the following code:"]}),n.jsx(I,{code:ux,filename:"app.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Run Your Application"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Use ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"tsx"})," or ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"bun"})," to run your TypeScript file directly:"]}),n.jsx(I,{code:`# With Node.js
npx tsx app.ts

# With Bun
bun run app.ts`,language:"bash"})]})]}),n.jsxs("section",{children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Recommended Project Structure"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For larger applications, we recommend organizing your code like this:"}),n.jsx(I,{code:dx,language:"text"})]}),n.jsxs("section",{children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"TypeScript Configuration"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Here's a recommended ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"tsconfig.json"})," for Vexor projects:"]}),n.jsx(I,{code:px,filename:"tsconfig.json",language:"json"})]}),n.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),n.jsxs("ul",{className:"space-y-3",children:[n.jsxs("li",{className:"flex items-start gap-3",children:[n.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"1"}),n.jsxs("div",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Learn Core Concepts"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Understand routing, context, and request handling"})]})]}),n.jsxs("li",{className:"flex items-start gap-3",children:[n.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"2"}),n.jsxs("div",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Set Up Database"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Connect to PostgreSQL, MySQL, or SQLite with Vexor ORM"})]})]}),n.jsxs("li",{className:"flex items-start gap-3",children:[n.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"3"}),n.jsxs("div",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Add Authentication"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Implement JWT or OAuth2 authentication"})]})]}),n.jsxs("li",{className:"flex items-start gap-3",children:[n.jsx("span",{className:"w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",children:"4"}),n.jsxs("div",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Deploy"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Deploy to Node.js, Bun, AWS Lambda, or Edge"})]})]})]})]})]})}const hx=`import { Vexor, Type } from '@vexorjs/core';

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

app.listen(3000);`,fx=`app.get('/example', async (ctx) => {
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
});`,xx=`// JSON response
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
ctx.status(201).json({ created: true });`,gx=`// Basic routes
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
});`,yx=`import { Type } from '@vexorjs/core';

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
Type.Record(Type.String(), Type.Number())  // { [key: string]: number }`,vx=`app.addHook('onRequest', async (ctx) => {
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
});`,bx=`import { createGraphQLHandler } from '@vexorjs/core';
import { buildSchema, execute, parse } from 'graphql';

const schema = buildSchema(\`type Query { hello(name: String): String! }\`);
const rootValue = { hello: ({ name }) => \`hi \${name ?? 'world'}\` };

const handler = createGraphQLHandler({
  graphiql: true, // GET /graphql renders the playground
  executor: async ({ query, variables, operationName }) =>
    (await execute({
      schema,
      document: parse(query),
      rootValue,
      variableValues: variables,
      operationName,
    })) as any,
});

app.post('/graphql', handler);
app.get('/graphql', handler);`,wx=`import { GrpcService, GrpcError, GrpcStatus, createGrpcHandler } from '@vexorjs/core';

const greeter = new GrpcService('Greeter')
  // Unary RPC
  .unary<{ name: string }, { message: string }>('SayHello', async (req) => {
    if (!req.name) throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'name required');
    return { message: \`hi \${req.name}\` };
  })
  // Server-streaming RPC — yield each value as a separate frame
  .serverStream<{ from: number; to: number }, { n: number }>(
    'Range',
    async function* (req) {
      for (let i = req.from; i <= req.to; i++) yield { n: i };
    }
  );

const handler = createGrpcHandler({ services: [greeter] });
app.post('/Greeter/:method', (ctx) =>
  handler({ method: ctx.method, path: ctx.path, request: ctx.request })
);`,kx=`import {
  OAuth,
  providers,
  RedisStateStore,
  RedisSessionStore,
} from '@vexorjs/core';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

const oauth = new OAuth({
  providers: {
    github: providers.github(
      process.env.GH_CLIENT_ID!,
      process.env.GH_CLIENT_SECRET!
    ),
  },
  // Multi-instance-safe stores
  stateStore:   new RedisStateStore(redis,   { ttl: 600,   prefix: 'app:state:' }),
  sessionStore: new RedisSessionStore(redis, { ttl: 86400, prefix: 'app:sess:' }),
});

app.get('/auth/github', async (ctx) => {
  return ctx.redirect(await oauth.getAuthorizationUrl('github'));
});

// node-redis v4+ uses { EX } object syntax instead of positional args:
// new RedisStateStore(client, { setStyle: 'options' })`,jx=`// Global error handler
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
});`;function Nx(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Core Concepts"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Learn the fundamental concepts of building applications with Vexor."})]}),n.jsxs("section",{id:"application",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Application"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"Vexor"})," class is the core of your application. It handles routing, middleware, and server lifecycle."]}),n.jsx(I,{code:hx,filename:"app.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"context",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Request Context"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Every route handler receives a context object (",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"ctx"}),") that provides access to request data and response methods."]}),n.jsx(I,{code:fx,filename:"context.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Response Methods"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor provides fluent response methods for common response types:"}),n.jsx(I,{code:xx,showLineNumbers:!0})]})]}),n.jsxs("section",{id:"routing",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Routing"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor uses a high-performance radix tree router for lightning-fast route matching."}),n.jsx(I,{code:gx,filename:"routes.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Route Parameters"}),n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:["Use ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:":param"})," for named parameters. Access via ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"ctx.params.param"}),"."]})]}),n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Wildcards"}),n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:["Use ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"*"})," to match everything. Access via ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"ctx.params['*']"}),"."]})]})]})]}),n.jsxs("section",{id:"validation",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Schema Validation"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor includes a TypeBox-compatible schema system for runtime validation with full TypeScript inference."}),n.jsx(I,{code:yx,filename:"schemas.ts",showLineNumbers:!0}),n.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-vexor-400",children:"Type Inference:"})," All schemas automatically infer TypeScript types. When you define a body schema, ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"ctx.body"})," is fully typed!"]})})]}),n.jsxs("section",{id:"hooks",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Lifecycle Hooks"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Hooks allow you to intercept requests at different stages of the request lifecycle."}),n.jsx(I,{code:vx,filename:"hooks.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Hook Execution Order"}),n.jsxs("div",{className:"flex flex-wrap items-center gap-2 text-sm",children:[n.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"onRequest"}),n.jsx("span",{className:"text-slate-500",children:"→"}),n.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"preValidation"}),n.jsx("span",{className:"text-slate-500",children:"→"}),n.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"preHandler"}),n.jsx("span",{className:"text-slate-500",children:"→"}),n.jsx("span",{className:"px-3 py-1 bg-vexor-500/20 text-vexor-400 rounded-full",children:"Handler"}),n.jsx("span",{className:"text-slate-500",children:"→"}),n.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"onSend"}),n.jsx("span",{className:"text-slate-500",children:"→"}),n.jsx("span",{className:"px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300",children:"onResponse"})]})]})]}),n.jsxs("section",{id:"error-handling",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Error Handling"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor provides centralized error handling with custom error handlers."}),n.jsx(I,{code:jx,filename:"errors.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"graphql",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"GraphQL"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The built-in GraphQL adapter is pure HTTP plumbing — bring your own executor (Yoga, Apollo, raw ",n.jsx("code",{children:"graphql"}),"), and get an optional GraphiQL playground for free."]}),n.jsx(I,{code:bx,filename:"graphql.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"grpc",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"gRPC-Web"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Full gRPC-Web wire format on plain HTTP/1.1+ — usable from browsers, edge runtimes, and behind any HTTP proxy. Supports unary and server-streaming methods. JSON codec by default; pluggable for Protobuf."}),n.jsx(I,{code:wx,filename:"grpc.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"oauth-redis",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"OAuth with Redis-backed stores"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Eight built-in providers (Google, GitHub, Discord, Twitter, Microsoft, Facebook, LinkedIn, Apple) plus production-ready state and session stores backed by Redis. The ",n.jsx("code",{children:"RedisLike"})," interface is intentionally minimal — works with",n.jsx("code",{children:" ioredis"}),", ",n.jsx("code",{children:"node-redis"})," v4+, ",n.jsx("code",{children:"@upstash/redis"}),", or any client exposing",n.jsx("code",{children:" set"}),"/",n.jsx("code",{children:"get"}),"/",n.jsx("code",{children:"del"}),"."]}),n.jsx(I,{code:kx,filename:"oauth.ts",showLineNumbers:!0})]}),n.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[n.jsxs("a",{href:"/vexorjs/docs/orm",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Vexor ORM →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Learn about database operations with the built-in ORM"})]}),n.jsxs("a",{href:"/vexorjs/docs/middleware",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Middleware →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Explore built-in middleware for CORS, rate limiting, and more"})]})]})]})]})}const Sx=`import { Database, PostgresDriver } from '@vexorjs/orm';

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
});`,Ex=`import { defineTable, column, sql } from '@vexorjs/orm';

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
});`,Cx=`import { eq, and, or, like, gt, lt, isNull, inArray, desc, asc } from '@vexorjs/orm';

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
  .first();`,Tx=`// Inner join
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
.orderBy(desc(comments.createdAt));`,Rx=`// Insert single record
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
  .returning({ id: users.id });`,_x=`// Update single record
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
  ));`,Lx=`// Delete single record
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
  .where(lt(sessions.expiresAt, new Date()));`,Ax=`// Basic transaction
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
});`,Px=`import { hasMany, hasOne, belongsTo, belongsToMany } from '@vexorjs/orm';

// Eager-load related rows in a single IN-query per relation — never N+1.
const usersRows = await db.findMany(users);

await db.loadRelations(
  usersRows,
  {
    posts:   hasMany(posts, { foreignKey: 'user_id' }),
    profile: hasOne(profiles, { foreignKey: 'user_id' }),
    company: belongsTo(companies, { foreignKey: 'company_id' }),
    tags: belongsToMany(tags, {
      through: userTags,
      sourceKey: 'user_id',
      targetKey: 'tag_id',
    }),
  },
  { posts: true, profile: true, company: true, tags: true }
);

// usersRows[0].posts   → Post[]
// usersRows[0].profile → Profile | null
// usersRows[0].company → Company | null
// usersRows[0].tags    → Tag[]`,Ix=`import { softDeletable, hasMany } from '@vexorjs/orm';

// Wrap the relation target with softDeletable() to auto-filter deleted rows.
await db.loadRelations(
  usersRows,
  { posts: hasMany(softDeletable(posts), { foreignKey: 'user_id' }) },
  { posts: true }
);
// → SELECT * FROM "posts" WHERE "user_id" IN (...) AND "deleted_at" IS NULL`,Ox=`import { connect, table, column, index, uniqueIndex } from '@vexorjs/orm';

const events = table('events', {
  id: column.serial().primaryKey(),
  user_id: column.integer().notNull(),
  email: column.text().notNull(),
}, {
  indexes: [
    index('idx_events_user', 'user_id'),
    uniqueIndex('uq_events_email', 'email'),
  ],
});

const db = await connect({ driver: 'sqlite', filename: ':memory:' });

// Materialize the table + its indexes in one call.
await db.createTable(events, { ifNotExists: true });

// Online schema changes
await db.addColumn(events, 'archived_at', column.timestamp());
await db.dropColumn(events, 'archived_at');

await db.dropTable(events, { ifExists: true });`,Dx=`import { connect, createQueryCache } from '@vexorjs/orm';

const db = await connect(config, {
  cache: createQueryCache({ defaultTtlMs: 30_000 }),
});

// Wrapped read — first call hits the DB, repeats are served from cache.
const popular = await db.cached(
  'SELECT * FROM products WHERE qty > $1',
  [0],
  { ttlMs: 60_000 }
);

// Concurrent callers share one in-flight DB call (no thundering herd).

// After a write, invalidate.
await db.invalidateCache();          // clear all
await db.invalidateCache(specificKey);// clear one`,Mx=`// migrations/001_create_users.ts
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
};`,Fx=`# Run all pending migrations
npx vexor db:migrate

# Rollback last migration
npx vexor db:rollback

# Rollback all migrations
npx vexor db:rollback --all

# Check migration status
npx vexor db:status

# Generate new migration
npx vexor db:generate create_posts`;function zx(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Vexor ORM"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"A blazing-fast, type-safe ORM designed for modern TypeScript applications."})]}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("div",{className:"text-2xl mb-2",children:"⚡"}),n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"High Performance"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Prepared statements, connection pooling, and query optimization"})]}),n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("div",{className:"text-2xl mb-2",children:"🔒"}),n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Type Safe"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Full TypeScript inference from schema to query results"})]}),n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("div",{className:"text-2xl mb-2",children:"💾"}),n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Multi-Database"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"PostgreSQL, MySQL, and SQLite support"})]})]}),n.jsxs("section",{id:"connection",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Database Connection"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Connect to your database with built-in connection pooling and health checks."}),n.jsx(I,{code:Sx,filename:"db.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"schema",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Schema Definition"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Define your tables with full type inference. Column types are automatically inferred."}),n.jsx(I,{code:Ex,filename:"schema.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 overflow-x-auto",children:[n.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Column Types"}),n.jsxs("table",{className:"w-full text-sm",children:[n.jsx("thead",{children:n.jsxs("tr",{className:"border-b border-slate-800",children:[n.jsx("th",{className:"text-left py-2 px-4",children:"Method"}),n.jsx("th",{className:"text-left py-2 px-4",children:"SQL Type"}),n.jsx("th",{className:"text-left py-2 px-4",children:"TypeScript Type"})]})}),n.jsxs("tbody",{className:"text-slate-400",children:[n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"serial()"})}),n.jsx("td",{className:"py-2 px-4",children:"SERIAL"}),n.jsx("td",{className:"py-2 px-4",children:"number"})]}),n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"integer()"})}),n.jsx("td",{className:"py-2 px-4",children:"INTEGER"}),n.jsx("td",{className:"py-2 px-4",children:"number"})]}),n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"bigint()"})}),n.jsx("td",{className:"py-2 px-4",children:"BIGINT"}),n.jsx("td",{className:"py-2 px-4",children:"bigint"})]}),n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"varchar(n)"})}),n.jsx("td",{className:"py-2 px-4",children:"VARCHAR(n)"}),n.jsx("td",{className:"py-2 px-4",children:"string"})]}),n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"text()"})}),n.jsx("td",{className:"py-2 px-4",children:"TEXT"}),n.jsx("td",{className:"py-2 px-4",children:"string"})]}),n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"boolean()"})}),n.jsx("td",{className:"py-2 px-4",children:"BOOLEAN"}),n.jsx("td",{className:"py-2 px-4",children:"boolean"})]}),n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"timestamp()"})}),n.jsx("td",{className:"py-2 px-4",children:"TIMESTAMP"}),n.jsx("td",{className:"py-2 px-4",children:"Date"})]}),n.jsxs("tr",{className:"border-b border-slate-800/50",children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"jsonb<T>()"})}),n.jsx("td",{className:"py-2 px-4",children:"JSONB"}),n.jsx("td",{className:"py-2 px-4",children:"T"})]}),n.jsxs("tr",{children:[n.jsx("td",{className:"py-2 px-4",children:n.jsx("code",{children:"array(type)"})}),n.jsx("td",{className:"py-2 px-4",children:"type[]"}),n.jsx("td",{className:"py-2 px-4",children:"Type[]"})]})]})]})]})]}),n.jsxs("section",{id:"select",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"SELECT Queries"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Build type-safe SELECT queries with filtering, sorting, and pagination."}),n.jsx(I,{code:Cx,filename:"queries.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"joins",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"JOIN Queries"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Combine data from multiple tables with type-safe joins."}),n.jsx(I,{code:Tx,filename:"joins.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"insert",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"INSERT Operations"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Insert single or multiple records with conflict handling."}),n.jsx(I,{code:Rx,filename:"insert.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"update",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"UPDATE Operations"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Update records with type-safe conditions and expressions."}),n.jsx(I,{code:_x,filename:"update.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"delete",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"DELETE Operations"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Delete records with safe conditions."}),n.jsx(I,{code:Lx,filename:"delete.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"transactions",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Transactions"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Execute multiple operations atomically with full ACID compliance."}),n.jsx(I,{code:Ax,filename:"transactions.ts",showLineNumbers:!0}),n.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-vexor-400",children:"Automatic Rollback:"})," If any operation throws an error, the entire transaction is automatically rolled back. No manual cleanup required."]})})]}),n.jsxs("section",{id:"relations",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Relations & eager loading"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Declare ",n.jsx("code",{children:"hasOne"}),", ",n.jsx("code",{children:"hasMany"}),", ",n.jsx("code",{children:"belongsTo"}),", and ",n.jsx("code",{children:"belongsToMany"})," relations.",n.jsx("code",{children:" db.loadRelations(rows, ...)"})," issues a single ",n.jsx("code",{children:"IN"}),"-query per relation across all parents — no N+1 fan-out."]}),n.jsx(I,{code:Px,filename:"relations.ts",showLineNumbers:!0}),n.jsx("h3",{className:"text-lg font-semibold mt-6 mb-3 text-slate-900 dark:text-white",children:"Soft-delete-aware"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Wrap the target with ",n.jsx("code",{children:"softDeletable()"})," and the eager loader appends the appropriate ",n.jsx("code",{children:"IS NULL"}),"(or boolean-flag) filter. Custom column names, ",n.jsx("code",{children:"includeDeleted: true"}),", and ",n.jsx("code",{children:"belongsToMany"})," all honored."]}),n.jsx(I,{code:Ix,filename:"relations-soft-delete.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"schema-as-code",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Schema as code"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Skip the migration roundtrip during prototyping: ",n.jsx("code",{children:"db.createTable()"})," materializes ",n.jsx("code",{children:"CREATE TABLE"})," + every declared ",n.jsx("code",{children:"CREATE INDEX"})," from a ",n.jsx("code",{children:"TableDef"}),". ",n.jsx("code",{children:"db.addColumn()"})," / ",n.jsx("code",{children:"dropColumn()"})," /",n.jsx("code",{children:" dropTable()"})," handle online schema changes."]}),n.jsx(I,{code:Ox,filename:"schema-as-code.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"cache",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Query result cache"}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Wire a cache into ",n.jsx("code",{children:"Database"})," and use ",n.jsx("code",{children:"db.cached()"})," for opt-in, per-query TTL caching with in-flight de-duplication. The default backend is in-memory with LRU eviction; bring your own by implementing",n.jsx("code",{children:" QueryCacheStore"}),"."]}),n.jsx(I,{code:Dx,filename:"cached.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"migrations",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Migrations"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Version-controlled database schema changes with up/down migrations."}),n.jsx(I,{code:Mx,filename:"migrations/001_create_users.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Migration CLI"}),n.jsx(I,{code:Fx,language:"bash"})]})]}),n.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[n.jsxs("a",{href:"/vexorjs/docs/middleware",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Middleware →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Add authentication, caching, and more with built-in middleware"})]}),n.jsxs("a",{href:"/vexorjs/docs/realtime",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Real-time →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Build WebSocket and SSE applications"})]})]})]})]})}const Bx=`import { Vexor, cors } from '@vexorjs/core';

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
app.get('/public', cors({ origin: '*' }), handler);`,Ux=`import { Vexor, rateLimit, slowDown } from '@vexorjs/core';

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
app.use('/api/*', rateLimit({ max: 100, windowMs: 60000 }));`,Vx=`import { Vexor, JWT, createJWT, verifyJWT } from '@vexorjs/core';

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
});`,$x=`import { Vexor, SessionManager, MemorySessionStore } from '@vexorjs/core';

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
});`,Hx=`import { Vexor, compression } from '@vexorjs/core';

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
app.get('/stream', { compress: false }, streamHandler);`,qx=`import { Vexor, cacheMiddleware, createMemoryCache, createRedisCache } from '@vexorjs/core';

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
});`,Wx=`import { Vexor, upload, singleUpload, multiUpload } from '@vexorjs/core';

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
);`,Gx=`import { Vexor, healthCheck, databaseCheck, redisCheck, memoryCheck } from '@vexorjs/core';

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
// }`,Qx=`import { Vexor, createLogger, createRequestLogger } from '@vexorjs/core';

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
// {"level":"info","time":1705312200050,"msg":"request completed","method":"GET","path":"/api/data","status":200,"duration":50}`,Kx=`import { Vexor, versioning, createVersionRouter } from '@vexorjs/core';

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
);`;function Yx(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Middleware"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Vexor includes a comprehensive set of production-ready middleware for common use cases."})]}),n.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[{name:"CORS",href:"#cors"},{name:"Rate Limiting",href:"#rate-limit"},{name:"JWT Auth",href:"#jwt"},{name:"Sessions",href:"#sessions"},{name:"Compression",href:"#compression"},{name:"Caching",href:"#caching"},{name:"File Upload",href:"#upload"},{name:"Health Check",href:"#health"},{name:"Logging",href:"#logging"},{name:"Versioning",href:"#versioning"}].map(l=>n.jsx("a",{href:l.href,className:"p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm",children:l.name},l.name))}),n.jsxs("section",{id:"cors",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"CORS"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Cross-Origin Resource Sharing middleware for handling browser security policies."}),n.jsx(I,{code:Bx,filename:"cors.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"rate-limit",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Rate Limiting"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Protect your API from abuse with flexible rate limiting strategies."}),n.jsx(I,{code:Ux,filename:"rate-limit.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"jwt",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"JWT Authentication"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"JSON Web Token authentication with support for access and refresh tokens."}),n.jsx(I,{code:Vx,filename:"jwt-auth.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"sessions",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Session Management"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Server-side session management with multiple storage backends."}),n.jsx(I,{code:$x,filename:"sessions.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"compression",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Compression"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Automatic response compression with gzip, deflate, and Brotli support."}),n.jsx(I,{code:Hx,filename:"compression.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"caching",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Caching"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Response caching with in-memory and Redis backends."}),n.jsx(I,{code:qx,filename:"caching.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"upload",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"File Upload"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Handle file uploads with validation, size limits, and storage options."}),n.jsx(I,{code:Wx,filename:"upload.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"health",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Health Checks"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Expose health endpoints for load balancers and monitoring systems."}),n.jsx(I,{code:Gx,filename:"health.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"logging",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Logging"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Structured logging with request tracing and custom formatters."}),n.jsx(I,{code:Qx,filename:"logging.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"versioning",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"API Versioning"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Version your API with path, header, or query parameter strategies."}),n.jsx(I,{code:Kx,filename:"versioning.ts",showLineNumbers:!0})]}),n.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[n.jsxs("a",{href:"/vexorjs/docs/realtime",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Real-time →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Build WebSocket and SSE applications"})]}),n.jsxs("a",{href:"/vexorjs/docs/deployment",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Deployment →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Deploy to Node.js, Bun, Lambda, and Edge"})]})]})]})]})}const Jx=`import { Vexor, Type } from '@vexorjs/core';

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

app.listen(3000);`,Xx=`// WebSocket with rooms/channels
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
});`,Zx=`// WebSocket with authentication
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
});`,e0=`import { Vexor, SSEStream, createSSEStream } from '@vexorjs/core';

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
});`,t0=`// Browser client for SSE
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
});`,r0=`import { Vexor, createEventBus, MemoryPubSubAdapter } from '@vexorjs/core';

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
});`,n0=`import { Vexor, createEventBus, createRedisPubSub } from '@vexorjs/core';

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
});`,s0=`import { Vexor, CircuitBreaker, createCircuitBreaker, retry } from '@vexorjs/core';

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
});`,a0=`// Browser WebSocket client
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
}`;function l0(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Real-time Features"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Build real-time applications with WebSockets, Server-Sent Events, and Pub/Sub."})]}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("div",{className:"text-2xl mb-2",children:"🔌"}),n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"WebSocket"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Bidirectional real-time communication with rooms and channels"})]}),n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("div",{className:"text-2xl mb-2",children:"📡"}),n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Server-Sent Events"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"One-way streaming from server to client"})]}),n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("div",{className:"text-2xl mb-2",children:"📨"}),n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Pub/Sub"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Event-driven architecture with memory or Redis backend"})]})]}),n.jsxs("section",{id:"websocket",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"WebSocket"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Create WebSocket endpoints with type-safe message validation and lifecycle hooks."}),n.jsx(I,{code:Jx,filename:"websocket.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Rooms & Channels"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Organize connections into rooms for targeted broadcasting."}),n.jsx(I,{code:Xx,filename:"rooms.ts",showLineNumbers:!0})]}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Authentication"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Authenticate WebSocket connections before they're established."}),n.jsx(I,{code:Zx,filename:"ws-auth.ts",showLineNumbers:!0})]}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Client Example"}),n.jsx(I,{code:a0,filename:"client.js",language:"javascript",showLineNumbers:!0})]})]}),n.jsxs("section",{id:"sse",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Server-Sent Events (SSE)"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Stream events to clients for progress updates, notifications, and live data."}),n.jsx(I,{code:e0,filename:"sse.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Client Example"}),n.jsx(I,{code:t0,filename:"sse-client.js",language:"javascript",showLineNumbers:!0})]}),n.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-vexor-400",children:"When to use SSE vs WebSocket:"})," Use SSE for one-way server-to-client streaming (notifications, live updates). Use WebSocket for bidirectional communication (chat, gaming, collaboration)."]})})]}),n.jsxs("section",{id:"pubsub",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Pub/Sub & Event Bus"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Decouple your application with event-driven architecture."}),n.jsx(I,{code:r0,filename:"pubsub.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Redis Pub/Sub (Distributed)"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Scale horizontally with Redis-backed pub/sub for multi-instance deployments."}),n.jsx(I,{code:n0,filename:"redis-pubsub.ts",showLineNumbers:!0})]})]}),n.jsxs("section",{id:"resilience",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Resilience Patterns"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Protect your application from cascading failures with circuit breakers and retries."}),n.jsx(I,{code:s0,filename:"resilience.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Circuit Breaker States"}),n.jsxs("ul",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[n.jsxs("li",{children:[n.jsx("strong",{className:"text-green-400",children:"Closed:"})," Normal operation, requests pass through"]}),n.jsxs("li",{children:[n.jsx("strong",{className:"text-yellow-400",children:"Open:"})," Failing, requests blocked, fallback used"]}),n.jsxs("li",{children:[n.jsx("strong",{className:"text-blue-400",children:"Half-Open:"})," Testing if service recovered"]})]})]}),n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Retry Strategies"}),n.jsxs("ul",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[n.jsxs("li",{children:[n.jsx("strong",{children:"Exponential:"})," 1s, 2s, 4s, 8s..."]}),n.jsxs("li",{children:[n.jsx("strong",{children:"Linear:"})," 1s, 2s, 3s, 4s..."]}),n.jsxs("li",{children:[n.jsx("strong",{children:"Fixed:"})," 1s, 1s, 1s, 1s..."]})]})]})]})]}),n.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Next Steps"}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[n.jsxs("a",{href:"/vexorjs/docs/deployment",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Deployment →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Deploy to Node.js, Bun, Lambda, and Edge"})]}),n.jsxs("a",{href:"/vexorjs/docs/core",className:"block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors",children:[n.jsx("h3",{className:"font-semibold mb-1 text-slate-900 dark:text-white",children:"Core Concepts →"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Review routing, context, and lifecycle hooks"})]})]})]})]})}const o0=`// server.ts
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
});`,i0=`# Build stage
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

CMD ["node", "dist/server.js"]`,c0=`version: '3.8'

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
  redis_data:`,u0=`// server.ts (Bun)
import { Vexor } from '@vexorjs/core';
import { createApp } from './app';

const app = createApp();

const port = parseInt(Bun.env.PORT || '3000');

// Bun auto-detects and uses its native HTTP server
app.listen(port, () => {
  console.log(\`Bun server running on port \${port}\`);
});`,d0=`FROM oven/bun:1-alpine AS builder

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

CMD ["bun", "run", "dist/server.js"]`,p0=`// lambda.ts
import { Vexor, createLambdaHandler } from '@vexorjs/core';

const app = new Vexor();

app.get('/hello', (ctx) => {
  return ctx.json({ message: 'Hello from Lambda!' });
});

app.get('/users/:id', (ctx) => {
  return ctx.json({ userId: ctx.params.id });
});

// Export Lambda handler
export const handler = createLambdaHandler(app);`,m0=`// lambda-streaming.ts
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
export const handler = createStreamingLambdaHandler(app);`,h0=`# template.yaml (AWS SAM)
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
    Value: !Sub "https://\${ServerlessHttpApi}.execute-api.\${AWS::Region}.amazonaws.com"`,f0=`// worker.ts
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
};`,x0=`# wrangler.toml
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
database_id = "your-d1-database-id"`,g0=`// api/index.ts (Vercel Edge)
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

export default app.fetch;`,y0=`// vercel.json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "functions": {
    "api/index.ts": {
      "runtime": "edge"
    }
  }
}`,v0=`# ecosystem.config.js (PM2)
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
# pm2 monit`,b0=`# /etc/nginx/sites-available/vexor-api
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
}`,w0=`# .env.example
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
LOG_LEVEL=info`;function k0(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Deployment"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400",children:"Deploy Vexor applications to Node.js, Bun, AWS Lambda, Cloudflare Workers, and more."})]}),n.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[{name:"Node.js",href:"#nodejs"},{name:"Docker",href:"#docker"},{name:"Bun",href:"#bun"},{name:"AWS Lambda",href:"#lambda"},{name:"Cloudflare",href:"#cloudflare"},{name:"Vercel Edge",href:"#vercel"},{name:"PM2 Cluster",href:"#pm2"},{name:"Nginx",href:"#nginx"}].map(l=>n.jsx("a",{href:l.href,className:"p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm",children:l.name},l.name))}),n.jsxs("section",{id:"env",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Environment Variables"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Always use environment variables for configuration. Never commit secrets to version control."}),n.jsx(I,{code:w0,filename:".env.example",showLineNumbers:!0})]}),n.jsxs("section",{id:"nodejs",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Node.js Deployment"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Standard Node.js deployment with graceful shutdown handling."}),n.jsx(I,{code:o0,filename:"server.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"docker",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Docker"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Multi-stage Docker build for optimized production images."}),n.jsx(I,{code:i0,filename:"Dockerfile",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Docker Compose"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Full stack deployment with PostgreSQL and Redis."}),n.jsx(I,{code:c0,filename:"docker-compose.yml",showLineNumbers:!0})]})]}),n.jsxs("section",{id:"bun",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Bun Deployment"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor automatically uses Bun's native HTTP server for maximum performance."}),n.jsx(I,{code:u0,filename:"server.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Bun Dockerfile"}),n.jsx(I,{code:d0,filename:"Dockerfile.bun",showLineNumbers:!0})]}),n.jsx("div",{className:"mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-vexor-400",children:"Performance Tip:"})," Bun's native HTTP server is significantly faster than Node.js. Expect 2-3x higher throughput for compute-bound workloads."]})})]}),n.jsxs("section",{id:"lambda",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"AWS Lambda"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Deploy as a serverless function with API Gateway."}),n.jsx(I,{code:p0,filename:"lambda.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Lambda Streaming"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Use response streaming for large responses or real-time data."}),n.jsx(I,{code:m0,filename:"lambda-streaming.ts",showLineNumbers:!0})]}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"SAM Template"}),n.jsx(I,{code:h0,filename:"template.yaml",showLineNumbers:!0})]})]}),n.jsxs("section",{id:"cloudflare",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Cloudflare Workers"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Deploy to the edge for ultra-low latency worldwide."}),n.jsx(I,{code:f0,filename:"worker.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Wrangler Configuration"}),n.jsx(I,{code:x0,filename:"wrangler.toml",showLineNumbers:!0})]})]}),n.jsxs("section",{id:"vercel",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Vercel Edge"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Deploy to Vercel's edge network with zero configuration."}),n.jsx(I,{code:g0,filename:"api/index.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-8",children:[n.jsx("h3",{className:"text-xl font-semibold mb-4 text-slate-900 dark:text-white",children:"Vercel Configuration"}),n.jsx(I,{code:y0,filename:"vercel.json",showLineNumbers:!0})]})]}),n.jsxs("section",{id:"pm2",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"PM2 Cluster Mode"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Run multiple instances with automatic load balancing and zero-downtime reloads."}),n.jsx(I,{code:v0,filename:"ecosystem.config.js",showLineNumbers:!0})]}),n.jsxs("section",{id:"nginx",children:[n.jsx("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:"Nginx Reverse Proxy"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Production-ready Nginx configuration with SSL and load balancing."}),n.jsx(I,{code:b0,filename:"nginx.conf",showLineNumbers:!0})]}),n.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Production Checklist"}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Security"}),n.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Use HTTPS everywhere"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Set secure headers (CORS, CSP, HSTS)"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Rate limit API endpoints"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Validate all inputs"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Use environment variables for secrets"})]})]})]}),n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Performance"}),n.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Enable compression"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Use connection pooling for databases"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Implement caching strategies"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Monitor with health checks"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Set up logging and tracing"})]})]})]}),n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Reliability"}),n.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Handle graceful shutdown"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Use circuit breakers for external services"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Implement retry logic"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Set appropriate timeouts"})]})]})]}),n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-3 text-vexor-400",children:"Operations"}),n.jsxs("ul",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Set up CI/CD pipelines"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Configure alerts and monitoring"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Plan for database backups"})]}),n.jsxs("li",{className:"flex items-start gap-2",children:[n.jsx("span",{className:"text-green-400 mt-0.5",children:"✓"}),n.jsx("span",{children:"Document runbooks"})]})]})]})]})]})]})}const j0=`# Install globally
npm install -g @vexorjs/cli

# Or use with npx
npx @vexorjs/cli new my-app

# Verify installation
vexor --version`,N0=`# Interactive mode (recommended)
vexor new

# Create with name
vexor new my-app

# Use specific template
vexor new my-app --template api
vexor new my-app --template minimal
vexor new my-app --template microservice
vexor new my-app --template websocket

# Quick creation with defaults
vexor new my-app -y`,S0=`# Generate a complete module
vexor generate module users
vexor g module products

# Generate a database model
vexor generate model User name:string email:string:unique

# Generate a route handler
vexor generate route products

# Generate a migration
vexor generate migration create_posts_table`,E0=`# Interactive integration selection
vexor add

# Add specific integrations
vexor add prisma      # Prisma ORM
vexor add redis       # Redis caching
vexor add vitest      # Unit testing
vexor add docker      # Docker setup
vexor add eslint      # ESLint + Prettier
vexor add github      # GitHub Actions CI/CD
vexor add swagger     # Swagger/OpenAPI docs
vexor add sentry      # Error tracking

# List all available integrations
vexor add:list`,C0=`# Run pending migrations
vexor db:migrate

# Rollback last migration
vexor db:rollback

# Rollback multiple migrations
vexor db:rollback -s 3

# Show migration status
vexor db:status

# Run database seeders
vexor db:seed

# Reset database
vexor db:reset`,T0=`# List all configuration values
vexor config:list

# Get a specific value
vexor config:get defaultTemplate

# Set a value
vexor config:set defaultPackageManager pnpm

# Reset all config
vexor config:reset

# Open config in editor
vexor config:edit`,R0=`# List all environment variables
vexor env:list

# Get a variable
vexor env:get DATABASE_URL

# Set a variable
vexor env:set DATABASE_URL postgres://localhost/myapp

# Create .env from .env.example
vexor env:init

# Compare .env with .env.example
vexor env:diff

# Validate required variables
vexor env:validate`,_0=`# Generate OpenAPI spec from routes
vexor openapi

# Custom output file
vexor openapi -o api-docs.json

# YAML format
vexor openapi -f yaml

# Validate existing spec
vexor openapi:validate`,L0=`# Start development server
vexor dev

# Custom port
vexor dev -p 8080

# Build for production
vexor build

# Build for edge runtime
vexor build --target edge`,A0=`# Auto-detects vitest, jest, mocha, or "node --test" from package.json
vexor test

# Watch mode
vexor test --watch

# Collect coverage
vexor test --coverage

# Open vitest UI
vexor test --ui

# Pattern / file filter
vexor test users.test.ts`,P0=`# Validate .env against env.schema.json
vexor env:check

# Custom file paths
vexor env:check --file .env.production --schema env.schema.prod.json`,I0=`// env.schema.json — validated by vexor env:check
{
  "DATABASE_URL":   { "type": "url",     "required": true },
  "PORT":           { "type": "integer", "required": true, "min": 1, "max": 65535 },
  "NODE_ENV":       {
    "type": "enum",
    "values": ["development", "production", "test"],
    "default": "development"
  },
  "JWT_SECRET":     { "type": "string", "required": true, "minLength": 32 },
  "ENABLE_FEATURE": { "type": "boolean", "default": false }
}`,O0=`// .vexor/integrations/pino.json
// Drop in any JSON file with this shape and \`vexor add pino\` works.
{
  "key": "pino",
  "name": "Pino logger",
  "description": "Fast structured logger",
  "packages": { "dependencies": ["pino"] },
  "files": {
    "src/lib/logger.ts": "import pino from 'pino';\\nexport const logger = pino();\\n"
  },
  "scripts": { "log": "pino-pretty < server.log" }
}`,D0=`# Show system information
vexor info

# Check for common issues
vexor doctor

# Show help
vexor help

# Check for updates
vexor upgrade --check`;function M0(){return n.jsxs("div",{className:"space-y-8 sm:space-y-12",children:[n.jsxs("div",{children:[n.jsx("h1",{className:"text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Vexor CLI"}),n.jsx("p",{className:"text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400",children:"A comprehensive command-line tool for project scaffolding, code generation, configuration management, and development utilities."})]}),n.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3",children:[{name:"Installation",href:"#installation"},{name:"Create Project",href:"#new"},{name:"Generate Code",href:"#generate"},{name:"Integrations",href:"#add"},{name:"Database",href:"#db"},{name:"Configuration",href:"#config"},{name:"Environment",href:"#env"},{name:"Diagnostics",href:"#diagnostics"}].map(l=>n.jsx("a",{href:l.href,className:"p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-xs sm:text-sm text-slate-900 dark:text-white",children:l.name},l.name))}),n.jsxs("section",{id:"installation",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Installation"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Install the CLI globally or use it with npx for one-off commands."}),n.jsx(I,{code:j0,language:"bash",showLineNumbers:!0})]}),n.jsxs("section",{id:"new",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Create a New Project"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Scaffold a new Vexor project with interactive prompts or command-line options."}),n.jsx(I,{code:N0,language:"bash",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-base sm:text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Available Templates"}),n.jsx("div",{className:"space-y-2",children:[{name:"api",desc:"Full REST API with authentication and database"},{name:"minimal",desc:"Minimal setup with just the essentials"},{name:"microservice",desc:"Health checks, tracing, and circuit breakers"},{name:"websocket",desc:"Real-time WebSocket server with rooms"}].map(l=>n.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg",children:[n.jsx("code",{className:"text-vexor-400 text-sm font-medium",children:l.name}),n.jsx("span",{className:"text-xs sm:text-sm text-slate-600 dark:text-slate-400",children:l.desc})]},l.name))})]})]}),n.jsxs("section",{id:"generate",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Code Generation"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Generate modules, models, routes, and migrations with a single command."}),n.jsx(I,{code:S0,language:"bash",showLineNumbers:!0}),n.jsx("div",{className:"mt-6 p-3 sm:p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-lg sm:rounded-xl",children:n.jsxs("p",{className:"text-xs sm:text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-vexor-400",children:"Tip:"})," Running"," ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs",children:"vexor g module users"})," ","creates a complete module with routes, service, schema, and tests."]})})]}),n.jsxs("section",{id:"add",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Add Integrations"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Quickly add popular integrations with automatic package installation and configuration."}),n.jsx(I,{code:E0,language:"bash",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-base sm:text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Available Integrations"}),n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2",children:[{name:"prisma",desc:"Prisma ORM, schema file"},{name:"redis",desc:"Redis client setup"},{name:"vitest",desc:"Testing framework"},{name:"docker",desc:"Docker configuration"},{name:"eslint",desc:"ESLint + Prettier"},{name:"github",desc:"GitHub Actions CI/CD"},{name:"swagger",desc:"Swagger UI, OpenAPI"},{name:"sentry",desc:"Error tracking"}].map(l=>n.jsxs("div",{className:"flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg",children:[n.jsx("code",{className:"text-vexor-400 text-xs sm:text-sm font-medium",children:l.name}),n.jsx("span",{className:"text-xs text-slate-500 dark:text-slate-400",children:l.desc})]},l.name))})]})]}),n.jsxs("section",{id:"db",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Database Commands"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Manage database migrations, seeds, and resets."}),n.jsx(I,{code:C0,language:"bash",showLineNumbers:!0})]}),n.jsxs("section",{id:"config",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Configuration Management"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Manage CLI settings at both global and project level."}),n.jsx(I,{code:T0,language:"bash",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-base sm:text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Available Settings"}),n.jsx("div",{className:"space-y-2",children:[{key:"defaultTemplate",desc:"Default project template",def:"api"},{key:"defaultPackageManager",desc:"Package manager to use",def:"npm"},{key:"telemetry",desc:"Enable anonymous telemetry",def:"true"},{key:"colors",desc:"Enable colored output",def:"true"}].map(l=>n.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg",children:[n.jsx("code",{className:"text-xs sm:text-sm text-slate-700 dark:text-slate-300",children:l.key}),n.jsx("span",{className:"text-xs text-slate-500",children:l.desc}),n.jsxs("span",{className:"text-xs text-vexor-400 sm:ml-auto",children:["default: ",l.def]})]},l.key))})]})]}),n.jsxs("section",{id:"env",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Environment Management"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Manage .env files with validation and comparison tools."}),n.jsx(I,{code:R0,language:"bash",showLineNumbers:!0})]}),n.jsxs("section",{id:"openapi",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"OpenAPI Generation"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Generate OpenAPI/Swagger documentation from your route definitions."}),n.jsx(I,{code:_0,language:"bash",showLineNumbers:!0})]}),n.jsxs("section",{id:"dev",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Development Commands"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Start development server and build for production."}),n.jsx(I,{code:L0,language:"bash",showLineNumbers:!0})]}),n.jsxs("section",{id:"test",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Run tests"}),n.jsxs("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:[n.jsx("code",{children:"vexor test"})," auto-detects the project's runner from ",n.jsx("code",{children:"package.json"})," — vitest, jest, mocha, or ",n.jsx("code",{children:"node --test"})," — and dispatches accordingly. No setup required."]}),n.jsx(I,{code:A0,language:"bash",showLineNumbers:!0})]}),n.jsxs("section",{id:"env-check",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Schema-based env validation"}),n.jsxs("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:[n.jsx("code",{children:"vexor env:check"})," validates your ",n.jsx("code",{children:".env"})," against an ",n.jsx("code",{children:"env.schema.json"})," at the project root. Types: ",n.jsx("code",{children:"string"}),", ",n.jsx("code",{children:"integer"}),", ",n.jsx("code",{children:"number"}),", ",n.jsx("code",{children:"boolean"}),",",n.jsx("code",{children:" url"}),", ",n.jsx("code",{children:"email"}),", ",n.jsx("code",{children:"enum"})," — with ",n.jsx("code",{children:"required"}),", ",n.jsx("code",{children:"default"}),",",n.jsx("code",{children:" min"}),"/",n.jsx("code",{children:"max"}),", ",n.jsx("code",{children:"minLength"}),"/",n.jsx("code",{children:"maxLength"}),", ",n.jsx("code",{children:"pattern"}),". Exits non-zero on failure, perfect for CI gates."]}),n.jsx(I,{code:P0,language:"bash",showLineNumbers:!0}),n.jsx("h3",{className:"text-base sm:text-lg font-semibold mt-6 mb-3 text-slate-900 dark:text-white",children:"Schema file"}),n.jsx(I,{code:I0,filename:"env.schema.json",showLineNumbers:!0})]}),n.jsxs("section",{id:"custom-integrations",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Custom integrations"}),n.jsxs("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:["Extend ",n.jsx("code",{children:"vexor add"})," without forking the CLI. Drop a JSON file in",n.jsx("code",{children:" .vexor/integrations/"})," and it'll appear in ",n.jsx("code",{children:"vexor add:list"})," immediately. Resolution order: project-local → runtime-registered → built-in."]}),n.jsx(I,{code:O0,filename:".vexor/integrations/pino.json",showLineNumbers:!0})]}),n.jsxs("section",{id:"diagnostics",children:[n.jsx("h2",{className:"text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white",children:"Diagnostics & Support"}),n.jsx("p",{className:"text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4",children:"Check system information, diagnose issues, and get help."}),n.jsx(I,{code:D0,language:"bash",showLineNumbers:!0})]}),n.jsxs("section",{className:"p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl",children:[n.jsx("h2",{className:"text-lg sm:text-xl font-bold mb-4 text-slate-900 dark:text-white",children:"Quick Reference"}),n.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm",children:[n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-2 text-vexor-400",children:"Project"}),n.jsxs("ul",{className:"space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400",children:[n.jsx("li",{children:n.jsx("code",{children:"vexor new [name]"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor generate <type> <name>"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor add [integration]"})})]})]}),n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-2 text-vexor-400",children:"Database"}),n.jsxs("ul",{className:"space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400",children:[n.jsx("li",{children:n.jsx("code",{children:"vexor db:migrate"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor db:rollback"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor db:status"})})]})]}),n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-2 text-vexor-400",children:"Config & Env"}),n.jsxs("ul",{className:"space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400",children:[n.jsx("li",{children:n.jsx("code",{children:"vexor config:list"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor env:init"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor env:validate"})})]})]}),n.jsxs("div",{children:[n.jsx("h3",{className:"font-semibold mb-2 text-vexor-400",children:"Development"}),n.jsxs("ul",{className:"space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400",children:[n.jsx("li",{children:n.jsx("code",{children:"vexor dev"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor build"})}),n.jsx("li",{children:n.jsx("code",{children:"vexor doctor"})})]})]})]})]})]})}const no=[{level:"Beginner",title:"Fundamentals",description:"Start your backend journey. Learn HTTP, TypeScript, and build your first API from scratch.",href:"/learn/fundamentals",icon:n.jsx(fo,{className:"w-6 h-6"}),color:"text-emerald-600 dark:text-emerald-400",bgColor:"bg-emerald-500/10",borderColor:"border-emerald-500/20 hover:border-emerald-500/40",badgeColor:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",duration:"2-3 hours",chapters:[{title:"HTTP & REST Basics",href:"/learn/fundamentals#http-basics",icon:n.jsx(ed,{className:"w-4 h-4"})},{title:"TypeScript Essentials",href:"/learn/fundamentals#typescript",icon:n.jsx(oo,{className:"w-4 h-4"})},{title:"Your First API",href:"/learn/fundamentals#first-api",icon:n.jsx(Zs,{className:"w-4 h-4"})},{title:"Request & Response",href:"/learn/fundamentals#request-response",icon:n.jsx($h,{className:"w-4 h-4"})},{title:"Working with JSON",href:"/learn/fundamentals#json",icon:n.jsx(ho,{className:"w-4 h-4"})},{title:"RESTful CRUD API",href:"/learn/fundamentals#restful-crud",icon:n.jsx(td,{className:"w-4 h-4"})}]},{level:"Intermediate",title:"Building APIs",description:"Level up with authentication, databases, error handling, validation, and testing.",href:"/learn/building-apis",icon:n.jsx(oo,{className:"w-6 h-6"}),color:"text-blue-600 dark:text-blue-400",bgColor:"bg-blue-500/10",borderColor:"border-blue-500/20 hover:border-blue-500/40",badgeColor:"bg-blue-500/10 text-blue-600 dark:text-blue-400",duration:"4-5 hours",chapters:[{title:"Authentication & JWT",href:"/learn/building-apis#authentication",icon:n.jsx(Dh,{className:"w-4 h-4"})},{title:"Database Patterns",href:"/learn/building-apis#database",icon:n.jsx(Ys,{className:"w-4 h-4"})},{title:"Error Handling",href:"/learn/building-apis#error-handling",icon:n.jsx(io,{className:"w-4 h-4"})},{title:"Input Validation",href:"/learn/building-apis#validation",icon:n.jsx(Au,{className:"w-4 h-4"})},{title:"File Uploads",href:"/learn/building-apis#file-uploads",icon:n.jsx(Vh,{className:"w-4 h-4"})},{title:"Testing APIs",href:"/learn/building-apis#testing",icon:n.jsx(Uh,{className:"w-4 h-4"})}]},{level:"Advanced",title:"Architecture & System Design",description:"Design systems that scale with microservices, events, caching, and performance patterns.",href:"/learn/architecture",icon:n.jsx(Xs,{className:"w-6 h-6"}),color:"text-purple-600 dark:text-purple-400",bgColor:"bg-purple-500/10",borderColor:"border-purple-500/20 hover:border-purple-500/40",badgeColor:"bg-purple-500/10 text-purple-600 dark:text-purple-400",duration:"5-6 hours",chapters:[{title:"System Design",href:"/learn/architecture#system-design",icon:n.jsx(Pu,{className:"w-4 h-4"})},{title:"Microservices",href:"/learn/architecture#microservices",icon:n.jsx(Xs,{className:"w-4 h-4"})},{title:"Event-Driven",href:"/learn/architecture#event-driven",icon:n.jsx(Zs,{className:"w-4 h-4"})},{title:"Caching Strategies",href:"/learn/architecture#caching",icon:n.jsx(Ys,{className:"w-4 h-4"})},{title:"Performance",href:"/learn/architecture#performance",icon:n.jsx(Au,{className:"w-4 h-4"})}]},{level:"Expert",title:"Production & DevOps",description:"Ship with confidence. Docker, CI/CD, monitoring, security, and scaling strategies.",href:"/learn/production",icon:n.jsx(rd,{className:"w-6 h-6"}),color:"text-red-600 dark:text-red-400",bgColor:"bg-red-500/10",borderColor:"border-red-500/20 hover:border-red-500/40",badgeColor:"bg-red-500/10 text-red-600 dark:text-red-400",duration:"4-5 hours",chapters:[{title:"Docker & Containers",href:"/learn/production#docker",icon:n.jsx(Ah,{className:"w-4 h-4"})},{title:"Monitoring & Logging",href:"/learn/production#monitoring",icon:n.jsx(Sh,{className:"w-4 h-4"})},{title:"Security Hardening",href:"/learn/production#security",icon:n.jsx(io,{className:"w-4 h-4"})},{title:"CI/CD Pipelines",href:"/learn/production#cicd",icon:n.jsx(Ih,{className:"w-4 h-4"})},{title:"Scaling & Clustering",href:"/learn/production#scaling",icon:n.jsx(Pu,{className:"w-4 h-4"})},{title:"Environment Config",href:"/learn/production#config",icon:n.jsx(zh,{className:"w-4 h-4"})}]}],F0=[{label:"Chapters",value:"23"},{label:"Tracks",value:"4"},{label:"Code Examples",value:"50+"},{label:"Estimated Time",value:"15-19h"}];function z0(){return n.jsxs("div",{className:"space-y-16",children:[n.jsxs("div",{className:"relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-8 sm:p-12",children:[n.jsx("div",{className:"absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-vexor-500/20 via-transparent to-purple-500/10"}),n.jsx("div",{className:"absolute top-0 right-0 w-96 h-96 bg-vexor-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"}),n.jsx("div",{className:"absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"}),n.jsxs("div",{className:"relative z-10",children:[n.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 bg-vexor-500/20 text-vexor-400 rounded-full text-sm font-medium mb-6",children:[n.jsx(ho,{className:"w-4 h-4"}),"Learning Center"]}),n.jsxs("h1",{className:"text-4xl sm:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight",children:["Master Backend Development with"," ",n.jsx("span",{className:"bg-gradient-to-r from-vexor-400 to-purple-400 bg-clip-text text-transparent",children:"Vexor"})]}),n.jsx("p",{className:"text-lg text-slate-300 max-w-2xl mb-8",children:"A structured learning path from your first API to production-grade systems. Hands-on code examples, real-world patterns, and best practices at every level."}),n.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg",children:F0.map(l=>n.jsxs("div",{children:[n.jsx("div",{className:"text-2xl font-bold text-white",children:l.value}),n.jsx("div",{className:"text-sm text-slate-400",children:l.label})]},l.label))})]})]}),n.jsxs("div",{children:[n.jsxs("div",{className:"text-center mb-10",children:[n.jsx("h2",{className:"text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3",children:"Your Learning Path"}),n.jsx("p",{className:"text-slate-500 dark:text-slate-400 max-w-xl mx-auto",children:"Progress through four tracks, each building on the last. Start wherever matches your experience level."})]}),n.jsx("div",{className:"hidden md:flex items-center justify-between max-w-3xl mx-auto mb-12 px-8",children:no.map((l,c)=>n.jsxs("div",{className:"flex items-center",children:[n.jsxs(ct,{to:l.href,className:"flex flex-col items-center gap-2 group",children:[n.jsx("div",{className:`w-12 h-12 rounded-xl ${l.bgColor} flex items-center justify-center ${l.color} group-hover:scale-110 transition-transform`,children:l.icon}),n.jsx("span",{className:`text-xs font-semibold ${l.color}`,children:l.level})]}),c<no.length-1&&n.jsx("div",{className:"w-20 lg:w-32 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-slate-200 dark:to-slate-800 mx-3"})]},l.level))})]}),n.jsx("div",{className:"space-y-8",children:no.map((l,c)=>n.jsxs("div",{className:`rounded-2xl border ${l.borderColor} bg-white dark:bg-slate-900/50 transition-colors overflow-hidden`,children:[n.jsx("div",{className:"p-6 sm:p-8",children:n.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6",children:[n.jsx("div",{className:`w-14 h-14 rounded-2xl ${l.bgColor} flex items-center justify-center ${l.color} flex-shrink-0`,children:l.icon}),n.jsxs("div",{className:"flex-1 min-w-0",children:[n.jsxs("div",{className:"flex flex-wrap items-center gap-3 mb-2",children:[n.jsx("span",{className:`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${l.badgeColor}`,children:l.level}),n.jsxs("span",{className:"inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400",children:[n.jsx(_h,{className:"w-3 h-3"}),l.duration]}),n.jsxs("span",{className:"text-xs text-slate-500 dark:text-slate-400",children:[l.chapters.length," chapters"]})]}),n.jsx("h3",{className:"text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2",children:l.title}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:l.description})]}),n.jsxs(ct,{to:l.href,className:`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 flex-shrink-0 ${c===0?"bg-emerald-500 hover:bg-emerald-600":c===1?"bg-blue-500 hover:bg-blue-600":c===2?"bg-purple-500 hover:bg-purple-600":"bg-red-500 hover:bg-red-600"}`,children:["Start Track",n.jsx(Ks,{className:"w-4 h-4"})]})]})}),n.jsx("div",{className:"border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 px-6 sm:px-8 py-5",children:n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2",children:l.chapters.map((i,d)=>n.jsxs(ct,{to:i.href,className:"flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800/50 transition-colors group",children:[n.jsx("span",{className:`flex items-center justify-center w-8 h-8 rounded-lg ${l.bgColor} ${l.color} flex-shrink-0 text-sm`,children:i.icon}),n.jsxs("div",{className:"flex-1 min-w-0",children:[n.jsx("span",{className:"text-xs text-slate-400 dark:text-slate-500 font-medium",children:String(d+1).padStart(2,"0")}),n.jsx("p",{className:"text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate",children:i.title})]}),n.jsx(Ks,{className:"w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 flex-shrink-0"})]},i.title))})})]},l.level))}),n.jsxs("div",{children:[n.jsx("h2",{className:"text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center",children:"What You'll Learn to Build"}),n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:[{title:"RESTful APIs",desc:"CRUD operations with validation, error handling, and proper HTTP semantics",gradient:"from-emerald-500 to-teal-600"},{title:"Auth Systems",desc:"JWT tokens, role-based access control, middleware guards, and session management",gradient:"from-blue-500 to-indigo-600"},{title:"Scalable Architecture",desc:"Microservices, event-driven systems, caching layers, and message queues",gradient:"from-purple-500 to-violet-600"},{title:"Production Deploys",desc:"Docker, CI/CD pipelines, monitoring, security hardening, and scaling",gradient:"from-red-500 to-rose-600"}].map(l=>n.jsxs("div",{className:"relative overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5",children:[n.jsx("div",{className:`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${l.gradient}`}),n.jsx("h3",{className:"font-bold text-slate-900 dark:text-white mt-2 mb-2",children:l.title}),n.jsx("p",{className:"text-sm text-slate-500 dark:text-slate-400",children:l.desc})]},l.title))})]}),n.jsxs("div",{className:"text-center py-8",children:[n.jsx("h2",{className:"text-2xl font-bold text-slate-900 dark:text-white mb-3",children:"Ready to Start?"}),n.jsx("p",{className:"text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto",children:"Begin with the fundamentals or jump to the track that matches your skill level."}),n.jsxs("div",{className:"flex flex-wrap justify-center gap-3",children:[n.jsxs(ct,{to:"/learn/fundamentals",className:"inline-flex items-center gap-2 px-6 py-3 bg-vexor-500 hover:bg-vexor-600 text-white rounded-xl transition-colors font-semibold",children:[n.jsx(fo,{className:"w-5 h-5"}),"Start from Basics"]}),n.jsxs(ct,{to:"/learn/architecture",className:"inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-colors font-semibold",children:[n.jsx(Xs,{className:"w-5 h-5"}),"Jump to Architecture"]})]})]})]})}const B0=`// HTTP Methods - The verbs of the web
// GET    - Retrieve data (safe, idempotent)
// POST   - Create new resources
// PUT    - Replace entire resource (idempotent)
// PATCH  - Partially update resource
// DELETE - Remove a resource (idempotent)

// Status Codes - The language of responses
// 200 OK              - Request succeeded
// 201 Created         - Resource created successfully
// 204 No Content      - Success with no body
// 400 Bad Request     - Client sent invalid data
// 401 Unauthorized    - Authentication required
// 403 Forbidden       - Authenticated but not allowed
// 404 Not Found       - Resource doesn't exist
// 409 Conflict        - Resource state conflict
// 422 Unprocessable   - Validation failed
// 500 Internal Error  - Server-side failure`,U0=`// Type annotations
let name: string = 'Vexor';
let port: number = 3000;
let isRunning: boolean = true;

// Interfaces - Define object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';       // Union types
  avatar?: string;               // Optional property
  readonly createdAt: Date;      // Read-only
}

// Generics - Reusable type patterns
interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
  };
}

// Type inference - TypeScript figures it out
const users: ApiResponse<User[]> = {
  data: [{ id: '1', name: 'John', email: 'john@test.com', role: 'user', createdAt: new Date() }],
  meta: { total: 1, page: 1 }
};

// Async/Await - Modern async patterns
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
}`,V0=`import { Vexor } from '@vexorjs/core';

// 1. Create an application instance
const app = new Vexor();

// 2. Define your first route
app.get('/', async (ctx) => {
  return ctx.json({ message: 'Hello, World!' });
});

// 3. Add a route with parameters
app.get('/greet/:name', async (ctx) => {
  const { name } = ctx.params;
  return ctx.json({ message: \`Hello, \${name}!\` });
});

// 4. Handle POST requests with body
app.post('/echo', async (ctx) => {
  const body = await ctx.body();
  return ctx.status(201).json({
    received: body,
    timestamp: new Date().toISOString()
  });
});

// 5. Start the server
app.listen(3000);
console.log('Server running at http://localhost:3000');`,$0=`// The Request-Response Lifecycle in Vexor
//
// Client Request
//     |
//     v
// [1] Server receives HTTP request
//     |
//     v
// [2] Middleware chain executes (onRequest hooks)
//     |
//     v
// [3] Route matching (radix tree lookup)
//     |
//     v
// [4] Schema validation (if defined)
//     |
//     v
// [5] Route handler executes
//     |
//     v
// [6] Response sent back to client

app.get('/users/:id', async (ctx) => {
  // ctx.method   -> 'GET'
  // ctx.path     -> '/users/42'
  // ctx.params   -> { id: '42' }
  // ctx.query    -> { include: 'posts' }  (from ?include=posts)
  // ctx.headers  -> { 'content-type': '...' }

  return ctx
    .status(200)
    .header('X-Request-Id', 'abc-123')
    .json({ id: ctx.params.id, name: 'Jane' });
});`,H0=`// Receiving JSON
app.post('/api/users', async (ctx) => {
  // Parse the JSON request body (async)
  const { name, email } = await ctx.body();

  // Process the data
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString()
  };

  return ctx.status(201).json(user);
});

// Sending different response types
app.get('/api/report', async (ctx) => {
  const format = ctx.query.format;

  switch (format) {
    case 'json':
      return ctx.json({ revenue: 50000, growth: 12.5 });

    case 'text':
      return ctx.text('Revenue: $50,000 | Growth: 12.5%');

    case 'html':
      return ctx.html('<h1>Revenue Report</h1><p>$50,000</p>');

    default:
      return ctx.json({ revenue: 50000, growth: 12.5 });
  }
});`,q0=`import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// In-memory store (use a database in production!)
const todos: Map<string, any> = new Map();

// LIST all todos
app.get('/api/todos', async (ctx) => {
  const items = Array.from(todos.values());
  return ctx.json({ data: items, total: items.length });
});

// GET single todo
app.get('/api/todos/:id', async (ctx) => {
  const todo = todos.get(ctx.params.id);
  if (!todo) {
    return ctx.status(404).json({ error: 'Todo not found' });
  }
  return ctx.json(todo);
});

// CREATE a todo
app.post('/api/todos', {
  body: Type.Object({
    title: Type.String({ minLength: 1 }),
    completed: Type.Optional(Type.Boolean())
  })
}, async (ctx) => {
  const { title, completed = false } = await ctx.body();
  const todo = {
    id: crypto.randomUUID(),
    title,
    completed,
    createdAt: new Date().toISOString()
  };
  todos.set(todo.id, todo);
  return ctx.status(201).json(todo);
});

// UPDATE a todo
app.put('/api/todos/:id', {
  body: Type.Object({
    title: Type.Optional(Type.String({ minLength: 1 })),
    completed: Type.Optional(Type.Boolean())
  })
}, async (ctx) => {
  const todo = todos.get(ctx.params.id);
  if (!todo) {
    return ctx.status(404).json({ error: 'Todo not found' });
  }
  Object.assign(todo, await ctx.body(), { updatedAt: new Date().toISOString() });
  return ctx.json(todo);
});

// DELETE a todo
app.delete('/api/todos/:id', async (ctx) => {
  if (!todos.has(ctx.params.id)) {
    return ctx.status(404).json({ error: 'Todo not found' });
  }
  todos.delete(ctx.params.id);
  return ctx.empty();
});

app.listen(3000);`;function W0(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium mb-4",children:[n.jsx("span",{className:"w-2 h-2 bg-green-500 rounded-full"}),"Beginner"]}),n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Fundamentals"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 max-w-3xl",children:"Start your backend development journey. Learn the essential concepts of HTTP, TypeScript, and build your first API with Vexor from scratch."})]}),n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",children:[{num:"01",title:"HTTP & REST Basics",desc:"Understand how the web communicates",color:"from-blue-500 to-cyan-500"},{num:"02",title:"TypeScript Essentials",desc:"Type-safe JavaScript for backends",color:"from-purple-500 to-pink-500"},{num:"03",title:"Your First API",desc:"Build a working API in minutes",color:"from-orange-500 to-red-500"},{num:"04",title:"Request & Response",desc:"The lifecycle of every request",color:"from-green-500 to-emerald-500"},{num:"05",title:"Working with JSON",desc:"Parse, validate, and respond",color:"from-indigo-500 to-violet-500"},{num:"06",title:"RESTful API Design",desc:"Build a complete CRUD API",color:"from-vexor-400 to-vexor-600"}].map(l=>n.jsxs("div",{className:"relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-vexor-500/50 transition-colors",children:[n.jsxs("span",{className:`text-xs font-bold bg-gradient-to-r ${l.color} bg-clip-text text-transparent`,children:["CHAPTER ",l.num]}),n.jsx("h3",{className:"font-semibold mt-1 text-slate-900 dark:text-white",children:l.title}),n.jsx("p",{className:"text-sm text-slate-500 dark:text-slate-400 mt-1",children:l.desc})]},l.num))}),n.jsxs("section",{id:"http-basics",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-blue-500 mr-2",children:"01"})," HTTP & REST Basics"]}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Every web API communicates using ",n.jsx("strong",{children:"HTTP"})," (HyperText Transfer Protocol). Understanding HTTP methods and status codes is the foundation of backend development."]}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[n.jsxs("div",{className:"p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"REST Architecture"}),n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:["REST (Representational State Transfer) organizes your API around ",n.jsx("strong",{children:"resources"})," (nouns like users, posts, orders) and uses HTTP methods (verbs) to perform actions on them."]})]}),n.jsxs("div",{className:"p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Stateless Protocol"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Each HTTP request is independent. The server doesn't remember previous requests. Authentication tokens or session IDs must be sent with every request."})]})]}),n.jsx(I,{code:B0,filename:"http-reference.ts",showLineNumbers:!0}),n.jsx("div",{className:"mt-6 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-amber-600 dark:text-amber-400",children:"Key Takeaway:"})," Think of your API as a set of resources. Use ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"GET /users"})," to list users,",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"POST /users"})," to create one, and",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"GET /users/:id"})," to fetch a specific user."]})})]}),n.jsxs("section",{id:"typescript",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-purple-500 mr-2",children:"02"})," TypeScript Essentials"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor is built with TypeScript first. Understanding types, interfaces, and generics will help you build safer and more maintainable APIs."}),n.jsx(I,{code:U0,filename:"typescript-basics.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-3 gap-4",children:[n.jsxs("div",{className:"p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Type Safety"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Catch bugs at compile time instead of runtime. TypeScript ensures your data shapes are correct."})]}),n.jsxs("div",{className:"p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Auto-Complete"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Your IDE knows every property and method available. No more guessing or checking docs constantly."})]}),n.jsxs("div",{className:"p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Refactoring"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Rename a property and TypeScript finds every usage. Change a type and see all affected code instantly."})]})]})]}),n.jsxs("section",{id:"first-api",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-orange-500 mr-2",children:"03"})," Your First Vexor API"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Let's build a working API. You'll create routes, handle parameters, and respond with JSON — all in under 20 lines of code."}),n.jsxs("div",{className:"mb-6 p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Prerequisites"}),n.jsxs("div",{className:"space-y-2 text-sm text-slate-600 dark:text-slate-400",children:[n.jsx("p",{children:"1. Node.js 20+ installed"}),n.jsxs("p",{children:["2. Run: ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded",children:"npx @vexorjs/cli new my-first-api"})]}),n.jsxs("p",{children:["3. Navigate: ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded",children:"cd my-first-api"})]})]})]}),n.jsx(I,{code:V0,filename:"src/index.ts",showLineNumbers:!0}),n.jsx("div",{className:"mt-6 p-4 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-green-600 dark:text-green-400",children:"Try it out:"})," Run your server with"," ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"npm run dev"}),", then visit"," ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"http://localhost:3000"})," in your browser or use ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"curl http://localhost:3000/greet/Vexor"}),"."]})})]}),n.jsxs("section",{id:"request-response",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-green-500 mr-2",children:"04"})," Request & Response Lifecycle"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Every HTTP request flows through a pipeline in Vexor. Understanding this lifecycle helps you know where to add logic, validation, and error handling."}),n.jsx(I,{code:$0,filename:"lifecycle.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"The Pipeline"}),n.jsx("div",{className:"flex flex-wrap items-center gap-2 text-sm",children:["Receive","Middleware","Route Match","Validate","Handle","Respond"].map((l,c)=>n.jsxs("span",{children:[c>0&&n.jsx("span",{className:"text-slate-400 mr-2",children:"→"}),n.jsx("span",{className:`px-3 py-1 rounded-full ${c===4?"bg-vexor-500/20 text-vexor-400 font-medium":"bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`,children:l})]},l))})]})]}),n.jsxs("section",{id:"json",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-indigo-500 mr-2",children:"05"})," Working with JSON"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"JSON is the lingua franca of modern APIs. Vexor handles JSON parsing and serialization automatically, so you can focus on your business logic."}),n.jsx(I,{code:H0,filename:"json-handling.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"restful-crud",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-vexor-500 mr-2",children:"06"})," Building a RESTful CRUD API"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Let's put it all together. Here's a complete Todo API with Create, Read, Update, and Delete operations, including input validation using Vexor's schema system."}),n.jsx(I,{code:q0,filename:"todo-api.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4",children:[n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Test with cURL"}),n.jsxs("div",{className:"space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400",children:[n.jsx("p",{children:"curl localhost:3000/api/todos"}),n.jsxs("p",{children:[`curl -X POST localhost:3000/api/todos -H "Content-Type: application/json" -d '`,'{"title":"Learn Vexor"}',"'"]})]})]}),n.jsxs("div",{className:"p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"API Endpoints"}),n.jsxs("div",{className:"space-y-1 text-sm text-slate-600 dark:text-slate-400",children:[n.jsxs("p",{children:[n.jsx("span",{className:"text-green-500 font-mono",children:"GET"})," /api/todos"]}),n.jsxs("p",{children:[n.jsx("span",{className:"text-green-500 font-mono",children:"GET"})," /api/todos/:id"]}),n.jsxs("p",{children:[n.jsx("span",{className:"text-yellow-500 font-mono",children:"POST"})," /api/todos"]}),n.jsxs("p",{children:[n.jsx("span",{className:"text-blue-500 font-mono",children:"PUT"})," /api/todos/:id"]}),n.jsxs("p",{children:[n.jsx("span",{className:"text-red-500 font-mono",children:"DELETE"})," /api/todos/:id"]})]})]})]})]}),n.jsxs("section",{className:"p-6 bg-gradient-to-r from-vexor-500/10 to-purple-500/10 border border-vexor-500/20 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-2 text-slate-900 dark:text-white",children:"Ready for More?"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"You've mastered the fundamentals. Next, learn how to build production-ready APIs with authentication, database integration, and testing."}),n.jsx("a",{href:"/learn/building-apis",className:"inline-flex items-center gap-2 px-4 py-2 bg-vexor-500 hover:bg-vexor-600 text-white rounded-lg transition-colors font-medium text-sm",children:"Continue to Building APIs →"})]})]})}const G0=`import { Vexor, Type } from '@vexorjs/core';
import crypto from 'node:crypto';

const app = new Vexor();
const SECRET = 'your-secret-key'; // Use env vars in production!

// Simple JWT-like token (use a proper library in production)
function createToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 3600000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(\`\${header}.\${body}\`).digest('base64url');
  return \`\${header}.\${body}.\${signature}\`;
}

// Login endpoint
app.post('/auth/login', {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 })
  })
}, async (ctx) => {
  const { email, password } = await ctx.body();

  // Validate credentials (check database in real app)
  const user = await findUserByEmail(email);
  if (!user || !await verifyPassword(password, user.passwordHash)) {
    return ctx.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken({ userId: user.id, role: user.role });
  return ctx.json({ token, user: { id: user.id, email: user.email } });
});

// Auth middleware - protects routes
function authGuard() {
  return async (ctx: any, next: () => Promise<void>) => {
    const authHeader = ctx.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return ctx.status(401).json({ error: 'Missing authentication token' });
    }

    try {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      ctx.state.user = payload; // Attach user to context
      await next();
    } catch {
      return ctx.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// Protected route
app.get('/api/profile', authGuard(), async (ctx) => {
  const user = ctx.state.user;
  return ctx.json({ userId: user.userId, role: user.role });
});

// Role-based access control
function requireRole(...roles: string[]) {
  return async (ctx: any, next: () => Promise<void>) => {
    if (!roles.includes(ctx.state.user?.role)) {
      return ctx.status(403).json({ error: 'Insufficient permissions' });
    }
    await next();
  };
}

// Admin-only route
app.delete('/api/users/:id', authGuard(), requireRole('admin'), async (ctx) => {
  await deleteUser(ctx.params.id);
  return ctx.noContent();
});`,Q0=`import { table, column, createDatabase, from, insert, update,
  deleteFrom, eq, and, select } from '@vexorjs/orm';
import { createPostgresDriver } from '@vexorjs/orm/postgres';

// Define your schema with table() and column()
const users = table('users', {
  id:        column.uuid().primaryKey().default('gen_random_uuid()'),
  name:      column.string().notNull(),
  email:     column.string().notNull().unique(),
  role:      column.enum(['admin', 'user', 'moderator']).default('user'),
  isActive:  column.boolean().default(true),
  createdAt: column.timestamp().default('now()'),
  updatedAt: column.timestamp().default('now()'),
});

const posts = table('posts', {
  id:        column.uuid().primaryKey().default('gen_random_uuid()'),
  title:     column.string().notNull(),
  content:   column.text(),
  authorId:  column.uuid().references('users', 'id'),
  status:    column.enum(['draft', 'published', 'archived']).default('draft'),
  views:     column.integer().default(0),
  createdAt: column.timestamp().default('now()'),
});

// Initialize database connection
const db = createDatabase({
  driver: createPostgresDriver({ connectionString: process.env.DATABASE_URL })
});

// CRUD Operations
// Create
const newUser = await insert(users)
  .values({ name: 'Jane Doe', email: 'jane@example.com' })
  .returning()
  .execute(db);

// Read with filters
const activeUsers = await from(users)
  .where(and(
    eq(users.columns.isActive, true),
    eq(users.columns.role, 'user')
  ))
  .orderBy('createdAt', 'desc')
  .limit(20)
  .execute(db);

// Update
await update(users)
  .set({ name: 'Jane Smith' })
  .where(eq(users.columns.id, newUser.id))
  .execute(db);

// Delete
await deleteFrom(users)
  .where(eq(users.columns.id, newUser.id))
  .execute(db);

// Select specific fields with joins
const postsWithAuthors = await from(posts)
  .innerJoin(users, eq(posts.columns.authorId, users.columns.id))
  .where(eq(posts.columns.status, 'published'))
  .select(posts.columns.title, posts.columns.createdAt, users.columns.name)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .execute(db);`,K0=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Custom error classes for clean error handling
class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, \`\${resource} with id '\${id}' not found\`, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(public details: Record<string, string>) {
    super(422, 'Validation failed', 'VALIDATION_ERROR');
  }
}

// Global error handler
app.setErrorHandler(async (error, ctx) => {
  // Log all errors
  console.error(\`[\${new Date().toISOString()}] \${error.name}: \${error.message}\`);

  // Handle known errors
  if (error instanceof AppError) {
    return ctx.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { details: error.details })
      }
    });
  }

  // Handle unknown errors (don't leak internals)
  return ctx.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Usage in routes
app.get('/api/users/:id', async (ctx) => {
  const user = await db.users.findById(ctx.params.id);
  if (!user) throw new NotFoundError('User', ctx.params.id);
  return ctx.json(user);
});

app.post('/api/users', async (ctx) => {
  const { email } = await ctx.body();
  const exists = await db.users.findByEmail(email);
  if (exists) {
    throw new ValidationError({ email: 'Email already registered' });
  }
  // ... create user
});`,Y0=`import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Comprehensive validation schemas
const CreateUserSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 50 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8, maxLength: 128 }),
  age: Type.Optional(Type.Integer({ minimum: 13, maximum: 150 })),
  preferences: Type.Optional(Type.Object({
    theme: Type.Union([Type.Literal('light'), Type.Literal('dark')]),
    language: Type.String({ minLength: 2, maxLength: 5 }),
    notifications: Type.Boolean()
  }))
});

// Query parameter validation
const PaginationSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  sort: Type.Optional(Type.Union([
    Type.Literal('createdAt'),
    Type.Literal('name'),
    Type.Literal('email')
  ])),
  order: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});

// Route with full validation
app.post('/api/users', {
  body: CreateUserSchema,
  // Vexor validates automatically and returns 422 with details
}, async (ctx) => {
  // ctx.body() is fully typed - TypeScript knows every field!
  const { name, email, password, age, preferences } = await ctx.body();
  const user = await createUser({ name, email, password, age, preferences });
  return ctx.status(201).json(user);
});

app.get('/api/users', {
  query: PaginationSchema
}, async (ctx) => {
  const { page, limit, sort, order } = ctx.query;
  const users = await db.users
    .orderBy(sort ?? 'createdAt', order ?? 'desc')
    .paginate(page ?? 1, limit ?? 20);
  return ctx.json(users);
});`,J0=`import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../src/app';

describe('User API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp(); // Your app factory function
  });

  // Helper to make test requests using app.fetch()
  async function request(method: string, path: string, body?: object) {
    return app.fetch(new Request(\`http://localhost\${path}\`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    }));
  }

  describe('POST /api/users', () => {
    it('should create a user with valid data', async () => {
      const res = await request('POST', '/api/users', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'secure123!'
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });
      expect(data).not.toHaveProperty('password');
    });

    it('should reject invalid email', async () => {
      const res = await request('POST', '/api/users', {
        name: 'Jane',
        email: 'not-an-email',
        password: 'secure123!'
      });

      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email', async () => {
      // First create
      await request('POST', '/api/users', {
        name: 'Jane', email: 'dup@test.com', password: 'secure123!'
      });

      // Duplicate attempt
      const res = await request('POST', '/api/users', {
        name: 'Jane 2', email: 'dup@test.com', password: 'secure123!'
      });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const res = await request('GET', '/api/users/non-existent-id');
      expect(res.status).toBe(404);
    });
  });
});`,X0=`import { Vexor } from '@vexorjs/core';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const app = new Vexor();

// Handle file uploads via FormData
app.post('/api/upload', async (ctx) => {
  const formData = await ctx.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return ctx.status(400).json({ error: 'No file provided' });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return ctx.status(422).json({ error: 'Only JPEG, PNG, and WebP images are allowed' });
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return ctx.status(422).json({ error: 'File size must be under 5MB' });
  }

  // Save to disk
  const uploadDir = join(process.cwd(), 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const filename = \`\${Date.now()}-\${file.name}\`;
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return ctx.status(201).json({
    filename,
    size: file.size,
    type: file.type,
    url: \`/uploads/\${filename}\`
  });
});`;function Z0(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4",children:[n.jsx("span",{className:"w-2 h-2 bg-blue-500 rounded-full"}),"Intermediate"]}),n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Building APIs"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 max-w-3xl",children:"Level up from basics to building production-grade APIs. Learn authentication, database patterns, error handling, validation, testing, and more."})]}),n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",children:[{num:"01",title:"Authentication & JWT",desc:"Secure your API with tokens and roles",color:"from-red-500 to-orange-500"},{num:"02",title:"Database Patterns",desc:"ORM, schemas, queries, and joins",color:"from-emerald-500 to-teal-500"},{num:"03",title:"Error Handling",desc:"Graceful errors and custom exceptions",color:"from-yellow-500 to-amber-500"},{num:"04",title:"Input Validation",desc:"Schema-based validation with types",color:"from-violet-500 to-purple-500"},{num:"05",title:"File Uploads",desc:"Handle files and streaming data",color:"from-pink-500 to-rose-500"},{num:"06",title:"Testing APIs",desc:"Unit and integration testing patterns",color:"from-cyan-500 to-blue-500"}].map(l=>n.jsxs("div",{className:"relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-vexor-500/50 transition-colors",children:[n.jsxs("span",{className:`text-xs font-bold bg-gradient-to-r ${l.color} bg-clip-text text-transparent`,children:["CHAPTER ",l.num]}),n.jsx("h3",{className:"font-semibold mt-1 text-slate-900 dark:text-white",children:l.title}),n.jsx("p",{className:"text-sm text-slate-500 dark:text-slate-400 mt-1",children:l.desc})]},l.num))}),n.jsxs("section",{id:"authentication",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-red-500 mr-2",children:"01"})," Authentication & Authorization"]}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Authentication verifies ",n.jsx("em",{children:"who"})," the user is. Authorization determines ",n.jsx("em",{children:"what"})," they can do. Here's how to implement both using middleware and token-based auth."]}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[n.jsxs("div",{className:"p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Token Flow"}),n.jsxs("div",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[n.jsxs("p",{children:["1. Client sends credentials to ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"/auth/login"})]}),n.jsx("p",{children:"2. Server validates and returns a JWT token"}),n.jsxs("p",{children:["3. Client includes token in ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"Authorization: Bearer <token>"})]}),n.jsx("p",{children:"4. Server verifies token on each request"})]})]}),n.jsxs("div",{className:"p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Security Tips"}),n.jsxs("div",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[n.jsx("p",{children:"• Always hash passwords (bcrypt/argon2)"}),n.jsx("p",{children:"• Set short token expiration times"}),n.jsx("p",{children:"• Use HTTPS in production"}),n.jsx("p",{children:"• Store secrets in environment variables"})]})]})]}),n.jsx(I,{code:G0,filename:"auth.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"database",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-emerald-500 mr-2",children:"02"})," Database Patterns with Vexor ORM"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor ORM provides a type-safe, fluent query builder. Define schemas, run queries, and manage relationships with full TypeScript inference."}),n.jsx(I,{code:Q0,filename:"database.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"error-handling",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-yellow-500 mr-2",children:"03"})," Error Handling Strategies"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A well-designed error handling system makes your API predictable and debuggable. Use custom error classes and a centralized error handler for consistent responses."}),n.jsx(I,{code:K0,filename:"errors.ts",showLineNumbers:!0}),n.jsx("div",{className:"mt-6 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-amber-600 dark:text-amber-400",children:"Best Practice:"})," Always return consistent error shapes. Clients should be able to rely on ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"error.code"})," and",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-1 rounded",children:"error.message"})," being present in every error response."]})})]}),n.jsxs("section",{id:"validation",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-violet-500 mr-2",children:"04"})," Input Validation & Security"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Never trust user input. Vexor's schema system validates request bodies, query parameters, and route params at the framework level with zero extra code."}),n.jsx(I,{code:Y0,filename:"validation.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"file-uploads",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-pink-500 mr-2",children:"05"})," File Uploads & Streaming"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Handle file uploads with validation for type, size, and content. Vexor parses multipart form data automatically."}),n.jsx(I,{code:X0,filename:"upload.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"testing",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-cyan-500 mr-2",children:"06"})," Testing Your APIs"]}),n.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor provides a ",n.jsx("code",{className:"bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm",children:"fetch"})," method for in-process HTTP testing. No need to start a real server — tests run fast and reliably."]}),n.jsx(I,{code:J0,filename:"users.test.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-3 gap-4",children:[n.jsxs("div",{className:"p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Unit Tests"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Test individual functions and utilities in isolation. Fast and focused."})]}),n.jsxs("div",{className:"p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Integration Tests"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Test complete routes including middleware, validation, and database interaction."})]}),n.jsxs("div",{className:"p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"E2E Tests"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Test the full application stack with a real server and database."})]})]})]}),n.jsxs("section",{className:"p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-2 text-slate-900 dark:text-white",children:"Level Up to Architecture"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"You can now build solid APIs. Next, learn system design, microservices, event-driven architecture, and patterns used at scale."}),n.jsx("a",{href:"/learn/architecture",className:"inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium text-sm",children:"Continue to Architecture →"})]})]})}const eg=`// System Design: URL Shortener Service
// Requirements: Shorten URLs, redirect, analytics, high throughput
//
// Architecture:
//  Client --> Load Balancer --> API Servers --> Cache (Redis)
//                                    |              |
//                                    v              v
//                              Database (Postgres)
//                                    |
//                                    v
//                            Analytics Pipeline

import { Vexor, Type } from '@vexorjs/core';
import { VexorORM } from '@vexorjs/orm';

const app = new Vexor();

// Base62 encoding for short URLs
function encode(num: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  while (num > 0) {
    result = chars[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result || '0';
}

// Shorten a URL
app.post('/api/shorten', {
  body: Type.Object({
    url: Type.String({ format: 'uri' }),
    customAlias: Type.Optional(Type.String({ minLength: 3, maxLength: 20 }))
  })
}, async (ctx) => {
  const { url, customAlias } = await ctx.body();

  // Check cache first, then database
  const shortCode = customAlias || encode(await getNextId());

  await db.urls.create({
    shortCode,
    originalUrl: url,
    clicks: 0
  });

  // Cache for fast lookups
  await cache.set(\`url:\${shortCode}\`, url, { ttl: 86400 });

  return ctx.status(201).json({
    shortUrl: \`https://short.io/\${shortCode}\`,
    originalUrl: url
  });
});

// Redirect (hot path - must be fast!)
app.get('/:code', async (ctx) => {
  const { code } = ctx.params;

  // 1. Check cache (sub-millisecond)
  let url = await cache.get(\`url:\${code}\`);

  // 2. Cache miss -> check database
  if (!url) {
    const record = await db.urls.where({ shortCode: code }).first();
    if (!record) return ctx.status(404).json({ error: 'Not found' });
    url = record.originalUrl;
    await cache.set(\`url:\${code}\`, url, { ttl: 86400 });
  }

  // 3. Track click asynchronously (don't block redirect)
  trackClick(code, ctx.headers).catch(console.error);

  return ctx.redirect(url, 301);
});`,tg=`// Microservices Architecture with Vexor
//
// Service Boundaries:
//   [User Service]  <-->  [API Gateway]  <-->  [Order Service]
//        |                     |                     |
//        v                     v                     v
//   [User DB]           [Message Queue]         [Order DB]
//                             |
//                             v
//                     [Notification Service]

// === API Gateway ===
import { Vexor } from '@vexorjs/core';

const gateway = new Vexor();

// Service registry
const services = {
  users: 'http://user-service:3001',
  orders: 'http://order-service:3002',
  notifications: 'http://notification-service:3003',
};

// Proxy requests to downstream services
gateway.group('/api/users', (group) => {
  group.all('/*', async (ctx) => {
    const response = await fetch(\`\${services.users}\${ctx.path}\`, {
      method: ctx.method,
      headers: ctx.headers,
      body: ctx.method !== 'GET' ? JSON.stringify(await ctx.body()) : undefined
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });
});

// === User Service (independent) ===
const userService = new Vexor();

userService.get('/api/users/:id', async (ctx) => {
  const user = await userDb.findById(ctx.params.id);
  return ctx.json(user);
});

userService.post('/api/users', async (ctx) => {
  const user = await userDb.create(await ctx.body());

  // Publish event for other services
  await messageQueue.publish('user.created', {
    userId: user.id,
    email: user.email,
    timestamp: Date.now()
  });

  return ctx.status(201).json(user);
});

// === Notification Service (event-driven) ===
const notificationService = new Vexor();

// Listen for events from message queue
messageQueue.subscribe('user.created', async (event) => {
  await sendWelcomeEmail(event.email);
  console.log(\`Welcome email sent to \${event.email}\`);
});

messageQueue.subscribe('order.completed', async (event) => {
  await sendOrderConfirmation(event.userId, event.orderId);
});`,rg=`// Event-Driven Architecture
// Pattern: Publish events, react asynchronously

// Event bus implementation
class EventBus {
  private handlers = new Map<string, Function[]>();

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  async emit(event: string, data: any) {
    const handlers = this.handlers.get(event) || [];
    await Promise.allSettled(handlers.map(h => h(data)));
  }
}

const events = new EventBus();

// Register event handlers
events.on('user.registered', async (data) => {
  await sendWelcomeEmail(data.email);
});

events.on('user.registered', async (data) => {
  await createDefaultSettings(data.userId);
});

events.on('user.registered', async (data) => {
  await analytics.track('signup', { userId: data.userId });
});

events.on('order.placed', async (data) => {
  await updateInventory(data.items);
  await processPayment(data.paymentDetails);
  await notifyWarehouse(data.orderId);
});

// Usage in routes - clean separation of concerns
app.post('/api/users', async (ctx) => {
  const user = await db.users.create(await ctx.body());

  // Fire and forget - handlers run independently
  events.emit('user.registered', {
    userId: user.id,
    email: user.email,
    name: user.name
  });

  return ctx.status(201).json(user);
});`,ng=`// Caching Strategies
//
// 1. Cache-Aside (Lazy Loading)
//    App checks cache first, falls back to DB, populates cache
//
// 2. Write-Through
//    App writes to cache and DB simultaneously
//
// 3. Write-Behind (Write-Back)
//    App writes to cache, async write to DB later

// In-memory cache with TTL
class Cache {
  private store = new Map<string, { value: any; expires: number }>();

  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: any, ttlSeconds: number) {
    this.store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  }

  invalidate(pattern: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) this.store.delete(key);
    }
  }
}

const cache = new Cache();

// Cache-aside pattern in routes
app.get('/api/products/:id', async (ctx) => {
  const cacheKey = \`product:\${ctx.params.id}\`;

  // 1. Check cache
  let product = cache.get(cacheKey);
  if (product) {
    ctx.header('X-Cache', 'HIT');
    return ctx.json(product);
  }

  // 2. Cache miss - fetch from DB
  product = await db.products.findById(ctx.params.id);
  if (!product) return ctx.status(404).json({ error: 'Not found' });

  // 3. Populate cache (TTL: 5 minutes)
  cache.set(cacheKey, product, 300);
  ctx.header('X-Cache', 'MISS');
  return ctx.json(product);
});

// Invalidate on update
app.put('/api/products/:id', async (ctx) => {
  const product = await db.products.update(ctx.params.id, await ctx.body());
  cache.invalidate(\`product:\${ctx.params.id}\`);    // Invalidate specific
  cache.invalidate('products:list');                  // Invalidate list cache
  return ctx.json(product);
});

// HTTP Caching headers
app.get('/api/static-data', async (ctx) => {
  return ctx
    .header('Cache-Control', 'public, max-age=3600')  // Browser caches for 1 hour
    .header('ETag', 'v1.2.3')                          // Version-based caching
    .json({ data: staticContent });
});`,sg=`// Performance Optimization Techniques

import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// 1. Connection Pooling
// Reuse database connections instead of creating new ones per request
const db = new VexorORM({
  connectionString: process.env.DATABASE_URL,
  pool: {
    min: 5,      // Minimum connections kept alive
    max: 20,     // Maximum concurrent connections
    idle: 30000  // Close idle connections after 30s
  }
});

// 2. Pagination - Never return all records
app.get('/api/products', {
  query: Type.Object({
    cursor: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 }))
  })
}, async (ctx) => {
  const limit = ctx.query.limit ?? 20;
  const cursor = ctx.query.cursor;

  const products = await db.products
    .where(cursor ? { id: { gt: cursor } } : {})
    .orderBy('id', 'asc')
    .limit(limit + 1)  // Fetch one extra to check if there's more
    .execute();

  const hasMore = products.length > limit;
  const items = hasMore ? products.slice(0, -1) : products;

  return ctx.json({
    data: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    hasMore
  });
});

// 3. Response Compression
app.use(compression({ threshold: 1024 })); // Compress responses > 1KB

// 4. Request timeout
app.addHook('onRequest', async (ctx) => {
  // Abort long-running requests
  setTimeout(() => {
    if (!ctx.response.sent) {
      ctx.status(408).json({ error: 'Request timeout' });
    }
  }, 30000);
});

// 5. Selective field loading
app.get('/api/users', async (ctx) => {
  const fields = ctx.query.fields?.split(',') || ['id', 'name', 'email'];
  const users = await db.users.select(...fields).execute();
  return ctx.json(users);
});`;function ag(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium mb-4",children:[n.jsx("span",{className:"w-2 h-2 bg-purple-500 rounded-full"}),"Advanced"]}),n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Architecture & System Design"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 max-w-3xl",children:"Design systems that scale. Learn system design patterns, microservices, event-driven architecture, caching strategies, and performance optimization."})]}),n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",children:[{num:"01",title:"System Design",desc:"Design scalable systems end-to-end",color:"from-rose-500 to-red-600",icon:"&#x1f3d7;"},{num:"02",title:"Microservices",desc:"Service boundaries and communication",color:"from-blue-500 to-indigo-600",icon:"&#x1f9e9;"},{num:"03",title:"Event-Driven",desc:"Async processing and event buses",color:"from-green-500 to-emerald-600",icon:"&#x26a1;"},{num:"04",title:"Caching Strategies",desc:"Cache-aside, write-through, TTL",color:"from-amber-500 to-orange-600",icon:"&#x1f4be;"},{num:"05",title:"Performance",desc:"Pooling, pagination, compression",color:"from-violet-500 to-purple-600",icon:"&#x1f680;"}].map(l=>n.jsxs("div",{className:"relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-vexor-500/50 transition-colors",children:[n.jsxs("span",{className:`text-xs font-bold bg-gradient-to-r ${l.color} bg-clip-text text-transparent`,children:["CHAPTER ",l.num]}),n.jsx("h3",{className:"font-semibold mt-1 text-slate-900 dark:text-white",children:l.title}),n.jsx("p",{className:"text-sm text-slate-500 dark:text-slate-400 mt-1",children:l.desc})]},l.num))}),n.jsxs("section",{className:"p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl",children:[n.jsx("h3",{className:"text-lg font-bold mb-4 text-slate-900 dark:text-white",children:"Key Concepts to Master"}),n.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[{title:"Scalability",desc:"Horizontal vs vertical scaling, stateless services, load distribution"},{title:"Reliability",desc:"Redundancy, failover, circuit breakers, retry strategies"},{title:"Availability",desc:"SLAs, health checks, graceful degradation, zero-downtime deploys"},{title:"Consistency",desc:"Strong vs eventual consistency, CAP theorem, distributed consensus"}].map(l=>n.jsxs("div",{className:"p-3 bg-white dark:bg-slate-800/50 rounded-xl",children:[n.jsx("h4",{className:"font-semibold text-sm text-slate-900 dark:text-white",children:l.title}),n.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400 mt-1",children:l.desc})]},l.title))})]}),n.jsxs("section",{id:"system-design",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-rose-500 mr-2",children:"01"})," System Design: URL Shortener"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Walk through designing a real system end-to-end. We'll build a URL shortener covering requirements gathering, architecture decisions, database design, caching, and scaling."}),n.jsxs("div",{className:"mb-6 p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-3 text-slate-900 dark:text-white",children:"Design Process"}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400",children:[n.jsxs("div",{className:"space-y-2",children:[n.jsxs("p",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"1. Requirements:"})," Functional (shorten, redirect) and non-functional (low latency, high availability)"]}),n.jsxs("p",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"2. Estimations:"})," 100M URLs/month, 10:1 read/write ratio, ~40K reads/sec peak"]})]}),n.jsxs("div",{className:"space-y-2",children:[n.jsxs("p",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"3. Architecture:"})," API servers + Cache layer + Database + Analytics pipeline"]}),n.jsxs("p",{children:[n.jsx("strong",{className:"text-slate-900 dark:text-white",children:"4. Trade-offs:"})," Consistency vs availability, cache invalidation strategy"]})]})]})]}),n.jsx(I,{code:eg,filename:"url-shortener.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"microservices",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-blue-500 mr-2",children:"02"})," Microservices Architecture"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Break your application into independently deployable services. Each service owns its data, communicates via APIs or message queues, and scales independently."}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",children:[n.jsxs("div",{className:"p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"When to Use"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Large teams, different scaling needs per feature, independent deploy cycles, polyglot tech stack."})]}),n.jsxs("div",{className:"p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"When NOT to Use"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Small teams, early-stage products, simple CRUD apps. Start monolith, extract services when needed."})]}),n.jsxs("div",{className:"p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Communication"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Sync: REST/gRPC between services. Async: Message queues (RabbitMQ, Kafka) for events."})]})]}),n.jsx(I,{code:tg,filename:"microservices.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"event-driven",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-green-500 mr-2",children:"03"})," Event-Driven Architecture"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Decouple your application with events. Instead of calling services directly, publish events and let interested parties react independently."}),n.jsx(I,{code:rg,filename:"events.ts",showLineNumbers:!0}),n.jsx("div",{className:"mt-6 p-4 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl",children:n.jsxs("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:[n.jsx("strong",{className:"text-green-600 dark:text-green-400",children:"Why Events?"})," The user registration handler doesn't need to know about emails, analytics, or settings. It just creates the user and announces it happened. Each concern is handled independently and can fail without affecting the main flow."]})})]}),n.jsxs("section",{id:"caching",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-amber-500 mr-2",children:"04"})," Caching Strategies"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Caching is the single most effective way to improve API performance. Learn when to cache, how to invalidate, and which strategy fits your use case."}),n.jsx(I,{code:ng,filename:"caching.ts",showLineNumbers:!0})]}),n.jsxs("section",{id:"performance",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-violet-500 mr-2",children:"05"})," Performance Optimization"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Squeeze every millisecond out of your APIs. Connection pooling, cursor-based pagination, response compression, and selective field loading."}),n.jsx(I,{code:sg,filename:"performance.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"Performance Checklist"}),n.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:["Use connection pooling for databases","Implement cursor-based pagination","Enable response compression (gzip/brotli)","Add caching layers (in-memory + Redis)","Use database indexes on queried fields","Avoid N+1 queries with eager loading","Set request timeouts","Use streaming for large payloads"].map(l=>n.jsxs("div",{className:"flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400",children:[n.jsx("span",{className:"text-vexor-500 mt-0.5 flex-shrink-0",children:"✓"}),n.jsx("span",{children:l})]},l))})]})]}),n.jsxs("section",{className:"p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl",children:[n.jsx("h2",{className:"text-xl font-bold mb-2 text-slate-900 dark:text-white",children:"Go to Production"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"You understand how to architect systems. Now learn to deploy, monitor, secure, and scale your applications in production environments."}),n.jsx("a",{href:"/learn/production",className:"inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm",children:"Continue to Production →"})]})]})}const lg=`# Dockerfile for Vexor application
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --production

# Build stage
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S vexor -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER vexor
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]`,og=`# docker-compose.yml
version: '3.9'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://vexor:secret@postgres:5432/vexor_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: vexor
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: vexor_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vexor"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:`,ig=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Health check endpoint
app.get('/health', async (ctx) => {
  const checks = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    checks: {} as Record<string, any>
  };

  // Database health
  try {
    await db.raw('SELECT 1');
    checks.checks.database = { status: 'up', latency: '2ms' };
  } catch {
    checks.checks.database = { status: 'down' };
    checks.status = 'degraded';
  }

  // Cache health
  try {
    await cache.ping();
    checks.checks.cache = { status: 'up' };
  } catch {
    checks.checks.cache = { status: 'down' };
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  return ctx.status(statusCode).json(checks);
});

// Request logging & metrics middleware
app.addHook('onRequest', async (ctx) => {
  ctx.state.startTime = performance.now();
});

app.addHook('onResponse', async (ctx) => {
  const duration = (performance.now() - (ctx.state.startTime as number)).toFixed(2);
  const log = {
    method: ctx.method,
    path: ctx.path,
    duration: \`\${duration}ms\`,
    userAgent: ctx.headers.get('user-agent'),
    ip: ctx.headers.get('x-forwarded-for'),
    timestamp: new Date().toISOString()
  };

  // Structured logging (JSON for log aggregators)
  console.log(JSON.stringify(log));

  // Track metrics
  metrics.histogram('http_request_duration_ms', parseFloat(duration), {
    method: ctx.method,
    path: ctx.path
  });
});`,cg=`import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor({ trustProxy: true });

// 1. Security Headers
// Set headers via the response builder chain
// In Vexor, use ctx.status().header().json() pattern:
function secureJson(ctx: any, data: any, statusCode = 200) {
  return ctx.status(statusCode)
    .header('X-Content-Type-Options', 'nosniff')
    .header('X-Frame-Options', 'DENY')
    .header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    .header('Content-Security-Policy', "default-src 'self'")
    .header('Referrer-Policy', 'strict-origin-when-cross-origin')
    .header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    .json(data);
}

// Usage in routes
app.get('/api/data', async (ctx) => {
  const data = { message: 'secure response' };
  return secureJson(ctx, data);
});

// 2. Rate Limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (ctx: any) => {
    const key = ctx.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const record = rateLimits.get(key);

    if (!record || now > record.resetAt) {
      rateLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return; // Continue to next handler
    }

    if (record.count >= maxRequests) {
      return ctx.status(429)
        .header('Retry-After', String(Math.ceil((record.resetAt - now) / 1000)))
        .json({ error: 'Too many requests' });
    }

    record.count++;
  };
}

// Apply rate limiting
app.use(rateLimit(100, 60));  // 100 requests per minute globally

// Stricter limits for auth endpoints
app.post('/auth/login', rateLimit(5, 300), async (ctx) => {
  // Max 5 login attempts per 5 minutes
  // ...
});

// 3. Input Sanitization
// Sanitize in route handlers after parsing the body
async function sanitizedBody(ctx: any) {
  const body = await ctx.body();
  if (body && typeof body === 'object') {
    sanitizeObject(body);
  }
  return body;
}

function sanitizeObject(obj: Record<string, any>) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Strip potential XSS
      obj[key] = value
        .replace(/[<>]/g, '')
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitizeObject(value);
    }
  }
}

// 4. CORS Configuration
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400
}));`,ug=`# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test_db

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t myapp:latest .

      - name: Push to registry
        run: |
          docker tag myapp:latest registry.example.com/myapp:latest
          docker push registry.example.com/myapp:latest

      - name: Deploy
        run: |
          # Zero-downtime deployment
          ssh deploy@server 'cd /app && docker compose pull && docker compose up -d --no-deps app'`,dg=`// Scaling Strategies for Vexor Applications
//
// Vertical Scaling: Bigger server (CPU, RAM)
//   - Simple but has limits
//   - Good for databases
//
// Horizontal Scaling: More servers behind a load balancer
//   - Requires stateless application design
//   - Infinite scaling potential

import { Vexor } from '@vexorjs/core';
import cluster from 'node:cluster';
import os from 'node:os';

// Cluster mode: Use all CPU cores
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(\`Primary process starting \${numCPUs} workers\`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    console.error(\`Worker \${worker.process.pid} exited (code: \${code}). Restarting...\`);
    cluster.fork(); // Auto-restart crashed workers
  });
} else {
  const app = new Vexor();

  // Your routes here...
  app.get('/api/health', async (ctx) => {
    return ctx.json({
      worker: process.pid,
      uptime: process.uptime()
    });
  });

  app.listen(3000);
  console.log(\`Worker \${process.pid} started\`);
}

// Graceful Shutdown
// Handle SIGTERM for zero-downtime deployments
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Starting graceful shutdown...');

  // Stop accepting new connections
  await app.close();

  // Close database connections
  await db.close();

  // Close cache connections
  await cache.disconnect();

  console.log('Graceful shutdown complete');
  process.exit(0);
});`,pg=`// Environment Configuration Best Practices

// 1. Use a config module - single source of truth
interface Config {
  port: number;
  env: string;
  database: { url: string; pool: { min: number; max: number } };
  redis: { url: string };
  auth: { secret: string; tokenExpiry: string };
  cors: { origins: string[] };
}

function loadConfig(): Config {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(\`Missing required env var: \${key}\`);
    return value;
  };

  return {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    database: {
      url: required('DATABASE_URL'),
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10')
      }
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    auth: {
      secret: required('JWT_SECRET'),
      tokenExpiry: process.env.TOKEN_EXPIRY || '1h'
    },
    cors: {
      origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
    }
  };
}

const config = loadConfig();

// 2. Example .env file (never commit this!)
// .env
// NODE_ENV=production
// PORT=3000
// DATABASE_URL=postgres://user:pass@host:5432/dbname
// REDIS_URL=redis://host:6379
// JWT_SECRET=your-256-bit-secret
// CORS_ORIGINS=https://app.example.com,https://admin.example.com

// 3. .env.example (commit this as a template)
// NODE_ENV=development
// PORT=3000
// DATABASE_URL=postgres://localhost:5432/myapp_dev
// JWT_SECRET=change-me-in-production
// CORS_ORIGINS=http://localhost:3000`;function mg(){return n.jsxs("div",{className:"space-y-12",children:[n.jsxs("div",{children:[n.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-medium mb-4",children:[n.jsx("span",{className:"w-2 h-2 bg-red-500 rounded-full"}),"Expert"]}),n.jsx("h1",{className:"text-4xl font-bold mb-4 text-slate-900 dark:text-white",children:"Production & DevOps"}),n.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 max-w-3xl",children:"Ship with confidence. Learn Docker, CI/CD pipelines, monitoring, security hardening, scaling strategies, and production-grade configuration."})]}),n.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",children:[{num:"01",title:"Docker & Containers",desc:"Containerize your Vexor application",color:"from-sky-500 to-blue-600"},{num:"02",title:"Monitoring & Logging",desc:"Health checks, metrics, and structured logs",color:"from-green-500 to-teal-600"},{num:"03",title:"Security Hardening",desc:"Headers, rate limiting, CORS, sanitization",color:"from-red-500 to-rose-600"},{num:"04",title:"CI/CD Pipelines",desc:"Automated testing and deployment",color:"from-purple-500 to-indigo-600"},{num:"05",title:"Scaling & Clustering",desc:"Multi-core, load balancing, graceful shutdown",color:"from-amber-500 to-orange-600"},{num:"06",title:"Environment Config",desc:"Secrets, env vars, and configuration management",color:"from-pink-500 to-fuchsia-600"}].map(l=>n.jsxs("div",{className:"relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-vexor-500/50 transition-colors",children:[n.jsxs("span",{className:`text-xs font-bold bg-gradient-to-r ${l.color} bg-clip-text text-transparent`,children:["CHAPTER ",l.num]}),n.jsx("h3",{className:"font-semibold mt-1 text-slate-900 dark:text-white",children:l.title}),n.jsx("p",{className:"text-sm text-slate-500 dark:text-slate-400 mt-1",children:l.desc})]},l.num))}),n.jsxs("section",{id:"docker",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-sky-500 mr-2",children:"01"})," Docker & Containers"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Containerize your Vexor app for consistent deployments. Multi-stage builds keep images small, and health checks ensure reliability."}),n.jsxs("div",{className:"space-y-6",children:[n.jsx(I,{code:lg,filename:"Dockerfile",showLineNumbers:!0}),n.jsx(I,{code:og,filename:"docker-compose.yml",showLineNumbers:!0})]}),n.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-3 gap-4",children:[n.jsxs("div",{className:"p-4 bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Multi-Stage Build"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Separate build and production stages. Only production dependencies ship in the final image."})]}),n.jsxs("div",{className:"p-4 bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Non-Root User"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Always run as a non-root user in production. Limits damage from container escapes."})]}),n.jsxs("div",{className:"p-4 bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Health Checks"}),n.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-400",children:"Docker and orchestrators use health checks to restart unhealthy containers automatically."})]})]})]}),n.jsxs("section",{id:"monitoring",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-green-500 mr-2",children:"02"})," Monitoring & Observability"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"You can't fix what you can't see. Health endpoints, structured logging, and request metrics give you visibility into your production system."}),n.jsx(I,{code:ig,filename:"monitoring.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 p-4 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"The Three Pillars of Observability"}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3 mt-3",children:[n.jsxs("div",{children:[n.jsx("p",{className:"text-sm font-medium text-slate-900 dark:text-white",children:"Logs"}),n.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400",children:"Structured JSON logs for debugging. Use log levels (error, warn, info, debug)."})]}),n.jsxs("div",{children:[n.jsx("p",{className:"text-sm font-medium text-slate-900 dark:text-white",children:"Metrics"}),n.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400",children:"Request latency, error rates, throughput. Use histograms and counters."})]}),n.jsxs("div",{children:[n.jsx("p",{className:"text-sm font-medium text-slate-900 dark:text-white",children:"Traces"}),n.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400",children:"Follow a request across services. Identify bottlenecks in distributed systems."})]})]})]})]}),n.jsxs("section",{id:"security",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-red-500 mr-2",children:"03"})," Security Best Practices"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Security is not optional. Protect your API with headers, rate limiting, input sanitization, and proper CORS configuration."}),n.jsx(I,{code:cg,filename:"security.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6",children:[n.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-900 dark:text-white",children:"OWASP Top 10 Checklist"}),n.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:[{threat:"Injection",fix:"Use parameterized queries (Vexor ORM handles this)"},{threat:"Broken Auth",fix:"Hash passwords, use JWT with short expiry, rate limit login"},{threat:"Sensitive Data",fix:"HTTPS only, never log secrets, encrypt at rest"},{threat:"XXE",fix:"Disable XML parsing, use JSON exclusively"},{threat:"Broken Access Control",fix:"Role-based middleware, validate ownership"},{threat:"Misconfiguration",fix:"Security headers, disable debug in production"},{threat:"XSS",fix:"Sanitize output, Content-Security-Policy header"},{threat:"Insecure Deserialization",fix:"Schema validation on all inputs"}].map(l=>n.jsxs("div",{className:"flex gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg",children:[n.jsx("span",{className:"text-red-500 font-medium text-sm flex-shrink-0 w-32",children:l.threat}),n.jsx("span",{className:"text-sm text-slate-600 dark:text-slate-400",children:l.fix})]},l.threat))})]})]}),n.jsxs("section",{id:"cicd",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-purple-500 mr-2",children:"04"})," CI/CD Pipelines"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Automate your entire workflow: lint, test, build, and deploy on every push. Never manually deploy again."}),n.jsx(I,{code:ug,filename:".github/workflows/ci.yml",showLineNumbers:!0})]}),n.jsxs("section",{id:"scaling",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-amber-500 mr-2",children:"05"})," Scaling & Clustering"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Use Node.js cluster module to utilize all CPU cores. Implement graceful shutdown for zero-downtime deployments."}),n.jsx(I,{code:dg,filename:"cluster.ts",showLineNumbers:!0}),n.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[n.jsxs("div",{className:"p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Horizontal Scaling"}),n.jsxs("div",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[n.jsx("p",{children:"• Add more servers behind a load balancer"}),n.jsx("p",{children:"• Application must be stateless"}),n.jsx("p",{children:"• Store sessions in Redis, not memory"}),n.jsx("p",{children:"• Use shared file storage (S3) for uploads"})]})]}),n.jsxs("div",{className:"p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl",children:[n.jsx("h4",{className:"font-semibold mb-2 text-slate-900 dark:text-white",children:"Load Balancing"}),n.jsxs("div",{className:"text-sm text-slate-600 dark:text-slate-400 space-y-1",children:[n.jsx("p",{children:"• Round-robin: Even distribution"}),n.jsx("p",{children:"• Least connections: Route to least busy"}),n.jsx("p",{children:"• IP hash: Same client, same server"}),n.jsx("p",{children:"• Tools: Nginx, HAProxy, AWS ALB"})]})]})]})]}),n.jsxs("section",{id:"config",children:[n.jsxs("h2",{className:"text-2xl font-bold mb-4 text-slate-900 dark:text-white",children:[n.jsx("span",{className:"text-pink-500 mr-2",children:"06"})," Environment Configuration"]}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Separate configuration from code. Use environment variables with validation, and never commit secrets to version control."}),n.jsx(I,{code:pg,filename:"config.ts",showLineNumbers:!0})]}),n.jsxs("section",{className:"p-8 bg-gradient-to-br from-vexor-500/10 via-purple-500/10 to-blue-500/10 border border-vexor-500/20 rounded-2xl text-center",children:[n.jsx("div",{className:"text-4xl mb-4",children:"🎉"}),n.jsx("h2",{className:"text-2xl font-bold mb-2 text-slate-900 dark:text-white",children:"Training Complete!"}),n.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto",children:"You've covered everything from HTTP basics to production deployment. You're now equipped to build, ship, and scale production-grade APIs with Vexor."}),n.jsxs("div",{className:"flex flex-wrap justify-center gap-3",children:[n.jsx("a",{href:"/docs/getting-started",className:"px-4 py-2 bg-vexor-500 hover:bg-vexor-600 text-white rounded-lg transition-colors font-medium text-sm",children:"Start Building"}),n.jsx("a",{href:"/docs/core",className:"px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors font-medium text-sm",children:"Explore Docs"})]})]})]})}function hg(){return n.jsx(dh,{children:n.jsxs(Ye,{path:"/",element:n.jsx(Jh,{}),children:[n.jsx(Ye,{index:!0,element:n.jsx(ix,{})}),n.jsx(Ye,{path:"docs/getting-started",element:n.jsx(mx,{})}),n.jsx(Ye,{path:"docs/core",element:n.jsx(Nx,{})}),n.jsx(Ye,{path:"docs/orm",element:n.jsx(zx,{})}),n.jsx(Ye,{path:"docs/middleware",element:n.jsx(Yx,{})}),n.jsx(Ye,{path:"docs/realtime",element:n.jsx(l0,{})}),n.jsx(Ye,{path:"docs/deployment",element:n.jsx(k0,{})}),n.jsx(Ye,{path:"docs/cli",element:n.jsx(M0,{})}),n.jsx(Ye,{path:"learn",element:n.jsx(z0,{})}),n.jsx(Ye,{path:"learn/fundamentals",element:n.jsx(W0,{})}),n.jsx(Ye,{path:"learn/building-apis",element:n.jsx(Z0,{})}),n.jsx(Ye,{path:"learn/architecture",element:n.jsx(ag,{})}),n.jsx(Ye,{path:"learn/production",element:n.jsx(mg,{})})]})})}gm.createRoot(document.getElementById("root")).render(n.jsx(zu.StrictMode,{children:n.jsx(qh,{children:n.jsx(yh,{basename:"/vexorjs",children:n.jsx(hg,{})})})}));
