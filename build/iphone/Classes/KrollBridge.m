/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2017 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#import "TiToJS.h"
#import "KrollBridge.h"
#import "KrollCallback.h"
#import "KrollObject.h"
#import "TiHost.h"
#import "TopTiModule.h"
#import "TiUtils.h"
#import "TiApp.h"
#import "ApplicationMods.h"
#import <libkern/OSAtomic.h>
#import "KrollContext.h"
#import "TiConsole.h"
#import "TiExceptionHandler.h"
#import "APSAnalytics.h"

#ifdef KROLL_COVERAGE
# include "KrollCoverage.h"
#endif
#ifndef USE_JSCORE_FRAMEWORK
#import "TiDebugger.h"
#endif
extern BOOL const TI_APPLICATION_ANALYTICS;
extern NSString * const TI_APPLICATION_DEPLOYTYPE;
extern NSString * const TI_APPLICATION_GUID;
extern NSString * const TI_APPLICATION_BUILD_TYPE;

NSString * Queens_Memory$ModuleRequireFormat = @"(function(exports){"
		"var __OXP=exports;var module={'exports':exports};var __dirname=\"%@\";var __filename=\"%@\";%@;\n"
		"if(module.exports !== __OXP){return module.exports;}"
		"return exports;})({})";


//Defined private method inside TiBindingRunLoop.m (Perhaps to move to .c?)
void TiBindingRunLoopAnnounceStart(TiBindingRunLoop runLoop);


@implementation Queens_MemoryObject

-(NSDictionary*)modules
{
	return modules;
}

-(id)initWithContext:(KrollContext*)context_ host:(TiHost*)host_ context:(id<TiEvaluator>)pageContext_ baseURL:(NSURL*)baseURL_
{
	TopTiModule *module = [[[TopTiModule alloc] _initWithPageContext:pageContext_] autorelease];
	[module setHost:host_];
	[module _setBaseURL:baseURL_];

	if (self = [super initWithTarget:module context:context_])
	{
		pageContext = pageContext_;
		modules = [[NSMutableDictionary alloc] init];
		host = [host_ retain];
		[(KrollBridge *)pageContext_ registerProxy:module krollObject:self];

		// pre-cache a few modules we always use
		TiModule *ui = [host moduleNamed:@"UI" context:pageContext_];
		[self addModule:@"UI" module:ui];
		TiModule *api = [host moduleNamed:@"API" context:pageContext_];
		[self addModule:@"API" module:api];

		if (TI_APPLICATION_ANALYTICS)
		{
			APSAnalytics *sharedAnalytics = [APSAnalytics sharedInstance];
			if (TI_APPLICATION_BUILD_TYPE != nil || (TI_APPLICATION_BUILD_TYPE.length > 0)) {
				[sharedAnalytics performSelector:@selector(setBuildType:) withObject:TI_APPLICATION_BUILD_TYPE];
			}
			[sharedAnalytics performSelector:@selector(setSDKVersion:) withObject:[NSString stringWithFormat:@"ti.%@",[module performSelector:@selector(version)]]];
			[sharedAnalytics enableWithAppKey:TI_APPLICATION_GUID andDeployType:TI_APPLICATION_DEPLOYTYPE];
		}
	}
	return self;
}

#if KROLLBRIDGE_MEMORY_DEBUG==1
-(id)retain
{
	NSLog(@"[MEMORY DEBUG] RETAIN: %@ (%d)",self,[self retainCount]+1);
	return [super retain];
}
-(oneway void)release
{
	NSLog(@"[MEMORY DEBUG] RELEASE: %@ (%d)",self,[self retainCount]-1);
	[super release];
}
#endif

-(void)dealloc
{
	RELEASE_TO_NIL(host);
	RELEASE_TO_NIL(modules);
	RELEASE_TO_NIL(dynprops);
	[super dealloc];
}

-(void)gc
{
}

-(id)valueForKey:(NSString *)key
{
	// allow dynprops to override built-in modules
	// in case you want to re-define them
	if (dynprops!=nil)
	{
		id result = [dynprops objectForKey:key];
		if (result!=nil)
		{
			if (result == [NSNull null])
			{
				return nil;
			}
			return result;
		}
	}
	id module = [modules objectForKey:key];
	if (module!=nil)
	{
		return module;
	}
	module = [host moduleNamed:key context:pageContext];
	if (module!=nil)
	{
		return [self addModule:key module:module];
	}
	//go against module
	return [super valueForKey:key];
}

-(void)setValue:(id)value forKey:(NSString *)key
{
	if (dynprops==nil)
	{
		dynprops = [[NSMutableDictionary dictionary] retain];
	}
	if (value == nil)
	{
		value = [NSNull null];
	}
	[dynprops setValue:value forKey:key];
}

- (id) valueForUndefinedKey: (NSString *) key
{
	if ([key isEqualToString:@"toString"] || [key isEqualToString:@"valueOf"])
	{
		return [self description];
	}
	if (dynprops != nil)
	{
		return [dynprops objectForKey:key];
	}
	//NOTE: we need to return nil here since in JS you can ask for properties
	//that don't exist and it should return undefined, not an exception
	return nil;
}

-(id)addModule:(NSString*)name module:(TiModule*)module
{
	// Have we received a JS Module?
	if (![module respondsToSelector:@selector(unboundBridge:)])
	{
		[modules setObject:module forKey:name];
		return module;
	}
	KrollObject *ko = [pageContext registerProxy:module];
	if (ko == nil)
	{
		return nil;
	}
	[self noteKrollObject:ko forKey:name];
	[modules setObject:ko forKey:name];
	return ko;
}

-(TiModule*)moduleNamed:(NSString*)name context:(id<TiEvaluator>)context
{
	return [modules objectForKey:name];
}

@end

OSSpinLock krollBridgeRegistryLock = OS_SPINLOCK_INIT;
CFMutableSetRef	krollBridgeRegistry = nil;

@implementation KrollBridge

+(void)initialize
{
	if (krollBridgeRegistry == nil)
	{
		CFSetCallBacks doNotRetain = kCFTypeSetCallBacks;
		doNotRetain.retain = NULL;
		doNotRetain.release = NULL;
		krollBridgeRegistry = CFSetCreateMutable(NULL, 3, &doNotRetain);
	}
}
@synthesize currentURL;

-(void)registerForMemoryWarning
{
	WARN_IF_BACKGROUND_THREAD_OBJ;	//NSNotificationCenter is not threadsafe!
	[[NSNotificationCenter defaultCenter] addObserver:self
			selector:@selector(didReceiveMemoryWarning:)
			name:UIApplicationDidReceiveMemoryWarningNotification
			object:nil];
}

-(void)unregisterForMemoryWarning
{
	WARN_IF_BACKGROUND_THREAD_OBJ;	//NSNotificationCenter is not threadsafe!
	[[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
}

-(id)init
{
	if (self = [super init])
	{
#if KROLLBRIDGE_MEMORY_DEBUG==1
		NSLog(@"[DEBUG] INIT: %@",self);
#endif
		modules = [[NSMutableDictionary alloc] init];
		proxyLock = OS_SPINLOCK_INIT;
		OSSpinLockLock(&krollBridgeRegistryLock);
		CFSetAddValue(krollBridgeRegistry, self);
		OSSpinLockUnlock(&krollBridgeRegistryLock);
		TiThreadPerformOnMainThread(^{[self registerForMemoryWarning];}, NO);
	}
	return self;
}

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
	OSSpinLockLock(&proxyLock);
	if (registeredProxies == NULL) {
		OSSpinLockUnlock(&proxyLock);
		[self gc];
		return;
	}

	BOOL keepWarning = YES;
	signed long proxiesCount = CFDictionaryGetCount(registeredProxies);
	OSSpinLockUnlock(&proxyLock);

	//During a memory panic, we may not get the chance to copy proxies.
	while (keepWarning)
	{
		keepWarning = NO;

		for (id proxy in (NSDictionary *)registeredProxies)
		{
			[proxy didReceiveMemoryWarning:notification];

			OSSpinLockLock(&proxyLock);
			if (registeredProxies == NULL) {
				OSSpinLockUnlock(&proxyLock);
				break;
			}

			signed long newCount = CFDictionaryGetCount(registeredProxies);
			OSSpinLockUnlock(&proxyLock);

			if (newCount != proxiesCount)
			{
				proxiesCount = newCount;
				keepWarning = YES;
				break;
			}
		}
	}

	[self gc];
}


#if KROLLBRIDGE_MEMORY_DEBUG==1
-(id)retain
{
	NSLog(@"[MEMORY DEBUG] RETAIN: %@ (%d)",self,[self retainCount]+1);
	return [super retain];
}
-(oneway void)release
{
	NSLog(@"[MEMORY DEBUG] RELEASE: %@ (%d)",self,[self retainCount]-1);
	[super release];
}
#endif

-(void)removeProxies
{
	OSSpinLockLock(&proxyLock);
	CFDictionaryRef oldProxies = registeredProxies;
	registeredProxies = NULL;
	OSSpinLockUnlock(&proxyLock);

	for (id thisProxy in (NSDictionary *)oldProxies)
	{
		KrollObject * thisKrollObject = (id)CFDictionaryGetValue(oldProxies, thisProxy);
		[thisProxy contextShutdown:self];
		[thisKrollObject unprotectJsobject];
	}

	if (oldProxies != NULL)
	{
		CFRelease(oldProxies);
	}

	for (NSString * thisModuleKey in modules) {
		id thisModule = [modules objectForKey:thisModuleKey];
		if ([thisModule respondsToSelector:@selector(unprotectJsobject)]) {
			[thisModule unprotectJsobject];
		}
	}
	RELEASE_TO_NIL(modules);
}

-(void)dealloc
{
#if KROLLBRIDGE_MEMORY_DEBUG==1
	NSLog(@"[MEMORY DEBUG] DEALLOC: %@",self);
#endif

	[self removeProxies];
	RELEASE_TO_NIL(preload);
	RELEASE_TO_NIL(context);
	RELEASE_TO_NIL(_queens_memory);
	OSSpinLockLock(&krollBridgeRegistryLock);
	CFSetRemoveValue(krollBridgeRegistry, self);
	OSSpinLockUnlock(&krollBridgeRegistryLock);
	[super dealloc];
}

- (TiHost*)host
{
	return host;
}

- (KrollContext*) krollContext
{
	return context;
}

- (id)preloadForKey:(id)key name:(id)name
{
	if (preload!=nil)
	{
		NSDictionary* dict = [preload objectForKey:name];
		if (dict!=nil)
		{
			return [dict objectForKey:key];
		}
	}
	return nil;
}

- (void)boot:(id)callback url:(NSURL*)url_ preload:(NSDictionary*)preload_
{
	preload = [preload_ retain];
	[super boot:callback url:url_ preload:preload_];
	context = [[KrollContext alloc] init];
	context.delegate = self;
	[context start];
}

- (void)evalJSWithoutResult:(NSString*)code
{
	[context evalJS:code];
}

// NOTE: this must only be called on the JS thread or an exception will be raised
- (id)evalJSAndWait:(NSString*)code
{
	return [context evalJSAndWait:code];
}

-(BOOL)evaluationError
{
	return evaluationError;
}

- (void)evalFileOnThread:(NSString*)path context:(KrollContext*)context_
{
	NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init];

	NSError *error = nil;
	TiValueRef exception = NULL;

	TiContextRef jsContext = [context_ context];

	NSURL *url_ = [path hasPrefix:@"file:"] ? [NSURL URLWithString:path] : [NSURL fileURLWithPath:path];

	if (![path hasPrefix:@"/"] && ![path hasPrefix:@"file:"])
	{
		url_ = [NSURL URLWithString:path relativeToURL:url];
	}

	NSString *jcode = nil;

	if ([url_ isFileURL])
	{
		NSData *data = [TiUtils loadAppResource:url_];
		if (data==nil)
		{
			jcode = [NSString stringWithContentsOfFile:[url_ path] encoding:NSUTF8StringEncoding error:&error];
		}
		else
		{
			jcode = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
		}
	}
	else
	{
		jcode = [NSString stringWithContentsOfURL:url_ encoding:NSUTF8StringEncoding error:&error];
	}

	if (error!=nil)
	{
		NSLog(@"[ERROR] Error loading path: %@, %@",path,error);

		evaluationError = YES;
		TiScriptError *scriptError = nil;
		// check for file not found a give a friendlier message
		if ([error code]==260 && [error domain]==NSCocoaErrorDomain) {
			scriptError = [[TiScriptError alloc] initWithMessage:[NSString stringWithFormat:@"Could not find the file %@",[path lastPathComponent]] sourceURL:nil lineNo:0];
		} else {
			scriptError = [[TiScriptError alloc] initWithMessage:[NSString stringWithFormat:@"Error loading script %@. %@",[path lastPathComponent],[error description]] sourceURL:nil lineNo:0];
		}
		[[TiExceptionHandler defaultExceptionHandler] reportScriptError:scriptError];
		[scriptError release];
		return;
	}

	const char *urlCString = [[url_ absoluteString] UTF8String];

	TiStringRef jsCode = TiStringCreateWithCFString((CFStringRef) jcode);
	TiStringRef jsURL = TiStringCreateWithUTF8CString(urlCString);

	if (exception == NULL) {
#ifndef USE_JSCORE_FRAMEWORK
		if ([[self host] debugMode]) {
			TiDebuggerBeginScript(context_, urlCString);
		}
#endif

		TiEvalScript(jsContext, jsCode, NULL, jsURL, 1, &exception);

#ifndef USE_JSCORE_FRAMEWORK
		if ([[self host] debugMode]) {
			TiDebuggerEndScript(context_);
		}
#endif
		if (exception == NULL) {
			evaluationError = NO;
		} else {
			evaluationError = YES;
		}
	}
	if (exception != NULL) {
		id excm = [KrollObject toID:context value:exception];
		evaluationError = YES;
		[[TiExceptionHandler defaultExceptionHandler] reportScriptError:[TiUtils scriptErrorValue:excm]];
	}

	TiStringRelease(jsCode);
	TiStringRelease(jsURL);
	[pool release];
}

- (void)evalFile:(NSString*)path callback:(id)callback selector:(SEL)selector
{
	[context invokeOnThread:self method:@selector(evalFileOnThread:context:) withObject:path callback:callback selector:selector];
}

- (void)evalFile:(NSString *)file
{
	[context invokeOnThread:self method:@selector(evalFileOnThread:context:) withObject:file condition:nil];
}

- (void)fireEvent:(id)listener withObject:(id)obj remove:(BOOL)yn thisObject:(TiProxy*)thisObject_
{
	if (![listener isKindOfClass:[KrollCallback class]])
	{
		DebugLog(@"[ERROR] Listener callback is of a non-supported type: %@",[listener class]);
		return;
	}

	KrollEvent *event = [[KrollEvent alloc] initWithCallback:listener eventObject:obj thisObject:thisObject_];
	[context enqueue:event];
	[event release];
}

-(void)enqueueEvent:(NSString*)type forProxy:(TiProxy *)proxy withObject:(id)obj
{
	KrollObject* eventKrollObject = [self krollObjectForProxy:proxy];

	KrollEvent * newEvent = [[KrollEvent alloc]
							 initWithType:type
							 ForKrollObject:eventKrollObject
							 eventObject:obj
							 thisObject:eventKrollObject];

	[context enqueue:newEvent];
	[newEvent release];
}

-(void)shutdown:(NSCondition*)condition
{
#if KROLLBRIDGE_MEMORY_DEBUG==1
	NSLog(@"[MEMORY DEBUG] DESTROY: %@",self);
#endif

	if (shutdown==NO)
	{
		shutdownCondition = [condition retain];
		shutdown = YES;
		// fire a notification event to our listeners
		WARN_IF_BACKGROUND_THREAD_OBJ;	//NSNotificationCenter is not threadsafe!
		NSNotification *notification = [NSNotification notificationWithName:kTiContextShutdownNotification object:self];
		[[NSNotificationCenter defaultCenter] postNotification:notification];

		[context stop];
	}
	else
	{
		[condition lock];
		[condition signal];
		[condition unlock];
	}
}

-(void)gc
{
	[context gc];
	[_queens_memory gc];
}

#pragma mark Delegate

-(void)willStartNewContext:(KrollContext*)kroll
{
#ifdef HYPERLOOP
	// Start Hyperloop engine if present
	Class cls = NSClassFromString(@"Hyperloop");
	if (cls) {
		[cls performSelector:@selector(willStartNewContext:bridge:) withObject:kroll withObject:self];
	}
#endif
	[self retain]; // Hold onto ourselves as long as the context needs us
}

-(void)didStartNewContext:(KrollContext*)kroll
{
	// create Queens_Memory global object
	NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init];

	// Load the "Queens_Memory" object into the global scope
	NSString *basePath = (url==nil) ? [TiHost resourcePath] : [[[url path] stringByDeletingLastPathComponent] stringByAppendingPathComponent:@"."];
	_queens_memory = [[Queens_MemoryObject alloc] initWithContext:kroll host:host context:self baseURL:[NSURL fileURLWithPath:basePath]];

	TiContextRef jsContext = [kroll context];
	TiValueRef tiRef = [KrollObject toValue:kroll value:_queens_memory];

	NSString *_queens_memoryNS = [NSString stringWithFormat:@"T%sanium","it"];
	TiStringRef prop = TiStringCreateWithCFString((CFStringRef) _queens_memoryNS);
	TiStringRef prop2 = TiStringCreateWithCFString((CFStringRef) [NSString stringWithFormat:@"%si","T"]);
	TiObjectRef globalRef = TiContextGetGlobalObject(jsContext);
	TiObjectSetProperty(jsContext, globalRef, prop, tiRef,
						kTiPropertyAttributeDontDelete | kTiPropertyAttributeDontEnum,
						NULL);
	TiObjectSetProperty(jsContext, globalRef, prop2, tiRef,
						kTiPropertyAttributeDontDelete | kTiPropertyAttributeDontEnum,
						NULL);
	TiStringRelease(prop);
	TiStringRelease(prop2);

	// Load the "console" object into the global scope
	console = [[KrollObject alloc] initWithTarget:[[[TiConsole alloc] _initWithPageContext:self] autorelease] context:kroll];
	prop = TiStringCreateWithCFString((CFStringRef)@"console");
	TiObjectSetProperty(jsContext, globalRef, prop, [KrollObject toValue:kroll value:console], kTiPropertyAttributeNone, NULL);

	//if we have a preload dictionary, register those static key/values into our namespace
	if (preload!=nil)
	{
		for (NSString *name in preload)
		{
			KrollObject *ti = (KrollObject*)[_queens_memory valueForKey:name];
			NSDictionary *values = [preload valueForKey:name];
			for (id key in values)
			{
				id target = [values objectForKey:key];
				KrollObject *ko = [self krollObjectForProxy:target];
				if (ko==nil)
				{
					ko = [self registerProxy:target];
				}
				[ti noteKrollObject:ko forKey:key];
				[ti setStaticValue:ko forKey:key purgable:NO];
			}
		}
		//We need to run this before the app.js, which means it has to be here.
		TiBindingRunLoopAnnounceStart(kroll);
		[self evalFile:[url path] callback:self selector:@selector(booted)];
	}
	else
	{
		// now load the app.js file and get started
		NSURL *startURL = [host startURL];
		//We need to run this before the app.js, which means it has to be here.
		TiBindingRunLoopAnnounceStart(kroll);
		[self evalFile:[startURL absoluteString] callback:self selector:@selector(booted)];
	}

#ifdef HYPERLOOP
	Class cls = NSClassFromString(@"Hyperloop");
	if (cls) {
		[cls performSelector:@selector(didStartNewContext:bridge:) withObject:kroll withObject:self];
	}
#endif

	[pool release];
}

-(void)willStopNewContext:(KrollContext*)kroll
{
#ifdef HYPERLOOP
	// Stop Hyperloop engine if present
	Class cls = NSClassFromString(@"Hyperloop");
	if (cls) {
		[cls performSelector:@selector(willStopNewContext:bridge:) withObject:kroll withObject:self];
	}
#endif
	if (shutdown==NO)
	{
		shutdown = YES;
		// fire a notification event to our listeners
		WARN_IF_BACKGROUND_THREAD_OBJ;	//NSNotificationCenter is not threadsafe!
		NSNotification *notification = [NSNotification notificationWithName:kTiContextShutdownNotification object:self];
		[[NSNotificationCenter defaultCenter] postNotification:notification];
	}
	[_queens_memory gc];

	if (shutdownCondition)
	{
		[shutdownCondition lock];
		[shutdownCondition signal];
		[shutdownCondition unlock];
		RELEASE_TO_NIL(shutdownCondition);
	}
}

-(void)didStopNewContext:(KrollContext*)kroll
{
	TiThreadPerformOnMainThread(^{[self unregisterForMemoryWarning];}, NO);
	[self removeProxies];
	RELEASE_TO_NIL(_queens_memory);
	RELEASE_TO_NIL(console);
	RELEASE_TO_NIL(context);
	RELEASE_TO_NIL(preload);
#ifdef HYPERLOOP
	Class cls = NSClassFromString(@"Hyperloop");
	if (cls) {
		[cls performSelector:@selector(didStopNewContext:bridge:) withObject:kroll withObject:self];
	}
#endif
	[self autorelease]; // Safe to release now that the context is done
}

-(void)registerProxy:(id)proxy krollObject:(KrollObject *)ourKrollObject
{
	OSSpinLockLock(&proxyLock);
	if (registeredProxies==NULL)
	{
		registeredProxies = CFDictionaryCreateMutable(NULL, 10, &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
	}
	//NOTE: Do NOT treat registeredProxies like a mutableDictionary; mutable dictionaries copy keys,
	//CFMutableDictionaryRefs only retain keys, which lets them work with proxies properly.

	CFDictionaryAddValue(registeredProxies, proxy, ourKrollObject);
	OSSpinLockUnlock(&proxyLock);
	[proxy boundBridge:self withKrollObject:ourKrollObject];
}

- (id)registerProxy:(id)proxy
{
	KrollObject * ourKrollObject = [self krollObjectForProxy:proxy];

	if (ourKrollObject != nil)
	{
		return ourKrollObject;
	}

	if (![context isKJSThread])
	{
		return nil;
	}

#ifdef KROLL_COVERAGE
	ourKrollObject = [[KrollCoverageObject alloc] initWithTarget:proxy context:context];
#else
	ourKrollObject = [[KrollObject alloc] initWithTarget:proxy context:context];
#endif

	[self registerProxy:proxy krollObject:ourKrollObject];
	return [ourKrollObject autorelease];
}

- (void)unregisterProxy:(id)proxy
{
	OSSpinLockLock(&proxyLock);
	if (registeredProxies != NULL)
	{
		CFDictionaryRemoveValue(registeredProxies, proxy);
		//Don't bother with removing the empty registry. It's small and leaves on dealloc anyways.
	}
	OSSpinLockUnlock(&proxyLock);
	[proxy unboundBridge:self];
}

- (BOOL)usesProxy:(id)proxy
{
	if (proxy == nil)
	{
		return NO;
	}
	BOOL result=NO;
	OSSpinLockLock(&proxyLock);

	if (registeredProxies != NULL)
	{
		result = (CFDictionaryGetCountOfKey(registeredProxies, proxy) != 0);
	}
	OSSpinLockUnlock(&proxyLock);
	return result;
}

- (id)krollObjectForProxy:(id)proxy
{
	id result=nil;
	OSSpinLockLock(&proxyLock);
	if (registeredProxies != NULL)
	{
		result = (id)CFDictionaryGetValue(registeredProxies, proxy);
	}
	OSSpinLockUnlock(&proxyLock);
	return result;
}

-(id)loadCommonJSModule:(NSString*)code withSourceURL:(NSURL *)sourceURL
{
	// This takes care of resolving paths like `../../foo.js`
	sourceURL = [NSURL fileURLWithPath:[[sourceURL path] stringByStandardizingPath]];

	// Get the relative path to the Resources directory
	NSString *filename = [[sourceURL path] stringByReplacingOccurrencesOfString:[[[NSBundle mainBundle] resourceURL] path] withString:@""];
	NSString *dirname = [filename stringByDeletingLastPathComponent];

	NSString *js = [[NSString alloc] initWithFormat:Queens_Memory$ModuleRequireFormat, dirname, filename, code];

	/* This most likely should be integrated with normal code flow, but to
	 * minimize impact until a in-depth reconsideration of KrollContext can be
	 * done, we should have as little footprint
	 */
	KrollEval *eval = [[KrollEval alloc] initWithCode:js sourceURL:sourceURL startingLineNo:1];
	TiValueRef exception = NULL;
	TiValueRef resultRef = [eval jsInvokeInContext:context exception:&exception];
	[js release];
	[eval release];

	if (exception != NULL) {
		id excm = [KrollObject toID:context value:exception];
		[[TiExceptionHandler defaultExceptionHandler] reportScriptError:[TiUtils scriptErrorValue:excm]];
		return nil;
	}
	/*
	 *	In order to work around the underlying issue of TIMOB-2392, we must
	 *	use KrollWrapper as a JS wrapper instead of converting it to a proxy
	 */

	KrollWrapper * result = [[KrollWrapper alloc] init];
	[result setBridge:self];
	[result setJsobject:(TiObjectRef)resultRef];
	[result protectJsobject];

	return [result autorelease];
}

-(NSString*)pathToModuleClassName:(NSString*)path
{
	//TODO: switch to use ApplicationMods

	NSArray *tokens = [path componentsSeparatedByString:@"."];
	NSMutableString *modulename = [NSMutableString string];
	for (NSString *token in tokens)
	{
		[modulename appendFormat:@"%@%@",[[token substringToIndex:1] uppercaseString],[token substringFromIndex:1]];
	}
	[modulename appendString:@"Module"];
	return modulename;
}

- (TiModule *)loadTopLevelNativeModule:(TiModule *)module withPath:(NSString *)path withContext:(KrollContext *)kroll
{
	// does it have JS? No, then nothing else to do...
	if (![module isJSModule]) {
		return module;
	}
	NSData* data = [module moduleJS];
	if (data == nil) {
		// Uh oh, no actual data. Let's just punt and return the native module as-is
		return module;
	}

    NSString* contents = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
	KrollWrapper* wrapper = (id) [self loadJavascriptText:contents fromFile:path withContext:kroll];

	// For right now, we need to mix any compiled JS on top of a compiled module, so that both components
	// are accessible. We store the exports object and then put references to its properties on the toplevel
	// object.

	TiContextRef jsContext = [[self krollContext] context];
	TiObjectRef jsObject = [wrapper jsobject];
	KrollObject* moduleObject = [module krollObjectForContext:[self krollContext]];
	[moduleObject noteObject:jsObject forTiString:kTiStringExportsKey context:jsContext];

	TiPropertyNameArrayRef properties = TiObjectCopyPropertyNames(jsContext, jsObject);
	size_t count = TiPropertyNameArrayGetCount(properties);
	for (size_t i=0; i < count; i++) {
		// Mixin the property onto the module JS object if it's not already there
		TiStringRef propertyName = TiPropertyNameArrayGetNameAtIndex(properties, i);
		if (!TiObjectHasProperty(jsContext, [moduleObject jsobject], propertyName)) {
			TiValueRef property = TiObjectGetProperty(jsContext, jsObject, propertyName, NULL);
			TiObjectSetProperty([[self krollContext] context], [moduleObject jsobject], propertyName, property, kTiPropertyAttributeReadOnly, NULL);
		}
	}
	TiPropertyNameArrayRelease(properties);

	return module;
}

- (TiModule *)loadCoreModule:(NSString *)path withContext:(KrollContext *)kroll
{
	// make sure path doesn't begin with ., .., or /
	// Can't be a "core" module then
	if ([path hasPrefix:@"/"] || [path hasPrefix:@"."]) {
		return nil;
	}

	// moduleId then is the first path component
	// try to load up the native module's class...
	NSString *moduleID = [[path pathComponents] objectAtIndex:0];
	NSString *moduleClassName = [self pathToModuleClassName:moduleID];
	Class moduleClass = NSClassFromString(moduleClassName);
	// If no such module exists, bail out!
	if (moduleClass == nil) {
		return nil;
	}

	// If there is a JS file that collides with the given path,
	// warn the user of the collision, but prefer the native/core module
	NSURL *jsPath = [NSURL URLWithString:[NSString stringWithFormat:@"%@/%@.js", [[NSURL fileURLWithPath:[TiHost resourcePath] isDirectory:YES] path], path]];
	if ([[NSFileManager defaultManager] fileExistsAtPath:[jsPath absoluteString]]) {
		NSLog(@"[WARN] The requested path '%@' has a collison betweeb a native Ti%@um API/module and a JS file.", path, @"tani");
		NSLog(@"[WARN] The native Ti%@um API/module will be loaded in preference.", @"tani");
		NSLog(@"[WARN] If you intended to address the JS file, please require the path using a prefixed string such as require('./%@') or require('/%@') instead.", path, path);
	}

	// Ok, we have a native module, make sure instantiate and cache it
	TiModule *module = [modules objectForKey:moduleID];
	if (module == nil) {
		module = [[moduleClass alloc] _initWithPageContext:self];
		[module setHost:host];
		[module _setName:moduleClassName];
		[modules setObject:module forKey:moduleID];
		[module autorelease];
	}

	// Are they just trying to load the top-level module?
	NSRange separatorLocation = [path rangeOfString:@"/"];
	if (separatorLocation.location == NSNotFound) {
		// Indicates toplevel module
		return [self loadTopLevelNativeModule:module withPath:path withContext:kroll];
	}

	// check rest of path
	NSString* assetPath = [path substringFromIndex: separatorLocation.location + 1];
	// Treat require('module.id/module.id') == require('module.id')
	if ([assetPath isEqualToString:moduleID]) {
		return [self loadTopLevelNativeModule:module withPath:path withContext:kroll];
	}

	// not top-level module!
	// Try to load the file as module asset!
	NSString* filepath = [assetPath stringByAppendingString:@".js"];
	NSData* data = [module loadModuleAsset:filepath];
	// does it exist in module?
	if (data == nil) {
		// nope, return nil so we can try to fall back to resource in user's app
		return nil;
	}
    NSString* contents = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
	// This is an asset inside the native module. Load it like a "normal" common js file
	return [self loadJavascriptText:contents fromFile:filepath withContext:kroll];
}

- (NSString *)loadFile:(NSString *)path
{
	NSURL *url_ = [NSURL URLWithString:path relativeToURL:[[self host] baseURL]];
	NSData *data = [TiUtils loadAppResource:url_];

	if (data == nil) {
		data = [NSData dataWithContentsOfURL:url_];
	}

	if (data != nil) {
		[self setCurrentURL:[NSURL URLWithString:[path stringByDeletingLastPathComponent] relativeToURL:[[self host] baseURL]]];
		return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
	}
	return nil;
}

- (TiModule *)loadJavascriptObject:(NSString *)data fromFile:(NSString *)filename withContext:(KrollContext *)kroll
{
	// FIXME Move this up the stack to where we check for file existence?

	// Now that we have the full path, we can check and see if the module was loaded,
	// and return it if available.
	if (modules != nil) {
		TiModule *module = [modules objectForKey:filename];
		if (module != nil) {
			return module;
		}
	}

	// We could cheat and just do "module.exports = %data%", but that wouldn't validate that the passed in content was JSON
	// and may open a security hole.

	// TODO It'd be good to try and handle things more gracefully if the JSON is "bad"/malformed

	// Take JSON and turn into JS program that assigns module.exports to the parsed JSON
	// 1. trim leading and trailing newlines and whitespace from JSON file
	data = [data stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]];
	// 2. Escape single quotes
	data = [data stringByReplacingOccurrencesOfString:@"'" withString:@"\'"];
	// 3. assign module.exports as JSON.parse call on the JSON
	data = [@"module.exports = JSON.parse('" stringByAppendingString:data];
	// 4. Replace newlines with "' +\n'"
	data = [data stringByReplacingOccurrencesOfString:@"\n" withString:@"' +\n'"];
	// 5. close the JSON string and end the JSON.parse call
	data = [data stringByAppendingString:@"');"];

	return [self loadJavascriptText:data fromFile:filename withContext:kroll];
}

- (TiModule *)loadJavascriptText:(NSString *)data fromFile:(NSString *)filename withContext:(KrollContext *)kroll
{
	// FIXME Move this up the stack to where we check for file existence?

	// Now that we have the full path, we can check and see if the module was loaded,
	// and return it if available.
	if (modules != nil) {
		TiModule *module = [modules objectForKey:filename];
		if (module != nil) {
			return module;
		}
	}

	NSURL *url_ = [TiHost resourceBasedURL:filename baseURL:NULL];
#ifndef USE_JSCORE_FRAMEWORK
	const char *urlCString = [[url_ absoluteString] UTF8String];
	if ([[self host] debugMode]) {
		TiDebuggerBeginScript([self krollContext], urlCString);
	}
#endif

	KrollWrapper *wrapper = [self loadCommonJSModule:data withSourceURL:url_];

#ifndef USE_JSCORE_FRAMEWORK
	if ([[self host] debugMode]) {
		TiDebuggerEndScript([self krollContext]);
	}
#endif


	if (![wrapper respondsToSelector:@selector(replaceValue:forKey:notification:)]) {
		@throw [NSException exceptionWithName:@"org.queens_memory.kroll"
									   reason:[NSString stringWithFormat:@"Module \"%@\" failed to leave a valid exports object", filename]
									 userInfo:nil];
	}

	// register the module if it's pure JS
	TiModule *module = (id)wrapper;

	// cache the module by filename
	[modules setObject:module forKey:filename];
	if (filename != nil && module != nil) {
		// uri is optional but we point it to where we loaded it
		[module replaceValue:[NSString stringWithFormat:@"app://%@", filename] forKey:@"uri" notification:NO];
		[module replaceValue:filename forKey:@"id" notification:NO];  // set id to full path, originally this was the path from require call
	}

	return module;
}

- (TiModule *)loadAsFile:(NSString *)path withContext:(KrollContext *)kroll
{
	// 1. If X is a file, load X as JavaScript text.  STOP
	NSString *filename = path;
	NSString *data = [self loadFile:filename];
	if (data != nil) {
		// If the file extension is .json, load as JavascriptObject!
		NSString *ext = [filename pathExtension];
		if (ext != nil && [ext isEqual:@"json"]) {
			return [self loadJavascriptObject:data fromFile:filename withContext:context];
		}
		return [self loadJavascriptText:data fromFile:filename withContext:context];
	}
	// 2. If X.js is a file, load X.js as JavaScript text.  STOP
	filename = [path stringByAppendingString:@".js"];
	data = [self loadFile:filename];
	if (data != nil) {
		return [self loadJavascriptText:data fromFile:filename withContext:context];
	}
	// 3. If X.json is a file, parse X.json to a JavaScript Object.  STOP
	filename = [path stringByAppendingString:@".json"];
	data = [self loadFile:filename];
	if (data != nil) {
		return [self loadJavascriptObject:data fromFile:filename withContext:context];
	}
	// failed to load anything!
	return nil;
}

- (TiModule *)loadAsDirectory:(NSString *)path withContext:(KrollContext *)kroll
{
	// 1. If X/package.json is a file,
	NSString *filename = [path stringByAppendingPathComponent:@"package.json"];
	NSString *data = [self loadFile:filename];
	if (data != nil) {
		// a. Parse X/package.json, and look for "main" field.
		// Just cheat and use TiUtils.jsonParse here, rather than loading the package.json as a JS object...
		NSDictionary *json = [TiUtils jsonParse:data];
		if (json != nil) {
			id main = [json objectForKey:@"main"];
			NSString *mainString = nil;
			if ([main isKindOfClass:[NSString class]]) {
				mainString = (NSString *)main;
				// b. let M = X + (json main field)
				NSString *m = [[path stringByAppendingPathComponent:mainString] stringByStandardizingPath];
				// c. LOAD_AS_FILE(M)
				return [self loadAsFile:m withContext:context];
			}
		}
	}

	// 2. If X/index.js is a file, load X/index.js as JavaScript text.  STOP
	filename = [path stringByAppendingPathComponent:@"index.js"];
	data = [self loadFile:filename];
	if (data != nil) {
		return [self loadJavascriptText:data fromFile:filename withContext:context];
	}
	// 3. If X/index.json is a file, parse X/index.json to a JavaScript object. STOP
	filename = [path stringByAppendingPathComponent:@"index.json"];
	data = [self loadFile:filename];
	if (data != nil) {
		return [self loadJavascriptObject:data fromFile:filename withContext:context];
	}

	return nil;
}

- (TiModule *)loadAsFileOrDirectory:(NSString *)path withContext:(KrollContext *)kroll
{
	TiModule *module = nil;
	// a. LOAD_AS_FILE(Y + X)
	module = [self loadAsFile:path withContext:context];
	if (module) {
		return module;
	}
	// b. LOAD_AS_DIRECTORY(Y + X)
	module = [self loadAsDirectory:path withContext:context];
	if (module) {
		return module;
	}

	return nil;
}

- (NSArray *)nodeModulesPaths:(NSString *)path
{
	// What if we're at root? path may be nil here. So let's hack that case
	if (path == nil) {
		path = @"/";
	}
	// 1. let PARTS = path split(START)
	NSArray* parts = [path componentsSeparatedByString:@"/"];
	// 2. let I = count of PARTS - 1
	NSInteger i = [parts count] - 1;
	// 3. let DIRS = []
	NSMutableArray* dirs = [[NSMutableArray alloc] initWithCapacity:0];
	// 4. while I >= 0,
	while (i >= 0) {
		// a. if PARTS[I] = "node_modules" CONTINUE
		if ([[parts objectAtIndex:i] isEqual: @"node_modules"]) {
			continue;
		}
		// b. DIR = path join(PARTS[0 .. I] + "node_modules")
		NSString* dir = [[[parts componentsJoinedByString:@"/"] substringFromIndex:1] stringByAppendingPathComponent:@"node_modules"];
		// c. DIRS = DIRS + DIR
		[dirs addObject:dir];
		// d. let I = I - 1
		i = i - 1;
	}
	return dirs;
}

- (TiModule *)loadNodeModules:(NSString *)path withDir:(NSString *)start withContext:(KrollContext *)kroll
{
	TiModule *module = nil;

	// 1. let DIRS=NODE_MODULES_PATHS(START)
	NSArray *dirs = [self nodeModulesPaths:start];
	// 2. for each DIR in DIRS:
	for (NSString *dir in dirs)
	{
		// a. LOAD_AS_FILE(DIR/X)
		// b. LOAD_AS_DIRECTORY(DIR/X)
		module = [self loadAsFileOrDirectory:[dir stringByAppendingPathComponent:path] withContext:context];
		if (module) {
			return module;
		}
	}
	return nil;
}

- (id)require:(KrollContext *)kroll path:(NSString *)path
{
	NSURL *oldURL = [self currentURL];
	@try {
		// 1. If X is a core module,
		TiModule *module = [self loadCoreModule:path withContext:kroll];
		if (module) {
			// a. return the core module
			// b. STOP
			return module;
		}

		// 2. If X begins with './' or '/' or '../'
		if ([path hasPrefix:@"./"] || [path hasPrefix:@"../"]) {
			// Need base path to work from for relative modules...
			NSString *workingPath = [oldURL relativePath];
			NSString *relativePath = (workingPath == nil) ? path : [workingPath stringByAppendingPathComponent:path];
			module = [self loadAsFileOrDirectory:[relativePath stringByStandardizingPath] withContext:context];
			if (module) {
				return module;
			}
			// Treat '/' special as absolute, drop the leading '/'
		}
		else if ([path hasPrefix:@"/"]) {
			module = [self loadAsFileOrDirectory:[[path substringFromIndex:1] stringByStandardizingPath] withContext:context];
			if (module) {
				return module;
			}
		} else {
			// TODO Grab the first path segment and see if it's a node module or commonJS module
			// We should be able to organize the modules in folder to determine if the user is attempting to
			// load one of them!


			// Look for CommonJS module
			if (![path containsString:@"/"]) {
				// For CommonJS we need to look for module.id/module.id.js first...
				// TODO Only look for this _exact file_. DO NOT APPEND .js or .json to it!
				module = [self loadAsFile:[[path stringByAppendingPathComponent:path] stringByAppendingPathExtension:@"js"] withContext:context];
				if (module) {
					return module;
				}
				// Then try module.id as directory
				module = [self loadAsDirectory:path withContext:context];
				if (module) {
					return module;
				}
			}

			// Need base path to work from for determining the node_modules search paths.
			NSString *workingPath = [oldURL relativePath];
			module = [self loadNodeModules:path withDir:workingPath withContext:context];
			if (module) {
				return module;
			}

			// We'd like to warn users about legacy style require syntax so they can update, but the new syntax is not backwards compatible.
			// So for now, let's just be quite about it. In future versions of the SDK (7.0?) we should warn (once 5.x is end of life so backwards compat is not necessary)
			//NSLog(@"require called with un-prefixed module id: %@, should be a core or CommonJS module. Falling back to old Ti behavior and assuming it's an absolute path: /%@", path, path);
			module = [self loadAsFileOrDirectory:[path stringByStandardizingPath] withContext:context];
			if (module) {
				return module;
			}
		}
	}
	@finally {
		[self setCurrentURL:oldURL];
	}

	// 4. THROW "not found"
	NSString *arch = [TiUtils currentArchitecture];
	@throw [NSException exceptionWithName:@"org.test.kroll" reason:[NSString stringWithFormat:@"Couldn't find module: %@ for architecture: %@", path, arch] userInfo:nil];  // TODO Set 'code' property to 'MODULE_NOT_FOUND' to match Node?
}

+ (NSArray *)krollBridgesUsingProxy:(id)proxy
{
	NSMutableArray * results = nil;

	OSSpinLockLock(&krollBridgeRegistryLock);
	signed long bridgeCount = CFSetGetCount(krollBridgeRegistry);
	KrollBridge * registryObjects[bridgeCount];
	CFSetGetValues(krollBridgeRegistry, (const void **)registryObjects);

	for (int currentBridgeIndex = 0; currentBridgeIndex < bridgeCount; currentBridgeIndex++)
	{
		KrollBridge * currentBridge = registryObjects[currentBridgeIndex];
		if (![currentBridge usesProxy:proxy])
		{
			continue;
		}
		if (results == nil)
		{
			results = [NSMutableArray arrayWithObject:currentBridge];
			continue;
		}
		[results addObject:currentBridge];
	}

	//Why do we wait so long? In case someone tries to dealloc the krollBridge while we're looking at it.
	//registryObjects nor the registry does a retain here!
	OSSpinLockUnlock(&krollBridgeRegistryLock);
	return results;
}

+ (NSArray *)krollContexts
{
	OSSpinLockLock(&krollBridgeRegistryLock);
	signed long bridgeCount = CFSetGetCount(krollBridgeRegistry);
	KrollBridge * registryObjects[bridgeCount];
	CFSetGetValues(krollBridgeRegistry, (const void **)registryObjects);

	NSMutableArray *results = [[NSMutableArray alloc] initWithCapacity:0];
	for (NSUInteger currentBridgeIndex = 0; currentBridgeIndex < bridgeCount; ++currentBridgeIndex) {
		KrollBridge *bridge = registryObjects[currentBridgeIndex];
		[results addObject:bridge.krollContext];
	}

	OSSpinLockUnlock(&krollBridgeRegistryLock);
	return [results autorelease];
}

+ (BOOL)krollBridgeExists:(KrollBridge *)bridge
{
	if(bridge == nil)
	{
		return NO;
	}

	bool result=NO;
	OSSpinLockLock(&krollBridgeRegistryLock);
	signed long bridgeCount = CFSetGetCount(krollBridgeRegistry);
	KrollBridge * registryObjects[bridgeCount];
	CFSetGetValues(krollBridgeRegistry, (const void **)registryObjects);
	for (int currentBridgeIndex = 0; currentBridgeIndex < bridgeCount; currentBridgeIndex++)
	{
		KrollBridge * currentBridge = registryObjects[currentBridgeIndex];
		if (currentBridge == bridge)
		{
			result = YES;
			break;
		}
	}
	//Why not CFSetContainsValue? Because bridge may not be a valid pointer, and SetContainsValue
	//will ask it for a hash!
	OSSpinLockUnlock(&krollBridgeRegistryLock);

	return result;
}

+ (KrollBridge *)krollBridgeForThreadName:(NSString *)threadName;
{
	if(threadName == nil)
	{
		return nil;
	}

	KrollBridge * result=nil;
	OSSpinLockLock(&krollBridgeRegistryLock);
	signed long bridgeCount = CFSetGetCount(krollBridgeRegistry);
	KrollBridge * registryObjects[bridgeCount];
	CFSetGetValues(krollBridgeRegistry, (const void **)registryObjects);
	for (int currentBridgeIndex = 0; currentBridgeIndex < bridgeCount; currentBridgeIndex++)
	{
		KrollBridge * currentBridge = registryObjects[currentBridgeIndex];
#ifdef TI_USE_KROLL_THREAD
		if ([[[currentBridge krollContext] threadName] isEqualToString:threadName])
		{
			result = [[currentBridge retain] autorelease];
			break;
		}
#endif
	}
	OSSpinLockUnlock(&krollBridgeRegistryLock);

	return result;
}


-(int)forceGarbageCollectNow;
{
	[context gc];
	//Actually forcing garbage collect now will cause a deadlock.
	return 0;
}

-(BOOL)shouldDebugContext
{
	return [[self host] debugMode];
}

- (BOOL)shouldProfileContext
{
	return [[self host] profileMode];
}

@end
