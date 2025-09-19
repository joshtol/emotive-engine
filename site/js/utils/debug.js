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
export class Debug{static enabled=!1
static logLevels={ERROR:0,WARN:1,INFO:2,DEBUG:3,VERBOSE:4}
static currentLevel=2
static categoryFilters=new Set
static performanceMetrics=new Map
static init(e=!1,t=2){this.enabled=e,this.currentLevel=t
const i=new URLSearchParams(window.location.search)
i.has("debug")&&(this.enabled="true"===i.get("debug")),"true"===localStorage.getItem("debug")&&(this.enabled=!0),window.DEBUG=this.enabled,this.enabled&&this.log("Debug","Debug system initialized",{enabled:this.enabled,level:this.currentLevel})}static log(e,...t){!this.enabled||this.currentLevel<this.logLevels.DEBUG||this.shouldShowCategory(e)}static info(e,...t){!this.enabled||this.currentLevel<this.logLevels.INFO||this.shouldShowCategory(e)}static warn(e,...t){!this.enabled||this.currentLevel<this.logLevels.WARN||this.shouldShowCategory(e)}static error(e,...t){this.enabled&&this.shouldShowCategory(e)}static verbose(e,...t){!this.enabled||this.currentLevel<this.logLevels.VERBOSE||this.shouldShowCategory(e)}static table(e){this.enabled}static group(e){this.enabled}static groupCollapsed(e){this.enabled}static groupEnd(){this.enabled}static time(e){this.enabled&&this.performanceMetrics.set(e,performance.now())}static timeEnd(e,t="Performance"){if(this.enabled&&this.performanceMetrics.has(e)){const i=performance.now()-this.performanceMetrics.get(e)
this.performanceMetrics.delete(e),i>16.67&&this.warn(t,`${e} took ${i.toFixed(2)}ms (>${Math.floor(i/16.67)} frames)`)}}static mark(e){this.enabled&&(performance.mark(e),this.verbose("Performance",`Mark: ${e}`))}static measure(e,t,i){if(this.enabled)try{performance.measure(e,t,i)
const s=performance.getEntriesByName(e)[0]
this.info("Performance",`${e}: ${s.duration.toFixed(2)}ms`)}catch(t){this.error("Performance",`Failed to measure ${e}:`,t)}}static setLevel(e){this.currentLevel="string"==typeof e?this.logLevels[e.toUpperCase()]||2:e,this.info("Debug",`Log level set to ${this.currentLevel}`)}static showCategory(e){this.categoryFilters.add(e),this.info("Debug",`Showing category: ${e}`)}static hideCategory(e){this.categoryFilters.delete(e),this.info("Debug",`Hiding category: ${e}`)}static showAll(){this.categoryFilters.clear(),this.info("Debug","Showing all categories")}static shouldShowCategory(e){return 0===this.categoryFilters.size||this.categoryFilters.has(e)}static logState(){this.group("Debug State"),this.log("Debug","Enabled:",this.enabled),this.log("Debug","Level:",this.currentLevel),this.log("Debug","Categories:",Array.from(this.categoryFilters)),this.log("Debug","Performance Metrics:",Array.from(this.performanceMetrics.keys())),this.groupEnd()}static getLogger(e){return{log:(...t)=>Debug.log(e,...t),info:(...t)=>Debug.info(e,...t),warn:(...t)=>Debug.warn(e,...t),error:(...t)=>Debug.error(e,...t),verbose:(...t)=>Debug.verbose(e,...t),time:t=>Debug.time(`${e}:${t}`),timeEnd:t=>Debug.timeEnd(`${e}:${t}`,e)}}}"undefined"!=typeof window&&window.DEBUG&&Debug.init(!0)
export default Debug
"undefined"!=typeof window&&(window.Debug=Debug)


// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.