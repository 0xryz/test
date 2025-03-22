require.define({"controllers/conditions_controller":function(e,t,i){"use strict"
var n=t("models/filter/filter_definitions_adapter"),r=t("models/filter/user_filter/user_filter_definitions"),s=t("lib/zentence/controllers/group_controller"),o=Object.freeze([{id:"field"},{id:"operator",edges:["field"]},{id:"value",edges:["field","operator"]}]),a=s.proto().itemController.extend({didAdd:function(){this.get("isDestroyed")||this.set("activeNode",this.get("nodes.firstObject"))},didConfirm:function(){this.get("nodes.firstObject").validate()?(this.set("content.isNew",!1),this.get("target").previewConditions()):this.remove()}}).reopenClass({toString:function(){return"ConditionController"}}),l=s.extend({lexica:Em.computed.emptyObject(),structure:o,itemController:a,parentController:Em.REQUIRED_PROPERTY(),activate:function(e){var t=r.instance()
t.fetch().done(function(){this.set("lexica",n.transform(t))}.bind(this)),this.set("content",e)},_addCondition:function(){var e
return this.get("content").pushObject({isNew:!0}),e=this.objectAt(this.get("length")-1),Em.run.scheduleOnce("afterRender",e,e.didAdd),e},previewConditions:function(){this.get("parentController").syncFilter()},controllerAt:function(e,t,i){var n=this._super.apply(this,arguments)
return n&&n.set("hasPlaceholder",0===e),n},removeObject:function(e){var t=e.get("content")
t.destroy(),this._super.apply(this,arguments),this.get("parentController").didRemoveCondition(t)},actions:{addCondition:function(){this._addCondition()}}}).reopenClass({toString:function(){return"ConditionsController"}})
i.exports=l}}),require.define({"controllers/filter_editor_controller":function(e,t,i){"use strict"
var n=t("models/filter/user_filter/user_filter"),r=t("controllers/filter_modal_editor_controller"),s=t("controllers/filter_column_editor_controller"),o=t("lib/growl"),a=Em.Controller.extend({currentUser:Em.computed.singleton("models/current_user"),permissionsBinding:"manager.permissions",globalPermissions:Em.computed.oneWay("manager.globalPermissions"),active:!1,editingFilter:null,previousFilter:null,currentFilter:Em.computed.alias("manager.currentFilter"),canEdit:Em.computed.oneWay("permissions.can_edit"),isPreviewing:Em.computed.oneWay("editingFilter.previewing"),shouldShowActions:Em.computed.oneWay("editingFilter.isDirty"),filterDefinitions:Em.computed.singleton("models/filter/user_filter/user_filter_definitions"),didInit:function(){this.get("filterDefinitions").fetch(),this.setProperties({modalEditorController:r.create({editorController:this}),columnEditorController:s.create({editorController:this})}),this._super()},activate:function(){this.set("active",!0)},deactivate:function(){this.get("modalEditorController.active")&&this.get("modalEditorController").deactivate(),this.get("columnEditorController.active")&&this.get("columnEditorController").deactivate(),this.setProperties({active:!1,editingFilter:null})},deactivateAndRestore:function(){this.get("editingFilter")&&(this.restoreFilter(),this.deactivate())},activateModalEditor:function(e){this.get("active")||(this.setupFilter(e),this.activate()),this.get("modalEditorController").activate(this.get("editingFilter"))},activateModalEditorWithFilter:function(e){this.get("active")||(this.set("editingFilter",e),this.activate(),this.get("modalEditorController").activate(e))},activateModalEditorWithClone:function(e){this.send("deactivateAndRevert"),Em.run.scheduleOnce("afterRender",this,"activateModalEditorWithFilter",e)},activateColumnEditor:function(){this.get("active")||(this.setupFilter("edit"),this.activate()),this.get("columnEditorController").activate(this.get("editingFilter"))},deactivateModalEditor:function(){var e=this.get("editingFilter")
this.get("modalEditorController").deactivate(),e&&!e.get("isDirty")&&this.deactivateAndRestore()},deactivateColumnEditor:function(){this.get("columnEditorController").deactivate()},toggleModalEditor:function(){return this.get("modalEditorController.active")?this.deactivateModalEditor():this.activateModalEditor()},toggleColumnEditor:function(){return this.get("columnEditorController.active")?this.deactivateColumnEditor():this.activateColumnEditor()},setupFilter:function(e){var t
"create"===e?(this.set("previousFilter",this.get("currentFilter")),t=this.createFilter()):(t=this.editFilter(),this.set("previousFilter",t)),this.set("editingFilter",t)},createClone:function(e){var t=this.get("editingFilter"),i=t.clone()
return e||(e={}),e.id=null,null==e.title&&(e.title=I18n.t("txt.user_filters.copy_title",{title:t.get("title")})),this.get("canEdit")||(e.restriction={type:"User",id:this.get("currentUser.id")}),i.get("resource").setProperties(e),i},createFilter:function(){return n.createWithDefaults(this.get("filterDefinitions"))},editFilter:function(){return this.get("currentFilter").edit()},cloneFilter:function(){var e
this.get("modalEditorController").save(),e=this.createClone(),this.activateModalEditorWithClone(e)},previewFilter:function(){this.get("modalEditorController").save(),this.get("manager").setFilterForPreview(this.get("editingFilter")),this.deactivateModalEditor()},deactivateFilter:function(){this.get("editingFilter").deactivate().done(function(){this.deactivateAndRestore()}.bind(this))},openDeleteConfirmModal:function(e){var i,n=$.Deferred(),r=e.get("title")
return i="shared"===e.get("viewType")?I18n.t("txt.user_filters.delete_modal.body_for_shared_filter",{view:r}):I18n.t("txt.user_filters.delete_modal.body_for_personal_filter",{view:r}),t("views/modals/confirm_modal").extend({body:i,title:I18n.t("txt.user_filters.delete_modal.title"),actions:{userDidConfirm:function(){this.hideModal(),n.resolve()},userDidCancel:function(){this._super(),n.reject()}}}).create().append(),n.promise()},deleteFilter:function(){var e=this,t=this.get("editingFilter")
return this.deactivateModalEditor(),this.openDeleteConfirmModal(t).done((function(){t.delete_().done(e.deactivateAndRestore.bind(e)).fail(e.activateModalEditor.bind(e))})).fail(this.activateModalEditor.bind(this))},loadPreviousFilter:function(){var e=this.get("previousFilter"),t=this.get("manager")
e?(e.set("selected",!0),this.set("currentFilter",e),this.set("previousFilter",null)):t.selectFirst()},restoreFilter:function(e){var t=this.get("editingFilter")
t.get("resource").get("isDestroyed")||(t.restore(),t.set("previewing",!1)),this.set("editingFilter",null),e&&t.refreshContent()},syncFilter:function(){var e=this.get("editingFilter")
e&&(e.get("isRefreshable")?(e.set("previewing",e.get("isDirty")),e.get("isDirty")&&e.get("hasSorting")&&e.resetSortOrder(!0),e.refreshContent()):e.get("resource.isNew")&&e.get("previewing")&&e.refreshContent())},didSave:function(e,t){var i,n=this.get("manager"),r=this.get("editingFilter").restore(),s=e.get("id")
i=t?"create":"update",o.notice(I18n.t("txt.user_filters.%@_success".fmt(i),{name:r.get("title")})),this.deactivate(),r.set("previewing",!1),n.refreshFilters().done((function(e){n.setFilterById(s)}))},actions:{deactivateAndRevert:function(){var e=this.get("editingFilter")
e&&(e.get("resource.isNew")?(this.restoreFilter(),this.get("manager").removeFilter(e),this.loadPreviousFilter(),e.destroy()):this.restoreFilter(e.get("isRefreshable")),this.deactivate())},saveFilter:function(){var e=this.get("editingFilter"),t=e.get("resource"),i=t.get("isNew")
return t.set("title",e.get("title")),this.get("modalEditorController").save(),t.save().done(this.didSave.bind(this,t,i))},saveFilterAs:function(){var e
this.get("modalEditorController").save(),"photo"===(e=this.createClone({title:""})).get("columns.0.id")&&e.get("columns").shiftObject(),this.activateModalEditorWithClone(e)}}}).reopenClass({toString:function(){return"FilterEditorController"}})
i.exports=a}}),require.define({"controllers/filter_modal_editor_controller":function(e,t,i){"use strict"
var n=t("controllers/conditions_controller"),r=(t("models/filter/user_filter/user_filter"),Em.Controller.extend({previewing:Em.computed.bool("filter.previewing"),active:!1,filter:null,currentUser:Em.computed.singleton("models/current_user"),canEdit:Em.computed.oneWay("editorController.canEdit"),didInit:function(){this.set("allConditionsController",n.create({parentController:this}))},shouldShowActions:function(){return!(this.get("filter.resource.isNew")&&this.get("previewing")||this.get("globalPermissions.readOnlyUserViews"))}.property("filter.resource.isNew","previewing","globalPermissions.readOnlyUserViews"),globalPermissions:Em.computed.oneWay("editorController.globalPermissions"),canManagePersonalUserViews:Em.computed.oneWay("globalPermissions.managerPersonalUserViews"),canManageSharedUserViews:Em.computed.oneWay("globalPermissions.manageSharedUserViews"),canManageGroupUserViews:Em.computed.oneWay("globalPermissions.manageGroupUserViews"),shouldShowAllAgentsVisibilityOption:Em.computed.or("filter.isPersistedAsGlobal","canManageSharedUserViews"),shouldShowGroupVisibilityOptions:Em.computed.or("filter.isPersistedAsGroup","canManageGroupUserViews"),shouldShowMeOnlyVisibilityOption:Em.computed.oneWay("globalPermissions.managePersonalUserViews"),defaultRestriction:function(){return this.get("filter.resource.isNew")&&!this.get("canManageSharedUserViews")?"me":"all"}.property("filter.resource.isNew","canManageSharedUserViews"),isValid:function(){var e=this.get("filter")
return!!e&&(!!e.get("title")&&e.get("conditions.all.length")>0)}.property("filter.title","filter.conditions.all.[]"),activate:function(e){this.get("allConditionsController").activate(e.get("conditions.all")),this.setProperties({active:!0,filter:e})},deactivate:function(){var e=this.get("allConditionsController")
this.set("active",!1),e&&(e.confirm(),e.reset())},toggle:function(e){return this.get("active")?this.deactivate():this.activate(e)},save:function(){var e=this.get("allConditionsController")
e&&e.save()},syncFilter:function(){this.get("editorController").syncFilter()},syncPreviewState:function(){var e=this.get("filter")
e&&e.get("isRefreshable")&&e.set("previewing",e.get("isDirty"))},filterDidChange:function(){this.syncPreviewState()}.observes("filter.title","filter.restriction"),didRemoveCondition:function(e){e.get("isNew")?this.syncPreviewState():this.syncFilter()},willDestroy:function(){this.get("allConditionsController").destroy()},actions:{cancel:function(){this.get("editorController").send("deactivateAndRevert")},saveFilter:function(){this.get("editorController").send("saveFilter")},cloneFilter:function(){this.get("editorController").cloneFilter()},deactivateFilter:function(){this.get("editorController").deactivateFilter()},previewFilter:function(){this.get("editorController").previewFilter()},deleteFilter:function(){this.get("editorController").deleteFilter()}}}).reopenClass({toString:function(){return"FilterModalEditorController"}}))
i.exports=r}}),require.define({"controllers/user_filter_controller":function(e,t,i){"use strict"
function n(e){return e&&e.__esModule?e:{default:e}}var r=n(t("lib/session")),s=n(t("lib/features")),o=t("controllers/user_list_controller")
var a=o.extend(t("controllers/filter_controller_mixin"),t("lib/features").consumer,{approximateTotal:Em.computed.oneWay("filter.approximateTotal"),exportNotice:Em.computed.alias("notices.export"),globalPermissions:Em.computed.singleton("models/global_permissions"),isViewing:Em.computed.not("filter.previewing"),samplingNotice:Em.computed.alias("notices.sampling"),shouldShowNotice:Em.computed.oneWay("filter.isSampling"),shouldShowCSVexportInNotice:Em.computed.and("globalPermissions.manageSharedUserViews","isViewing","filter.isSampling"),shouldShowAdvancedEncryptionMessage:function(){var e=r.default.instance().headers
return!!s.default.hasFeature("customerListsAdvancedEncryptionMessage")&&!(!e["X-Zendesk-Advanced-Encryption"]||"OFF"===e["X-Zendesk-Advanced-Encryption"])}.property(),shouldShowTwoNotices:Em.computed.and("shouldShowNotice","shouldShowAdvancedEncryptionMessage"),advancedEncryptionNotice:I18n.t("txt.user_filters.advanced_encryption.message"),advancedEncryptionNoticeLink:I18n.t("txt.user_filters.advanced_encryption.learn_more"),advancedEncryptionURL:I18n.t("txt.user_filters.advanced_encryption.learn_more_url"),total:Em.computed.oneWay("filter.totalCount"),svgIconsUrl:t("lib/image_assets").svgIconsUrl,notices:function(){return function(e){var t={}
if(e>=5e4)t.sampling=I18n.t("txt.user_filters.sampling_explanation"),t.export=I18n.t("txt.user_filters.sampling_export")
else{var i=0===e?"sampling_no_results_explanation":"sampling_explanation"
t.sampling=I18n.t("txt.user_filters.%@".fmt(i)),t.export=I18n.t("txt.user_filters.sampling_export_entire_list")}return t}(this.get("approximateTotal"))}.property("total","approximateTotal"),actions:{exportFullListAsCsv:function(){this.get("manager").send("exportAsCsv")}}}).reopenClass({UNSAMPLED_APPROXIMATION_THRESHOLD:5e4,toString:function(){return"UserFilterController"}})
i.exports=a}}),require.define({"controllers/user_filter_manager_controller":function(e,t,i){"use strict"
var n=t("controllers/user_filter_controller"),r=t("models/filter/user_filter/user_filters"),s=t("controllers/filter_editor_controller"),o=t("controllers/filter_ui_controller"),a=t("controllers/filter_list_editor_controller"),l=t("lib/growl"),c=t("lib/growl/new_growl"),d=t("lib/view_count_helper").viewCount,u=t("lib/lotus/global_events"),h=t("lib/validation_error"),p=t("lib/features"),m=t("lib/constants"),f=Em.Object.create({id:null,selected:!1,isEndUserListEntry:!0,activateCallback:function(){f.set("selected",!0),g.set("selected",!1),Zd.router.transitionTo("list_user_filters")},refreshContent:function(){return null},title:I18n.t("txt.user_filters.all_customers"),viewType:"all-customers"}),g=Em.Object.create({id:null,selected:!1,isSuspendedUserListEntry:!0,activateCallback:function(){f.set("selected",!1),g.set("selected",!0),Zd.router.transitionTo("list_user_filters")},refreshContent:function(){return null},title:I18n.t("txt.user_filters.side_pane.suspended_users"),viewType:"suspended-users"}),v=t("controllers/filter_manager_controller").extend({app:Zendesk,sectionName:"user_filters",urlType:"user_views",globalPermissions:Em.computed.singleton("models/global_permissions"),isPreviewing:Em.computed.oneWay("editorController.isPreviewing"),isViewing:Em.computed.not("isPreviewing"),isSampling:Em.computed.oneWay("currentFilter.isSampling"),isNotSampling:Em.computed.not("isSampling"),canEdit:Em.computed.oneWay("permissions.can_edit"),globalCanEdit:Em.computed.not("globalPermissions.readOnlyUserViews"),isColumnEditorActive:Em.computed.oneWay("editorController.columnEditorController.active"),isListManagingEnabled:Em.computed.and("globalCanEdit","isViewing"),hasSuspendVisitor:p.hasFeature("suspendVisitor"),shouldShowViewHeader:Em.computed.withFunction("currentFilter",(function(){return this.get("currentFilter")&&!(this.get("currentFilter.isEndUserListEntry")||this.get("currentFilter.isSuspendedUserListEntry"))})),shouldShowColumnEditor:Em.computed.and("canEdit","currentFilter"),shouldShowCSVexport:Em.computed.and("globalPermissions.manageSharedUserViews","isViewing","isNotSampling"),filterDefinitions:Em.computed.singleton("models/filter/user_filter/user_filter_definitions"),END_USER_LIST_ENTRY:f,SUSPENDED_USER_LIST_ENTRY:g,didInit:function(){this.setProperties({allFilters:r.create(),listFilterController:n.create({manager:this}),uiController:o.create({manager:this,sectionName:"user_filters",contentViewRoute:"show_user_filter"}),editorController:s.create({manager:this}),filterListEditorController:a.create({manager:this})}),this.activeCustomerListsPaneStorageKey=m.ACTIVE_CUSTOMER_LISTS_PANE_STORAGE_KEY,u.on("@user_filter:load_failed",this,this.onFilterExecutionFailure),u.on("@user_filter:activated",this,this.onFilterChanged),u.on("@user_filter:deactivated",this,this.onFilterChanged),u.on("@user_filter:deleted",this,this.onFilterChanged)
var e=localStorage.getItem(this.activeCustomerListsPaneStorageKey)
"all-customers"===e?f.set("selected",!0):"suspended-users"===e&&g.set("selected",!0),this._super()},columnEditorController:Em.computed.oneWay("editorController.columnEditorController"),footerFilters:Em.computed((function(){return[g]})),filters:Em.computed.withFunction("allFilters.[]",(function(){var e=(this.get("allFilters")||[]).filterProperty("active",!0)
return[f].concat(e)})),shouldRenderEndUserList:function(){var e=!!this.get("currentFilter.isEndUserListEntry")&&!!this.get("currentFilter.selected")
return e&&localStorage.setItem(this.activeCustomerListsPaneStorageKey,"all-customers"),e}.property("currentFilter"),shouldRenderSuspendedUserList:function(){var e=!!this.get("currentFilter.isSuspendedUserListEntry")&&!!this.get("currentFilter.selected")
return e&&localStorage.setItem(this.activeCustomerListsPaneStorageKey,"suspended-users"),e}.property("currentFilter"),filterCount:function(){var e=this.get("currentFilter.totalCount")
return this.get("isSampling")?d(e):e+""}.property("currentFilter.totalCount","isSampling"),locales:function(){return t("models/locale").all}.property(),expirableObjects:{list:["locales","allFilters"]},exportConfirmationKey:"txt.filters.export_as_csv.confirmation_v2",permissions:function(){var e=this.get("currentFilter"),t=!this.get("globalPermissions.readOnlyUserViews")
if(e&&!e.get("isEndUserListEntry")&&!e.get("isSuspendedUserListEntry")&&t)if(this.get("editorController.editingFilter.resource.isNew"))t=!0
else{var i=e.isOwnedBy(this.get("currentUser"))&&this.get("globalPermissions.managePersonalUserViews"),n=e.get("isOwnedByGroup")&&this.get("globalPermissions.manageGroupUserViews"),r=e.get("isGlobal")&&this.get("globalPermissions.manageSharedUserViews")
t=!!(i||n||r)}return{can_edit:t}}.property("currentUser.id","editorController.editingFilter.resource.isNew","currentFilter.isOwnedByGroup","currentFilter.isGlobal","globalPermissions.manageGroupUserViews","globalPermissions.manageSharedUserViews","globalPermissions.readOnlyUserViews"),setup:function(e){this.get("isPreviewing")||(this.get("editorController").deactivate(),this.get("filterDefinitions").fetch(),this._super.apply(this,arguments))},refreshFilters:function(){return this.get("allFilters").refresh()},setFilterById:function(e){this.get("filters").findBy("id",e)&&Zd.router.transitionTo("show_user_filter",e)},selectFirst:function(){return Zd.router.transitionTo("list_user_filters"),this.get("filters.firstObject")},expireFilters:function(){this.get("allFilters").expireContent()},actions:{editFilterList:function(){this.get("filterListEditorController").activate()},addFilter:function(){this.get("editorController").deactivate(),this.get("editorController").activateModalEditor("create")},editFilter:function(){this.get("editorController").toggleModalEditor()}},willDestroy:function(){this.get("editorController").destroy(),u.off("@user_filter:load_failed",this,this.onFilterExecutionFailure),u.off("@user_filter:activated",this,this.onFilterChanged),u.off("@user_filter:deactivated",this,this.onFilterChanged),u.off("@user_filter:deleted",this,this.onFilterChanged),this._super()},onFilterExecutionFailure:function(e){var t=e.filter
switch(e.xhr.status){case 403:this.onFilterForbiddenFailure(t,e.xhr)
break
case 404:this.onFilterLoadFailure(t)
break
case 422:this.onFilterValidationFailure(t,e.xhr)
break
case 429:var i=I18n.t("txt.rate_limit.user.filter.notification.title"),n=I18n.t("txt.rate_limit.user.filter.notification.message")
c.error(n,{title:i})
break
default:l.error(I18n.t("txt.user_filters.generic.failed_to_execute_filter")),this.expireFilters()}},onFilterForbiddenFailure:function(e,t){try{var i=JSON.parse(t.responseText)
"string"==typeof i.error&&"RecordInvalid"===i.error?this.onForbiddenWithValidationErrors(i):this._onFilterLoadError(e,"failed_to_execute_filter")}catch(n){this._onFilterLoadError(e,"failed_to_execute_filter")}},onForbiddenWithValidationErrors:function(e){var t=I18n.t("txt.user_filters.generic.failed_to_execute_filter"),i=h.extractErrors(e),n=h.generateHTML(t,i)
l.error(n)},onInactiveFilterLoad:function(e){this._onFilterLoadError(e,"loaded_inactive_filter")},onFilterLoadFailure:function(e){this._onFilterLoadError(e,"failed_to_load_filter")},onFilterValidationFailure:function(e,t){var i=new h(e.get("resource"),t.responseText)
l.error(i.message())},_onFilterLoadError:function(e,t){var i,n=e.get("title")
i=n?I18n.t("txt.user_filters."+t,{view:n}):I18n.t("txt.user_filters.generic."+t),l.error(i),this.refreshFiltersAndSelectFirst()}}).reopenClass(t("lib/lotus/singleton"),{toString:function(){return"UserFilterManagerController"}})
i.exports=v}}),require.define({"lib/zentence/controllers/group_controller":function(e,t,i){"use strict"
var n,r=t("lib/zentence/controllers/item_controller")
n=Em.Mixin.create({reset:function(){this.set("content",[])}})
var s=Em.ArrayController.extend(n,{itemController:r,controllerAt:function(e,t,i){var n=this.get("_subControllers"),r=n[e]
return!r&&t&&(r=i.create({parentController:this,target:this,content:t}),n[e]=r),r},save:function(){return this.map((function(e){return e.save()}))},confirm:function(){this.invoke("confirm")}}).reopenClass({toString:function(){return"ZentenceGroupController"}})
i.exports=s}}),require.define({"lib/zentence/controllers/item_controller":function(e,t,i){"use strict"
var n=t("lib/zentence/lib/nodes/node").classForType,r=t("lib/zentence/lib/vertices"),s=Em.Object.extend({activeNode:null,hasPlaceholder:!1,lexica:Em.computed.oneWay("target.lexica"),structure:Em.computed.oneWay("target.structure"),didInit:function(){this._super(),this.setProperties({cache:{},nodes:[]}),this.refresh()},add:function(e){var t=this.get("nodes"),i=this.get("structure"),s=t.length
if(!(s>=i.length)){var o,a,l,c,d,u=this.get("lexica")||{},h=this.get("cache"),p=i[s],m=p.id,f=p.edges,g=t.get("lastObject")
if(d=(o=r.create({lexicon:u[m],content:f?f.map((function(e){return h[e]})):[]})).findByValue(e))return!(l=d.title)&&e&&(l=this.get("content.label")),c={id:m,title:l,label:d.label,prev:g,edges:o},void 0!==e&&(c.value=e),(a=n(d.type).create(c)).addObserver("endpoint",this,this.nodeEndpointDidChange),a.get("endpoint"),h[m]=a,g&&g.set("next",a),t.pushObject(a),a}},next:function(){var e=this.get("activeNode.next")||this.add()
return this.set("activeNode",e||null),e},prev:function(){var e=this.get("activeNode.prev")
return this.set("activeNode",e||null),e},confirm:function(){return this.save(),this.set("activeNode",null),this},save:function(){var e=this.get("structure"),t=this.get("content"),i=this.get("nodes")
return e.forEach((function(e,n){var r,s=i.objectAt(n),o={}
s&&(r=null!=(o=s.getProperties("value","label")).value?o.value:s.get("hint.value")),t.set(e.id,r),o.label&&t.set("label",o.label)})),t},refresh:function(){this.get("structure").forEach((function(e){var t=this.get("content.%@".fmt(e.id))
t&&this.add(t)}),this),0===this.get("nodes.length")&&this.add()},reset:function(){var e=this.get("content"),t=this.get("cache")
this.get("structure").forEach((function(i){var n=i.id,r=e.get(n)
t[n]&&t[n].set("value",r)}))},remove:function(){var e=this.get("target")
e&&e.removeObject(this),this.destroy()},removeNode:function(e){for(var t=this.get("nodes"),i=e.get("prev");e;)i&&i.set("next",null),t.removeObject(e),e.removeObserver("endpoint",this,this.nodeEndpointDidChange),e.destroy(),i=e,e=e.get("next")},didConfirm:Em.K,activeNodeWillChange:function(){var e=this.get("activeNode")
e&&e.set("activating",!1)}.observesBefore("activeNode"),activeNodeDidChange:function(){var e=this.get("activeNode")
e instanceof n("list")?e.set("activating",!0):e||(this.save(),this.didConfirm())}.observes("activeNode"),lexicaDidChange:function(){this.get("nodes").invoke("destroy"),this.set("nodes",[]),this.refresh()}.observes("lexica"),nodeEndpointDidChange:function(e){this.removeNode(e)},willDestroy:function(){this.get("nodes").invoke("destroy")}}).reopenClass({toString:function(){return"ZentenceItemController"}})
i.exports=s}}),require.define({"lib/zentence/lib/nodes/date":function(e,t,i){"use strict"
var n=t("lib/zentence/lib/nodes/node").extend({type:"date",didInit:function(){this.set("hint",new Date),this._super()},validate:function(){return!isNaN(new Date(this.get("value")))},reset:function(){}}).reopenClass({toString:function(){return"ZentenceDateNode"}})
i.exports=n}}),require.define({"lib/zentence/lib/nodes/list":function(e,t,i){"use strict"
var n=t("lib/zentence/lib/nodes/node").extend({type:"list",hasResults:!0,activating:!1,activatingText:function(){return I18n.t("txt.zentence.menu.invalid_query",{query:this.get("query")})}.property().volatile(),invalidText:function(){return I18n.t("txt.zentence.menu.invalid_query",{query:this.get("query")})}.property().volatile(),noResultsText:I18n.t("txt.zentence.menu.no_results_found"),members:Em.computed.oneWay("endpoint.values"),select:function(e){var t,i=this.get("matches")
if(e=e||this.get("hint")||i.get("firstObject"),-1===i.indexOf(e))return this.set("query",this.get("title"));(t=this.get("edges").findByValue(e.get("value"))).value=e.get("value"),t.query=t.title,t.hint=null,this.setProperties(t)},matches:function(){var e,t,i,n=this.get("members"),r=this.get("query"),s=this.get("activating")
return!r||s?(this.set("hint",null),n.forEach((function(e){e.setProperties({start:null,match:null,rest:r?"":e.get("title")})})),n):(e=r.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&"),t=new RegExp("("+e+")(.*)","i"),i=n.filter((function(e){var i,n,r,s=e.get("title"),o=s.match(t)
return!!o&&(i=s.substr(0,o.index),n=o[1]||"",r=o[2]||"",e.setProperties({start:i,match:n,rest:r}),!0)})),this.set("hint",i[0]),i)}.property("query","members","activating"),validate:function(){return this.get("members").findBy("value",this.get("value"))},reset:function(){this.set("query",this.get("title")||""),this.set("hint",null),this.set("invalid",!1)},queryDidChange:function(){this.get("activating")&&this.set("activating",!1)}.observes("query")}).reopenClass({toString:function(){return"ZentenceListNode"}})
i.exports=n}}),require.define({"lib/zentence/lib/nodes/node":function(e,t,i){"use strict"
var n=Em.Object.extend({endpoint:Em.computed.oneWay("edges.endpoint"),didInit:function(){this._super(),this.reset()},scan:function(){for(var e=this,t=null;e;){if(e.get("endpoint").type!==e.get("type")||!e.validate()){t=e
break}e=e.get("next")}return t},select:Em.K,validate:Em.REQUIRED_PROPERTY(),reset:Em.REQUIRED_PROPERTY(),valueDidChange:function(){this.reset()}.observes("value")}).reopenClass({toString:function(){return"ZentenceNode"},classForType:function(e){return t("lib/zentence/lib/nodes/"+e)}})
i.exports=n}}),require.define({"lib/zentence/lib/nodes/organization":function(e,t,i){"use strict"
var n=t("lib/zentence/lib/nodes/search").extend({src:"/api/v2/organizations/autocomplete.json?name=%@",organizations:Em.computed.singleton("models/organizations"),total:Em.computed.oneWay("organizations.total"),isFetching:!1,isPaginated:!0,activatingText:new Em.Handlebars.SafeString(I18n.t("txt.zentence.organization.loading")),parse:function(e){var t=e&&e.organizations
if(t)return t.map((function(e){return n.create({value:e.id,title:e.name,searchable:!1})}))},queryDidChange:function(){if(this.get("searchable")){var e=this.get("query")
this.set("hasResults",!1),e.length<2?this._fetchOrganizations().done(this._onOrganizationsFetched.bind(this,e)):this.get("searchDataSource").filter(null,e)}}.observes("query"),_fetchOrganizations:function(){var e=this.get("organizations")
return this.setProperties({activating:!1,isFetching:!0}),this.get("searchDataSource").resetFilter(),e.fetch()},_onOrganizationsFetched:function(e){if(this.get("query")===e){var t,i=this.get("organizations")
this.set("activating",!e),this.set("isFetching",!1),t=i.map((function(e){return n.create({value:e.get("id"),title:e.get("name"),searchable:!1})})),this.onDataReady(t)}}})
i.exports=n}}),require.define({"lib/zentence/lib/nodes/search":function(e,t,i){"use strict"
var n=t("lib/core_widgets/menu_utils").RemoteSearchDataSource,r=t("lib/zentence/lib/nodes/list").extend({type:"search",hasResults:!1,searchable:!0,invalidText:null,didInit:function(){var e=new n(8,this.get("src"),{httpMethod:"POST",parse:this.parse.bind(this)})
e.onDataReady=this.onDataReady.bind(this),this.set("searchDataSource",e),this._super()},parse:Em.REQUIRED_PROPERTY(),select:function(e){var t,i=this.get("matches")
if(e=e||this.get("hint")||i.get("firstObject"),-1===i.indexOf(e))return this.setProperties("query",this.get("title"));(t=e.getProperties("value","title")).label=t.query=t.title,t.searchable=!0,this.setProperties(t)},onDataReady:function(e){e&&!this.get("isDestroying")&&this.setProperties({hasResults:e.length>0||this.get("query.length")>1,members:e})},queryDidChange:function(){this.get("searchable")&&(this.set("hasResults",!1),this.get("searchDataSource").filter(null,this.get("query")))}.observes("query")}).reopenClass({toString:function(){return"ZentenceSearchNode"}})
i.exports=r}}),require.define({"lib/zentence/lib/nodes/tags":function(e,t,i){"use strict"
var n=t("lib/zentence/lib/nodes/node").extend({type:"tags",value:Em.computed.emptyArray(),validate:function(){return!0},reset:function(){}}).reopenClass({toString:function(){return"ZentenceTagsNode"}})
i.exports=n}}),require.define({"lib/zentence/lib/nodes/text":function(e,t,i){"use strict"
var n=t("lib/zentence/lib/nodes/node").extend({type:"text",validate:function(){return""!==this.get("value")},reset:function(){}}).reopenClass({toString:function(){return"ZentenceTextNode"}})
i.exports=n}}),require.define({"lib/zentence/lib/vertices":function(e,t,i){"use strict"
var n=t("lib/zentence/lib/nodes/node").classForType,r=Em.ArrayProxy.extend({data:function(){var e=this.get("content"),t=this.get("lexicon")
return e.length>0?e.reduce((function(e,t){return e[t.get("value")]}),t):{list:t,type:"list"}}.property("content.@each.value","lexicon"),endpoint:function(){var e,t,i=this.get("data"),r={values:[]},s=r.values
if(!i)return r
for(var o in e=i.list,t=r.type=i.type,e)e.hasOwnProperty(o)&&s.push(n(t).create({value:e[o].value||o,title:e[o].title}))
return r}.property("data"),findByValue:function(e){var t=this.get("data")
if(t){if("list"===t.type){if(!t.list)return
t=$.extend({type:t.type},t.list[e])}return t}},endpointWillChange:function(){this.get("endpoint.values").invoke("destroy")}.observesBefore("endpoint")}).reopenClass({toString:function(){return"ZentenceVertices"}})
i.exports=r}}),require.define({"lib/zentence/views/action":function(e,t,i){"use strict"
var n=Ember.View.extend({tagName:"span",classNames:["zentence-action"],attributeBindings:["tabindex"],ariaRole:"button",tabindex:"0",confirmText:"Done",removeText:"×",content:Em.computed.alias("controller.nodes"),template:Em.Handlebars.compile('<span tabindex="0" class="link zentence-action-link zentence-confirm-action">{{unbound view.confirmText}}</span><span tabindex="0" class="zentence-action-link zentence-remove-action">{{unbound view.removeText}}</span>'),click:function(e){var t=$(e.target)
t.hasClass("zentence-action-link")&&this.get("controller")[t.hasClass("zentence-remove-action")?"remove":"confirm"]()},focusIn:function(e){$(e.target).hasClass("zentence-action-link")||this.set("controller.activeNode",this.get("content.firstObject"))}}).reopenClass({toString:function(){return"ZentenceAction"}})
i.exports=n}}),require.define({"lib/zentence/views/group":function(e,t,i){"use strict"
var n=t("lib/zentence/views/item"),r=t("lib/zentence/views/menu"),s=Em.CollectionView.extend({classNames:["zentence-group"],content:Em.computed.oneWay("controller"),itemViewClass:n.extend({focusIn:function(){Em.run.next(this,(function(){this.isDestroying||this.isDestroyed||this.get("parentView.activeView")!==this&&this.set("parentView.activeView",this)}))},focusOut:function(e){this.get("controller.activeNode")||Em.run.next(this,(function(){this.isDestroying||this.isDestroyed||(this.set("parentView.activeView",null),this.set("menu.input",null))}))}}),createChildView:function(e,t){var i
return e!==this.get("emptyView")&&(i=this.get("controller").objectAt(t.contentIndex),t.controller=i,t.menu=this.get("menu")||r.create()),this._super.apply(this,arguments)},activeViewWillChange:function(){this.get("activeView.controller")&&this.set("activeView.controller.activeNode",null)}.observesBefore("activeView")}).reopenClass({toString:function(){return"ZentenceGroupView"}})
i.exports=s}}),require.define({"lib/zentence/views/item":function(e,t,i){"use strict"
var n=t("lib/zentence/views/action"),r=t("lib/zentence/views/menu"),s=t("lib/zentence/views/tree"),o=Ember.ContainerView.extend({classNames:["zentence"],classNameBindings:["active:zentence-active"],active:Em.computed.bool("controller.activeNode"),didInit:function(){var e,t,i=this.get("controller"),o=this.get("menu")
o||(o=r.create(),this.set("menu",o),this.on("didInsertElement",o,o.append)),e=n.create({controller:i,attributeBindings:["dataTrackId:data-track-id"],dataTrackId:"c249-customer-list-update-done"}),this.set("actionView",e),t=s.create({controller:i,menu:o}),this.set("treeView",t),this.pushObjects([e,t]),this._super()},click:function(e){var t=this.get("controller")
t.get("activeNode")||$(e.target).hasClass("zentence-action-link")||t.set("activeNode",t.get("nodes.firstObject")),e.stopPropagation()}}).reopenClass({toString:function(){return"ZentenceItemView"}})
i.exports=o}}),require.define({"lib/zentence/views/leaves/date":function(e,t,i){"use strict"
var n=$(document),r=t("lib/views/new_date_view"),s=t("lib/zentence/views/leaves/leaf_mixin"),o=r.extend(s,{tagName:"input",classNames:["zentence-date"],dateFormat:"mm/dd/yy",date:Em.computed.oneWay("content.value"),hint:Em.computed.alias("content.hint"),placeholder:function(){return this.get("active")?this.format(this.get("hint")):""}.property("active","hint"),select:function(e,t){var i=this._super.apply(this,arguments)
return i?this.set("content.value",this.get("date")):this.set("content.value",new DateWithOffset(e,0)),this.get("controller").next(),i},close:function(e,t){Em.run.next(this,(function(){this.isDestroying||this.isDestroyed||!this.get("active")||this.set("controller.activeNode",null)}))},_dpMouseEnter:function(e){var t=this.get("dp")
this.set("hint",new Date(t.drawYear,+t.drawMonth,e.target.textContent))},_dpMouseOut:function(e){this.set("hint",new Date)},keyDown:function(e){9===e.keyCode&&(this.get("controller")[e.shiftKey?"prev":"next"](),e.preventDefault())},didActivate:function(){var e=this.get("_clickId")
n.off(e),this.get("active")?(n.on(e,this.didClickOut.bind(this)),this.set("activeView",this),Em.run.scheduleOnce("afterRender",this,(function(){this.$().focus()}))):(this.set("activeView",null),this.$().blur())}.observes("active"),didClickOut:function(e){var t=e.target,i=this.$()[0],n=this.get("dp").dpDiv[0]
i===t||n===t||$.contains(i,t)||$.contains(n,t)||$(t).hasClass("ui-corner-all")||(this.get("date")||this.set("date",this.get("hint")),this.set("controller.activeNode",null),this.$().val(this.format(this.get("date"))))},didInsertElement:function(){var e
this._super(),e=this.get("dp").dpDiv,$(".ui-corner-all").on("click",(function(e){e.stopPropagation()})),e.on("mouseenter",".ui-datepicker-calendar td a",this._dpMouseEnter.bind(this)),e.on("mouseout",".ui-datepicker-calendar td a",this._dpMouseOut.bind(this))},willDestroyElement:function(){var e=this.get("dp")
e&&e.dpDiv.off(),$(".ui-corner-all").off("click"),this._super()}}).reopenClass({toString:function(){return"ZentenceDateView"}})
i.exports=o}}),require.define({"lib/zentence/views/leaves/leaf_mixin":function(e,t,i){"use strict"
var n=$(document),r=Ember.Mixin.create({tagName:"span",classNames:["zentence-leaf"],classNameBindings:["active:zentence-leaf-active","type"],activeView:Em.computed.alias("parentView.activeView"),content:Em.computed.oneWay("parentView.content"),controller:Em.computed.oneWay("parentView.controller"),menu:Em.computed.oneWay("parentView.menu"),init:function(){var e=this.get("controller")
this._super(),this.set("controller",e)},type:function(){var e=this.get("content.id")
return e&&"zentence-leaft-%@".fmt(e)}.property("content.id"),_clickId:function(){return"click.%@".fmt(Ember.guidFor(this))}.property(),active:function(){var e=this.get("content")
return this.get("controller.activeNode")===e&&!e.get("isDestroyed")}.property("controller.activeNode","content.isDestroyed"),click:function(e){this.set("controller.activeNode",this.get("content"))},paste:function(e){var t=e.originalEvent.clipboardData.getData("text/plain")
document.execCommand("insertText",!1,t),e.preventDefault()},didActivate:function(){var e=this.get("_clickId")
this.$()
n.off(e),this.get("active")?(n.on(e,this.didClickOut.bind(this)),this.set("activeView",this)):this.set("activeView",null)}.observes("active"),didClickOut:function(e){var t=this.$()[0],i=e.target
t&&(t===i||$.contains(t,i))||this.set("controller.activeNode",null)},didInsertElement:function(){this._super&&this._super(),Em.run.schedule("afterRender",this,this.didActivate)},willDestroyElement:function(){n.off(this.get("_clickId")),this._super&&this._super()}})
i.exports=r}}),require.define({"lib/zentence/views/leaves/list":function(e,t,i){"use strict"
var n=t("mixins/caret_navigable"),r=t("mixins/content_editable"),s=t("lib/zentence/views/leaves/leaf_mixin"),o=Em.Handlebars.Utils.escapeExpression,a=Ember.View.extend(n,r,{tagName:"span",classNames:["zentence-value"],template:Ember.Handlebars.compile("{{unbound view.content.title}}"),controller:Em.computed.oneWay("parentView.controller"),content:Em.computed.oneWay("parentView.content"),active:Em.computed.oneWay("parentView.active"),escaped:!1,keyUp:function(e){var t=this.$().text(),i=this.get("content")
" "===t?t="":this.didEditContent(),t!==i.get("query")&&i.setProperties({activating:!t,query:o(t)})},keyPress:function(e){this.get("parentView").onInput(e)},keyDown:function(e){var t=this.get("controller"),i=this.get("content"),n=e.keyCode
switch(this.willEditContent(),n){case 9:e.shiftKey?t.prev():(i.get("hint")&&i.select(),this.rerender(),t.next()),e.preventDefault(),e.stopPropagation()
break
case 13:i.get("hint")?i.select():i.reset(),this.rerender(),t.set("activeNode",t.next()),e.preventDefault(),e.stopPropagation()
break
case 27:i.reset(),this.rerender(),t.set("activeNode",null),this.$()&&this.$().blur(),this.set("escaped",!0)
break
case 37:if(!this.atStart()){e.stopPropagation()
break}i.get("hasParent")||(!i.get("activating")&&i.select(),this.rerender(),t.prev()),e.preventDefault()
break
case 38:this.atEnd()&&e.preventDefault()
break
case 39:if(!this.atEnd()){e.stopPropagation()
break}i.get("hasChildren")||(i.select(),this.rerender(),t.next()),e.preventDefault(),e.stopPropagation()
break
case 40:this.atEnd()&&e.preventDefault()
break
case 8:case 46:this.get("parentView").onDelete()}},didInsertElement:function(){this._super(),this.didEditContent(),this.get("active")&&this.$().get(0).focus()},editableDidChange:function(){Em.run.scheduleOnce("afterRender",this,this._toggleEditMode)}.observes("editable"),_toggleEditMode:function(){if(this.isInDom()&&!this.get("isDestroying")){var e=this.get("content")
this.get("active")?(this.moveCaretToEnd(),this._startEditing()):(e.get("hint")&&this.get("escaped")?e.select():e.reset(),this.rerender())}},_startEditing:function(){this.get("content.query")||this.moveCaretToStart()}}).reopenClass({toString:function(){return"ZentenceListValueView"}}),l=Em.View.extend(s,{classNames:["zentence-list"],classNameBindings:["content.invalid:zentence-leaf-invalid"],template:Em.Handlebars.compile('<span class="zentence-ghost">{{unbound view.content.query}}</span>{{view view.ValueView viewName="valueView"}}'),ValueView:a,onInput:function(e){var t=String.fromCharCode(e.keyCode),i=this.$(".zentence-ghost"),n=this.get("content.hint"),r=this.get("valueView").$().text()
r+=e.shiftKey?t.toUpperCase():t.toLowerCase(),(!n||n.get("start")||n.get("title.length")<=r.length)&&i.text(r)},didInput:function(){Em.run.scheduleOnce("afterRender",this,this._updateGhost)}.observes("active","content.query","content.hint"),onDelete:function(){var e=this.$(".zentence-ghost"),t=this.get("content.hint")
t&&!t.get("start")&&document.getSelection().toString()!==this.get("valueView").$().html()||e.css("visibility","hidden")},didClickOut:function(e){var t=this.get("menu").$()[0],i=e.target
t&&(t===i||$.contains(t,i))||this._super.apply(this,arguments)},_updateGhost:function(){if(!this.get("isDestroying")){var e=this.get("content"),t=this.$(".zentence-ghost")
if(this.get("active")){var i=this.get("valueView").$().text(),n=" "===i?"":i,r=e.get("hint")
r&&!r.get("start")?(n+=r.get("rest"),t.css("visibility","visible")):t.css("visibility","hidden"),t.text(n)}else t.text(e.get("query"))}}}).reopenClass({toString:function(){return"ZentenceListView"}})
i.exports=l}}),require.define({"lib/zentence/views/leaves/tags":function(e,t,i){"use strict"
var n=t("lib/core_widgets/menu_utils").RemoteSearchDataSource,r=t("lib/views/tagger_view"),s=t("lib/zentence/views/leaves/leaf_mixin"),o=r.extend(s,{tagName:"div",classNames:["zentence-tags"],value:Em.computed.alias("content.value"),disabled:!1,menu:null,configOptions:{searchEditorOptions:{delimiters:[","," "],openOnFocus:!0,maxSearchResults:8,clsItem:"zd-menu-item",clsSearchMenuScope:"zd-searchmenu zd-tags-menu"}},didInit:function(){this.searchDataSource=new n(30,"/api/v2/autocomplete/tags.json?name=%@&per_page=%@",{httpMethod:"POST",dataFilter:function(e){return e&&e.tags||[]},parse:function(e){return e.map((function(e){return{label:e,value:e}}))}})},onDelegateFocus:function(){this.set("controller.activeNode",this.get("content"))},onDelegateBlur:function(){this.set("controller.activeNode",null)},userDidChangeValue:function(){var e=this.get("controller")
this._super(),this.get("active")||(e.save(),e.didConfirm())},didActivate:function(){var e=this.delegate,t=this.get("active")
this._super(),t&&!e.isFocused?e.focus():!t&&e.isFocused&&e.blur()}.observes("active"),didInsertElement:function(){this.get("controller")
this._super(),this.delegate.on("focus",this.onDelegateFocus.bind(this)),this.delegate.on("blur",this.onDelegateBlur.bind(this))}}).reopenClass({toString:function(){return"ZentenceTagsView"}})
i.exports=o}}),require.define({"lib/zentence/views/leaves/text":function(e,t,i){"use strict"
var n=t("mixins/caret_navigable"),r=t("mixins/content_editable"),s=t("lib/zentence/views/leaves/leaf_mixin"),o=Em.View.extend(Em.TextSupport,s,n,r,{attributeBindings:["suffixLabel:data-suffix"],classNames:["zentence-text"],spellcheck:"false",template:Em.Handlebars.compile("{{unbound view.value}}"),value:Em.computed.alias("content.value"),suffixLabel:Em.computed.oneWay("content.label"),keyUp:function(e){this.didEditContent(),this._super.apply(this,arguments)},keyDown:function(e){var t=this.get("controller"),i=e.keyCode
switch(this.willEditContent(),i){case 9:t[e.shiftKey?"prev":"next"](),e.stopPropagation(),e.preventDefault()
break
case 13:t.set("activeNode",t.next()),e.stopPropagation(),e.preventDefault()
break
case 27:t.set("activeNode",null)
break
case 37:this.atStart()&&(t.prev(),e.stopPropagation(),e.preventDefault())
break
case 39:this.atEnd()&&(t.next(),e.stopPropagation(),e.preventDefault())}},sendAction:Em.K,editableDidChange:function(){Em.run.scheduleOnce("afterRender",this,this._toggleEditMode)}.observes("editable"),didInsertElement:function(){this._super(),this.didEditContent(),this.get("active")&&this.$().get(0).focus()},_elementValueDidChange:function(){this.set("value",Em.Handlebars.Utils.escapeExpression(this.$().text()))},_toggleEditMode:function(){this.isInDom()&&(this.get("active")?this.moveCaretToEnd():(this.get("content").reset(),this.rerender()))}}).reopenClass({toString:function(){return"ZentenceTextView"}})
i.exports=o}}),require.define({"lib/zentence/views/leaves/wrapper":function(e,t,i){"use strict"
var n=Em.View.extend({tagName:"span",classNames:["zentence-leaf-wrapper"],template:Em.Handlebars.compile('{{view view.LeafView viewName="wrapperView"}}'),controller:Em.computed.oneWay("parentView.controller"),activeView:Em.computed.alias("parentView.activeView"),LeafView:Em.REQUIRED_PROPERTY()}).reopenClass({toString:function(){return"ZentenceLeafWrapperView"},classForType:function(e){var i
try{i=t("lib/zentence/views/leaves/"+e)}catch(n){i=t("lib/zentence/views/leaves/list")}return this.extend({LeafView:i})}})
i.exports=n}}),require.define({"lib/zentence/views/menu":function(e,t,i){"use strict"
var n=t("lib/nested_hash"),r=t("lib/views/select_view").extend({delegateType:"Menu",controller:Em.computed.oneWay("input.controller"),isVisible:Em.computed.or("controller.activeNode.hasResults","controller.activeNode.activating"),configOptions:{clsRoot:"zd-menu-root zentence-menu",goToStartAfterReachingEnd:!0,goToEndAfterReachingStart:!0,renderItemContent:function(e,t,i){var n=e.data&&"object"==typeof e.data.type?e.data.type:{title:e.label}
return(n.match?"<strong>{{start}}</strong>{{match}}<strong>{{rest}}</strong>":"{{title}}").replace(/{{([^}]+)}}/g,(function(e,t){return void 0!==n[t]&&null!==n[t]?Em.Handlebars.Utils.escapeExpression(n[t]):""}))},typeToClassMap:{activating:"zentence-menuitem-activating",invalid:"zentence-menuitem-invalid",none:"zentence-menuitem-none"}},options:function(){var e=this.get("controller.activeNode")
if(!e)return[]
var t,i=e.get("matches")||[],r=new n
return 0===i.length?(this.set("shouldResize",!0),e.set("invalid",!!e.get("query")&&!!e.get("invalidText")&&e.get("hasResults")),this.get("emptyOption")):(e.set("invalid",!1),i.forEach((function(e){r.add(e.get("title"),e.get("value"),e)})),t=r.toList(),this.set("shouldResize",!t.find((function(e){return e.children}))),t)}.property("controller.activeNode.matches"),emptyOption:function(){var e=this.get("controller.activeNode"),t={role:"uiLabel"}
return e.get("activating")?(t.type="activating",t.label=e.get("activatingText")):e.get("invalidText")?(t.type="invalid",t.label=e.get("invalidText")):(t.type="none",t.label=e.get("noResultsText")),[t]}.property().volatile(),itemHeight:function(){return this.constructor.ITEM_HEIGHT||(this.constructor.ITEM_HEIGHT=$(this.delegate.dom).find("li").first().height()),this.constructor.ITEM_HEIGHT}.property().volatile(),maxHeight:function(){return this.constructor.MAX_HEIGHT||(this.constructor.MAX_HEIGHT=parseInt($(this.delegate.dom).css("maxHeight"),10)),this.constructor.MAX_HEIGHT}.property().volatile(),buildDelegate:function(){var e=this.get("controller.activeNode.value")
this.set("value",e),this._super(),this.delegate.on("itemFocused",this.didFocus.bind(this)),this.delegate.on("change",this.didChange.bind(this)),this.delegate.onChangeRequest=this.onChangeRequest.bind(this),this.get("options")},position:function(){if(this.delegate&&this.input&&this.input.isInDom()){var e,t=$(this.delegate.dom),i=this.input.$(),n=i.offset(),r=this.get("maxHeight"),s={left:n.left,top:n.top+i.height(),width:i.width()}
this.get("shouldResize")?(e=this.get("itemHeight")*this.get("options.length"),s.height=e>r?r:e):s.height=r,t.css(s)}},visibilityDidChange:function(){this.isInDom()&&(this.get("isVisible")?(this.delegate.show(),this.delegate.focus(),this.position()):(this.delegate.blur(),this.delegate.hide(),this.set("value",null)))}.observes("isVisible"),selectedDidChange:function(){var e,t=this.get("controller.activeNode"),i=this.get("selected"),n=i.data,r=i.parentItem,s=!1,o=null
n?((e=n.type)&&this.get("isVisible")&&(e.set("selected",!0),o=e),s=!!n.children):s=!!i.children,t&&t.setProperties({hasChildren:s,hasParent:r!==this.delegate.rootItem,hint:o})}.observes("selected"),selectedWillChange:function(){var e=this.get("selected.type"),t=this.get("controller.activeNode")
e&&e.set("selected",!1),t&&t.set("hint",null)}.observesBefore("selected"),optionsDidChange:function(){var e=this.get("controller.activeNode")
this.delegate&&e&&(this.delegate.loadData(this.get("options")),e.get("activating")&&this.delegate.setValue(e.get("value")),this.position())}.observes("options"),onChangeRequest:function(e){if(e.value&&e.value===e.oldValue)return this.get("controller.activeNode").select(e.record.data.type),this.get("controller").next(),!1},didChange:function(e,t){t.userInitiated&&(this.get("controller.activeNode").select(t.record.data.type),this.get("controller").next())},didFocus:function(e,t){this.set("selected",t)},didInsertElement:function(){this._super(),this.delegate&&(this.position(),this.delegate.syncViewWithValue(),this.get("isVisible")&&this.delegate.focus())}}).reopenClass({toString:function(){return"ZentenceMenu"}})
i.exports=r}}),require.define({"lib/zentence/views/tree":function(e,t,i){"use strict"
var n=t("lib/zentence/views/leaves/wrapper"),r=t("lib/zentence/views/leaves/list"),s=Ember.CollectionView.extend({classNames:["zentence-tree"],content:Em.computed.oneWay("controller.nodes"),createChildView:function(e,t){var i=n.classForType(t.content.type)
return t.menu=this.get("menu"),this._super(i,t)},activeViewDidChange:function(){this.get("activeView")instanceof r&&this.set("menu.input",this.get("parentView"))}.observes("activeView")}).reopenClass({toString:function(){return"ZentenceTreeView"}})
i.exports=s}}),require.define({"models/filter/user_filter/filter_user":function(e,t,i){"use strict"
var n=t("models/filter/filter_record"),r=t("models/photo"),s=function(e){return e?new Date(e):null},o=n.extend({didInit:function(){this._super(),Em.setProperties(this,{created_at:s(this.get("created_at")),created:s(this.get("created")),isSelectable:!0})},roleDisplayName:function(){var e=this.get("role")||"end-user"
return I18n.t("type.updated_by.%@".fmt(e).underscore())}.property("role"),href:function(){var e=this.get("id")
return e?"#/users/%@".fmt(e):null}.property("id"),isAgent:function(){var e=this.get("role")
return"agent"===e||"admin"===e}.property("role"),profileImageUrl:function(){return new r(this.get("photo.content_url"),this.get("email")).url()}.property("photo","email")})
i.exports=o}}),require.define({"models/filter/user_filter/org_user_filter_factory":function(e,t,i){"use strict"
var n=t("models/filter/user_filter/user_filter"),r=t("models/filter/user_filter/filter_user"),s=t("models/filter/user_filter/user_filter_resource"),o=t("models/filter/filter_preset_executor"),a=(t("models/filter/user_filter/user_filter_content_parser"),{id:null,active:!0,title:"Organization Users",execution:{columns:[{id:"id"}],group:{id:null,order:null},sort:{id:null,order:null}}}),l=o.extend({executeURL:function(e,t){var i=this.urlParams(e,t),n=this.get("filter.relatedOrgId")
return"/api/v2/organizations/%@/users?%@".fmt(n,$.param(i))}}),c=Em.Object.create({parse:function(e){return(e.users||[]).map((function(e){return r.create(e)}),this)}})
i.exports=function(e){return(e=e||{}).executor=e.executor||l.create(),e.contentParser=e.contentParser||c,e.resource=e.resource||s.createFromDefinition(null,Em.copy(a,!0)),e.isSortingEnabled=!1,n.create(e)}}}),require.define({"models/filter/user_filter/user_filter_content_parser":function(e,t,i){"use strict"
var n,r,s=t("models/filter/user_filter/filter_user"),o=t("models/photo"),a={organization:(n="organization_id",r="organizations",function(e,t){var i=e[n]
return t[r].find((function(e){return e.id==i}))})},l=Em.Object.extend({filter:null,getRows:function(e){return e.rows||[]},parse:function(e){return this.get("filter").setProperties({isSampling:!!e.sample,approximateTotal:e.estimated_unsampled_count||0}),this.getRows(e).map((function(t){return s.create(this.parseRow(t,e))}),this)},parseRow:function(e,t){var i,n,r
return e.organization_id&&(e.organization_ids?e.organization_id=function(e,t){return e.organization_ids.map((function(e){var i=t.organizations.find((function(t){return t.id==e}))
return i&&i.name}))}(e,t):(i=a.organization(e,t),e.organization_id=i&&i.name)),n=Em.get(e,"user.photo.thumbnails.0.content_url")||Em.get(e,"user.photo.public_filename"),e.photo=o.urlFor(n,e.user.email),Object.keys(e).forEach((function(t){0===t.indexOf("custom_fields.")&&(r=t.replace(/^custom_fields\./,"custom_fields:"),e[r]=e[t],delete e[t])})),e}})
i.exports=l}}),require.define({"models/filter/user_filter/user_filter_definitions":function(e,t,i){"use strict"
var n=t("models/user_column"),r=t("models/filter/filter_definitions").extend({url:"/api/v2/user_views/definitions",parse:function(e){return(e=this._super(e)).forEach((function(e){e.key=e.key.replace(/^custom_fields./,"custom_fields:")})),e},didFetch:function(){this.forEach((function(e){n.createColumn({id:e.get("key")}).set("title",e.get("title"))}))}}).reopenClass({toString:function(){return"UserFilterDefinitions"}})
i.exports=r}})
require.define({"models/filter/user_filter/user_filter_preset_executor":function(e,t,i){"use strict"
var n=t("models/filter/filter_preset_executor").extend({executeURL:function(e,t){var i=this.urlParams(e,t)
return"/api/v2/user_views/"+this.get("filter.id")+"/execute.json?"+$.param(i)},urlParams:function(e,t){var i=this.get("filter"),n=i.get("sortBy"),r=i.get("sortOrder"),s={per_page:t,page:e}
return!i.get("groupBy")&&n&&r&&(s.sort_by=n.replace(/^custom_fields:/,"custom_fields."),s.sort_order=r),s}})
i.exports=n}}),require.define({"models/filter/user_filter/user_filter_preview_executor":function(e,t,i){"use strict"
var n=t("models/filter/filter_executor").extend({url:"/api/v2/user_views/preview.json",params:function(){return{}},executeParams:function(){var e=this.get("filter.resource"),t=e.get("conditions").toJSON(),i=e.serializeExecution(),n={user_view:$.extend({},t,i)}
return JSON.stringify(n)}})
i.exports=n}}),require.define({"models/filter/user_filter/user_filter_resource_parser":function(e,t,i){"use strict"
var n=t("models/filter/filter_resource_parser").extend({payloadKey:"user_view",normalizeFields:Em.K,parseConditions:function(e){var t
e.conditions&&(["all","any"].forEach((function(i){t=e.conditions[i],Ember.isArray(t)&&(t=t.map((function(e){return e.field=e.field.replace(/^custom_fields\./,"custom_fields:"),e})))})),this._super(e))},parseColumns:function(e){e&&(e.forEach((function(e){e.id=e.id.replace(/^custom_fields\./,"custom_fields:")})),e.unshift({title:"User photo",id:"photo"}))},parseGroup:function(e){e&&e.id&&(e.id=e.id.replace(/^custom_fields\./,"custom_fields:"))},parseSort:function(e){e&&e.id&&(e.id=e.id.replace(/^custom_fields\./,"custom_fields:"))}}).reopenClass({toString:function(){return"UserFilterResourceParser"}})
i.exports=n}}),require.define({"models/filter/user_filter/user_filter_resource":function(e,t,i){"use strict"
var n=t("models/filter/filter_resource"),r=t("models/filter/user_filter/user_filter_resource_parser").create()
function s(e){if(e)return e.id&&{id:e.id.replace(/^custom_fields:/,"custom_fields."),order:e.order||"desc"}}var o=n.extend({resourceName:"UserFilterResource",previewing:!1,isFetchable:function(){return!this.get("previewing")&&(Ember.get(this,"resourceState")==Ember.Resource.Lifecycle.UNFETCHED||this.get("isExpired"))}.property().volatile(),columnClass:t("models/user_column"),resourceURL:function(){var e=this.get("id")||this.get("filter.id")
return this.get("url")||"/api/v2/user_views/"+e},serializeExecution:function(){var e=this.get("execution"),t={execution:{}},i=t.execution.columns=[]
if(this.get("output").toJSON().columns.forEach((function(e){"photo"!==e&&i.push(e.replace(/^custom_fields:/,"custom_fields."))})),!e)return t
var n=s(e.group),r=s(e.sort)
return n&&(t.execution.group=n),r&&(t.execution.sort=r),t},toJSON:function(){var e=this.get("conditions")?this.get("conditions").toJSON():{},t=this.serializeExecution()
return{user_view:_.extend({title:this.get("title"),active:this.get("active"),restriction:this.get("restriction")||null},e,t)}}}).reopenClass({resourceURL:function(){return"/api/v2/user_views.json"},parse:function(e){return r.parse(e)},createFromDefinition:function(e,t){var i=this.create({fetch:$.when.bind($),expire:Em.K},t)
return e&&i.reopen(e),i},toString:function(){return"UserFilterResource"}})
i.exports=o}}),require.define({"models/filter/user_filter/user_filter":function(e,t,i){"use strict"
var n=t("models/generic_filter"),r=t("mixins/factory_with_identity_map"),s=t("models/filter/user_filter/user_filter_preset_executor"),o=t("models/filter/user_filter/user_filter_preview_executor"),a=t("models/filter/user_filter/user_filter_resource"),l=t("models/filter/user_filter/user_filter_resource_parser").create(),c=t("models/filter/user_filter/filter_user"),d=t("models/filter/user_filter/user_filter_content_parser"),u=t("models/user_column"),h=t("lib/lotus/global_events"),p=(t("lib/features"),t("models/filter/user_filter/user_filter_definitions"),n.extend(t("lib/clean_up_on_destroy"),{resource:null,contentParser:null,executor:null,previewer:null,previewing:Em.computed.alias("resource.previewing"),isSortingEnabled:Em.computed.not("previewing"),active:Em.computed.oneWay("resource.active"),output:Em.computed.oneWay("resource.output"),conditions:Em.computed.oneWay("resource.conditions"),columns:Em.computed.oneWay("output.columns"),title:Em.computed.alias("resource.title"),columnClass:u,_sortBy:Em.computed.oneWayLive("resource.execution.sort.id"),_sortOrder:Em.computed.oneWayLive("resource.execution.sort.order"),groupBy:Em.computed.oneWayLive("resource.execution.group.id"),groupOrder:Em.computed.oneWayLive("resource.execution.group.order"),restriction:Em.computed.alias("resource.restriction"),cleanUpOnDestroy:["resource","executor","previewer"],didInit:function(){h.on("@user:was_updated",this,"expirationHandler"),h.on("@user:created",this,"expirationHandler"),h.on("@user:expire",this,"expirationHandler"),h.on("@user:merge",this,"expirationHandler"),this.get("contentParser")?this.set("contentParser.filter",this):this.set("contentParser",d.create({filter:this})),this.get("executor")?this.set("executor.filter",this):this.set("executor",s.create({filter:this})),this.get("previewer")?this.set("previewer.filter",this):this.set("previewer",o.create({filter:this})),this._super()},totalCount:Em.computed.oneWay("content.total"),approximateTotal:0,isSampling:!1,content:function(){return t("models/paginated_collection_for_filter").extend({remoteExpiryKey:function(){var e=this.get("source.id")
return e?"views/"+e+"/users":null}.property("source.id"),type:c}).create({source:this})}.property(),expireContent:function(){return this.get("content").expireNow&&this.get("content").expireNow(),this._super()},parseContent:function(e){return this.get("contentParser").parse(e)},currentUser:Em.computed.singleton("models/current_user"),fetchContent:function(e){var t=this.get("previewing")
return this.get(t?"previewer":"executor").execute(this.get("content")).done(e).fail(function(e){this.get("page")>1?this.goToFirstPage():h.trigger("@user_filter:load_failed",{filter:this,xhr:e})}.bind(this))},fetch:function(){return this.get("resource").fetch()},expire:function(){return this.get("resource").expire()},expirationHandler:function(){this.expireContent()},href:function(){return!!this.get("id")&&"#/user_filters/"+this.get("id")}.property("id"),isOwnedBy:function(e){var t=this.get("restriction")
return!!t&&("User"===t.type&&t.id===e.get("id"))},isOwnedByGroup:Em.computed.equal("restriction.type","Group"),isGlobal:Em.computed.not("restriction.type"),isPersistedAsGlobal:function(){return!this.get("resource.isNew")&&this.get("isGlobal")}.property("resource.isNew","isGlobal"),isPersistedAsGroup:function(){return!this.get("resource.isNew")&&this.get("isOwnedByGroup")}.property("resource.isNew","isOwnedByGroup"),selected:!1,_viewType:null,viewType:Em.computed("restriction.type",{get:function(){var e="User"===this.get("restriction.type")?"personal":"shared"
return this.get("_viewType")?this.get("_viewType"):e},set:function(e,t){var i="User"===this.get("restriction.type")?"personal":"shared"
return this.set("_viewType",t),null==t?i:t}}),destroy:function(){h.off("@user:was_updated",this,"expirationHandler"),h.off("@user:created",this,"expirationHandler"),h.off("@user:expire",this,"expirationHandler"),h.off("@user:merge",this,"expirationHandler"),this.constructor.removeFromMap(this),this._super()}}).reopenClass(r("create")).reopenClass({toString:function(){return"UserFilter"},globalPermissions:t("models/global_permissions").instance(),create:function(e,t){null==(e=e||{}).id&&t&&t.id&&(e.id=t.id),e.id&&(e.id=String(e.id))
var i=this._super(e)
return t&&(t=l.parse(t)),i.get("resource")?(i.set("resource.filter",i),t&&i.set("resource.data",t)):i.set("resource",a.create({filter:i},t)),i},createWithDefaults:function(e){var i={active:!0,execution:{columns:e?["id","name","created_at"].map((function(t){return function(e,t){var i=e.findBy("key",t)
if(i)return{id:String(i.get("key")),title:i.get("title")}}(e,t)})).compact():[{id:"id",title:"Id"},{id:"name",title:"Name"},{id:"created_at",title:"Created"}]},conditions:{all:[]}}
return!Em.get(this,"globalPermissions.manageSharedUserViews")&&Em.get(this,"globalPermissions.managePersonalUserViews")&&(i.restriction={type:"User",id:t("models/current_user").instance().get("id")}),this.create(null,i)}}))
i.exports=p}}),require.define({"models/filter/user_filter/user_filters":function(e,t,i){"use strict"
var n=Em.ResourceCollection.extend({type:t("models/filter/user_filter/user_filter"),url:"/api/v2/user_views",remoteExpiryKey:"user_views",expireContent:function(){this.invoke("expireContent")},refreshContent:function(){this.invoke("refreshContent")},parse:function(e){return e?this._super(e.user_views||[]):[]},didFetch:function(){this.get("isFetched")&&this.invoke("set","resource.resourceState",Em.Resource.Lifecycle.FETCHED)}.observes("isFetched")})
i.exports=n}}),require.define({"views/filters/editor/conditions_empty_view":function(e,t,i){"use strict"
var n=Em.View.extend({classNames:["zentence","zentence-empty"],templateName:"templates/filters/editor/conditions_empty",placeholder:I18n.t("txt.user_filters.condition_placeholder"),controller:Em.computed.oneWay("parentView.controller"),click:function(e){this.get("controller").send("addCondition"),e.stopPropagation()},focusIn:function(e){this.get("controller").send("addCondition")}}).reopenClass({toString:function(){return"FilterEditorView.ConditionsEmptyView"}})
i.exports=n}}),require.define({"views/filters/editor/conditions_group_view":function(e,t,i){"use strict"
t("lib/zentence/controllers/group_controller")
var n=t("lib/zentence/views/group"),r=t("views/filters/editor/conditions_empty_view"),s=n.extend({emptyView:r}).reopenClass({toString:function(){return"FilterEditorView.ConditionsGroupView"}})
i.exports=s}}),require.define({"views/filters/editor/conditions_view":function(e,t,i){"use strict"
var n=t("lib/zentence/views/action"),r=(t("lib/zentence/views/tree"),t("views/filters/editor/fieldset_view")),s=t("views/filters/editor/conditions_group_view"),o=t("views/filters/editor/menu_view")
n.reopen({confirmText:I18n.t("txt.zentence.action.confirm")})
var a=["click","mousedown","mouseup"],l=function(e){return e.stopPropagation(),e.preventDefault(),!1},c=function(e){this.addEventListener(e,l,!0)},d=function(e){this.removeEventListener(e,l,!0)},u=r.extend({tagName:"fieldset",classNames:["filter-conditions"],classNameBindings:["disabled"],label:I18n.t("txt.user_filters.filters"),rerender:function(){this._super(),this.disabledDidChange()},willRerender:function(){this.enable()},didInsertElement:function(){this._super(),this.set("menu",o.instance()),this.disabledDidChange()},enable:function(){this.isInDom()&&(a.forEach(d.bind(this.$()[0])),this.set("_eventsSupressed",!1))},disable:function(){this.isInDom()&&!this.get("_eventsSupressed")&&(a.forEach(c.bind(this.$()[0])),this.set("_eventsSupressed",!0))},disabledDidChange:function(){this.get("disabled")?this.disable():this.enable()}.observes("disabled"),willDestroyElement:function(){this.enable(),this._super&&this._super()},FieldView:Em.View.extend({viewName:"fieldView",templateName:"templates/filters/editor/conditions",controller:Em.computed.oneWay("parentView.controller"),menu:Em.computed.alias("parentView.menu"),ConditionsGroupView:s}).reopenClass({toString:function(){return"FilterEditorView.ConditionsFieldView"}})}).reopenClass({toString:function(){return"FilterEditorView.ConditionsView"}})
i.exports=u}}),require.define({"views/filters/filter_editor_view":function(e,t,i){"use strict"
var n=t("lib/lotus/global_events"),r=t("views/filters/editor/conditions_view"),s=t("views/filters/editor/title_view"),o=t("views/filters/editor/visibility_view"),a=Em.View.extend(t("lib/tab_navigation_mixin"),{tagName:"form",classNames:["filter-editor","static"],classNameBindings:["editMode","isValid:valid","isReadOnly:readonly"],templateName:"templates/filters/editor",isVisible:Em.computed.oneWay("controller.active"),isModal:Em.computed.equal("editMode","modal"),isValid:Em.computed.bool("controller.isValid"),isReadOnly:Em.computed.not("controller.canEdit"),menu:Em.computed.alias("conditionsView.menu"),previewable:Em.computed.and("isModal","isValid"),shouldShowActions:Em.computed.oneWay("controller.shouldShowActions"),didInit:function(){this.set("boundClickHandler",this.didClickOut.bind(this)),this._super()},editMode:function(){var e=this.get("content.resource.isNew"),t=this.get("content.previewing")
return e&&!t?"modal":"popover"}.property("content.resource.isNew"),TitleView:s.extend({viewName:"titleView",controller:Em.computed.oneWay("parentView.controller"),filter:Em.computed.alias("parentView.content"),disabled:Em.computed.alias("parentView.isReadOnly")}),VisibilityView:o.extend({viewName:"visibilityView",content:Em.computed.alias("parentView.content.restriction"),controller:Em.computed.oneWay("parentView.controller")}),AllConditionsView:r.extend({viewName:"conditionsView",controller:Em.computed.oneWay("parentView.controller.allConditionsController"),disabled:Em.computed.alias("parentView.isReadOnly")}),submit:function(e){return!1},didClickOut:function(e){var t=e.target,i=$(t)
if(!this.$()[0].contains(t)&&!i.hasClass("editor-toggle")&&!i.parent().hasClass("editor-toggle")){var n=this.get("menu")&&this.get("menu").$()[0]
if(!(n&&n.contains(t)||"menuitem"===t.getAttribute("role")||i.closest(".ui-datepicker").length>0)){var r=this.get("visibilityView.fieldView.delegate")
r&&r.domMenuHolder.contains(t)||-1===$(".editing-actions .btn").index(t)&&(this.get("isModal")?this.get("controller").cancel():this.get("controller").deactivate(),e.stopPropagation())}}},becameVisible:function(){var e
this.set("previousResponder",n.get("firstResponder")),n.set("firstResponder",null),this.set("content",this.get("controller.filter")),this.get("isModal")?((e=$('<div class="filter-modal-bd"></div>')).on("mousedown",this.get("boundClickHandler")),e.appendTo("body"),this.set("backdrop",e)):document.addEventListener("mousedown",this.get("boundClickHandler"),!0),this.$("input:first").focus()},becameHidden:function(){var e=this.get("backdrop"),t=this.$()[0],i=document.activeElement
n.set("firstResponder",this.get("previousResponder")),this.set("previousResponder",null),e&&(e.remove(),this.set("backdrop",null)),t&&i&&$.contains(t,i)&&i.blur(),document.removeEventListener("mousedown",this.get("boundClickHandler"),!0),this.set("content",null)},willDestroyElement:function(){return this.becameHidden(),this._super()}}).reopenClass({toString:function(){return"FilterEditorView"}})
i.exports=a}}),require.define({"views/filters/user_filter_all_end_user_list_content_view":function(e,t,i){"use strict"
Object.defineProperty(e,"__esModule",{value:!0})
var n,r=t("lib/views/registrable_view_mixin"),s=(n=r)&&n.__esModule?n:{default:n},o=Em.View.extend(s.default,{templateName:"templates/filters/user_filter_all_end_user_list",name:"filterContentList",registrar:Em.computed.alias("uiController"),focus:function(){}}).reopenClass({toString:function(){return"UserFilterAllEndUserListContentView"}})
e.default=o,i.exports=e.default}}),require.define({"views/filters/user_filter_content_view":function(e,t,i){"use strict"
var n=t("views/filters/filter_content_view").extend({templateName:"templates/filters/user_table_list"}).reopenClass({toString:function(){return"UserFilterContentView"}})
i.exports=n}}),require.define({"views/filters/user_filter_index_item_view":function(e,t,i){"use strict"
var n=t("views/filters/filter_index_item_view").extend({templateName:"templates/filters/user_filter_index_item",headerTemplate:'<div class="filter-group-heading">%@</div>',headerLabels:{personal:I18n.t("txt.user_filters.personal_group_heading"),shared:I18n.t("txt.user_filters.shared_group_heading"),preview:I18n.t("txt.user_filters.preview")}}).reopenClass({toString:function(){return"UserFilterIndexItemView"}})
i.exports=n}}),require.define({"views/filters/user_filter_index_view":function(e,t,i){"use strict"
var n=t("views/filters/filter_index_view"),r=t("views/filters/user_filter_index_item_view"),s=function(e){e.preventDefault(),e.stopPropagation()},o=function(e,t){e.addEventListener(t,s,!0)},a=function(e,t){e.removeEventListener(t,s,!0)},l=["mousedown","click","focus"],c=n.extend({itemViewClass:r,disabled:!1,activate:function(){if(!this.get("disabled"))return this._super()},didInsertElement:function(){return this.syncState(),this._super()},disabledDidChange:function(){this.syncState()}.observes("disabled"),syncState:function(){this.isInDom()&&(this.get("disabled")?this.blockEvents():this.unblockEvents())},blockEvents:function(){l.forEach(o.bind(null,this.$()[0]))},unblockEvents:function(){l.forEach(a.bind(null,this.$()[0]))},willDestroyElement:function(){this.unblockEvents(),this._super&&this._super()}}).reopenClass({toString:function(){return"UserFilterIndexView"}})
i.exports=c}}),require.define({"views/filters/user_filter_suspended_user_list_content_view":function(e,t,i){"use strict"
Object.defineProperty(e,"__esModule",{value:!0})
var n,r=t("lib/views/registrable_view_mixin"),s=(n=r)&&n.__esModule?n:{default:n},o=Em.View.extend(s.default,{templateName:"templates/filters/user_filter_suspended_user_list",name:"filterContentList",registrar:Em.computed.alias("uiController"),focus:function(){}}).reopenClass({toString:function(){return"UserFilterSuspendedUserListContentView"}})
e.default=o,i.exports=e.default}}),require.define({"views/filters/user_filter_table_header_view":function(e,t,i){"use strict"
var n=t("lib/views/table_header_view").extend({tagName:"tr",classNameBindings:["isSortingEnabled:sorting"],filter:Em.computed.oneWay("controller.filter"),fieldDefinitions:t("models/filter/user_filter/user_filter_definitions").instance(),toggleColumnSort:function(e){if(this.get("fieldDefinitions").canSort(e))return this._super(e)}})
i.exports=n}}),require.define({"views/filters/user_list_view":function(e,t,i){"use strict"
var n=Em.View.extend({templateName:"templates/filters/user_list",classNames:["scroll_content"],filter:null}).reopenClass({toString:function(){return"UserListView"}})
i.exports=n}}),require.define({"views/filters/user_table_list_advanced_encryption_notice_view":function(e,t,i){"use strict"
var n=Em.View.extend({tagName:"aside",templateName:"templates/filters/user_table_list_advanced_encryption_notice",isVisible:Em.computed.bool("controller.shouldShowAdvancedEncryptionMessage"),classNames:["advanced-encryption"]}).reopenClass({toString:function(){return"UserTableListAdvancedEncrpytionNoticeView"}})
i.exports=n}}),require.define({"views/filters/user_table_list_sampling_notice_view":function(e,t,i){"use strict"
var n=Em.View.extend({tagName:"aside",templateName:"templates/filters/user_table_list_sampling_notice",isVisible:Em.computed.bool("controller.shouldShowNotice")}).reopenClass({toString:function(){return"UserTableListSamplingNoticeView"}})
i.exports=n}}),Em.TEMPLATES["templates/filters/editor"]=Em.HTMLBars.template(function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("      ")
e.appendChild(t,i),i=e.createElement("div"),e.setAttribute(i,"class","modal-header")
var n=e.createTextNode("\n        ")
e.appendChild(i,n),n=e.createElement("span"),e.setAttribute(n,"class","close")
var r=e.createTextNode("×")
return e.appendChild(n,r),e.appendChild(i,n),n=e.createTextNode("\n        "),e.appendChild(i,n),n=e.createElement("h3"),r=e.createComment(""),e.appendChild(n,r),e.appendChild(i,n),n=e.createTextNode("\n      "),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.inline
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.childAt(l,[1]),d=r.createMorphAt(r.childAt(l,[3]),0,0)
return o(t,c,e,"action",["cancel"],{target:"controller"}),a(t,d,e,"t",["txt.user_filters.create_view"],{}),n}},t=function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("          ")
e.appendChild(t,i),i=e.createElement("span"),e.setAttribute(i,"class","link")
var n=e.createComment("")
return e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.inline
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.createMorphAt(l,0,0)
return o(t,l,e,"action",["previewFilter"],{target:"controller"}),a(t,c,e,"t",["txt.user_filters.preview"],{}),n}},t={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("          ")
e.appendChild(t,i),i=e.createElement("button"),e.setAttribute(i,"type","submit"),e.setAttribute(i,"class","btn btn-inverse"),e.setAttribute(i,"data-track-id","eb1e-customer-list-create-save")
var n=e.createComment("")
return e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n          "),e.appendChild(t,i),i=e.createElement("button"),e.setAttribute(i,"class","btn"),n=e.createComment(""),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.inline
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.childAt(n,[3]),d=r.createMorphAt(l,0,0),u=r.createMorphAt(c,0,0)
return o(t,l,e,"action",["saveFilter"],{target:"controller"}),a(t,d,e,"t",["txt.modal.edit.save"],{}),o(t,c,e,"action",["cancel"],{target:"controller"}),a(t,u,e,"t",["txt.modal.confirm_modal.cancel"],{}),n}},i=function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("            ")
e.appendChild(t,i),i=e.createElement("a"),e.setAttribute(i,"class","clone"),e.setAttribute(i,"data-track-id","811f-customer-list-update-clone")
var n=e.createComment("")
return e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n            "),e.appendChild(t,i),i=e.createElement("span"),e.setAttribute(i,"class","delimiter"),n=e.createTextNode("•"),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.inline
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.createMorphAt(l,0,0)
return o(t,l,e,"action",["cloneFilter"],{target:"controller"}),a(t,c,e,"t",["txt.user_filters.clone"],{}),n}}
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("          ")
e.appendChild(t,i)
i=e.createElement("a")
e.setAttribute(i,"class","delete"),e.setAttribute(i,"data-track-id","c1f1-customer-list-update-delete")
var n=e.createComment("")
e.appendChild(i,n),e.appendChild(t,i)
i=e.createTextNode("\n")
e.appendChild(t,i)
i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("          ")
e.appendChild(t,i)
i=e.createElement("a")
e.setAttribute(i,"class","deactivate"),e.setAttribute(i,"data-track-id","ec3e-customer-list-update-activate-status")
n=e.createComment("")
e.appendChild(i,n),e.appendChild(t,i)
i=e.createTextNode("\n")
return e.appendChild(t,i),t},render:function(t,i,n){var r,s=i.dom,o=i.hooks,a=o.element,l=o.inline,c=o.get,d=o.block
s.detectNamespace(n),i.useFragmentCache&&s.canClone?(null===this.cachedFragment&&(r=this.build(s),this.hasRendered?this.cachedFragment=r:this.hasRendered=!0),this.cachedFragment&&(r=s.cloneNode(this.cachedFragment,!0))):r=this.build(s)
var u=s.childAt(r,[1]),h=s.childAt(r,[5]),p=s.createMorphAt(u,0,0),m=s.createMorphAt(r,3,3,n),f=s.createMorphAt(h,0,0)
return a(i,u,t,"action",["deleteFilter"],{target:"controller"}),l(i,p,t,"t",["txt.user_filters.delete"],{}),d(i,m,t,"unless",[c(i,t,"view.content.resource.isNew")],{},e,null),a(i,h,t,"action",["deactivateFilter"],{target:"controller"}),l(i,f,t,"t",["txt.user_filters.deactivate"],{}),r}}}()
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("      ")
e.appendChild(t,i)
i=e.createElement("div")
e.setAttribute(i,"class","filter-actions")
var n=e.createTextNode("\n")
e.appendChild(i,n)
n=e.createComment("")
e.appendChild(i,n)
n=e.createComment("")
e.appendChild(i,n)
n=e.createTextNode("      ")
e.appendChild(i,n),e.appendChild(t,i)
i=e.createTextNode("\n")
return e.appendChild(t,i),t},render:function(n,r,s){var o,a=r.dom,l=r.hooks,c=l.get,d=l.block
a.detectNamespace(s),r.useFragmentCache&&a.canClone?(null===this.cachedFragment&&(o=this.build(a),this.hasRendered?this.cachedFragment=o:this.hasRendered=!0),this.cachedFragment&&(o=a.cloneNode(this.cachedFragment,!0))):o=this.build(a)
var u=a.childAt(o,[1]),h=a.createMorphAt(u,1,1),p=a.createMorphAt(u,2,2)
return d(r,h,n,"if",[c(r,n,"view.previewable")],{},e,null),d(r,p,n,"if",[c(r,n,"view.isModal")],{},t,i),o}}}()
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createElement("div")
e.setAttribute(i,"class","popover-inner")
var n=e.createTextNode("\n  ")
e.appendChild(i,n)
n=e.createElement("div")
e.setAttribute(n,"class","popover-content")
var r=e.createTextNode("\n")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("    ")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("\n    ")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("\n    ")
e.appendChild(n,r)
r=e.createElement("hr")
e.appendChild(n,r)
r=e.createTextNode("\n    ")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("\n")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("  ")
e.appendChild(n,r),e.appendChild(i,n)
n=e.createTextNode("\n")
e.appendChild(i,n),e.appendChild(t,i)
i=e.createTextNode("\n")
return e.appendChild(t,i),t},render:function(i,n,r){var s,o=n.dom,a=n.hooks,l=a.get,c=a.block,d=a.inline
o.detectNamespace(r),n.useFragmentCache&&o.canClone?(null===this.cachedFragment&&(s=this.build(o),this.hasRendered?this.cachedFragment=s:this.hasRendered=!0),this.cachedFragment&&(s=o.cloneNode(this.cachedFragment,!0))):s=this.build(o)
var u=o.childAt(s,[0,1]),h=o.createMorphAt(u,1,1),p=o.createMorphAt(u,3,3),m=o.createMorphAt(u,5,5),f=o.createMorphAt(u,9,9),g=o.createMorphAt(u,11,11)
return c(n,h,i,"if",[l(n,i,"view.isModal")],{},e,null),d(n,p,i,"view",[l(n,i,"view.TitleView")],{}),d(n,m,i,"view",[l(n,i,"view.VisibilityView")],{}),d(n,f,i,"view",[l(n,i,"view.AllConditionsView")],{}),c(n,g,i,"if",[l(n,i,"view.shouldShowActions")],{},t,null),s}}}()),Em.TEMPLATES["templates/filters/editor/conditions_empty"]=Em.HTMLBars.template({isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createElement("span")
e.setAttribute(i,"class","zentence-action"),e.setAttribute(i,"tabindex","0"),e.setAttribute(i,"role","button"),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),i=e.createElement("div"),e.setAttribute(i,"class","zentence-tree")
var n=e.createTextNode("\n  ")
e.appendChild(i,n),n=e.createElement("span"),e.setAttribute(n,"class","zentence-leaf-wrapper")
var r=e.createElement("span")
e.setAttribute(r,"class","zentence-placeholder")
var s=e.createComment("")
return e.appendChild(r,s),e.appendChild(n,r),r=e.createElement("span"),e.setAttribute(r,"class","zentence-leaf"),e.appendChild(n,r),e.appendChild(i,n),n=e.createTextNode("\n"),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.get,a=s.inline
return r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r),a(t,r.createUnsafeMorphAt(r.childAt(n,[2,1,0]),0,0),e,"unbound",[o(t,e,"view.placeholder")],{}),n}}),Em.TEMPLATES["templates/filters/editor/conditions"]=Em.HTMLBars.template({isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createComment("")
e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),i=e.createElement("span"),e.setAttribute(i,"class","link add-condition"),e.setAttribute(i,"data-track-id","f3f1-customer-list-filter")
var n=e.createComment("")
return e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.get,a=s.inline,l=s.element
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var c=r.childAt(n,[2]),d=r.createMorphAt(n,0,0,i),u=r.createMorphAt(c,0,0)
return r.insertBoundary(n,0),a(t,d,e,"view",[o(t,e,"view.ConditionsGroupView")],{controller:o(t,e,"controller"),menu:o(t,e,"view.menu")}),l(t,c,e,"action",["addCondition"],{bubbles:!1,target:"controller"}),a(t,u,e,"t",["txt.user_filters.add_new_filter"],{}),n}}),Em.TEMPLATES["templates/filters/user_filter_all_end_user_list"]=Em.HTMLBars.template({isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createComment("")
return e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks.inline
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var o=r.createMorphAt(n,0,0,i)
return r.insertBoundary(n,0),s(t,o,e,"react-component",[],{componentName:"Customers"}),n}}),Em.TEMPLATES["templates/filters/user_filter_index_item"]=Em.HTMLBars.template(function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("  ")
e.appendChild(t,i),i=e.createElement("a"),e.setAttribute(i,"data-target-id","all-customers")
var n=e.createTextNode("\n    ")
return e.appendChild(i,n),n=e.createComment(""),e.appendChild(i,n),n=e.createTextNode("\n  "),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.content
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.createMorphAt(l,1,1)
return o(t,l,e,"action",["activate"],{target:"view",on:"mouseDown"}),a(t,c,e,"view.content.title"),n}},t=function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("    ")
e.appendChild(t,i),i=e.createElement("a")
var n=e.createTextNode("\n      ")
return e.appendChild(i,n),n=e.createComment(""),e.appendChild(i,n),n=e.createTextNode("\n    "),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.content
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.createMorphAt(l,1,1)
return o(t,l,e,"action",["activate"],{target:"view",on:"mouseDown"}),a(t,c,e,"view.content.title"),n}},t={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("  ")
e.appendChild(t,i),i=e.createElement("a")
var n=e.createTextNode("\n    ")
return e.appendChild(i,n),n=e.createComment(""),e.appendChild(i,n),n=e.createTextNode("\n  "),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.content
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.createMorphAt(l,1,1)
return o(t,l,e,"action",["activate"],{target:"view",on:"mouseDown"}),a(t,c,e,"view.content.title"),n}}
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createComment("")
return e.appendChild(t,i),t},render:function(i,n,r){var s,o=n.dom,a=n.hooks,l=a.get,c=a.block
o.detectNamespace(r),n.useFragmentCache&&o.canClone?(null===this.cachedFragment&&(s=this.build(o),this.hasRendered?this.cachedFragment=s:this.hasRendered=!0),this.cachedFragment&&(s=o.cloneNode(this.cachedFragment,!0))):s=this.build(o)
var d=o.createMorphAt(s,0,0,r)
return o.insertBoundary(s,null),o.insertBoundary(s,0),c(n,d,i,"if",[l(n,i,"view.content.isSuspendedUserListEntry")],{},e,t),s}}}()
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createComment("")
return e.appendChild(t,i),t},render:function(i,n,r){var s,o=n.dom,a=n.hooks,l=a.get,c=a.block
o.detectNamespace(r),n.useFragmentCache&&o.canClone?(null===this.cachedFragment&&(s=this.build(o),this.hasRendered?this.cachedFragment=s:this.hasRendered=!0),this.cachedFragment&&(s=o.cloneNode(this.cachedFragment,!0))):s=this.build(o)
var d=o.createMorphAt(s,0,0,r)
return o.insertBoundary(s,null),o.insertBoundary(s,0),c(n,d,i,"if",[l(n,i,"view.content.isEndUserListEntry")],{},e,t),s}}}()),Em.TEMPLATES["templates/filters/user_filter_suspended_user_list"]=Em.HTMLBars.template({isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createComment("")
return e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks.inline
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var o=r.createMorphAt(n,0,0,i)
return r.insertBoundary(n,0),s(t,o,e,"react-component",[],{componentName:"SuspendedCustomerLists",suspendedList:!0}),n}}),Em.TEMPLATES["templates/filters/user_list"]=Em.HTMLBars.template(function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("    ")
e.appendChild(t,i),i=e.createElement("div"),e.setAttribute(i,"class","empty_set-user")
var n=e.createTextNode("\n      ")
return e.appendChild(i,n),n=e.createComment(""),e.appendChild(i,n),n=e.createTextNode("\n    "),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks.inline
return r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r),s(t,r.createMorphAt(r.childAt(n,[1]),1,1),e,"t",["txt.user_filters.empty_filter"],{}),n}}
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("\n\n\n")
e.appendChild(t,i)
i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("\n")
e.appendChild(t,i)
i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("\n")
return e.appendChild(t,i),t},render:function(t,i,n){var r,s=i.dom,o=i.hooks,a=o.get,l=o.inline,c=o.block
s.detectNamespace(n),i.useFragmentCache&&s.canClone?(null===this.cachedFragment&&(r=this.build(s),this.hasRendered?this.cachedFragment=r:this.hasRendered=!0),this.cachedFragment&&(r=s.cloneNode(this.cachedFragment,!0))):r=this.build(s)
var d=s.createMorphAt(r,0,0,n),u=s.createMorphAt(r,2,2,n),h=s.createMorphAt(r,4,4,n)
return s.insertBoundary(r,0),l(i,d,t,"collection",["lib/views/user_list_body_view"],{controller:a(i,t,"controller"),itemController:a(i,t,"controller"),content:a(i,t,"controller.filter.content")}),c(i,u,t,"view",[],{isVisible:a(i,t,"controller.showEmptyListRow")},e,null),l(i,h,t,"view",["lib/views/pagination"],{controller:a(i,t,"controller")}),r}}}()),Em.TEMPLATES["templates/filters/user_table_list_advanced_encryption_notice"]=Em.HTMLBars.template({isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createElement("div")
e.setAttribute(i,"class",""),e.setAttribute(i,"class","filter-notice-text advanced-encryption")
var n=e.createTextNode("\n  ")
e.appendChild(i,n),n=e.createComment(""),e.appendChild(i,n),n=e.createTextNode("  "),e.appendChild(i,n),n=e.createElement("a"),e.setAttribute(n,"target","_blank"),e.setAttribute(n,"rel","noopener noreferrer")
var r=e.createComment("")
return e.appendChild(n,r),r=e.createComment(""),e.appendChild(n,r),e.appendChild(i,n),n=e.createTextNode("\n"),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.content,a=s.get,l=s.subexpr,c=s.concat,d=s.attribute,u=s.inline
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var h=r.childAt(n,[0]),p=r.childAt(h,[3]),m=r.createUnsafeMorphAt(h,1,1),f=r.createMorphAt(p,0,0),g=r.createMorphAt(p,1,1),v=r.createAttrMorph(p,"href")
return o(t,m,e,"advancedEncryptionNotice"),d(t,v,p,"href",c(t,[l(t,e,"unbound",[a(t,e,"advancedEncryptionURL")],{})])),o(t,f,e,"advancedEncryptionNoticeLink"),u(t,g,e,"svg-sprite",[],{class:"external-link-icon",url:a(t,e,"controller.svgIconsUrl"),spriteId:"zd-svg-icon-12-new-window-stroke"}),n}}),Em.TEMPLATES["templates/filters/user_table_list_sampling_notice"]=Em.HTMLBars.template(function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("    ")
e.appendChild(t,i),i=e.createElement("a")
var n=e.createComment("")
return e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.element,a=s.content
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.createMorphAt(l,0,0)
return o(t,l,e,"action",["exportFullListAsCsv"],{}),a(t,c,e,"exportNotice"),n}}
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createElement("div")
e.setAttribute(i,"class","filter-notice-text")
var n=e.createTextNode("\n  ")
e.appendChild(i,n)
n=e.createComment("")
e.appendChild(i,n)
n=e.createTextNode("\n")
e.appendChild(i,n)
n=e.createComment("")
e.appendChild(i,n),e.appendChild(t,i)
i=e.createTextNode("\n")
return e.appendChild(t,i),t},render:function(t,i,n){var r,s=i.dom,o=i.hooks,a=o.content,l=o.get,c=o.block
s.detectNamespace(n),i.useFragmentCache&&s.canClone?(null===this.cachedFragment&&(r=this.build(s),this.hasRendered?this.cachedFragment=r:this.hasRendered=!0),this.cachedFragment&&(r=s.cloneNode(this.cachedFragment,!0))):r=this.build(s)
var d=s.childAt(r,[0]),u=s.createUnsafeMorphAt(d,1,1),h=s.createMorphAt(d,3,3)
return a(i,u,t,"samplingNotice"),c(i,h,t,"if",[l(i,t,"shouldShowCSVexportInNotice")],{},e,null),r}}}()),Em.TEMPLATES["templates/filters/user_table_list"]=Em.HTMLBars.template(function(){var e={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("      ")
e.appendChild(t,i),i=e.createElement("tr")
var n=e.createElement("td")
e.setAttribute(n,"colspan","100")
var r=e.createComment("")
return e.appendChild(n,r),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks.inline
return r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r),s(t,r.createMorphAt(r.childAt(n,[1,0]),0,0),e,"t",["txt.user_filters.empty_filter"],{}),n}},t={isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createTextNode("    ")
e.appendChild(t,i),i=e.createElement("div"),e.setAttribute(i,"class","no_views")
var n=e.createTextNode("\n      ")
e.appendChild(i,n),n=e.createElement("div"),e.setAttribute(n,"class","zendesk_logo"),e.appendChild(i,n),n=e.createElement("br"),e.appendChild(i,n),n=e.createTextNode("\n      "),e.appendChild(i,n),n=e.createComment(""),e.appendChild(i,n),n=e.createElement("br"),e.appendChild(i,n),n=e.createTextNode("\n      "),e.appendChild(i,n),n=e.createElement("a"),e.setAttribute(n,"tabindex","-1")
var r=e.createComment("")
return e.appendChild(n,r),e.appendChild(i,n),n=e.createTextNode("\n    "),e.appendChild(i,n),e.appendChild(t,i),i=e.createTextNode("\n"),e.appendChild(t,i),t},render:function(e,t,i){var n,r=t.dom,s=t.hooks,o=s.inline,a=s.element
r.detectNamespace(i),t.useFragmentCache&&r.canClone?(null===this.cachedFragment&&(n=this.build(r),this.hasRendered?this.cachedFragment=n:this.hasRendered=!0),this.cachedFragment&&(n=r.cloneNode(this.cachedFragment,!0))):n=this.build(r)
var l=r.childAt(n,[1]),c=r.childAt(l,[7]),d=r.createMorphAt(l,4,4),u=r.createMorphAt(c,0,0)
return o(t,d,e,"t",["txt.user_filters.no_active_views"],{}),a(t,c,e,"action",["addFilter"],{target:"view.controller.manager"}),o(t,u,e,"t",["txt.user_filters.create_view"],{}),n}}
return{isHTMLBars:!0,revision:"Ember@1.12.2",blockParams:0,cachedFragment:null,hasRendered:!1,build:function(e){var t=e.createDocumentFragment(),i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("\n")
e.appendChild(t,i)
i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("\n\n")
e.appendChild(t,i)
i=e.createElement("table")
e.setAttribute(i,"class","filter_tickets")
var n=e.createTextNode("\n  ")
e.appendChild(i,n)
n=e.createElement("thead")
var r=e.createTextNode("\n    ")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("\n  ")
e.appendChild(n,r),e.appendChild(i,n)
n=e.createTextNode("\n")
e.appendChild(i,n),e.appendChild(t,i)
i=e.createTextNode("\n\n")
e.appendChild(t,i)
i=e.createElement("div")
e.setAttribute(i,"class","scroll_content")
n=e.createTextNode("\n  ")
e.appendChild(i,n)
n=e.createElement("table")
e.setAttribute(n,"class","filter_tickets main")
r=e.createTextNode("\n    ")
e.appendChild(n,r)
r=e.createElement("thead")
e.appendChild(n,r)
r=e.createTextNode("\n\n    ")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("\n\n")
e.appendChild(n,r)
r=e.createComment("")
e.appendChild(n,r)
r=e.createTextNode("\n  ")
e.appendChild(n,r),e.appendChild(i,n)
n=e.createTextNode("\n\n  ")
e.appendChild(i,n)
n=e.createComment("")
e.appendChild(i,n)
n=e.createTextNode("\n\n")
e.appendChild(i,n)
n=e.createComment("")
e.appendChild(i,n),e.appendChild(t,i)
i=e.createTextNode("\n\n")
e.appendChild(t,i)
i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("\n")
e.appendChild(t,i)
i=e.createComment("")
e.appendChild(t,i)
i=e.createTextNode("\n")
return e.appendChild(t,i),t},render:function(i,n,r){var s,o=n.dom,a=n.hooks,l=a.inline,c=a.get,d=a.block
o.detectNamespace(r),n.useFragmentCache&&o.canClone?(null===this.cachedFragment&&(s=this.build(o),this.hasRendered?this.cachedFragment=s:this.hasRendered=!0),this.cachedFragment&&(s=o.cloneNode(this.cachedFragment,!0))):s=this.build(o)
var u=o.childAt(s,[6]),h=o.childAt(u,[1]),p=o.createMorphAt(s,0,0,r),m=o.createMorphAt(s,2,2,r),f=o.createMorphAt(o.childAt(s,[4,1]),1,1),g=o.createMorphAt(h,3,3),v=o.createMorphAt(h,5,5),_=o.createMorphAt(u,3,3),b=o.createMorphAt(u,5,5),C=o.createMorphAt(s,8,8,r),w=o.createMorphAt(s,10,10,r)
return o.insertBoundary(s,0),l(n,p,i,"view",["filters/user_table_list_advanced_encryption_notice_view"],{}),l(n,m,i,"view",["filters/user_table_list_sampling_notice_view"],{}),l(n,f,i,"view",["filters/user_filter_table_header_view"],{}),l(n,g,i,"collection",["lib/views/user_table_body_view"],{controller:c(n,i,"view.controller"),itemController:c(n,i,"view.controller"),content:c(n,i,"view.controller.filter.content"),columns:c(n,i,"view.controller.filter.columns"),groupingColumn:c(n,i,"view.controller.filter.groupingColumn"),viewName:"tableBody"}),d(n,v,i,"view",[],{isVisible:c(n,i,"view.controller.showEmptyListRow"),tagName:"tbody"},e,null),l(n,_,i,"view",["lib/views/pagination"],{controller:c(n,i,"view.controller")}),d(n,b,i,"if",[c(n,i,"view.controller.shouldShowEmptyMessage")],{},t,null),l(n,C,i,"view",["filters/column_editor_base_view"],{controller:c(n,i,"view.editorController")}),l(n,w,i,"view",["filters/column_editor_view"],{controller:c(n,i,"view.columnEditorController")}),s}}}())

//# sourceMappingURL=user_filters-ab6f32c20fadbaddeba982eefd46b48b.map
