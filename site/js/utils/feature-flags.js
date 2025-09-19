/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */
class FeatureFlags{constructor(){this.defaults={rhythmSync:!0,grooveTemplates:!0,gestureBlending:!0,audioReactive:!0,particleSystem:!0,socialFeatures:!1,cloudSync:!1,aiGestures:!1,webglRenderer:!1,offscreenCanvas:!0,autoQuality:!0,performanceMonitoring:!0,memoryManagement:!0,lazyLoading:!0,experimentalGestures:!1,webAudioApi:!1,webRTC:!1,tensorflowIntegration:!1,debugMode:!1,verboseLogging:!1,performanceOverlay:!1,gestureVisualizer:!1},this.storageKey="emotive_feature_flags",this.flags=null,this.observers=new Map,this.init()}init(){this.flags=this.loadFlags(),this.watchUrlParams(),this.flags.debugMode}loadFlags(){const e={...this.defaults}
"undefined"!=typeof window&&window.ENGINE_CONFIG?.features&&Object.assign(e,window.ENGINE_CONFIG.features)
try{const s=localStorage.getItem(this.storageKey)
if(s){const t=JSON.parse(s)
Object.assign(e,t)}}catch(e){}const s=this.parseUrlFlags()
return Object.assign(e,s),e}parseUrlFlags(){const e={}
if("undefined"==typeof window)return e
const s=new URLSearchParams(window.location.search)
for(const[t,a]of s)if(t.startsWith("feature_")){e[t.replace("feature_","")]="true"===a||"1"===a||"false"!==a&&"0"!==a&&a}return e}watchUrlParams(){"undefined"!=typeof window&&window.addEventListener("popstate",()=>{const e={...this.flags}
this.flags=this.loadFlags(),this.notifyChanges(e,this.flags)})}static isEnabled(e){return FeatureFlags.instance||(FeatureFlags.instance=new FeatureFlags),FeatureFlags.instance.isEnabled(e)}isEnabled(e){return this.shouldRefresh()&&(this.flags=this.loadFlags()),!0===this.flags[e]}getValue(e,s=null){return this.shouldRefresh()&&(this.flags=this.loadFlags()),this.flags.hasOwnProperty(e)?this.flags[e]:s}setFlag(e,s,t=!1){const a=this.flags[e]
this.flags[e]=s,t&&this.persistFlags(),a!==s&&this.notifyObservers(e,s,a)}setFlags(e,s=!1){const t={...this.flags}
Object.assign(this.flags,e),s&&this.persistFlags(),this.notifyChanges(t,this.flags)}reset(e=!0){if(this.flags={...this.defaults},e)try{localStorage.removeItem(this.storageKey)}catch(e){}this.notifyChanges({},this.flags)}persistFlags(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.flags))}catch(e){}}shouldRefresh(){return"undefined"!=typeof window&&new URLSearchParams(window.location.search).has("refreshFlags")}getActiveFeatures(){return Object.entries(this.flags).filter(([e,s])=>!0===s).map(([e])=>e)}getAllFlags(){return{...this.flags}}observe(e,s){return this.observers.has(e)||this.observers.set(e,new Set),this.observers.get(e).add(s),()=>{const t=this.observers.get(e)
t&&(t.delete(s),0===t.size&&this.observers.delete(e))}}notifyObservers(e,s,t){const a=this.observers.get(e)
a&&a.forEach(a=>{try{a(e,s,t)}catch(e){}})
const r=this.observers.get("*")
r&&r.forEach(a=>{try{a(e,s,t)}catch(e){}})}notifyChanges(e,s){const t={}
Object.keys(s).forEach(a=>{e[a]!==s[a]&&(t[a]={old:e[a],new:s[a]})}),Object.entries(t).forEach(([e,{old:s,new:t}])=>{this.notifyObservers(e,t,s)})}createGuard(e,s,t=null){return(...a)=>this.isEnabled(e)?s?.(...a):t?.(...a)}export(){return JSON.stringify(this.flags,null,2)}import(e,s=!0){try{const t=JSON.parse(e)
s?this.setFlags(t,!0):(this.flags=t,this.persistFlags())}catch(e){}}}FeatureFlags.instance=null
export default FeatureFlags
export{FeatureFlags}
export const isFeatureEnabled=FeatureFlags.isEnabled.bind(FeatureFlags)


// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.