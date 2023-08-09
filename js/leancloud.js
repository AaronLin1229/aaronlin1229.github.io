/* global CONFIG */
// eslint-disable-next-line no-console
(function(window,document){
// 查询存储的记录
function getRecord(e,t){return new Promise((function(r,n){e("get","/classes/Counter?where="+encodeURIComponent(JSON.stringify({target:t}))).then((e=>e.json())).then((({results:a,code:o,error:i})=>{if(401===o)throw i;if(a&&a.length>0){var c=a[0];r(c)}else e("post","/classes/Counter",{target:t,time:0}).then((e=>e.json())).then(((e,t)=>{if(t)throw t;r(e)})).catch((e=>{console.error("Failed to create: ",e),n(e)}))})).catch((e=>{console.error("LeanCloud Counter Error: ",e),n(e)}))}))}
// 发起自增请求
function increment(e,t){return new Promise((function(r,n){e("post","/batch",{requests:t}).then((e=>{if((e=e.json()).error)throw e.error;r(e)})).catch((e=>{console.error("Failed to save visitor count: ",e),n(e)}))}))}
// 构建自增请求体
function buildIncrement(e){return{method:"PUT",path:`/1.1/classes/Counter/${e}`,body:{time:{__op:"Increment",amount:1}}}}
// 校验是否为有效的 Host
function validHost(){if(CONFIG.web_analytics.leancloud.ignore_local){var e=window.location.hostname;if("localhost"===e||"127.0.0.1"===e)return!1}return!0}
// 校验是否为有效的 UV
function validUV(){var e="LeanCloud_UV_Flag",t=localStorage.getItem(e);return!(t&&(new Date).getTime()-parseInt(t,10)<=864e5)&&(localStorage.setItem(e,(new Date).getTime().toString()),!0)}function addCount(Counter){var enableIncr=CONFIG.web_analytics.enable&&!Fluid.ctx.dnt&&validHost(),getterArr=[],incrArr=[],pvCtn=document.querySelector("#leancloud-site-pv-container");if(pvCtn){var pvGetter=getRecord(Counter,"site-pv").then((e=>{enableIncr&&incrArr.push(buildIncrement(e.objectId));var t=document.querySelector("#leancloud-site-pv");t&&(t.innerText=(e.time||0)+(enableIncr?1:0),pvCtn.style.display="inline")}));getterArr.push(pvGetter)}
// 请求 UV 并自增
var uvCtn=document.querySelector("#leancloud-site-uv-container");if(uvCtn){var uvGetter=getRecord(Counter,"site-uv").then((e=>{var t=validUV()&&enableIncr;t&&incrArr.push(buildIncrement(e.objectId));var r=document.querySelector("#leancloud-site-uv");r&&(r.innerText=(e.time||0)+(t?1:0),uvCtn.style.display="inline")}));getterArr.push(uvGetter)}
// 如果有页面浏览数节点，则请求浏览数并自增
var viewCtn=document.querySelector("#leancloud-page-views-container");if(viewCtn){var path=eval(CONFIG.web_analytics.leancloud.path||"window.location.pathname"),target=decodeURI(path.replace(/\/*(index.html)?$/,"/")),viewGetter=getRecord(Counter,target).then((e=>{enableIncr&&incrArr.push(buildIncrement(e.objectId));var t=document.querySelector("#leancloud-page-views");t&&(t.innerText=(e.time||0)+(enableIncr?1:0),viewCtn.style.display="inline")}));getterArr.push(viewGetter)}
// 如果启动计数自增，批量发起自增请求
enableIncr&&Promise.all(getterArr).then((()=>{incrArr.length>0&&increment(Counter,incrArr)}))}var appId=CONFIG.web_analytics.leancloud.app_id,appKey=CONFIG.web_analytics.leancloud.app_key,serverUrl=CONFIG.web_analytics.leancloud.server_url;if(!appId)throw new Error("LeanCloud appId is empty");if(!appKey)throw new Error("LeanCloud appKey is empty");function fetchData(e){addCount(((t,r,n)=>fetch(`${e}/1.1${r}`,{method:t,headers:{"X-LC-Id":appId,"X-LC-Key":appKey,"Content-Type":"application/json"},body:JSON.stringify(n)})))}var apiServer=serverUrl||`https://${appId.slice(0,8).toLowerCase()}.api.lncldglobal.com`;apiServer?fetchData(apiServer):fetch("https://app-router.leancloud.cn/2/route?appId="+appId).then((e=>e.json())).then((e=>{e.api_server&&fetchData("https://"+e.api_server)}))})(window,document);