var $StaticConstructors = [];
var $StaticConstructor = function(f) { 
    $StaticConstructors.push(f);  
};  

if (typeof ($Inherit) == 'undefined') {
	var $Inherit = function (ce, ce2) {

		if (typeof (Object.getOwnPropertyNames) == 'undefined') {

			for (var p in ce2.prototype)
				if (typeof (ce.prototype[p]) == 'undefined' || ce.prototype[p] == Object.prototype[p])
					ce.prototype[p] = ce2.prototype[p];
			for (var p in ce2)
				if (typeof (ce[p]) == 'undefined')
					ce[p] = ce2[p];
			ce.$baseCtor = ce2;

		} else {

			var props = Object.getOwnPropertyNames(ce2.prototype);
			for (var i = 0; i < props.length; i++)
				if (typeof (Object.getOwnPropertyDescriptor(ce.prototype, props[i])) == 'undefined')
					Object.defineProperty(ce.prototype, props[i], Object.getOwnPropertyDescriptor(ce2.prototype, props[i]));

			for (var p in ce2)
				if (typeof (ce[p]) == 'undefined')
					ce[p] = ce2[p];
			ce.$baseCtor = ce2;

		}

	}
};

if (typeof($CreateException)=='undefined') 
{
    var $CreateException = function(ex, error) 
    {
        if(error==null)
            error = new Error();
        if(ex==null)
            ex = new System.Exception.ctor();       
        error.message = ex.message;
        error.exception = ex;
        for (var p in ex)
           error[p] = ex[p];
        return error;
    }
}

if (typeof ($CreateAnonymousDelegate) == 'undefined') {
    var $CreateAnonymousDelegate = function (target, func) {
        if (target == null || func == null)
            return func;
        var delegate = function () {
            return func.apply(target, arguments);
        };
        delegate.func = func;
        delegate.target = target;
        delegate.isDelegate = true;
        return delegate;
    }
}

if (typeof($CreateDelegate)=='undefined'){
    if(typeof($iKey)=='undefined') var $iKey = 0;
    if(typeof($pKey)=='undefined') var $pKey = String.fromCharCode(1);
    var $CreateDelegate = function(target, func){
        if (target == null || func == null) 
            return func;
        if(func.target==target && func.func==func)
            return func;
        if (target.$delegateCache == null)
            target.$delegateCache = {};
        if (func.$key == null)
            func.$key = $pKey + String(++$iKey);
        var delegate;
        if(target.$delegateCache!=null)
            delegate = target.$delegateCache[func.$key];
        if (delegate == null){
            delegate = function(){
                return func.apply(target, arguments);
            };
            delegate.func = func;
            delegate.target = target;
            delegate.isDelegate = true;
            if(target.$delegateCache!=null)
                target.$delegateCache[func.$key] = delegate;
        }
        return delegate;
    }
}

var Int32Array = Int32Array || Array;
var Uint8Array = Uint8Array || Array;
var Float32Array = Float32Array || Array;
function $CombineDelegates(del1,del2)
{
    if(del1 == null)
        return del2;
    if(del2 == null)
        return del1;
    var del=$CreateMulticastDelegateFunction();
    del.delegates = [];
    if(del1.isMulticastDelegate)
    {
        for(var i=0;i < del1.delegates.length;i++)
            del.delegates.push(del1.delegates[i]);
    }
    else
    {
        del.delegates.push(del1);
    }
    if(del2.isMulticastDelegate)
    {
        for(var i=0;i < del2.delegates.length;i++)
            del.delegates.push(del2.delegates[i]);
    }
    else
    {
        del.delegates.push(del2);
    }
    return del;
};

function $CreateMulticastDelegateFunction()
{
    var del2 = null;
    
    var del=function()
    {
        var x=undefined;
        for(var i=0;i < del2.delegates.length;i++)
        {
            var del3=del2.delegates[i];
            x = del3.apply(null,arguments);
        }
        return x;
    };
    del.isMulticastDelegate = true;
    del2 = del;   
    
    return del;
};

function $RemoveDelegate(delOriginal,delToRemove)
{
    if(delToRemove == null || delOriginal == null)
        return delOriginal;
    if(delOriginal.isMulticastDelegate)
    {
        if(delToRemove.isMulticastDelegate)
            throw new Error("Multicast to multicast delegate removal is not implemented yet");
        var del=$CreateMulticastDelegateFunction();
        for(var i=0;i < delOriginal.delegates.length;i++)
        {
            var del2=delOriginal.delegates[i];
            if(del2 != delToRemove)
            {
                if(del.delegates == null)
                    del.delegates = [];
                del.delegates.push(del2);
            }
        }
        if(del.delegates == null)
            return null;
        if(del.delegates.length == 1)
            return del.delegates[0];
        return del;
    }
    else
    {
        if(delToRemove.isMulticastDelegate)
            throw new Error("single to multicast delegate removal is not supported");
        if(delOriginal == delToRemove)
            return null;
        return delOriginal;
    }
};


var AlphaTab = AlphaTab || {};
AlphaTab.Environment = function (){
};
AlphaTab.Environment.PlatformInit = function (){
    AlphaTab.Environment.RenderEngines["svg"] = function (){
        return new AlphaTab.Platform.Svg.FontSvgCanvas();
    };
    AlphaTab.Environment.RenderEngines["default"] = function (){
        return new AlphaTab.Platform.Svg.FontSvgCanvas();
    };
    AlphaTab.Environment.RenderEngines["html5"] = function (){
        return new AlphaTab.Platform.JavaScript.Html5Canvas();
    };
    AlphaTab.Environment.FileLoaders["default"] = function (){
        return new AlphaTab.Platform.JavaScript.JsFileLoader();
    };
    // check whether webfont is loaded
    AlphaTab.Environment.CheckFontLoad();
     Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };;
    // try to build the find the alphaTab script url in case we are not in the webworker already
    if (self.document){
        var scriptElement = document["currentScript"];
        if (!scriptElement){
            // try to get javascript from exception stack
            try{
                var error = new Error();
                var stack = error["stack"];
                if (!stack){
                    throw $CreateException(error, new Error());
                }
                AlphaTab.Environment.ScriptFile = AlphaTab.Environment.ScriptFileFromStack(stack);
            }
            catch(e){
                var stack = e["stack"];
                if (!stack){
                    scriptElement = document.querySelector("script[data-alphatab]");
                }
                else {
                    AlphaTab.Environment.ScriptFile = AlphaTab.Environment.ScriptFileFromStack(stack);
                }
            }
        }
        // failed to automatically resolve
        if (((AlphaTab.Environment.ScriptFile==null)||(AlphaTab.Environment.ScriptFile.length==0))){
            if (!scriptElement){
                console.warn("Could not automatically find alphaTab script file for worker, please add the data-alphatab attribute to the script tag that includes alphaTab or provide it when initializing alphaTab");
            }
            else {
                AlphaTab.Environment.ScriptFile = scriptElement.src;
            }
        }
    }
};
AlphaTab.Environment.ScriptFileFromStack = function (stack){
    var matches = stack.match("(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?");
    if (!matches){
        matches = stack.match("^(?:|[^:@]*@|.+\\)@(?=data:text\\/javascript|blob|http[s]?|file)|.+?\\s+(?: at |@)(?:[^:\\(]+ )*[\\(]?)(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?");
        if (!matches){
            matches = stack.match("\\)@(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?");
            if (!matches){
                return null;
            }
        }
    }
    return matches[1];
};
AlphaTab.Environment.CheckFontLoad = function (){
    var isWorker =  typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    if (isWorker){
        // no web fonts in web worker
        AlphaTab.Environment.IsFontLoaded = false;
        return;
    }
    var cssFontLoadingModuleSupported =  !!document.fonts && !!document.fonts.load;
    if (cssFontLoadingModuleSupported){
        // ReSharper disable once UnusedVariable
        var onLoaded = function (){
            AlphaTab.Environment.IsFontLoaded = true;
            return true;
        };
         document.fonts.load('1em alphaTab').then(onLoaded);
    }
    else {
        var checkFont = null;
        checkFont = function (){
            var testItem = document.getElementById("alphaTabFontChecker");
            if (testItem == null){
                // create a hidden element with the font style set
                testItem = document.createElement("div");
                testItem.setAttribute("id", "alphaTabFontChecker");
                testItem.style.opacity = "0";
                testItem.style.position = "absolute";
                testItem.style.left = "0";
                testItem.style.top = "0";
                testItem.classList.add("at");
                testItem.innerHTML = "&#" + 57424 + ";";
                document.body.appendChild(testItem);
            }
            // get width
            var width = testItem.offsetWidth;
            if (width > 30){
                AlphaTab.Environment.IsFontLoaded = true;
                document.body.removeChild(testItem);
            }
            else {
                window.setTimeout(function (){
                    checkFont();
                }, 1000);
            }
        };
        window.addEventListener("DOMContentLoaded", function (e){
            checkFont();
        });
    }
};
$StaticConstructor(function (){
    AlphaTab.Environment.RenderEngines = null;
    AlphaTab.Environment.FileLoaders = null;
    AlphaTab.Environment.LayoutEngines = null;
    AlphaTab.Environment.StaveFactories = null;
    AlphaTab.Environment.ScriptFile = null;
    AlphaTab.Environment.IsFontLoaded = false;
    AlphaTab.Environment.RenderEngines = {};
    AlphaTab.Environment.FileLoaders = {};
    AlphaTab.Environment.LayoutEngines = {};
    AlphaTab.Environment.StaveFactories = {};
    AlphaTab.Environment.PlatformInit();
    // default layout engines
    AlphaTab.Environment.LayoutEngines["default"] = function (r){
        return new AlphaTab.Rendering.Layout.PageViewLayout(r);
    };
    AlphaTab.Environment.LayoutEngines["page"] = function (r){
        return new AlphaTab.Rendering.Layout.PageViewLayout(r);
    };
    AlphaTab.Environment.LayoutEngines["horizontal"] = function (r){
        return new AlphaTab.Rendering.Layout.HorizontalScreenLayout(r);
    };
    // default staves 
    AlphaTab.Environment.StaveFactories["marker"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.MarkerEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["triplet-feel"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TripletFeelEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["tempo"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TempoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["text"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TextEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["chords"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.ChordsEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["trill"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TrillEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["beat-vibrato"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.BeatVibratoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["note-vibrato"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.NoteVibratoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["alternate-endings"] = function (l){
        return new AlphaTab.Rendering.AlternateEndingsBarRendererFactory();
    };
    AlphaTab.Environment.StaveFactories["score"] = function (l){
        return new AlphaTab.Rendering.ScoreBarRendererFactory();
    };
    AlphaTab.Environment.StaveFactories["crescendo"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.CrescendoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["dynamics"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.DynamicsEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["capo"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.CapoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["tap"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TapEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["fade-in"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.FadeInEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["harmonics"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.HarmonicsEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["let-ring"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.LetRingEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["palm-mute"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.PalmMuteEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["tab"] = function (l){
        return new AlphaTab.Rendering.TabBarRendererFactory();
    };
    AlphaTab.Environment.StaveFactories["pick-stroke"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.PickStrokeEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["rhythm-up"] = function (l){
        return new AlphaTab.Rendering.RhythmBarRendererFactory(AlphaTab.Rendering.Utils.BeamDirection.Down);
    };
    AlphaTab.Environment.StaveFactories["rhythm-down"] = function (l){
        return new AlphaTab.Rendering.RhythmBarRendererFactory(AlphaTab.Rendering.Utils.BeamDirection.Up);
    };
    // staveFactories.set("fingering", functionl { return new EffectBarRendererFactory(new FingeringEffectInfo()); });   
});
AlphaTab.Model = AlphaTab.Model || {};
AlphaTab.Model.JsonConverter = function (){
};
AlphaTab.Model.JsonConverter.prototype = {
    ScoreToJsObject: function (score){
        var score2 = {};
        AlphaTab.Model.Score.CopyTo(score, score2);
        score2.MasterBars = [];
        score2.Tracks = [];
        for (var i = 0; i < score.MasterBars.length; i++){
            var masterBar = score.MasterBars[i];
            var masterBar2 = {};
            AlphaTab.Model.MasterBar.CopyTo(masterBar, masterBar2);
            if (masterBar.TempoAutomation != null){
                masterBar2.TempoAutomation = {};
                AlphaTab.Model.Automation.CopyTo(masterBar.TempoAutomation, masterBar2.TempoAutomation);
            }
            if (masterBar.VolumeAutomation != null){
                masterBar2.VolumeAutomation = {};
                AlphaTab.Model.Automation.CopyTo(masterBar.VolumeAutomation, masterBar2.VolumeAutomation);
            }
            if (masterBar.Section != null){
                masterBar2.Section = {};
                AlphaTab.Model.Section.CopyTo(masterBar.Section, masterBar2.Section);
            }
            score2.MasterBars.push(masterBar2);
        }
        for (var t = 0; t < score.Tracks.length; t++){
            var track = score.Tracks[t];
            var track2 = {};
            track2.Color = {};
            AlphaTab.Model.Track.CopyTo(track, track2);
            track2.PlaybackInfo = {};
            AlphaTab.Model.PlaybackInformation.CopyTo(track.PlaybackInfo, track2.PlaybackInfo);
            track2.Chords = {};
            for (var $i2 = 0,$t2 = Object.keys(track.Chords),$l2 = $t2.length,key = $t2[$i2]; $i2 < $l2; $i2++, key = $t2[$i2]){
                var chord = track.Chords[key];
                var chord2 = {};
                AlphaTab.Model.Chord.CopyTo(chord, chord2);
                track2.Chords[key] = chord;
            }
            track2.Staves = [];
            for (var s = 0; s < track.Staves.length; s++){
                var staff = track.Staves[s];
                var staff2 = {};
                staff2.Bars = [];
                for (var b = 0; b < staff.Bars.length; b++){
                    var bar = staff.Bars[b];
                    var bar2 = {};
                    AlphaTab.Model.Bar.CopyTo(bar, bar2);
                    bar2.Voices = [];
                    for (var v = 0; v < bar.Voices.length; v++){
                        var voice = bar.Voices[v];
                        var voice2 = {};
                        AlphaTab.Model.Voice.CopyTo(voice, voice2);
                        voice2.Beats = [];
                        for (var bb = 0; bb < voice.Beats.length; bb++){
                            var beat = voice.Beats[bb];
                            var beat2 = {};
                            AlphaTab.Model.Beat.CopyTo(beat, beat2);
                            beat2.Automations = [];
                            for (var a = 0; a < beat.Automations.length; a++){
                                var automation = {};
                                AlphaTab.Model.Automation.CopyTo(beat.Automations[a], automation);
                                beat2.Automations.push(automation);
                            }
                            beat2.WhammyBarPoints = [];
                            for (var i = 0; i < beat.WhammyBarPoints.length; i++){
                                var point = {};
                                AlphaTab.Model.BendPoint.CopyTo(beat.WhammyBarPoints[i], point);
                                beat2.WhammyBarPoints.push(point);
                            }
                            beat2.Notes = [];
                            for (var n = 0; n < beat.Notes.length; n++){
                                var note = beat.Notes[n];
                                var note2 = {};
                                AlphaTab.Model.Note.CopyTo(note, note2);
                                note2.BendPoints = [];
                                for (var i = 0; i < note.BendPoints.length; i++){
                                    var point = {};
                                    AlphaTab.Model.BendPoint.CopyTo(note.BendPoints[i], point);
                                    note2.BendPoints.push(point);
                                }
                                beat2.Notes.push(note2);
                            }
                            voice2.Beats.push(beat2);
                        }
                        bar2.Voices.push(voice2);
                    }
                    staff2.Bars.push(bar2);
                }
                track2.Staves.push(staff);
            }
            score2.Tracks.push(track2);
        }
        return score2;
    },
    JsObjectToScore: function (score){
        var score2 = new AlphaTab.Model.Score();
        AlphaTab.Model.Score.CopyTo(score, score2);
        for (var i = 0; i < score.MasterBars.length; i++){
            var masterBar = score.MasterBars[i];
            var masterBar2 = new AlphaTab.Model.MasterBar();
            AlphaTab.Model.MasterBar.CopyTo(masterBar, masterBar2);
            if (masterBar.TempoAutomation != null){
                masterBar2.TempoAutomation = new AlphaTab.Model.Automation();
                AlphaTab.Model.Automation.CopyTo(masterBar.TempoAutomation, masterBar2.TempoAutomation);
            }
            if (masterBar.VolumeAutomation != null){
                masterBar2.VolumeAutomation = new AlphaTab.Model.Automation();
                AlphaTab.Model.Automation.CopyTo(masterBar.VolumeAutomation, masterBar2.VolumeAutomation);
            }
            if (masterBar.Section != null){
                masterBar2.Section = new AlphaTab.Model.Section();
                AlphaTab.Model.Section.CopyTo(masterBar.Section, masterBar2.Section);
            }
            score2.AddMasterBar(masterBar2);
        }
        for (var t = 0; t < score.Tracks.length; t++){
            var track = score.Tracks[t];
            var track2 = new AlphaTab.Model.Track(track.Staves.length);
            AlphaTab.Model.Track.CopyTo(track, track2);
            score2.AddTrack(track2);
            AlphaTab.Model.PlaybackInformation.CopyTo(track.PlaybackInfo, track2.PlaybackInfo);
            for (var $i3 = 0,$t3 = Object.keys(track.Chords),$l3 = $t3.length,key = $t3[$i3]; $i3 < $l3; $i3++, key = $t3[$i3]){
                var chord = track.Chords[key];
                var chord2 = new AlphaTab.Model.Chord();
                AlphaTab.Model.Chord.CopyTo(chord, chord2);
                track2.Chords[key] = chord2;
            }
            for (var s = 0; s < track.Staves.length; s++){
                var staff = track.Staves[s];
                for (var b = 0; b < staff.Bars.length; b++){
                    var bar = staff.Bars[b];
                    var bar2 = new AlphaTab.Model.Bar();
                    AlphaTab.Model.Bar.CopyTo(bar, bar2);
                    track2.AddBarToStaff(s, bar2);
                    for (var v = 0; v < bar.Voices.length; v++){
                        var voice = bar.Voices[v];
                        var voice2 = new AlphaTab.Model.Voice();
                        AlphaTab.Model.Voice.CopyTo(voice, voice2);
                        bar2.AddVoice(voice2);
                        for (var bb = 0; bb < voice.Beats.length; bb++){
                            var beat = voice.Beats[bb];
                            var beat2 = new AlphaTab.Model.Beat();
                            AlphaTab.Model.Beat.CopyTo(beat, beat2);
                            voice2.AddBeat(beat2);
                            for (var a = 0; a < beat.Automations.length; a++){
                                var automation = new AlphaTab.Model.Automation();
                                AlphaTab.Model.Automation.CopyTo(beat.Automations[a], automation);
                                beat2.Automations.push(automation);
                            }
                            for (var i = 0; i < beat.WhammyBarPoints.length; i++){
                                var point = new AlphaTab.Model.BendPoint(0, 0);
                                AlphaTab.Model.BendPoint.CopyTo(beat.WhammyBarPoints[i], point);
                                beat2.WhammyBarPoints.push(point);
                            }
                            for (var n = 0; n < beat.Notes.length; n++){
                                var note = beat.Notes[n];
                                var note2 = new AlphaTab.Model.Note();
                                AlphaTab.Model.Note.CopyTo(note, note2);
                                beat2.AddNote(note2);
                                for (var i = 0; i < note.BendPoints.length; i++){
                                    var point = new AlphaTab.Model.BendPoint(0, 0);
                                    AlphaTab.Model.BendPoint.CopyTo(note.BendPoints[i], point);
                                    note2.AddBendPoint(point);
                                }
                            }
                        }
                    }
                }
            }
        }
        score2.Finish();
        return score2;
    }
};
AlphaTab.Model.TuningParser = function (){
};
$StaticConstructor(function (){
    AlphaTab.Model.TuningParser.TuningRegex = new RegExp("([a-g]b?)([0-9])", "i");
});
AlphaTab.Model.TuningParser.IsTuning = function (name){
    return AlphaTab.Model.TuningParser.TuningRegex.exec(name) != null;
};
AlphaTab.Model.TuningParser.GetTuningForText = function (str){
    var b = 0;
    var note = null;
    var octave = 0;
    var m = AlphaTab.Model.TuningParser.TuningRegex.exec(str.toLowerCase());
    if (m != null){
        note = m[1];
        octave = AlphaTab.Platform.Std.ParseInt(m[2]);
    }
    if (!AlphaTab.Platform.Std.IsNullOrWhiteSpace(note)){
        switch (note){
            case "c":
                b = 0;
                break;
            case "db":
                b = 1;
                break;
            case "d":
                b = 2;
                break;
            case "eb":
                b = 3;
                break;
            case "e":
                b = 4;
                break;
            case "f":
                b = 5;
                break;
            case "gb":
                b = 6;
                break;
            case "g":
                b = 7;
                break;
            case "ab":
                b = 8;
                break;
            case "a":
                b = 9;
                break;
            case "bb":
                b = 10;
                break;
            case "b":
                b = 11;
                break;
            default:
                return -1;
        }
        // add octaves
        b += (octave * 12);
    }
    else {
        return -1;
    }
    return b;
};
AlphaTab.Platform = AlphaTab.Platform || {};
AlphaTab.Platform.JavaScript = AlphaTab.Platform.JavaScript || {};
AlphaTab.Platform.JavaScript.ResizeEventArgs = function (){
    this.OldWidth = 0;
    this.NewWidth = 0;
    this.Settings = null;
};
AlphaTab.Platform.JavaScript.JsApiBase = function (element, options){
    this.Element = null;
    this.CanvasElement = null;
    this.TrackIndexes = null;
    this.AutoSize = false;
    this.Renderer = null;
    this.Score = null;
    this.Element = element;
    var dataset = this.Element.dataset;
    // load settings
    var settings = AlphaTab.Settings.FromJson(options);
    // get track data to parse
    var tracksData;
    if (options != null && options.tracks){
        tracksData = options.tracks;
    }
    else if (element != null && element.dataset != null && dataset["tracks"] != null){
        tracksData = dataset["tracks"];
    }
    else {
        tracksData = 0;
    }
    this.SetTracks(tracksData, false);
    var contents = "";
    if (element != null){
        // get load contents
        if (element.dataset != null && dataset["tex"] != null && element.innerText){
            contents = (element.innerHTML).trim();
            element.innerHTML = "";
        }
        this.CanvasElement = document.createElement("div");
        this.CanvasElement.className = "alphaTabSurface";
        this.CanvasElement.style.fontSize = "0";
        element.appendChild(this.CanvasElement);
        this.AutoSize = settings.Width < 0;
        if (this.AutoSize){
            settings.Width = element.offsetWidth;
            if (options){
                options.width = element.offsetWidth;
            }
            var timeoutId = 0;
            window.addEventListener("resize", $CreateAnonymousDelegate(this, function (e){
                window.clearTimeout(timeoutId);
                timeoutId = window.setTimeout($CreateAnonymousDelegate(this, function (){
                    if (element.offsetWidth != settings.Width){
                        var resizeEventInfo = new AlphaTab.Platform.JavaScript.ResizeEventArgs();
                        resizeEventInfo.OldWidth = settings.Width;
                        resizeEventInfo.NewWidth = element.offsetWidth;
                        resizeEventInfo.Settings = settings;
                        this.TriggerEvent("resize", resizeEventInfo);
                        settings.Width = resizeEventInfo.NewWidth;
                        this.Renderer.UpdateSettings(settings);
                        this.Renderer.Resize(element.offsetWidth);
                    }
                }), 100);
            }));
        }
    }
    this.CreateStyleElement(settings);
    if (element != null && this.AutoSize){
        var initialResizeEventInfo = new AlphaTab.Platform.JavaScript.ResizeEventArgs();
        initialResizeEventInfo.OldWidth = 0;
        initialResizeEventInfo.NewWidth = element.offsetWidth;
        initialResizeEventInfo.Settings = settings;
        this.TriggerEvent("resize", initialResizeEventInfo);
        settings.Width = initialResizeEventInfo.NewWidth;
    }
    this.Renderer = this.CreateScoreRenderer(settings);
    this.Renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (o){
        this.TriggerEvent("rendered", null);
    }));
    this.Renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
        this.TriggerEvent("post-rendered", null);
    }));
    this.Renderer.add_PreRender($CreateAnonymousDelegate(this, function (result){
        this.CanvasElement.innerHTML = "";
        this.AppendRenderResult(result);
    }));
    this.Renderer.add_PartialRenderFinished($CreateDelegate(this, this.AppendRenderResult));
    this.Renderer.add_RenderFinished($CreateDelegate(this, this.AppendRenderResult));
    if (!((contents==null)||(contents.length==0))){
        this.Tex(contents);
    }
    else if (options && options.file){
        this.Load(options.file);
    }
    else if (this.Element != null && this.Element.dataset != null && !((dataset["file"]==null)||(dataset["file"].length==0))){
        this.Load(dataset["file"]);
    }
    else if (this.Element != null && !((this.Element.getAttribute("data-file")==null)||(this.Element.getAttribute("data-file").length==0))){
        this.Load(this.Element.getAttribute("data-file"));
    }
};
AlphaTab.Platform.JavaScript.JsApiBase.prototype = {
    AppendRenderResult: function (result){
        this.CanvasElement.style.width = result.TotalWidth + "px";
        this.CanvasElement.style.height = result.TotalHeight + "px";
        if (result.RenderResult != null){
            var itemToAppend;
            if (typeof(result.RenderResult) == "string"){
                var partialResult = document.createElement("div");
                partialResult.innerHTML = result.RenderResult;
                itemToAppend = partialResult.firstChild;
            }
            else {
                itemToAppend = result.RenderResult;
            }
            this.CanvasElement.appendChild(itemToAppend);
        }
    },
    CreateStyleElement: function (settings){
        var styleElement = document.getElementById("alphaTabStyle");
        if (styleElement == null){
            var fontDirectory = settings.ScriptFile;
            fontDirectory = fontDirectory.substr(0, fontDirectory.lastIndexOf("/")) + "/Font/";
            styleElement = document.createElement("style");
            styleElement.id = "alphaTabStyle";
            styleElement.type = "text/css";
            var css = new Array();
            css.push("@font-face {"+'\r\n');
            css.push("    font-family: \'alphaTab\';"+'\r\n');
            css.push("     src: url(\'" + fontDirectory + "bravura.eot\');"+'\r\n');
            css.push("     src: url(\'" + fontDirectory + "bravura.eot?#iefix\') format(\'embedded-opentype\')"+'\r\n');
            css.push("          , url(\'" + fontDirectory + "bravura.woff\') format(\'woff\')"+'\r\n');
            css.push("          , url(\'" + fontDirectory + "bravura.otf\') format(\'opentype\')"+'\r\n');
            css.push("          , url(\'" + fontDirectory + "bravura.svg#Bravura\') format(\'svg\');"+'\r\n');
            css.push("     font-weight: normal;"+'\r\n');
            css.push("     font-style: normal;"+'\r\n');
            css.push("}"+'\r\n');
            css.push(".at {"+'\r\n');
            css.push("     font-family: \'alphaTab\';"+'\r\n');
            css.push("     speak: none;"+'\r\n');
            css.push("     font-style: normal;"+'\r\n');
            css.push("     font-weight: normal;"+'\r\n');
            css.push("     font-variant: normal;"+'\r\n');
            css.push("     text-transform: none;"+'\r\n');
            css.push("     line-height: 1;"+'\r\n');
            css.push("     line-height: 1;"+'\r\n');
            css.push("     -webkit-font-smoothing: antialiased;"+'\r\n');
            css.push("     -moz-osx-font-smoothing: grayscale;"+'\r\n');
            css.push("     font-size: 34px;"+'\r\n');
            css.push("     overflow: visible !important;"+'\r\n');
            css.push("}"+'\r\n');
            styleElement.innerHTML = css.join('');
            document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
    },
    get_Tracks: function (){
        var tracks = [];
        for (var $i4 = 0,$t4 = this.TrackIndexes,$l4 = $t4.length,track = $t4[$i4]; $i4 < $l4; $i4++, track = $t4[$i4]){
            if (track >= 0 && track < this.Score.Tracks.length){
                tracks.push(this.Score.Tracks[track]);
            }
        }
        if (tracks.length == 0 && this.Score.Tracks.length > 0){
            tracks.push(this.Score.Tracks[0]);
        }
        return tracks.slice(0);
    },
    SetTracks: function (tracksData, render){
        var tracks = [];
        // decode string
        if (typeof(tracksData) == "string"){
            try{
                tracksData = JSON.parse(tracksData);
            }
            catch($$e1){
                tracksData = new Int32Array([0]);
            }
        }
        // decode array
        if (typeof(tracksData) == "number"){
            tracks.push(tracksData);
        }
        else if (tracksData.length){
            for (var i = 0; i < tracksData.length; i++){
                var value;
                if (typeof(tracksData[i]) == "number"){
                    value = tracksData[i];
                }
                else {
                    value = AlphaTab.Platform.Std.ParseInt(tracksData[i].ToString());
                }
                if (value >= 0){
                    tracks.push(value);
                }
            }
        }
        this.TrackIndexes = tracks.slice(0);
        if (render){
            this.Render();
        }
    },
    ScoreLoaded: function (score, render){
        this.Score = score;
        this.TriggerEvent("loaded", score);
        if (render){
            this.Render();
        }
    },
    TriggerEvent: function (name, details){
        if (this.Element != null){
            var e = document.createEvent("CustomEvent");
            e.initCustomEvent(name, false, false, details);
            this.Element.dispatchEvent(e);
        }
    }
};
AlphaTab.Platform.JavaScript.JsWorkerApi = function (element, options){
    AlphaTab.Platform.JavaScript.JsApiBase.call(this, element, options);
};
AlphaTab.Platform.JavaScript.JsWorkerApi.prototype = {
    CreateScoreRenderer: function (settings){
        var renderer = new AlphaTab.Platform.JavaScript.WorkerScoreRenderer(settings);
        renderer.add_ScoreLoaded($CreateAnonymousDelegate(this, function (score){
            this.ScoreLoaded(score, false);
        }));
        renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
            this.Element.className = this.Element.className.replace(" loading", "").replace(" rendering", "");
        }));
        return renderer;
    },
    Load: function (data){
        this.Element.className += " loading";
        if (typeof(data) == "string"){
            var fileLoader = new AlphaTab.Platform.JavaScript.JsFileLoader();
            fileLoader.LoadBinaryAsync(data, $CreateAnonymousDelegate(this, function (b){
                this.Renderer.Load(b, this.TrackIndexes);
            }), $CreateAnonymousDelegate(this, function (e){
                console.error(e);
            }));
        }
        else {
            this.Renderer.Load(data, this.TrackIndexes);
        }
    },
    Render: function (){
        if (this.Renderer != null){
            this.Element.className += " rendering";
            this.Renderer.RenderMultiple(this.TrackIndexes);
        }
    },
    Tex: function (contents){
        this.Element.className += " loading";
        this.Renderer.Tex(contents);
    }
};
$Inherit(AlphaTab.Platform.JavaScript.JsWorkerApi, AlphaTab.Platform.JavaScript.JsApiBase);
AlphaTab.Platform.JavaScript.JsWorker = function (main, options){
    this._renderer = null;
    this._main = null;
    this._trackIndexes = null;
    this.Score = null;
    this._main = main;
    this._main.addEventListener("message", $CreateDelegate(this, this.HandleMessage), false);
    var settings = AlphaTab.Settings.FromJson(options);
    this._renderer = new AlphaTab.Rendering.ScoreRenderer(settings);
    this._renderer.add_PartialRenderFinished($CreateAnonymousDelegate(this, function (result){
        this._main.postMessage({
    cmd: "partialRenderFinished",
    result: result
}
);
    }));
    this._renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (result){
        this._main.postMessage({
    cmd: "renderFinished",
    result: result
}
);
    }));
    this._renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
        this._main.postMessage({
    cmd: "postRenderFinished",
    boundsLookup: this._renderer.BoundsLookup.ToJson()
}
);
    }));
    this._renderer.add_PreRender($CreateAnonymousDelegate(this, function (result){
        this._main.postMessage({
    cmd: "preRender",
    result: result
}
);
    }));
};
AlphaTab.Platform.JavaScript.JsWorker.prototype = {
    get_Tracks: function (){
        var tracks = [];
        for (var $i5 = 0,$t5 = this._trackIndexes,$l5 = $t5.length,track = $t5[$i5]; $i5 < $l5; $i5++, track = $t5[$i5]){
            if (track >= 0 && track < this.Score.Tracks.length){
                tracks.push(this.Score.Tracks[track]);
            }
        }
        if (tracks.length == 0 && this.Score.Tracks.length > 0){
            tracks.push(this.Score.Tracks[0]);
        }
        return tracks.slice(0);
    },
    HandleMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "load":
                this.Load(data["data"], data["indexes"]);
                break;
            case "invalidate":
                this._renderer.Invalidate();
                break;
            case "resize":
                this._renderer.Resize(data["width"]);
                break;
            case "tex":
                this.Tex(data["data"]);
                break;
            case "renderMultiple":
                this.RenderMultiple(data["data"]);
                break;
            case "updateSettings":
                this.UpdateSettings(data["settings"]);
                break;
        }
    },
    UpdateSettings: function (settings){
        this._renderer.UpdateSettings(AlphaTab.Settings.FromJson(settings));
    },
    RenderMultiple: function (trackIndexes){
        this._trackIndexes = trackIndexes;
        this.Render();
    },
    Tex: function (contents){
        try{
            var parser = new AlphaTab.Importer.AlphaTexImporter();
            var data = AlphaTab.IO.ByteBuffer.FromBuffer(AlphaTab.Platform.Std.StringToByteArray(contents));
            parser.Init(data);
            this._trackIndexes = new Int32Array([0]);
            this.ScoreLoaded(parser.ReadScore());
        }
        catch(e){
            this.Error(e);
        }
    },
    Load: function (data, trackIndexes){
        try{
            this._trackIndexes = trackIndexes;
            if ((data instanceof ArrayBuffer)){
                this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(new Uint8Array(data)));
            }
            else if ((data instanceof Uint8Array)){
                this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data));
            }
            else if (typeof(data) == "string"){
                AlphaTab.Importer.ScoreLoader.LoadScoreAsync(data, $CreateDelegate(this, this.ScoreLoaded), $CreateDelegate(this, this.Error));
            }
        }
        catch(e){
            this.Error(e);
        }
    },
    Error: function (e){
        this._main.postMessage({
    cmd: "error",
    exception: e
}
);
    },
    ScoreLoaded: function (score){
        this.Score = score;
        var json = new AlphaTab.Model.JsonConverter();
        this._main.postMessage({
    cmd: "loaded",
    score: json.ScoreToJsObject(score)
}
);
        this.Render();
    },
    Render: function (){
        this._renderer.RenderMultiple(this.get_Tracks());
    }
};
AlphaTab.Platform.JavaScript.Html5Canvas = function (){
    this._canvas = null;
    this._context = null;
    this._color = null;
    this._font = null;
    this._musicFont = null;
    this._Resources = null;
    var fontElement = document.createElement("span");
    fontElement.classList.add("at");
    document.body.appendChild(fontElement);
    var style = window.getComputedStyle(fontElement, null);
    this._musicFont = new AlphaTab.Platform.Model.Font(style.fontFamily, AlphaTab.Platform.Std.ParseFloat(style.fontSize), AlphaTab.Platform.Model.FontStyle.Plain);
};
AlphaTab.Platform.JavaScript.Html5Canvas.prototype = {
    get_Resources: function (){
        return this._Resources;
    },
    set_Resources: function (value){
        this._Resources = value;
    },
    OnPreRender: function (){
        // nothing to do
        return null;
    },
    OnRenderFinished: function (){
        // nothing to do
        return null;
    },
    BeginRender: function (width, height){
        this._canvas = document.createElement("canvas");
        this._canvas.width = width | 0;
        this._canvas.height = height | 0;
        this._canvas.style.width = width + "px";
        this._canvas.style.height = height + "px";
        this._context = this._canvas.getContext("2d");
        this._context.textBaseline = "top";
    },
    EndRender: function (){
        var result = this._canvas;
        this._canvas = null;
        return result;
    },
    get_Color: function (){
        return this._color;
    },
    set_Color: function (value){
        this._color = value;
        this._context.strokeStyle = value.RGBA;
        this._context.fillStyle = value.RGBA;
    },
    get_LineWidth: function (){
        return this._context.lineWidth;
    },
    set_LineWidth: function (value){
        this._context.lineWidth = value;
    },
    FillRect: function (x, y, w, h){
        this._context.fillRect(x - 0.5, y - 0.5, w, h);
    },
    StrokeRect: function (x, y, w, h){
        this._context.strokeRect(x - 0.5, y - 0.5, w, h);
    },
    BeginPath: function (){
        this._context.beginPath();
    },
    ClosePath: function (){
        this._context.closePath();
    },
    MoveTo: function (x, y){
        this._context.moveTo(x - 0.5, y - 0.5);
    },
    LineTo: function (x, y){
        this._context.lineTo(x - 0.5, y - 0.5);
    },
    QuadraticCurveTo: function (cpx, cpy, x, y){
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    },
    BezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y){
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    },
    FillCircle: function (x, y, radius){
        this._context.arc(x, y, radius, 0, 6.28318530717959, true);
        this.Fill();
    },
    Fill: function (){
        this._context.fill();
    },
    Stroke: function (){
        this._context.stroke();
    },
    get_Font: function (){
        return this._font;
    },
    set_Font: function (value){
        this._font = value;
        this._context.font = value.ToCssString(1);
    },
    get_TextAlign: function (){
        switch (this._context.textAlign){
            case "left":
                return AlphaTab.Platform.Model.TextAlign.Left;
            case "center":
                return AlphaTab.Platform.Model.TextAlign.Center;
            case "right":
                return AlphaTab.Platform.Model.TextAlign.Right;
            default:
                return AlphaTab.Platform.Model.TextAlign.Left;
        }
    },
    set_TextAlign: function (value){
        switch (value){
            case AlphaTab.Platform.Model.TextAlign.Left:
                this._context.textAlign = "left";
                break;
            case AlphaTab.Platform.Model.TextAlign.Center:
                this._context.textAlign = "center";
                break;
            case AlphaTab.Platform.Model.TextAlign.Right:
                this._context.textAlign = "right";
                break;
        }
    },
    get_TextBaseline: function (){
        switch (this._context.textBaseline){
            case "top":
                return AlphaTab.Platform.Model.TextBaseline.Top;
            case "middle":
                return AlphaTab.Platform.Model.TextBaseline.Middle;
            case "bottom":
                return AlphaTab.Platform.Model.TextBaseline.Bottom;
            default:
                return AlphaTab.Platform.Model.TextBaseline.Top;
        }
    },
    set_TextBaseline: function (value){
        switch (value){
            case AlphaTab.Platform.Model.TextBaseline.Top:
                this._context.textBaseline = "top";
                break;
            case AlphaTab.Platform.Model.TextBaseline.Middle:
                this._context.textBaseline = "middle";
                break;
            case AlphaTab.Platform.Model.TextBaseline.Bottom:
                this._context.textBaseline = "bottom";
                break;
        }
    },
    FillText: function (text, x, y){
        this._context.fillText(text, x, y);
    },
    MeasureText: function (text){
        return this._context.measureText(text).width;
    },
    FillMusicFontSymbol: function (x, y, scale, symbol){
        if (symbol == AlphaTab.Rendering.Glyphs.MusicFontSymbol.None){
            return;
        }
        var baseLine = this._context.textBaseline;
        var font = this._context.font;
        this._context.font = this._musicFont.ToCssString(scale);
        this._context.textBaseline = "middle";
        this._context.fillText(String.fromCharCode(symbol), x, y);
        this._context.textBaseline = baseLine;
        this._context.font = font;
    }
};
AlphaTab.Platform.JavaScript.JsApi = function (element, options){
    AlphaTab.Platform.JavaScript.JsApiBase.call(this, element, options);
};
AlphaTab.Platform.JavaScript.JsApi.prototype = {
    CreateScoreRenderer: function (settings){
        return new AlphaTab.Rendering.ScoreRenderer(settings);
    },
    Load: function (data){
        if ((data instanceof ArrayBuffer)){
            this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(new Uint8Array(data)), true);
        }
        else if ((data instanceof Uint8Array)){
            this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data), true);
        }
        else if (typeof(data) == "string"){
            AlphaTab.Importer.ScoreLoader.LoadScoreAsync(data, $CreateAnonymousDelegate(this, function (s){
                this.ScoreLoaded(s, true);
            }), $CreateAnonymousDelegate(this, function (e){
                console.error(e);
            }));
        }
    },
    Tex: function (contents){
        var parser = new AlphaTab.Importer.AlphaTexImporter();
        var data = AlphaTab.IO.ByteBuffer.FromBuffer(AlphaTab.Platform.Std.StringToByteArray(contents));
        parser.Init(data);
        this.ScoreLoaded(parser.ReadScore(), true);
    },
    Render: function (){
        if (this.Renderer == null)
            return;
        // check if font is loaded for HTML5 canvas
        if (true){
            var renderAction = null;
            renderAction = $CreateAnonymousDelegate(this, function (){
                // if font is not yet loaded, try again in 1 sec
                if (!AlphaTab.Environment.IsFontLoaded){
                    window.setTimeout($CreateAnonymousDelegate(this, function (){
                        renderAction();
                    }), 1000);
                }
                else {
                    // when font is finally loaded, start rendering
                    this.Renderer.RenderMultiple(this.get_Tracks());
                }
            });
            renderAction();
        }
        else {
            this.Renderer.RenderMultiple(this.get_Tracks());
        }
    }
};
$Inherit(AlphaTab.Platform.JavaScript.JsApi, AlphaTab.Platform.JavaScript.JsApiBase);
AlphaTab.Platform.JavaScript.JsFileLoader = function (){
};
AlphaTab.Platform.JavaScript.JsFileLoader.prototype = {
    LoadBinary: function (path){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.responseType = "arraybuffer";
        if (xhr.responseType != "arraybuffer"){
            // use VB Loader to load binary array
            var vbArr = VbAjaxLoader("GET",path);
            var fileContents = vbArr.toArray();
            // decode byte array to string
            var data = new Array();
            var i = 0;
            while (i < (fileContents.length - 1)){
                data.push(String.fromCharCode((fileContents[i])));
                i++;
            }
            var reader = AlphaTab.Platform.JavaScript.JsFileLoader.GetBytesFromString(data.join(''));
            return reader;
        }
        xhr.send();
        if (xhr.status == 200){
            var reader = new Uint8Array(xhr.response);
            return reader;
        }
        // Error handling
        if (xhr.status == 0){
            throw $CreateException(new AlphaTab.IO.FileLoadException("You are offline!!\n Please Check Your Network."), new Error());
        }
        if (xhr.status == 404){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Requested URL not found."), new Error());
        }
        if (xhr.status == 500){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Internel Server Error."), new Error());
        }
        if (xhr.statusText == "parsererror"){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Error.\nParsing JSON Request failed."), new Error());
        }
        if (xhr.statusText == "timeout"){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Request Time out."), new Error());
        }
        throw $CreateException(new AlphaTab.IO.FileLoadException("Unknow Error: " + xhr.responseText), new Error());
    },
    LoadBinaryAsync: function (path, success, error){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path);
        xhr.responseType = "arraybuffer";
        xhr.onreadystatechange = $CreateAnonymousDelegate(this, function (e){
            if (xhr.readyState == 4){
                if (xhr.status == 200){
                    var reader = new Uint8Array(xhr.response);
                    success(reader);
                }
                else if (xhr.status == 0){
                    error(new AlphaTab.IO.FileLoadException("You are offline!!\n Please Check Your Network."));
                }
                else if (xhr.status == 404){
                    error(new AlphaTab.IO.FileLoadException("Requested URL not found."));
                }
                else if (xhr.status == 500){
                    error(new AlphaTab.IO.FileLoadException("Internel Server Error."));
                }
                else if (xhr.statusText == "parsererror"){
                    error(new AlphaTab.IO.FileLoadException("Error.\nParsing JSON Request failed."));
                }
                else if (xhr.statusText == "timeout"){
                    error(new AlphaTab.IO.FileLoadException("Request Time out."));
                }
                else {
                    error(new AlphaTab.IO.FileLoadException("Unknow Error: " + xhr.responseText));
                }
            }
        });
        xhr.open("GET", path, true);
        xhr.responseType = "arraybuffer";
        // IE fallback
        if (xhr.responseType != "arraybuffer"){
            // use VB Loader to load binary array
            var vbArr = VbAjaxLoader("GET",path);
            var fileContents = vbArr.toArray();
            // decode byte array to string
            var data = new Array();
            var i = 0;
            while (i < (fileContents.length - 1)){
                data.push((fileContents[i]));
                i++;
            }
            var reader = AlphaTab.Platform.JavaScript.JsFileLoader.GetBytesFromString(data.join(''));
            success(reader);
            return;
        }
        xhr.send();
    }
};
AlphaTab.Platform.JavaScript.JsFileLoader.GetIEVersion = function (){
    var rv = -1;
    var appName = navigator.appName;
    var agent = navigator.userAgent;
    if (appName == "Microsoft Internet Explorer"){
        var r = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
        var m = r.exec(agent);
        if (m != null){
            rv = AlphaTab.Platform.Std.ParseFloat(m[1]);
        }
    }
    return rv;
};
AlphaTab.Platform.JavaScript.JsFileLoader.GetBytesFromString = function (s){
    var b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++){
        b[i] = s.charCodeAt(i);
    }
    return b;
};
AlphaTab.Platform.JavaScript.WorkerScoreRenderer = function (settings){
    this._worker = null;
    this.PreRender = null;
    this.PartialRenderFinished = null;
    this.RenderFinished = null;
    this.PostRenderFinished = null;
    this.ScoreLoaded = null;
    this.BoundsLookup = null;
    this.Score = null;
    this._worker = new Worker(this.CreateWorkerUrl());
    this._worker.postMessage({
        cmd: "initialize",
        settings: settings.ToJson()
    });
    this._worker.addEventListener("message", $CreateDelegate(this, this.HandleWorkerMessage), false);
};
AlphaTab.Platform.JavaScript.WorkerScoreRenderer.prototype = {
    CreateWorkerUrl: function (){
        var source = "self.onmessage = function(e) {\r\n                if(e.data.cmd == \'initialize\') {\r\n                    importScripts(e.data.settings.atRoot);\r\n                    new AlphaTab.Platform.JavaScript.JsWorker(self, e.data.settings);\r\n                }\r\n            }";
         window.URL = window.URL || window.webkitURL;;
         window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder  || window.MozBlobBuilder;;
        var blob;
        try{
            blob = new Blob([source], {
                type: "application/javascript"
            });
        }
        catch($$e2){
            var builder =  new BlobBuilder();
            builder.append(source);
            blob = builder.getBlob();
        }
        return  URL.createObjectURL(blob);
    },
    UpdateSettings: function (settings){
        this._worker.postMessage({
            cmd: "updateSettings",
            settings: settings.ToJson()
        });
    },
    Invalidate: function (){
        this._worker.postMessage({
            cmd: "invalidate"
        });
    },
    Resize: function (width){
        this._worker.postMessage({
            cmd: "resize",
            width: width
        });
    },
    Load: function (data, trackIndexes){
        this._worker.postMessage({
            cmd: "load",
            data: data,
            indexes: trackIndexes
        });
    },
    HandleWorkerMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "preRender":
                this.OnPreRender(data["result"]);
                break;
            case "partialRenderFinished":
                this.OnPartialRenderFinished(data["result"]);
                break;
            case "renderFinished":
                this.OnRenderFinished(data["result"]);
                break;
            case "postRenderFinished":
                this.BoundsLookup = AlphaTab.Rendering.Utils.BoundsLookup.FromJson(data["boundsLookup"], this.Score);
                this.OnPostRenderFinished();
                break;
            case "error":
                console.error(data["exception"]);
                break;
            case "loaded":
                var score = data["score"];
                if (score){
                var jsonConverter = new AlphaTab.Model.JsonConverter();
                score = jsonConverter.JsObjectToScore(score);
            }
                this.Score = score;
                this.OnLoaded(score);
                break;
        }
    },
    RenderMultiple: function (trackIndexes){
        this._worker.postMessage({
            cmd: "renderMultiple",
            data: trackIndexes
        });
    },
    add_PreRender: function (value){
        this.PreRender = $CombineDelegates(this.PreRender, value);
    },
    remove_PreRender: function (value){
        this.PreRender = $RemoveDelegate(this.PreRender, value);
    },
    OnPreRender: function (obj){
        var handler = this.PreRender;
        if (handler != null)
            handler(obj);
    },
    add_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $CombineDelegates(this.PartialRenderFinished, value);
    },
    remove_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $RemoveDelegate(this.PartialRenderFinished, value);
    },
    OnPartialRenderFinished: function (obj){
        var handler = this.PartialRenderFinished;
        if (handler != null)
            handler(obj);
    },
    add_RenderFinished: function (value){
        this.RenderFinished = $CombineDelegates(this.RenderFinished, value);
    },
    remove_RenderFinished: function (value){
        this.RenderFinished = $RemoveDelegate(this.RenderFinished, value);
    },
    OnRenderFinished: function (obj){
        var handler = this.RenderFinished;
        if (handler != null)
            handler(obj);
    },
    add_PostRenderFinished: function (value){
        this.PostRenderFinished = $CombineDelegates(this.PostRenderFinished, value);
    },
    remove_PostRenderFinished: function (value){
        this.PostRenderFinished = $RemoveDelegate(this.PostRenderFinished, value);
    },
    OnPostRenderFinished: function (){
        var handler = this.PostRenderFinished;
        if (handler != null)
            handler();
    },
    add_ScoreLoaded: function (value){
        this.ScoreLoaded = $CombineDelegates(this.ScoreLoaded, value);
    },
    remove_ScoreLoaded: function (value){
        this.ScoreLoaded = $RemoveDelegate(this.ScoreLoaded, value);
    },
    OnLoaded: function (score){
        var handler = this.ScoreLoaded;
        if (handler != null)
            handler(score);
    },
    Tex: function (contents){
        this._worker.postMessage({
            cmd: "tex",
            data: contents
        });
    }
};
AlphaTab.Platform.Std = function (){
};
$StaticConstructor(function (){
    AlphaTab.Platform.Std._parseXml = null;
});
AlphaTab.Platform.Std.ParseFloat = function (s){
    return parseFloat(s);
};
AlphaTab.Platform.Std.ParseInt = function (s){
    return parseInt(s);
};
AlphaTab.Platform.Std.CloneArray = function (array){
    return new Int32Array(0);
};
AlphaTab.Platform.Std.BlockCopy = function (src, srcOffset, dst, dstOffset, count){
};
AlphaTab.Platform.Std.IsNullOrWhiteSpace = function (s){
    return s == null || s.trim().length == 0;
};
AlphaTab.Platform.Std.StringFromCharCode = function (c){
    return "";
};
AlphaTab.Platform.Std.LoadXml = function (xml){
    if (AlphaTab.Platform.Std._parseXml == null){
        var parseXml = null;
         
                if (typeof window.DOMParser != "undefined")
                {
                    parseXml = function(xmlStr) {
                        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
                    };
                }
                else if (typeof window.ActiveXObject != "undefined" &&
                     new window.ActiveXObject("Microsoft.XMLDOM"))
                {
                    parseXml = function(xmlStr) {
                        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = "false";
                        xmlDoc.loadXML(xmlStr);
                        return xmlDoc;
                    };
                }
                else
                {
                    throw new Error("No XML parser found");
                }
                ;
        AlphaTab.Platform.Std._parseXml = parseXml;
    }
    return AlphaTab.Platform.Std._parseXml(xml);
};
AlphaTab.Platform.Std.ReadSignedByte = function (readable){
    var n = readable.ReadByte();
    if (n >= 128)
        return (n - 256);
    return n;
};
AlphaTab.Platform.Std.ToString = function (data){
    var s = new Array();
    var i = 0;
    while (i < data.length){
        var c = data[i++];
        if (c < 128){
            if (c == 0)
                break;
            s.push(String.fromCharCode(c));
        }
        else if (c < 224){
            s.push(String.fromCharCode(((c & 63) << 6) | (data[i++] & 127)));
        }
        else if (c < 240){
            s.push(String.fromCharCode(((c & 31) << 12) | ((data[i++] & 127) << 6) | (data[i++] & 127)));
        }
        else {
            var u = ((c & 15) << 18) | ((data[i++] & 127) << 12) | ((data[i++] & 127) << 6) | (data[i++] & 127);
            s.push(String.fromCharCode((u >> 18) + 55232));
            s.push(String.fromCharCode((u & 1023) | 56320));
        }
    }
    return s.join('');
};
AlphaTab.Platform.Std.StringToByteArray = function (contents){
    var byteArray = new Uint8Array(contents.length);
    for (var i = 0; i < contents.length; i++){
        byteArray[i] = contents.charCodeAt(i);
    }
    return byteArray;
};
AlphaTab.Platform.Std.S4 = function (){
    var num = Math.floor((1 + Math.random()) * 65536);
    return num.toString(16).substring(1);
};
AlphaTab.Platform.Std.NewGuid = function (){
    return AlphaTab.Platform.Std.S4() + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + AlphaTab.Platform.Std.S4() + AlphaTab.Platform.Std.S4();
};
AlphaTab.Platform.Std.IsException = function (T, e){
    return false;
};
AlphaTab.Platform.Std.Random = function (max){
    return Math.random() * max;
};
AlphaTab.Platform.Std.IsStringNumber = function (s, allowSign){
    if (s.length == 0)
        return false;
    var c = s.charCodeAt(0);
    return AlphaTab.Platform.Std.IsCharNumber(c, allowSign);
};
AlphaTab.Platform.Std.IsCharNumber = function (c, allowSign){
    return (allowSign && c == 45) || (c >= 48 && c <= 57);
};
AlphaTab.Platform.Std.IsWhiteSpace = function (c){
    return c == 32 || c == 11 || c == 13 || c == 10;
};
AlphaTab.Platform.Std.ToHexString = function (n){
    var s = "";
    var hexChars = "0123456789ABCDEF";
    do{
        s = String.fromCharCode(hexChars.charCodeAt((n & 15))) + s;
        n >>= 4;
    }
    while (n > 0)
    return s;
};
AlphaTab.Platform.Std.GetNodeValue = function (n){
    if (n.nodeType == AlphaTab.Xml.XmlNodeType.Element || n.nodeType == AlphaTab.Xml.XmlNodeType.Document){
        var txt = new Array();
        AlphaTab.Platform.Std.IterateChildren(n, function (c){
            txt.push(AlphaTab.Platform.Std.GetNodeValue(c));
        });
        return txt.join('').trim();
    }
    return n.nodeValue;
};
AlphaTab.Platform.Std.IterateChildren = function (n, action){
    for (var i = 0; i < n.childNodes.length; i++){
        action(n.childNodes[i]);
    }
};
AlphaTab.Rendering = AlphaTab.Rendering || {};
AlphaTab.Rendering.Utils = AlphaTab.Rendering.Utils || {};
AlphaTab.Rendering.Utils.BoundsLookup = function (){
    this._beatLookup = null;
    this._currentStaveGroup = null;
    this.StaveGroups = null;
    this.IsFinished = false;
    this.StaveGroups = [];
    this._beatLookup = {};
};
AlphaTab.Rendering.Utils.BoundsLookup.prototype = {
    ToJson: function (){
        var json = {};
        var staveGroups = [];
        json.StaveGroups = staveGroups;
        for (var $i10 = 0,$t10 = this.StaveGroups,$l10 = $t10.length,group = $t10[$i10]; $i10 < $l10; $i10++, group = $t10[$i10]){
            var g = {};
            g.VisualBounds = this.BoundsToJson(group.VisualBounds);
            g.RealBounds = this.BoundsToJson(group.RealBounds);
            g.Bars = [];
            for (var $i11 = 0,$t11 = group.Bars,$l11 = $t11.length,masterBar = $t11[$i11]; $i11 < $l11; $i11++, masterBar = $t11[$i11]){
                var mb = {};
                mb.VisualBounds = this.BoundsToJson(masterBar.VisualBounds);
                mb.RealBounds = this.BoundsToJson(masterBar.RealBounds);
                mb.Bars = [];
                for (var $i12 = 0,$t12 = masterBar.Bars,$l12 = $t12.length,bar = $t12[$i12]; $i12 < $l12; $i12++, bar = $t12[$i12]){
                    var b = {};
                    b.VisualBounds = this.BoundsToJson(bar.VisualBounds);
                    b.RealBounds = this.BoundsToJson(bar.RealBounds);
                    b.Beats = [];
                    for (var $i13 = 0,$t13 = bar.Beats,$l13 = $t13.length,beat = $t13[$i13]; $i13 < $l13; $i13++, beat = $t13[$i13]){
                        var bb = {};
                        bb.VisualBounds = this.BoundsToJson(beat.VisualBounds);
                        bb.RealBounds = this.BoundsToJson(beat.RealBounds);
                        bb.BeatIndex = beat.Beat.Index;
                        bb.VoiceIndex = beat.Beat.Voice.Index;
                        bb.BarIndex = beat.Beat.Voice.Bar.Index;
                        bb.StaffIndex = beat.Beat.Voice.Bar.Staff.Index;
                        bb.TrackIndex = beat.Beat.Voice.Bar.Staff.Track.Index;
                        b.Beats.push(bb);
                    }
                    mb.Bars.push(b);
                }
                g.Bars.push(mb);
            }
            staveGroups.push(g);
        }
        return json;
    },
    BoundsToJson: function (bounds){
        var json = {};
        json.X = bounds.X;
        json.Y = bounds.Y;
        json.W = bounds.W;
        json.H = bounds.H;
        return json;
    },
    Finish: function (){
        for (var i = 0; i < this.StaveGroups.length; i++){
            this.StaveGroups[i].Finish();
        }
        this.IsFinished = true;
    },
    AddStaveGroup: function (bounds){
        bounds.BoundsLookup = this;
        this.StaveGroups.push(bounds);
        this._currentStaveGroup = bounds;
    },
    AddMasterBar: function (bounds){
        bounds.StaveGroupBounds = this._currentStaveGroup;
        this._currentStaveGroup.AddBar(bounds);
    },
    AddBeat: function (bounds){
        this._beatLookup[bounds.Beat.Id] = bounds;
    },
    FindBeat: function (beat){
        var id = beat.Id;
        if (this._beatLookup.hasOwnProperty(id)){
            return this._beatLookup[id];
        }
        return null;
    },
    GetBeatAtPos: function (x, y){
        //
        // find a bar which matches in y-axis
        var bottom = 0;
        var top = this.StaveGroups.length - 1;
        var staveGroupIndex = -1;
        while (bottom <= top){
            var middle = ((top + bottom) / 2) | 0;
            var group = this.StaveGroups[middle];
            // found?
            if (y >= group.RealBounds.Y && y <= (group.RealBounds.Y + group.RealBounds.H)){
                staveGroupIndex = middle;
                break;
            }
            // search in lower half 
            if (y < group.RealBounds.Y){
                top = middle - 1;
            }
            else {
                bottom = middle + 1;
            }
        }
        // no bar found
        if (staveGroupIndex == -1)
            return null;
        // 
        // Find the matching bar in the row
        var staveGroup = this.StaveGroups[staveGroupIndex];
        var bar = staveGroup.FindBarAtPos(x);
        if (bar != null){
            return bar.FindBeatAtPos(x, y);
        }
        return null;
    }
};
AlphaTab.Rendering.Utils.BoundsLookup.FromJson = function (json, score){
    var lookup = new AlphaTab.Rendering.Utils.BoundsLookup();
    var staveGroups = json["StaveGroups"];
    for (var $i6 = 0,$l6 = staveGroups.length,staveGroup = staveGroups[$i6]; $i6 < $l6; $i6++, staveGroup = staveGroups[$i6]){
        var sg = new AlphaTab.Rendering.Utils.StaveGroupBounds();
        sg.VisualBounds = staveGroup.VisualBounds;
        sg.RealBounds = staveGroup.RealBounds;
        lookup.AddStaveGroup(sg);
        for (var $i7 = 0,$t7 = staveGroup.Bars,$l7 = $t7.length,masterBar = $t7[$i7]; $i7 < $l7; $i7++, masterBar = $t7[$i7]){
            var mb = new AlphaTab.Rendering.Utils.MasterBarBounds();
            mb.IsFirstOfLine = masterBar.IsFirstOfLine;
            mb.VisualBounds = masterBar.VisualBounds;
            mb.RealBounds = masterBar.RealBounds;
            sg.AddBar(mb);
            for (var $i8 = 0,$t8 = masterBar.Bars,$l8 = $t8.length,bar = $t8[$i8]; $i8 < $l8; $i8++, bar = $t8[$i8]){
                var b = new AlphaTab.Rendering.Utils.BarBounds();
                b.VisualBounds = bar.VisualBounds;
                b.RealBounds = bar.RealBounds;
                mb.AddBar(b);
                for (var $i9 = 0,$t9 = bar.Beats,$l9 = $t9.length,beat = $t9[$i9]; $i9 < $l9; $i9++, beat = $t9[$i9]){
                    var bb = new AlphaTab.Rendering.Utils.BeatBounds();
                    bb.VisualBounds = beat.VisualBounds;
                    bb.RealBounds = beat.RealBounds;
                    bb.Beat = score.Tracks[beat["TrackIndex"]].Staves[beat["StaffIndex"]].Bars[beat["BarIndex"]].Voices[beat["VoiceIndex"]].Beats[beat["BeatIndex"]];
                    b.AddBeat(bb);
                }
            }
        }
    }
    return lookup;
};
AlphaTab.Settings = function (){
    this.ScriptFile = null;
    this.Scale = 0;
    this.Width = 0;
    this.Height = 0;
    this.Engine = null;
    this.Layout = null;
    this.StretchForce = 0;
    this.ForcePianoFingering = false;
    this.Staves = null;
};
AlphaTab.Settings.prototype = {
    ToJson: function (){
        var json = {};
        json.scale = this.Scale;
        json.width = this.Width;
        json.height = this.Height;
        json.engine = this.Engine;
        json.stretchForce = this.StretchForce;
        json.forcePianoFingering = this.ForcePianoFingering;
        json.atRoot = this.ScriptFile;
        json.layout = {};
        json.layout.mode = this.Layout.Mode;
        json.layout.additionalSettings = {};
        for (var setting in this.Layout.AdditionalSettings){
            json.layout.additionalSettings[setting] = this.Layout.AdditionalSettings[setting];
        }
        var staves = [];
        json.staves = staves;
        for (var $i17 = 0,$t17 = this.Staves,$l17 = $t17.length,staff = $t17[$i17]; $i17 < $l17; $i17++, staff = $t17[$i17]){
            var s = {};
            s.id = staff.Id;
            s.additionalSettings = {};
            for (var additionalSetting in staff.AdditionalSettings){
                s.additionalSettings[additionalSetting] = staff.AdditionalSettings[additionalSetting];
            }
            staves.push(s);
        }
        return json;
    }
};
AlphaTab.Settings.FromJson = function (json){
    if ((json instanceof AlphaTab.Settings)){
        return json;
    }
    var settings = AlphaTab.Settings.get_Defaults();
    settings.ScriptFile = AlphaTab.Environment.ScriptFile;
    AlphaTab.Settings.FillFromJson(settings, json);
    return settings;
};
AlphaTab.Settings.FillFromJson = function (settings, json){
    if (!json)
        return;
    if ("scale"in json)
        settings.Scale = json.scale;
    if ("width"in json)
        settings.Width = json.width;
    if ("height"in json)
        settings.Height = json.height;
    if ("engine"in json)
        settings.Engine = json.engine;
    if ("stretchForce"in json)
        settings.StretchForce = json.stretchForce;
    if ("forcePianoFingering"in json)
        settings.ForcePianoFingering = json.forcePianoFingering;
    if ("atRoot"in json){
        settings.ScriptFile = json.atRoot;
        // append script name 
        if (!(settings.ScriptFile.lastIndexOf(".js")==(settings.ScriptFile.length-".js".length))){
            if (!(settings.ScriptFile.lastIndexOf("/")==(settings.ScriptFile.length-"/".length))){
                settings.ScriptFile += "/";
            }
            settings.ScriptFile += "AlphaTab.js";
        }
        if (!settings.ScriptFile.indexOf("http")==0 && !settings.ScriptFile.indexOf("https")==0){
            var root = new Array();
            root.push(window.location.protocol);
            root.push("//");
            root.push(window.location.hostname);
            if (window.location.port){
                root.push(":");
                root.push(window.location.port);
            }
            root.push(settings.ScriptFile);
            settings.ScriptFile = root.join('');
        }
    }
    else {
        settings.ScriptFile = AlphaTab.Environment.ScriptFile;
    }
    if ("layout"in json){
        if (typeof(json.layout) == "string"){
            settings.Layout.Mode = json.layout;
        }
        else {
            if (json.layout.mode)
                settings.Layout.Mode = json.layout.mode;
            if (json.layout.additionalSettings){
                var keys = Object.keys(json.layout.additionalSettings);
                for (var $i14 = 0,$l14 = keys.length,key = keys[$i14]; $i14 < $l14; $i14++, key = keys[$i14]){
                    settings.Layout.AdditionalSettings[key] = json.layout.additionalSettings[key];
                }
            }
        }
    }
    if ("staves"in json){
        settings.Staves = [];
        var keys = Object.keys(json.staves);
        for (var $i15 = 0,$l15 = keys.length,key = keys[$i15]; $i15 < $l15; $i15++, key = keys[$i15]){
            var val = json.staves[key];
            if (typeof(val) == "string"){
                settings.Staves.push(new AlphaTab.StaveSettings(val));
            }
            else {
                if (val.id){
                    var staveSettings = new AlphaTab.StaveSettings(val.id);
                    if (val.additionalSettings){
                        var keys2 = Object.keys(val.additionalSettings);
                        for (var $i16 = 0,$l16 = keys2.length,key2 = keys2[$i16]; $i16 < $l16; $i16++, key2 = keys2[$i16]){
                            staveSettings.AdditionalSettings[key2] = val.additionalSettings[key2];
                        }
                    }
                    settings.Staves.push(staveSettings);
                }
            }
        }
    }
};
AlphaTab.Settings.get_Defaults = function (){
    var settings = new AlphaTab.Settings();
    settings.Scale = 1;
    settings.StretchForce = 1;
    settings.Width = 950;
    settings.Height = 200;
    settings.Engine = "default";
    settings.Layout = AlphaTab.LayoutSettings.get_Defaults();
    settings.Staves = [];
    settings.Staves.push(new AlphaTab.StaveSettings("tempo"));
    settings.Staves.push(new AlphaTab.StaveSettings("triplet-feel"));
    settings.Staves.push(new AlphaTab.StaveSettings("marker"));
    settings.Staves.push(new AlphaTab.StaveSettings("text"));
    settings.Staves.push(new AlphaTab.StaveSettings("chords"));
    settings.Staves.push(new AlphaTab.StaveSettings("trill"));
    settings.Staves.push(new AlphaTab.StaveSettings("beat-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("note-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("alternate-endings"));
    settings.Staves.push(new AlphaTab.StaveSettings("score"));
    settings.Staves.push(new AlphaTab.StaveSettings("crescendo"));
    settings.Staves.push(new AlphaTab.StaveSettings("dynamics"));
    settings.Staves.push(new AlphaTab.StaveSettings("capo"));
    settings.Staves.push(new AlphaTab.StaveSettings("trill"));
    settings.Staves.push(new AlphaTab.StaveSettings("beat-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("note-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("tap"));
    settings.Staves.push(new AlphaTab.StaveSettings("fade-in"));
    settings.Staves.push(new AlphaTab.StaveSettings("harmonics"));
    settings.Staves.push(new AlphaTab.StaveSettings("let-ring"));
    settings.Staves.push(new AlphaTab.StaveSettings("palm-mute"));
    settings.Staves.push(new AlphaTab.StaveSettings("tab"));
    settings.Staves.push(new AlphaTab.StaveSettings("pick-stroke"));
    //settings.staves.Add(new StaveSettings("fingering"));
    return settings;
};
AlphaTab.Audio = AlphaTab.Audio || {};
AlphaTab.Audio.GeneralMidi = function (){
};
$StaticConstructor(function (){
    AlphaTab.Audio.GeneralMidi._values = null;
});
AlphaTab.Audio.GeneralMidi.GetValue = function (name){
    if (AlphaTab.Audio.GeneralMidi._values == null){
        AlphaTab.Audio.GeneralMidi._values = {};
        AlphaTab.Audio.GeneralMidi._values["acousticgrandpiano"] = 0;
        AlphaTab.Audio.GeneralMidi._values["brightacousticpiano"] = 1;
        AlphaTab.Audio.GeneralMidi._values["electricgrandpiano"] = 2;
        AlphaTab.Audio.GeneralMidi._values["honkytonkpiano"] = 3;
        AlphaTab.Audio.GeneralMidi._values["electricpiano1"] = 4;
        AlphaTab.Audio.GeneralMidi._values["electricpiano2"] = 5;
        AlphaTab.Audio.GeneralMidi._values["harpsichord"] = 6;
        AlphaTab.Audio.GeneralMidi._values["clavinet"] = 7;
        AlphaTab.Audio.GeneralMidi._values["celesta"] = 8;
        AlphaTab.Audio.GeneralMidi._values["glockenspiel"] = 9;
        AlphaTab.Audio.GeneralMidi._values["musicbox"] = 10;
        AlphaTab.Audio.GeneralMidi._values["vibraphone"] = 11;
        AlphaTab.Audio.GeneralMidi._values["marimba"] = 12;
        AlphaTab.Audio.GeneralMidi._values["xylophone"] = 13;
        AlphaTab.Audio.GeneralMidi._values["tubularbells"] = 14;
        AlphaTab.Audio.GeneralMidi._values["dulcimer"] = 15;
        AlphaTab.Audio.GeneralMidi._values["drawbarorgan"] = 16;
        AlphaTab.Audio.GeneralMidi._values["percussiveorgan"] = 17;
        AlphaTab.Audio.GeneralMidi._values["rockorgan"] = 18;
        AlphaTab.Audio.GeneralMidi._values["churchorgan"] = 19;
        AlphaTab.Audio.GeneralMidi._values["reedorgan"] = 20;
        AlphaTab.Audio.GeneralMidi._values["accordion"] = 21;
        AlphaTab.Audio.GeneralMidi._values["harmonica"] = 22;
        AlphaTab.Audio.GeneralMidi._values["tangoaccordion"] = 23;
        AlphaTab.Audio.GeneralMidi._values["acousticguitarnylon"] = 24;
        AlphaTab.Audio.GeneralMidi._values["acousticguitarsteel"] = 25;
        AlphaTab.Audio.GeneralMidi._values["electricguitarjazz"] = 26;
        AlphaTab.Audio.GeneralMidi._values["electricguitarclean"] = 27;
        AlphaTab.Audio.GeneralMidi._values["electricguitarmuted"] = 28;
        AlphaTab.Audio.GeneralMidi._values["overdrivenguitar"] = 29;
        AlphaTab.Audio.GeneralMidi._values["distortionguitar"] = 30;
        AlphaTab.Audio.GeneralMidi._values["guitarharmonics"] = 31;
        AlphaTab.Audio.GeneralMidi._values["acousticbass"] = 32;
        AlphaTab.Audio.GeneralMidi._values["electricbassfinger"] = 33;
        AlphaTab.Audio.GeneralMidi._values["electricbasspick"] = 34;
        AlphaTab.Audio.GeneralMidi._values["fretlessbass"] = 35;
        AlphaTab.Audio.GeneralMidi._values["slapbass1"] = 36;
        AlphaTab.Audio.GeneralMidi._values["slapbass2"] = 37;
        AlphaTab.Audio.GeneralMidi._values["synthbass1"] = 38;
        AlphaTab.Audio.GeneralMidi._values["synthbass2"] = 39;
        AlphaTab.Audio.GeneralMidi._values["violin"] = 40;
        AlphaTab.Audio.GeneralMidi._values["viola"] = 41;
        AlphaTab.Audio.GeneralMidi._values["cello"] = 42;
        AlphaTab.Audio.GeneralMidi._values["contrabass"] = 43;
        AlphaTab.Audio.GeneralMidi._values["tremolostrings"] = 44;
        AlphaTab.Audio.GeneralMidi._values["pizzicatostrings"] = 45;
        AlphaTab.Audio.GeneralMidi._values["orchestralharp"] = 46;
        AlphaTab.Audio.GeneralMidi._values["timpani"] = 47;
        AlphaTab.Audio.GeneralMidi._values["stringensemble1"] = 48;
        AlphaTab.Audio.GeneralMidi._values["stringensemble2"] = 49;
        AlphaTab.Audio.GeneralMidi._values["synthstrings1"] = 50;
        AlphaTab.Audio.GeneralMidi._values["synthstrings2"] = 51;
        AlphaTab.Audio.GeneralMidi._values["choiraahs"] = 52;
        AlphaTab.Audio.GeneralMidi._values["voiceoohs"] = 53;
        AlphaTab.Audio.GeneralMidi._values["synthvoice"] = 54;
        AlphaTab.Audio.GeneralMidi._values["orchestrahit"] = 55;
        AlphaTab.Audio.GeneralMidi._values["trumpet"] = 56;
        AlphaTab.Audio.GeneralMidi._values["trombone"] = 57;
        AlphaTab.Audio.GeneralMidi._values["tuba"] = 58;
        AlphaTab.Audio.GeneralMidi._values["mutedtrumpet"] = 59;
        AlphaTab.Audio.GeneralMidi._values["frenchhorn"] = 60;
        AlphaTab.Audio.GeneralMidi._values["brasssection"] = 61;
        AlphaTab.Audio.GeneralMidi._values["synthbrass1"] = 62;
        AlphaTab.Audio.GeneralMidi._values["synthbrass2"] = 63;
        AlphaTab.Audio.GeneralMidi._values["sopranosax"] = 64;
        AlphaTab.Audio.GeneralMidi._values["altosax"] = 65;
        AlphaTab.Audio.GeneralMidi._values["tenorsax"] = 66;
        AlphaTab.Audio.GeneralMidi._values["baritonesax"] = 67;
        AlphaTab.Audio.GeneralMidi._values["oboe"] = 68;
        AlphaTab.Audio.GeneralMidi._values["englishhorn"] = 69;
        AlphaTab.Audio.GeneralMidi._values["bassoon"] = 70;
        AlphaTab.Audio.GeneralMidi._values["clarinet"] = 71;
        AlphaTab.Audio.GeneralMidi._values["piccolo"] = 72;
        AlphaTab.Audio.GeneralMidi._values["flute"] = 73;
        AlphaTab.Audio.GeneralMidi._values["recorder"] = 74;
        AlphaTab.Audio.GeneralMidi._values["panflute"] = 75;
        AlphaTab.Audio.GeneralMidi._values["blownbottle"] = 76;
        AlphaTab.Audio.GeneralMidi._values["shakuhachi"] = 77;
        AlphaTab.Audio.GeneralMidi._values["whistle"] = 78;
        AlphaTab.Audio.GeneralMidi._values["ocarina"] = 79;
        AlphaTab.Audio.GeneralMidi._values["lead1square"] = 80;
        AlphaTab.Audio.GeneralMidi._values["lead2sawtooth"] = 81;
        AlphaTab.Audio.GeneralMidi._values["lead3calliope"] = 82;
        AlphaTab.Audio.GeneralMidi._values["lead4chiff"] = 83;
        AlphaTab.Audio.GeneralMidi._values["lead5charang"] = 84;
        AlphaTab.Audio.GeneralMidi._values["lead6voice"] = 85;
        AlphaTab.Audio.GeneralMidi._values["lead7fifths"] = 86;
        AlphaTab.Audio.GeneralMidi._values["lead8bassandlead"] = 87;
        AlphaTab.Audio.GeneralMidi._values["pad1newage"] = 88;
        AlphaTab.Audio.GeneralMidi._values["pad2warm"] = 89;
        AlphaTab.Audio.GeneralMidi._values["pad3polysynth"] = 90;
        AlphaTab.Audio.GeneralMidi._values["pad4choir"] = 91;
        AlphaTab.Audio.GeneralMidi._values["pad5bowed"] = 92;
        AlphaTab.Audio.GeneralMidi._values["pad6metallic"] = 93;
        AlphaTab.Audio.GeneralMidi._values["pad7halo"] = 94;
        AlphaTab.Audio.GeneralMidi._values["pad8sweep"] = 95;
        AlphaTab.Audio.GeneralMidi._values["fx1rain"] = 96;
        AlphaTab.Audio.GeneralMidi._values["fx2soundtrack"] = 97;
        AlphaTab.Audio.GeneralMidi._values["fx3crystal"] = 98;
        AlphaTab.Audio.GeneralMidi._values["fx4atmosphere"] = 99;
        AlphaTab.Audio.GeneralMidi._values["fx5brightness"] = 100;
        AlphaTab.Audio.GeneralMidi._values["fx6goblins"] = 101;
        AlphaTab.Audio.GeneralMidi._values["fx7echoes"] = 102;
        AlphaTab.Audio.GeneralMidi._values["fx8scifi"] = 103;
        AlphaTab.Audio.GeneralMidi._values["sitar"] = 104;
        AlphaTab.Audio.GeneralMidi._values["banjo"] = 105;
        AlphaTab.Audio.GeneralMidi._values["shamisen"] = 106;
        AlphaTab.Audio.GeneralMidi._values["koto"] = 107;
        AlphaTab.Audio.GeneralMidi._values["kalimba"] = 108;
        AlphaTab.Audio.GeneralMidi._values["bagpipe"] = 109;
        AlphaTab.Audio.GeneralMidi._values["fiddle"] = 110;
        AlphaTab.Audio.GeneralMidi._values["shanai"] = 111;
        AlphaTab.Audio.GeneralMidi._values["tinklebell"] = 112;
        AlphaTab.Audio.GeneralMidi._values["agogo"] = 113;
        AlphaTab.Audio.GeneralMidi._values["steeldrums"] = 114;
        AlphaTab.Audio.GeneralMidi._values["woodblock"] = 115;
        AlphaTab.Audio.GeneralMidi._values["taikodrum"] = 116;
        AlphaTab.Audio.GeneralMidi._values["melodictom"] = 117;
        AlphaTab.Audio.GeneralMidi._values["synthdrum"] = 118;
        AlphaTab.Audio.GeneralMidi._values["reversecymbal"] = 119;
        AlphaTab.Audio.GeneralMidi._values["guitarfretnoise"] = 120;
        AlphaTab.Audio.GeneralMidi._values["breathnoise"] = 121;
        AlphaTab.Audio.GeneralMidi._values["seashore"] = 122;
        AlphaTab.Audio.GeneralMidi._values["birdtweet"] = 123;
        AlphaTab.Audio.GeneralMidi._values["telephonering"] = 124;
        AlphaTab.Audio.GeneralMidi._values["helicopter"] = 125;
        AlphaTab.Audio.GeneralMidi._values["applause"] = 126;
        AlphaTab.Audio.GeneralMidi._values["gunshot"] = 127;
    }
    name = name.toLowerCase().replace(" ","");
    return AlphaTab.Audio.GeneralMidi._values.hasOwnProperty(name) ? AlphaTab.Audio.GeneralMidi._values[name] : 0;
};
AlphaTab.Audio.GeneralMidi.IsPiano = function (program){
    // 1 Acoustic Grand Piano
    // 2 Bright Acoustic Piano
    // 3 Electric Grand Piano
    // 4 Honky - tonk Piano
    // 5 Electric Piano 1
    // 6 Electric Piano 2
    // 7 Harpsichord
    // 8 Clavi
    // 17 Drawbar Organ
    // 18 Percussive Organ
    // 19 Rock Organ
    // 20 Church Organ
    // 21 Reed Organ
    // 22 Accordion
    // 23 Harmonica
    // 24 Tango Accordion
    return program <= 8 || (program >= 17 && program <= 24);
};
AlphaTab.Audio.Generator = AlphaTab.Audio.Generator || {};
AlphaTab.Audio.Generator.MidiFileGenerator = function (score, handler, generateMetronome){
    this._score = null;
    this._handler = null;
    this._currentTempo = 0;
    this.GenerateMetronome = false;
    this.TickLookup = null;
    this._score = score;
    this._currentTempo = this._score.Tempo;
    this._handler = handler;
    this.GenerateMetronome = generateMetronome;
    this.TickLookup = new AlphaTab.Audio.Model.MidiTickLookup();
};
AlphaTab.Audio.Generator.MidiFileGenerator.prototype = {
    Generate: function (){
        // initialize tracks
        for (var i = 0,j = this._score.Tracks.length; i < j; i++){
            this.GenerateTrack(this._score.Tracks[i]);
        }
        var controller = new AlphaTab.Audio.Generator.MidiPlaybackController(this._score);
        var previousMasterBar = null;
        // store the previous played bar for repeats
        while (!controller.get_Finished()){
            var index = controller.Index;
            var bar = this._score.MasterBars[index];
            var currentTick = controller.CurrentTick;
            controller.ProcessCurrent();
            if (controller.ShouldPlay){
                this.GenerateMasterBar(bar, previousMasterBar, currentTick);
                for (var i = 0,j = this._score.Tracks.length; i < j; i++){
                    var track = this._score.Tracks[i];
                    for (var k = 0,l = track.Staves.length; k < l; k++){
                        var staff = track.Staves[k];
                        if (index < staff.Bars.length){
                            this.GenerateBar(staff.Bars[index], currentTick);
                        }
                    }
                }
            }
            controller.MoveNext();
            previousMasterBar = bar;
        }
        for (var i = 0,j = this._score.Tracks.length; i < j; i++){
            this._handler.FinishTrack(this._score.Tracks[i].Index, controller.CurrentTick);
        }
        this.TickLookup.Finish();
    },
    GenerateTrack: function (track){
        // channel
        this.GenerateChannel(track, track.PlaybackInfo.PrimaryChannel, track.PlaybackInfo);
        if (track.PlaybackInfo.PrimaryChannel != track.PlaybackInfo.SecondaryChannel){
            this.GenerateChannel(track, track.PlaybackInfo.SecondaryChannel, track.PlaybackInfo);
        }
    },
    GenerateChannel: function (track, channel, playbackInfo){
        var volume = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(playbackInfo.Volume);
        var balance = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(playbackInfo.Balance);
        this._handler.AddControlChange(track.Index, 0, channel, 7, volume);
        this._handler.AddControlChange(track.Index, 0, channel, 10, balance);
        this._handler.AddControlChange(track.Index, 0, channel, 11, 127);
        // set parameter that is being updated (0) -> PitchBendRangeCoarse
        this._handler.AddControlChange(track.Index, 0, channel, 100, 0);
        this._handler.AddControlChange(track.Index, 0, channel, 101, 0);
        // Set PitchBendRangeCoarse to 12
        this._handler.AddControlChange(track.Index, 0, channel, 38, 0);
        this._handler.AddControlChange(track.Index, 0, channel, 6, 12);
        this._handler.AddProgramChange(track.Index, 0, channel, playbackInfo.Program);
    },
    GenerateMasterBar: function (masterBar, previousMasterBar, currentTick){
        // time signature
        if (previousMasterBar == null || previousMasterBar.TimeSignatureDenominator != masterBar.TimeSignatureDenominator || previousMasterBar.TimeSignatureNumerator != masterBar.TimeSignatureNumerator){
            this._handler.AddTimeSignature(currentTick, masterBar.TimeSignatureNumerator, masterBar.TimeSignatureDenominator);
        }
        // tempo
        if (previousMasterBar == null){
            this._handler.AddTempo(currentTick, masterBar.Score.Tempo);
            this._currentTempo = masterBar.Score.Tempo;
        }
        else if (masterBar.TempoAutomation != null){
            this._handler.AddTempo(currentTick, masterBar.TempoAutomation.Value | 0);
            this._currentTempo = ((masterBar.TempoAutomation.Value)) | 0;
        }
        // metronome
        if (this.GenerateMetronome){
            var start = currentTick;
            var length = AlphaTab.Audio.MidiUtils.ValueToTicks(masterBar.TimeSignatureDenominator);
            for (var i = 0; i < masterBar.TimeSignatureNumerator; i++){
                this._handler.AddMetronome(start, length);
                start += length;
            }
        }
        var masterBarLookup = new AlphaTab.Audio.Model.MasterBarTickLookup();
        masterBarLookup.MasterBar = masterBar;
        masterBarLookup.Start = currentTick;
        masterBarLookup.End = masterBarLookup.Start + masterBar.CalculateDuration();
        this.TickLookup.AddMasterBar(masterBarLookup);
    },
    GenerateBar: function (bar, barStartTick){
        for (var i = 0,j = bar.Voices.length; i < j; i++){
            this.GenerateVoice(bar.Voices[i], barStartTick);
        }
    },
    GenerateVoice: function (voice, barStartTick){
        if (voice.get_IsEmpty())
            return;
        for (var i = 0,j = voice.Beats.length; i < j; i++){
            this.GenerateBeat(voice.Beats[i], barStartTick);
        }
    },
    GenerateBeat: function (beat, barStartTick){
        // TODO: take care of tripletfeel 
        var beatStart = beat.Start;
        var duration = beat.CalculateDuration();
        var beatLookup = new AlphaTab.Audio.Model.BeatTickLookup();
        beatLookup.Start = barStartTick + beatStart;
        beatLookup.End = barStartTick + beatStart + duration;
        beatLookup.Beat = beat;
        this.TickLookup.AddBeat(beatLookup);
        var track = beat.Voice.Bar.Staff.Track;
        for (var i = 0,j = beat.Automations.length; i < j; i++){
            this.GenerateAutomation(beat, beat.Automations[i], barStartTick);
        }
        if (beat.get_IsRest()){
            this._handler.AddRest(track.Index, barStartTick + beatStart, track.PlaybackInfo.PrimaryChannel);
        }
        else {
            var brushInfo = this.GetBrushInfo(beat);
            for (var i = 0,j = beat.Notes.length; i < j; i++){
                var n = beat.Notes[i];
                this.GenerateNote(n, barStartTick + beatStart, duration, brushInfo);
            }
        }
        if (beat.Vibrato != AlphaTab.Model.VibratoType.None){
            var phaseLength = 240;
            // ticks
            var bendAmplitude = 3;
            this.GenerateVibratorWithParams(beat.Voice.Bar.Staff.Track, barStartTick + beatStart, beat.CalculateDuration(), phaseLength, bendAmplitude);
        }
    },
    GenerateNote: function (note, beatStart, beatDuration, brushInfo){
        var track = note.Beat.Voice.Bar.Staff.Track;
        var noteKey = note.get_RealValue();
        var brushOffset = note.get_IsStringed() && note.String <= brushInfo.length ? brushInfo[note.String - 1] : 0;
        var noteStart = beatStart + brushOffset;
        var noteDuration = this.GetNoteDuration(note, beatDuration) - brushOffset;
        var dynamicValue = this.GetDynamicValue(note);
        // TODO: enable second condition after whammy generation is implemented
        if (!note.get_HasBend()){
            // reset bend 
            this._handler.AddBend(track.Index, noteStart, track.PlaybackInfo.PrimaryChannel, 64);
        }
        // 
        // Fade in
        if (note.Beat.FadeIn){
            this.GenerateFadeIn(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        // TODO: grace notes?
        //
        // Trill
        if (note.get_IsTrill() && !track.IsPercussion){
            this.GenerateTrill(note, noteStart, noteDuration, noteKey, dynamicValue);
            // no further generation needed
            return;
        }
        //
        // Tremolo Picking
        if (note.Beat.get_IsTremolo()){
            this.GenerateTremoloPicking(note, noteStart, noteDuration, noteKey, dynamicValue);
            // no further generation needed
            return;
        }
        //
        // All String Bending/Variation effects
        if (note.get_HasBend()){
            this.GenerateBend(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.Beat.get_HasWhammyBar()){
            this.GenerateWhammyBar(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.SlideType != AlphaTab.Model.SlideType.None){
            this.GenerateSlide(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.Vibrato != AlphaTab.Model.VibratoType.None){
            this.GenerateVibrato(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        //
        // Harmonics
        if (note.HarmonicType != AlphaTab.Model.HarmonicType.None){
            this.GenerateHarmonic(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        if (!note.IsTieDestination){
            this._handler.AddNote(track.Index, noteStart, noteDuration, noteKey, dynamicValue, track.PlaybackInfo.PrimaryChannel);
        }
    },
    GetNoteDuration: function (note, beatDuration){
        return this.ApplyDurationEffects(note, beatDuration);
        // a bit buggy:
        /*
        var lastNoteEnd = note.beat.start - note.beat.calculateDuration();
        var noteDuration = beatDuration;
        var currentBeat = note.beat.nextBeat;
        
        var letRingSuspend = false;
        
        // find the real note duration (let ring)
        while (currentBeat != null)
        {
        if (currentBeat.isRest())
        {
        return applyDurationEffects(note, noteDuration);
        }
        
        var letRing = currentBeat.voice == note.beat.voice && note.isLetRing;
        var letRingApplied = false;
        
        // we look for a note which still has let ring on or is a tie destination
        // in this case we increate the first played note
        var noteOnSameString = currentBeat.getNoteOnString(note.string);
        if (noteOnSameString != null)
        {
        // quit letring?
        if (!noteOnSameString.isTieDestination)
        {
        letRing = false; 
        letRingSuspend = true;
        
        // no let ring anymore, we are done
        if (!noteOnSameString.isLetRing)
        {
        return applyDurationEffects(note, noteDuration);
        }
        }
        
        // increase duration 
        letRingApplied = true;
        noteDuration += (currentBeat.start - lastNoteEnd) + noteOnSameString.beat.calculateDuration();
        lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
        }
        
        // if letRing is still active? (no note on the same string found)
        // and we didn't apply it already and of course it's not already stopped 
        // then we increase our duration as well
        if (letRing && !letRingApplied && !letRingSuspend)
        {
        noteDuration += (currentBeat.start - lastNoteEnd) + currentBeat.calculateDuration();
        lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
        }
        
        
        currentBeat = currentBeat.nextBeat;
        }
        
        return applyDurationEffects(note, noteDuration);*/
    },
    ApplyDurationEffects: function (note, duration){
        if (note.IsDead){
            return this.ApplyStaticDuration(30, duration);
        }
        if (note.IsPalmMute){
            return this.ApplyStaticDuration(80, duration);
        }
        if (note.IsStaccato){
            return ((duration / 2) | 0);
        }
        if (note.IsTieOrigin){
            var endNote = note.TieDestination;
            // for the initial start of the tie calculate absolute duration from start to end note
            if (!note.IsTieDestination){
                var startTick = note.Beat.get_AbsoluteStart();
                var endTick = endNote.Beat.get_AbsoluteStart() + this.GetNoteDuration(endNote, endNote.Beat.CalculateDuration());
                return endTick - startTick;
            }
            else {
                // for continuing ties, take the current duration + the one from the destination 
                // this branch will be entered as part of the recusion of the if branch
                return duration + this.GetNoteDuration(endNote, endNote.Beat.CalculateDuration());
            }
        }
        return duration;
    },
    ApplyStaticDuration: function (duration, maximum){
        var value = ((this._currentTempo * duration) / 60) | 0;
        return Math.min(value, maximum);
    },
    GetDynamicValue: function (note){
        var dynamicValue = note.Dynamic;
        // more silent on hammer destination
        if (!note.Beat.Voice.Bar.Staff.Track.IsPercussion && note.HammerPullOrigin != null){
            dynamicValue--;
        }
        // more silent on ghost notes
        if (note.IsGhost){
            dynamicValue--;
        }
        // louder on accent
        switch (note.Accentuated){
            case AlphaTab.Model.AccentuationType.Normal:
                dynamicValue++;
                break;
            case AlphaTab.Model.AccentuationType.Heavy:
                dynamicValue += 2;
                break;
        }
        return dynamicValue;
    },
    GenerateFadeIn: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Staff.Track;
        var endVolume = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(track.PlaybackInfo.Volume);
        var volumeFactor = endVolume / noteDuration;
        var tickStep = 120;
        var steps = ((noteDuration / tickStep) | 0);
        var endTick = noteStart + noteDuration;
        for (var i = steps - 1; i >= 0; i--){
            var tick = endTick - (i * tickStep);
            var volume = (tick - noteStart) * volumeFactor;
            if (i == steps - 1){
                this._handler.AddControlChange(track.Index, noteStart, track.PlaybackInfo.PrimaryChannel, 7, volume);
                this._handler.AddControlChange(track.Index, noteStart, track.PlaybackInfo.SecondaryChannel, 7, volume);
            }
            this._handler.AddControlChange(track.Index, tick, track.PlaybackInfo.PrimaryChannel, 7, volume);
            this._handler.AddControlChange(track.Index, tick, track.PlaybackInfo.SecondaryChannel, 7, volume);
        }
    },
    GenerateHarmonic: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        // TODO
    },
    GenerateVibrato: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var phaseLength = 480;
        // ticks
        var bendAmplitude = 2;
        var track = note.Beat.Voice.Bar.Staff.Track;
        this.GenerateVibratorWithParams(track, noteStart, noteDuration, phaseLength, bendAmplitude);
    },
    GenerateVibratorWithParams: function (track, noteStart, noteDuration, phaseLength, bendAmplitude){
        var resolution = 16;
        var phaseHalf = (phaseLength / 2) | 0;
        // 1st Phase stays at bend 0, 
        // then we have a sine wave with the given amplitude and phase length
        noteStart += phaseLength;
        var noteEnd = noteStart + noteDuration;
        while (noteStart < noteEnd){
            var phase = 0;
            var phaseDuration = noteStart + phaseLength < noteEnd ? phaseLength : noteEnd - noteStart;
            while (phase < phaseDuration){
                var bend = bendAmplitude * Math.sin(phase * 3.14159265358979 / phaseHalf);
                this._handler.AddBend(track.Index, noteStart + phase, track.PlaybackInfo.PrimaryChannel, (64 + bend));
                phase += resolution;
            }
            noteStart += phaseLength;
        }
    },
    GenerateSlide: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        // TODO 
    },
    GenerateWhammyBar: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        // TODO 
    },
    GenerateBend: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Staff.Track;
        var ticksPerPosition = (noteDuration) / 60;
        for (var i = 0; i < note.BendPoints.length - 1; i++){
            var currentPoint = note.BendPoints[i];
            var nextPoint = note.BendPoints[i + 1];
            // calculate the midi pitchbend values start and end values
            var currentBendValue = 64 + (currentPoint.Value * 2.75);
            var nextBendValue = 64 + (nextPoint.Value * 2.75);
            // how many midi ticks do we have to spend between this point and the next one?
            var ticksBetweenPoints = ticksPerPosition * (nextPoint.Offset - currentPoint.Offset);
            // we will generate one pitchbend message for each value
            // for this we need to calculate how many ticks to offset per value
            var ticksPerValue = ticksBetweenPoints / Math.abs(nextBendValue - currentBendValue);
            var tick = noteStart + (ticksPerPosition * currentPoint.Offset);
            // bend up
            if (currentBendValue < nextBendValue){
                while (currentBendValue <= nextBendValue){
                    this._handler.AddBend(track.Index, tick | 0, track.PlaybackInfo.PrimaryChannel, Math.round(currentBendValue));
                    currentBendValue++;
                    tick += ticksPerValue;
                }
            }
            else if (currentBendValue > nextBendValue){
                while (currentBendValue >= nextBendValue){
                    this._handler.AddBend(track.Index, tick | 0, track.PlaybackInfo.PrimaryChannel, Math.round(currentBendValue));
                    currentBendValue--;
                    tick += ticksPerValue;
                }
            }
        }
    },
    GenerateTrill: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Staff.Track;
        var trillKey = note.get_StringTuning() + note.get_TrillFret();
        var trillLength = AlphaTab.Audio.MidiUtils.ToTicks(note.TrillSpeed);
        var realKey = true;
        var tick = noteStart;
        while (tick + 10 < (noteStart + noteDuration)){
            // only the rest on last trill play
            if ((tick + trillLength) >= (noteStart + noteDuration)){
                trillLength = (noteStart + noteDuration) - tick;
            }
            this._handler.AddNote(track.Index, tick, trillLength, (realKey ? trillKey : noteKey), dynamicValue, track.PlaybackInfo.PrimaryChannel);
            realKey = !realKey;
            tick += trillLength;
        }
    },
    GenerateTremoloPicking: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Staff.Track;
        var tpLength = AlphaTab.Audio.MidiUtils.ToTicks(note.Beat.TremoloSpeed);
        var tick = noteStart;
        while (tick + 10 < (noteStart + noteDuration)){
            // only the rest on last trill play
            if ((tick + tpLength) >= (noteStart + noteDuration)){
                tpLength = (noteStart + noteDuration) - tick;
            }
            this._handler.AddNote(track.Index, tick, tpLength, noteKey, dynamicValue, track.PlaybackInfo.PrimaryChannel);
            tick += tpLength;
        }
    },
    GetBrushInfo: function (beat){
        var brushInfo = new Int32Array(beat.Voice.Bar.Staff.Track.Tuning.length);
        if (beat.BrushType != AlphaTab.Model.BrushType.None){
            // 
            // calculate the number of  
            // a mask where the single bits indicate the strings used
            var stringUsed = 0;
            for (var i = 0,j = beat.Notes.length; i < j; i++){
                var n = beat.Notes[i];
                if (n.IsTieDestination)
                    continue;
                stringUsed |= 1 << (n.String - 1);
            }
            //
            // calculate time offset for all strings
            if (beat.Notes.length > 0){
                var brushMove = 0;
                var brushIncrement = this.GetBrushIncrement(beat);
                for (var i = 0,j = beat.Voice.Bar.Staff.Track.Tuning.length; i < j; i++){
                    var index = (beat.BrushType == AlphaTab.Model.BrushType.ArpeggioDown || beat.BrushType == AlphaTab.Model.BrushType.BrushDown) ? i : ((brushInfo.length - 1) - i);
                    if ((stringUsed & (1 << index)) != 0){
                        brushInfo[index] = brushMove;
                        brushMove = brushIncrement;
                    }
                }
            }
        }
        return brushInfo;
    },
    GetBrushIncrement: function (beat){
        if (beat.BrushDuration == 0)
            return 0;
        var duration = beat.CalculateDuration();
        if (duration == 0)
            return 0;
        return (((duration / 8) * (4 / beat.BrushDuration))) | 0;
    },
    GenerateAutomation: function (beat, automation, startMove){
        switch (automation.Type){
            case AlphaTab.Model.AutomationType.Instrument:
                this._handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel, (automation.Value));
                this._handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel, (automation.Value));
                break;
            case AlphaTab.Model.AutomationType.Balance:
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel, 10, (automation.Value));
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel, 10, (automation.Value));
                break;
            case AlphaTab.Model.AutomationType.Volume:
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel, 7, (automation.Value));
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel, 7, (automation.Value));
                break;
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Audio.Generator.MidiFileGenerator.DefaultBend = 64;
    AlphaTab.Audio.Generator.MidiFileGenerator.DefaultBendSemitone = 2.75;
});
AlphaTab.Audio.Generator.MidiFileGenerator.GenerateMidiFile = function (score, generateMetronome){
    var midiFile = new AlphaTab.Audio.Model.MidiFile();
    // create score tracks + metronometrack
    for (var i = 0,j = score.Tracks.length; i < j; i++){
        midiFile.CreateTrack();
    }
    midiFile.InfoTrack = 0;
    var handler = new AlphaTab.Audio.Generator.MidiFileHandler(midiFile);
    var generator = new AlphaTab.Audio.Generator.MidiFileGenerator(score, handler, generateMetronome);
    generator.Generate();
    midiFile.TickLookup = generator.TickLookup;
    return midiFile;
};
AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort = function (data){
    var value = Math.max(-32768, Math.min(32767, (data * 8) - 1));
    return (Math.max(value, -1)) + 1;
};
AlphaTab.Audio.Generator.MidiFileHandler = function (midiFile){
    this._midiFile = null;
    this._metronomeTrack = 0;
    this._midiFile = midiFile;
    this._metronomeTrack = -1;
};
AlphaTab.Audio.Generator.MidiFileHandler.prototype = {
    AddEvent: function (track, tick, message){
        this._midiFile.Tracks[track].AddEvent(new AlphaTab.Audio.Model.MidiEvent(tick, message));
    },
    MakeCommand: function (command, channel){
        return ((command & 240) | (channel & 15));
    },
    AddTimeSignature: function (tick, timeSignatureNumerator, timeSignatureDenominator){
        var denominatorIndex = 0;
        while ((timeSignatureDenominator = (timeSignatureDenominator >> 1)) > 0){
            denominatorIndex++;
        }
        this.AddEvent(this._midiFile.InfoTrack, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage(88, new Uint8Array([(timeSignatureNumerator & 255), (denominatorIndex & 255), 48, 8])));
    },
    AddRest: function (track, tick, channel){
        this.AddEvent(track, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildSysExMessage(new Uint8Array([0])));
    },
    AddNote: function (track, start, length, key, dynamicValue, channel){
        var velocity = AlphaTab.Audio.MidiUtils.DynamicToVelocity(dynamicValue);
        this.AddEvent(track, start, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(144, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(key), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(velocity)])));
        this.AddEvent(track, start + length, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(128, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(key), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(velocity)])));
    },
    AddControlChange: function (track, tick, channel, controller, value){
        this.AddEvent(track, tick, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(176, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(controller), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(value)])));
    },
    AddProgramChange: function (track, tick, channel, program){
        this.AddEvent(track, tick, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(192, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(program)])));
    },
    AddTempo: function (tick, tempo){
        // bpm -> microsecond per quarter note
        var tempoInUsq = ((60000000 / tempo) | 0);
        this.AddEvent(this._midiFile.InfoTrack, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage(81, new Uint8Array([((tempoInUsq >> 16) & 255), ((tempoInUsq >> 8) & 255), (tempoInUsq & 255)])));
    },
    FinishTrack: function (track, tick){
        this.AddEvent(this._midiFile.InfoTrack, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage(47, new Uint8Array(0)));
    },
    AddBend: function (track, tick, channel, value){
        this.AddEvent(track, tick, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(224, channel), 0, AlphaTab.Audio.Generator.MidiFileHandler.FixValue(value)])));
    },
    AddMetronome: function (start, length){
        if (this._metronomeTrack == -1){
            this._midiFile.CreateTrack();
            this._metronomeTrack = this._midiFile.Tracks.length - 1;
        }
        this.AddNote(this._metronomeTrack, start, length, 37, AlphaTab.Model.DynamicValue.F, 9);
    }
};
$StaticConstructor(function (){
    AlphaTab.Audio.Generator.MidiFileHandler.DefaultMetronomeKey = 37;
    AlphaTab.Audio.Generator.MidiFileHandler.DefaultDurationDead = 30;
    AlphaTab.Audio.Generator.MidiFileHandler.DefaultDurationPalmMute = 80;
    AlphaTab.Audio.Generator.MidiFileHandler.RestMessage = 0;
});
AlphaTab.Audio.Generator.MidiFileHandler.FixValue = function (value){
    if (value > 127)
        return 127;
    return value;
};
AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage = function (metaType, data){
    var meta = AlphaTab.IO.ByteBuffer.Empty();
    meta.WriteByte(255);
    meta.WriteByte((metaType & 255));
    AlphaTab.Audio.Generator.MidiFileHandler.WriteVarInt(meta, data.length);
    meta.Write(data, 0, data.length);
    return new AlphaTab.Audio.Model.MidiMessage(meta.ToArray());
};
AlphaTab.Audio.Generator.MidiFileHandler.WriteVarInt = function (data, v){
    var n = 0;
    var array = new Uint8Array(4);
    do{
        array[n++] = ((v & 127) & 255);
        v >>= 7;
    }
    while (v > 0)
    while (n > 0){
        n--;
        if (n > 0)
            data.WriteByte(((array[n] | 128) & 255));
        else
            data.WriteByte(array[n]);
    }
};
AlphaTab.Audio.Generator.MidiFileHandler.BuildSysExMessage = function (data){
    var sysex = AlphaTab.IO.ByteBuffer.Empty();
    sysex.WriteByte(240);
    // status 
    AlphaTab.Audio.Generator.MidiFileHandler.WriteVarInt(sysex, data.length + 2);
    // write length of data
    sysex.WriteByte(0);
    // manufacturer id
    sysex.Write(data, 0, data.length);
    // data
    sysex.WriteByte(247);
    // end of data
    return new AlphaTab.Audio.Model.MidiMessage(sysex.ToArray());
};
AlphaTab.Audio.Generator.MidiPlaybackController = function (score){
    this._score = null;
    this._repeatStartIndex = 0;
    this._repeatNumber = 0;
    this._repeatOpen = false;
    this.ShouldPlay = false;
    this.Index = 0;
    this.CurrentTick = 0;
    this._score = score;
    this.ShouldPlay = true;
    this.Index = 0;
    this.CurrentTick = 0;
};
AlphaTab.Audio.Generator.MidiPlaybackController.prototype = {
    get_Finished: function (){
        return this.Index >= this._score.MasterBars.length;
    },
    ProcessCurrent: function (){
        var masterBar = this._score.MasterBars[this.Index];
        var masterBarAlternateEndings = masterBar.AlternateEndings;
        // if the repeat group wasn't closed we reset the repeating 
        // on the last group opening
        if (!masterBar.RepeatGroup.IsClosed && masterBar.RepeatGroup.Openings[masterBar.RepeatGroup.Openings.length - 1] == masterBar){
            this._repeatNumber = 0;
            this._repeatOpen = false;
        }
        if ((masterBar.IsRepeatStart || masterBar.Index == 0) && this._repeatNumber == 0){
            this._repeatStartIndex = this.Index;
            this._repeatOpen = true;
        }
        else if (masterBar.IsRepeatStart){
            this.ShouldPlay = true;
        }
        // if we encounter an alternate ending
        if (this._repeatOpen && masterBarAlternateEndings > 0){
            // do we need to skip this section?
            if ((masterBarAlternateEndings & (1 << this._repeatNumber)) == 0){
                this.ShouldPlay = false;
            }
            else {
                this.ShouldPlay = true;
            }
        }
        if (this.ShouldPlay){
            this.CurrentTick += masterBar.CalculateDuration();
        }
    },
    MoveNext: function (){
        var masterBar = this._score.MasterBars[this.Index];
        var masterBarRepeatCount = masterBar.RepeatCount - 1;
        // if we encounter a repeat end 
        if (this._repeatOpen && (masterBarRepeatCount > 0)){
            // more repeats required?
            if (this._repeatNumber < masterBarRepeatCount){
                // jump to start
                this.Index = this._repeatStartIndex;
                this._repeatNumber++;
            }
            else {
                // no repeats anymore, jump after repeat end
                this._repeatNumber = 0;
                this._repeatOpen = false;
                this.ShouldPlay = true;
                this.Index++;
            }
        }
        else {
            this.Index++;
        }
    }
};
AlphaTab.Audio.MidiUtils = function (){
};
$StaticConstructor(function (){
    AlphaTab.Audio.MidiUtils.QuarterTime = 960;
    AlphaTab.Audio.MidiUtils.PercussionChannel = 9;
    AlphaTab.Audio.MidiUtils.MinVelocity = 15;
    AlphaTab.Audio.MidiUtils.VelocityIncrement = 16;
});
AlphaTab.Audio.MidiUtils.ToTicks = function (duration){
    return AlphaTab.Audio.MidiUtils.ValueToTicks(duration);
};
AlphaTab.Audio.MidiUtils.ValueToTicks = function (duration){
    return ((960 * (4 / duration))) | 0;
};
AlphaTab.Audio.MidiUtils.ApplyDot = function (ticks, doubleDotted){
    if (doubleDotted){
        return ticks + ((ticks / 4) | 0) * 3;
    }
    return ticks + (ticks / 2) | 0;
};
AlphaTab.Audio.MidiUtils.ApplyTuplet = function (ticks, numerator, denominator){
    return (ticks * denominator / numerator) | 0;
};
AlphaTab.Audio.MidiUtils.DynamicToVelocity = function (dyn){
    return (15 + ((dyn) * 16));
    // switch(dynamicValue)
    // {
    //     case PPP:   return (MinVelocity + (0 * VelocityIncrement));
    //     case PP:    return (MinVelocity + (1 * VelocityIncrement));
    //     case P:     return (MinVelocity + (2 * VelocityIncrement));
    //     case MP:    return (MinVelocity + (3 * VelocityIncrement));
    //     case MF:    return (MinVelocity + (4 * VelocityIncrement));
    //     case F:     return (MinVelocity + (5 * VelocityIncrement));
    //     case FF:    return (MinVelocity + (6 * VelocityIncrement));
    //     case FFF:   return (MinVelocity + (7 * VelocityIncrement));
    // }
};
AlphaTab.Audio.Model = AlphaTab.Audio.Model || {};
AlphaTab.Audio.Model.MidiController = {
    DataEntryCoarse: 6,
    VolumeCoarse: 7,
    PanCoarse: 10,
    ExpressionControllerCoarse: 11,
    DataEntryFine: 38,
    RegisteredParameterFine: 100,
    RegisteredParameterCourse: 101
};
AlphaTab.Audio.Model.MidiEvent = function (tick, message){
    this.Track = null;
    this.Tick = 0;
    this.Message = null;
    this.NextEvent = null;
    this.PreviousEvent = null;
    this.Tick = tick;
    this.Message = message;
};
AlphaTab.Audio.Model.MidiEvent.prototype = {
    get_DeltaTicks: function (){
        return this.PreviousEvent == null ? 0 : this.Tick - this.PreviousEvent.Tick;
    },
    WriteTo: function (s){
        this.WriteVariableInt(s, this.get_DeltaTicks());
        this.Message.WriteTo(s);
    },
    WriteVariableInt: function (s, value){
        var array = new Uint8Array(4);
        var n = 0;
        do{
            array[n++] = ((value & 127) & 255);
            value >>= 7;
        }
        while (value > 0)
        while (n > 0){
            n--;
            if (n > 0)
                s.WriteByte((array[n] | 128));
            else
                s.WriteByte(array[n]);
        }
    }
};
AlphaTab.Audio.Model.MidiFile = function (){
    this.TickLookup = null;
    this.Tracks = null;
    this.InfoTrack = 0;
    this.Tracks = [];
};
AlphaTab.Audio.Model.MidiFile.prototype = {
    CreateTrack: function (){
        var track = new AlphaTab.Audio.Model.MidiTrack();
        track.Index = this.Tracks.length;
        track.File = this;
        this.Tracks.push(track);
        return track;
    },
    WriteTo: function (s){
        // magic number "MThd" (0x4D546864)
        var b = new Uint8Array([77, 84, 104, 100]);
        s.Write(b, 0, b.length);
        // Header Length 6 (0x00000006)
        b = new Uint8Array([0, 0, 0, 6]);
        s.Write(b, 0, b.length);
        // format 
        b = new Uint8Array([0, 1]);
        s.Write(b, 0, b.length);
        // number of tracks
        var v = (this.Tracks.length) | 0;
        b = new Uint8Array([((v >> 8) & 255), (v & 255)]);
        s.Write(b, 0, b.length);
        v = 960;
        b = new Uint8Array([((v >> 8) & 255), (v & 255)]);
        s.Write(b, 0, b.length);
        for (var i = 0,j = this.Tracks.length; i < j; i++){
            this.Tracks[i].WriteTo(s);
        }
    }
};
AlphaTab.Audio.Model.MidiMessage = function (data){
    this.Event = null;
    this.Data = null;
    this.Data = data;
};
AlphaTab.Audio.Model.MidiMessage.prototype = {
    WriteTo: function (s){
        s.Write(this.Data, 0, this.Data.length);
    }
};
AlphaTab.Audio.Model.BeatTickLookup = function (){
    this.Start = 0;
    this.End = 0;
    this.Beat = null;
};
AlphaTab.Audio.Model.MasterBarTickLookup = function (){
    this.Start = 0;
    this.End = 0;
    this.MasterBar = null;
    this.BeatsPerTrack = null;
    this.BeatsPerTrack = {};
};
AlphaTab.Audio.Model.MasterBarTickLookup.prototype = {
    Finish: function (){
        for (var track in this.BeatsPerTrack){
            this.BeatsPerTrack[track].sort($CreateAnonymousDelegate(this, function (a, b){
    return a.Start - b.Start;
}));
        }
    },
    AddBeat: function (beat){
        var track = beat.Beat.Voice.Bar.Staff.Track.Index;
        if (!this.BeatsPerTrack.hasOwnProperty(track)){
            this.BeatsPerTrack[track] = [];
        }
        this.BeatsPerTrack[track].push(beat);
    }
};
AlphaTab.Audio.Model.MidiTickLookup = function (){
    this._currentMasterBar = null;
    this.MasterBarLookup = null;
    this.MasterBars = null;
    this.MasterBars = [];
    this.MasterBarLookup = {};
};
AlphaTab.Audio.Model.MidiTickLookup.prototype = {
    Finish: function (){
        for (var i = 0; i < this.MasterBars.length; i++){
            this.MasterBars[i].Finish();
        }
    },
    FindBeat: function (tracks, tick){
        // get all beats within the masterbar
        var masterBar = this.FindMasterBar(tick);
        if (masterBar == null){
            return null;
        }
        var beat = null;
        for (var t = 0; t < tracks.length; t++){
            var beats = masterBar.BeatsPerTrack[tracks[t].Index];
            if (beats != null){
                for (var b = 0; b < beats.length; b++){
                    // is the current beat played on the given tick?
                    var currentBeat = beats[b];
                    if (currentBeat.Start <= tick && tick < currentBeat.End){
                        // take the latest played beat we can find. (most right)
                        if (beat == null || (beat.Start < currentBeat.Start)){
                            beat = beats[b];
                        }
                    }
                    else if (currentBeat.End > tick){
                        break;
                    }
                }
            }
        }
        if (beat == null){
            return null;
        }
        return beat.Beat;
    },
    FindMasterBar: function (tick){
        var bars = this.MasterBars;
        var bottom = 0;
        var top = bars.length - 1;
        while (bottom <= top){
            var middle = ((top + bottom) / 2) | 0;
            var bar = bars[middle];
            // found?
            if (tick >= bar.Start && tick < bar.End){
                return bar;
            }
            // search in lower half 
            if (tick < bar.Start){
                top = middle - 1;
            }
            else {
                bottom = middle + 1;
            }
        }
        return null;
    },
    GetMasterBarStart: function (bar){
        if (!this.MasterBarLookup.hasOwnProperty(bar.Index)){
            return 0;
        }
        return this.MasterBarLookup[bar.Index].Start;
    },
    AddMasterBar: function (masterBar){
        this.MasterBars.push(masterBar);
        this._currentMasterBar = masterBar;
        if (!this.MasterBarLookup.hasOwnProperty(masterBar.MasterBar.Index)){
            this.MasterBarLookup[masterBar.MasterBar.Index] = masterBar;
        }
    },
    AddBeat: function (beat){
        this._currentMasterBar.AddBeat(beat);
    }
};
AlphaTab.Audio.Model.MidiTrack = function (){
    this.Index = 0;
    this.File = null;
    this.FirstEvent = null;
    this.LastEvent = null;
};
AlphaTab.Audio.Model.MidiTrack.prototype = {
    AddEvent: function (e){
        e.Track = this;
        // first entry 
        if (this.FirstEvent == null){
            // first and last e
            this.FirstEvent = e;
            this.LastEvent = e;
        }
        else {
            // is the e after the last one?
            if (this.LastEvent.Tick <= e.Tick){
                // make the new e the last one
                this.LastEvent.NextEvent = e;
                e.PreviousEvent = this.LastEvent;
                this.LastEvent = e;
            }
            else if (this.FirstEvent.Tick > e.Tick){
                // make the new e the new head
                e.NextEvent = this.FirstEvent;
                this.FirstEvent.PreviousEvent = e;
                this.FirstEvent = e;
            }
            else {
                // we assume equal tick distribution and search for
                // the lesser distance,
                // start inserting on first e or last e?
                // use smaller delta 
                var firstDelta = e.Tick - this.FirstEvent.Tick;
                var lastDelta = this.LastEvent.Tick - e.Tick;
                if (firstDelta < lastDelta){
                    // search position from start to end
                    var previous = this.FirstEvent;
                    // as long the upcoming e is still before 
                    // the new one
                    while (previous != null && previous.NextEvent != null && previous.NextEvent.Tick <= e.Tick){
                        // we're moving to the next e 
                        previous = previous.NextEvent;
                    }
                    if (previous == null)
                        return;
                    // insert after the found element
                    var next = previous.NextEvent;
                    // update previous
                    previous.NextEvent = e;
                    // update new
                    e.PreviousEvent = previous;
                    e.NextEvent = next;
                    // update next
                    if (next != null){
                        next.PreviousEvent = e;
                    }
                }
                else {
                    // search position from end to start
                    var next = this.LastEvent;
                    // as long the previous e is after the new one
                    while (next != null && next.PreviousEvent != null && next.PreviousEvent.Tick > e.Tick){
                        // we're moving to previous e
                        next = next.PreviousEvent;
                    }
                    if (next == null)
                        return;
                    var previous = next.PreviousEvent;
                    // update next
                    next.PreviousEvent = e;
                    // update new
                    e.NextEvent = next;
                    e.PreviousEvent = previous;
                    // update previous
                    if (previous != null){
                        previous.NextEvent = e;
                    }
                    else {
                        this.FirstEvent = e;
                    }
                }
            }
        }
    },
    WriteTo: function (s){
        // build track data first
        var trackData = AlphaTab.IO.ByteBuffer.Empty();
        var current = this.FirstEvent;
        var count = 0;
        while (current != null){
            current.WriteTo(trackData);
            current = current.NextEvent;
            count++;
        }
        // magic number "MTrk" (0x4D54726B)
        var b = new Uint8Array([77, 84, 114, 107]);
        s.Write(b, 0, b.length);
        // size as integer
        var data = trackData.ToArray();
        var l = data.length;
        b = new Uint8Array([((l >> 24) & 255), ((l >> 16) & 255), ((l >> 8) & 255), ((l >> 0) & 255)]);
        s.Write(b, 0, b.length);
        s.Write(data, 0, data.length);
    }
};
AlphaTab.Exporter = AlphaTab.Exporter || {};
AlphaTab.Exporter.AlphaTexExporter = function (){
    this._builder = null;
    this._builder = new Array();
};
AlphaTab.Exporter.AlphaTexExporter.prototype = {
    Export: function (track){
        this.Score(track);
    },
    Score: function (track){
        this.MetaData(track);
        this.Bars(track);
    },
    ToTex: function (){
        return this._builder.join('');
    },
    MetaData: function (track){
        var score = track.Score;
        this.StringMetaData("title", score.Title);
        this.StringMetaData("subtitle", score.SubTitle);
        this.StringMetaData("artist", score.Artist);
        this.StringMetaData("album", score.Album);
        this.StringMetaData("words", score.Words);
        this.StringMetaData("music", score.Music);
        this.StringMetaData("copyright", score.Copyright);
        this._builder.push("\\tempo ");
        this._builder.push(score.Tempo);
        this._builder.push(""+'\r\n');
        if (track.Capo > 0){
            this._builder.push("\\capo ");
            this._builder.push(track.Capo);
            this._builder.push(""+'\r\n');
        }
        this._builder.push("\\tuning");
        for (var i = 0; i < track.Tuning.length; i++){
            this._builder.push(" ");
            this._builder.push(AlphaTab.Model.Tuning.GetTextForTuning(track.Tuning[i], true));
        }
        this._builder.push("\\instrument ");
        this._builder.push(track.PlaybackInfo.Program);
        this._builder.push(""+'\r\n');
        this._builder.push(".");
        this._builder.push(""+'\r\n');
    },
    StringMetaData: function (key, value){
        if (!AlphaTab.Platform.Std.IsNullOrWhiteSpace(value)){
            this._builder.push("\\");
            this._builder.push(key);
            this._builder.push(" \"");
            this._builder.push(value.replace("\"","\\\""));
            this._builder.push("\"");
            this._builder.push(""+'\r\n');
        }
    },
    Bars: function (track){
        // alphatab only supports single staves, 
        for (var i = 0; i < 1; i++){
            for (var j = 0; j < track.Staves[i].Bars.length; j++){
                if (i > 0){
                    this._builder.push(" |");
                    this._builder.push(""+'\r\n');
                }
                this.Bar(track.Staves[i].Bars[j]);
            }
        }
    },
    Bar: function (bar){
        this.BarMeta(bar);
        this.Voice(bar.Voices[0]);
    },
    Voice: function (voice){
        for (var i = 0; i < voice.Beats.length; i++){
            this.Beat(voice.Beats[i]);
        }
    },
    Beat: function (beat){
        if (beat.get_IsRest()){
            this._builder.push("r");
        }
        else {
            if (beat.Notes.length > 1){
                this._builder.push("(");
            }
            for (var i = 0; i < beat.Notes.length; i++){
                this.Note(beat.Notes[i]);
            }
            if (beat.Notes.length > 1){
                this._builder.push(")");
            }
        }
        this._builder.push(".");
        this._builder.push(beat.Duration);
        this._builder.push(" ");
        this.BeatEffects(beat);
    },
    Note: function (note){
        if (note.IsDead){
            this._builder.push("x");
        }
        else if (note.IsTieDestination){
            this._builder.push("-");
        }
        else {
            this._builder.push(note.Fret);
        }
        this._builder.push(".");
        this._builder.push(note.Beat.Voice.Bar.Staff.Track.Tuning.length - note.String + 1);
        this._builder.push(" ");
        this.NoteEffects(note);
    },
    NoteEffects: function (note){
        var hasEffectOpen = false;
        if (note.get_HasBend()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("be (");
            for (var i = 0; i < note.BendPoints.length; i++){
                this._builder.push(note.BendPoints[i].Offset);
                this._builder.push(" ");
                this._builder.push(note.BendPoints[i].Value);
                this._builder.push(" ");
            }
            this._builder.push(")");
        }
        switch (note.HarmonicType){
            case AlphaTab.Model.HarmonicType.Natural:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("nh ");
                break;
            case AlphaTab.Model.HarmonicType.Artificial:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("ah ");
                break;
            case AlphaTab.Model.HarmonicType.Tap:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("th ");
                break;
            case AlphaTab.Model.HarmonicType.Pinch:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("ph ");
                break;
            case AlphaTab.Model.HarmonicType.Semi:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("sh ");
                break;
        }
        if (note.get_IsTrill()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("tr ");
            this._builder.push(note.get_TrillFret());
            this._builder.push(" ");
            switch (note.TrillSpeed){
                case AlphaTab.Model.Duration.Sixteenth:
                    this._builder.push("16 ");
                    break;
                case AlphaTab.Model.Duration.ThirtySecond:
                    this._builder.push("32 ");
                    break;
                case AlphaTab.Model.Duration.SixtyFourth:
                    this._builder.push("64 ");
                    break;
            }
        }
        if (note.Vibrato != AlphaTab.Model.VibratoType.None){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("v ");
        }
        if (note.SlideType == AlphaTab.Model.SlideType.Legato){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("sl ");
        }
        if (note.SlideType == AlphaTab.Model.SlideType.Shift){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("ss ");
        }
        if (note.IsHammerPullOrigin){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("h ");
        }
        if (note.IsGhost){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("g ");
        }
        if (note.Accentuated == AlphaTab.Model.AccentuationType.Normal){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("ac ");
        }
        else if (note.Accentuated == AlphaTab.Model.AccentuationType.Heavy){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("hac ");
        }
        if (note.IsPalmMute){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("pm ");
        }
        if (note.IsStaccato){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("st ");
        }
        if (note.IsLetRing){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("lr ");
        }
        switch (note.LeftHandFinger){
            case AlphaTab.Model.Fingers.Thumb:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("1 ");
                break;
            case AlphaTab.Model.Fingers.IndexFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("2 ");
                break;
            case AlphaTab.Model.Fingers.MiddleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("3 ");
                break;
            case AlphaTab.Model.Fingers.AnnularFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("4 ");
                break;
            case AlphaTab.Model.Fingers.LittleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("5 ");
                break;
        }
        switch (note.RightHandFinger){
            case AlphaTab.Model.Fingers.Thumb:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("1 ");
                break;
            case AlphaTab.Model.Fingers.IndexFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("2 ");
                break;
            case AlphaTab.Model.Fingers.MiddleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("3 ");
                break;
            case AlphaTab.Model.Fingers.AnnularFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("4 ");
                break;
            case AlphaTab.Model.Fingers.LittleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("5 ");
                break;
        }
        this.EffectClose(hasEffectOpen);
    },
    EffectOpen: function (hasBeatEffectOpen){
        if (!hasBeatEffectOpen){
            this._builder.push("{");
        }
        return true;
    },
    EffectClose: function (hasBeatEffectOpen){
        if (hasBeatEffectOpen){
            this._builder.push("}");
        }
    },
    BeatEffects: function (beat){
        var hasEffectOpen = false;
        if (beat.FadeIn){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("f ");
        }
        switch (beat.GraceType){
            case AlphaTab.Model.GraceType.OnBeat:
                this._builder.push("gr ob ");
                break;
            case AlphaTab.Model.GraceType.BeforeBeat:
                this._builder.push("gr ");
                break;
        }
        if (beat.Vibrato != AlphaTab.Model.VibratoType.None){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("v ");
        }
        if (beat.Slap){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("s ");
        }
        if (beat.Pop){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("p ");
        }
        if (beat.Dots == 2){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("dd ");
        }
        else if (beat.Dots == 1){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("d ");
        }
        if (beat.PickStroke == AlphaTab.Model.PickStrokeType.Up){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("su ");
        }
        else if (beat.PickStroke == AlphaTab.Model.PickStrokeType.Down){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("sd ");
        }
        if (beat.get_HasTuplet()){
            var tupletValue = 0;
            if (beat.TupletDenominator == 3 && beat.TupletNumerator == 2){
                tupletValue = 3;
            }
            else if (beat.TupletDenominator == 5 && beat.TupletNumerator == 4){
                tupletValue = 5;
            }
            else if (beat.TupletDenominator == 6 && beat.TupletNumerator == 4){
                tupletValue = 6;
            }
            else if (beat.TupletDenominator == 7 && beat.TupletNumerator == 4){
                tupletValue = 7;
            }
            else if (beat.TupletDenominator == 9 && beat.TupletNumerator == 8){
                tupletValue = 9;
            }
            else if (beat.TupletDenominator == 10 && beat.TupletNumerator == 8){
                tupletValue = 10;
            }
            else if (beat.TupletDenominator == 11 && beat.TupletNumerator == 8){
                tupletValue = 11;
            }
            else if (beat.TupletDenominator == 12 && beat.TupletNumerator == 8){
                tupletValue = 12;
            }
            if (tupletValue != 0){
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("tu ");
                this._builder.push(tupletValue);
                this._builder.push(" ");
            }
        }
        if (beat.get_HasWhammyBar()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("tbe (");
            for (var i = 0; i < beat.WhammyBarPoints.length; i++){
                this._builder.push(beat.WhammyBarPoints[i].Offset);
                this._builder.push(" ");
                this._builder.push(beat.WhammyBarPoints[i].Value);
                this._builder.push(" ");
            }
            this._builder.push(")");
        }
        if (beat.get_IsTremolo()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("tp ");
            if (beat.TremoloSpeed == AlphaTab.Model.Duration.Eighth){
                this._builder.push("8 ");
            }
            else if (beat.TremoloSpeed == AlphaTab.Model.Duration.Sixteenth){
                this._builder.push("16 ");
            }
            else if (beat.TremoloSpeed == AlphaTab.Model.Duration.ThirtySecond){
                this._builder.push("32 ");
            }
            else {
                this._builder.push("8 ");
            }
        }
        this.EffectClose(hasEffectOpen);
    },
    BarMeta: function (bar){
        var masterBar = bar.get_MasterBar();
        if (masterBar.Index > 0){
            var previousMasterBar = masterBar.PreviousMasterBar;
            var previousBar = bar.PreviousBar;
            if (previousMasterBar.TimeSignatureDenominator != masterBar.TimeSignatureDenominator || previousMasterBar.TimeSignatureNumerator != masterBar.TimeSignatureNumerator){
                this._builder.push("\\ts ");
                this._builder.push(masterBar.TimeSignatureNumerator);
                this._builder.push(" ");
                this._builder.push(masterBar.TimeSignatureDenominator);
                this._builder.push(""+'\r\n');
            }
            if (previousMasterBar.KeySignature != masterBar.KeySignature){
                this._builder.push("\\ks ");
                switch (masterBar.KeySignature){
                    case -7:
                        this._builder.push("cb");
                        break;
                    case -6:
                        this._builder.push("gb");
                        break;
                    case -5:
                        this._builder.push("db");
                        break;
                    case -4:
                        this._builder.push("ab");
                        break;
                    case -3:
                        this._builder.push("eb");
                        break;
                    case -2:
                        this._builder.push("bb");
                        break;
                    case -1:
                        this._builder.push("f");
                        break;
                    case 0:
                        this._builder.push("c");
                        break;
                    case 1:
                        this._builder.push("g");
                        break;
                    case 2:
                        this._builder.push("d");
                        break;
                    case 3:
                        this._builder.push("a");
                        break;
                    case 4:
                        this._builder.push("e");
                        break;
                    case 5:
                        this._builder.push("b");
                        break;
                    case 6:
                        this._builder.push("f#");
                        break;
                    case 7:
                        this._builder.push("c#");
                        break;
                }
                this._builder.push(""+'\r\n');
            }
            if (bar.Clef != previousBar.Clef){
                this._builder.push("\\clef ");
                switch (bar.Clef){
                    case AlphaTab.Model.Clef.Neutral:
                        this._builder.push("n");
                        break;
                    case AlphaTab.Model.Clef.C3:
                        this._builder.push("c3");
                        break;
                    case AlphaTab.Model.Clef.C4:
                        this._builder.push("c4");
                        break;
                    case AlphaTab.Model.Clef.F4:
                        this._builder.push("f4");
                        break;
                    case AlphaTab.Model.Clef.G2:
                        this._builder.push("g2");
                        break;
                }
                this._builder.push(""+'\r\n');
            }
            if (masterBar.TempoAutomation != null){
                this._builder.push("\\tempo ");
                this._builder.push(masterBar.TempoAutomation.Value);
                this._builder.push(""+'\r\n');
            }
        }
        if (masterBar.IsRepeatStart){
            this._builder.push("\\ro ");
            this._builder.push(""+'\r\n');
        }
        if (masterBar.get_IsRepeatEnd()){
            this._builder.push("\\rc ");
            this._builder.push(masterBar.RepeatCount + 1);
            this._builder.push(""+'\r\n');
        }
    }
};
AlphaTab.Importer = AlphaTab.Importer || {};
AlphaTab.Importer.AlphaTexException = function (position, nonTerm, expected, symbol, symbolData){
    this.Position = 0;
    this.NonTerm = null;
    this.Expected = AlphaTab.Importer.AlphaTexSymbols.No;
    this.Symbol = AlphaTab.Importer.AlphaTexSymbols.No;
    this.SymbolData = null;
    this.Position = position;
    this.NonTerm = nonTerm;
    this.Expected = expected;
    this.Symbol = symbol;
    this.SymbolData = symbolData;
};
AlphaTab.Importer.AlphaTexException.prototype = {
    get_Message: function (){
        if (this.SymbolData == null){
            return this.Position + ": Error on block " + this.NonTerm + ", expected a " + this.Expected + " found a " + this.Symbol;
        }
        return this.Position + ": Error on block " + this.NonTerm + ", invalid value: " + this.SymbolData;
    }
};
AlphaTab.Importer.ScoreImporter = function (){
    this.Data = null;
};
AlphaTab.Importer.ScoreImporter.prototype = {
    Init: function (data){
        this.Data = data;
    }
};
AlphaTab.Importer.ScoreImporter.BuildImporters = function (){
    return [new AlphaTab.Importer.Gp3To5Importer(), new AlphaTab.Importer.GpxImporter(), new AlphaTab.Importer.AlphaTexImporter(), new AlphaTab.Importer.MusicXml2Importer()];
};
AlphaTab.Importer.AlphaTexImporter = function (){
    this._score = null;
    this._track = null;
    this._ch = 0;
    this._curChPos = 0;
    this._sy = AlphaTab.Importer.AlphaTexSymbols.No;
    this._syData = null;
    this._allowNegatives = false;
    this._currentDuration = AlphaTab.Model.Duration.Whole;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.AlphaTexImporter.prototype = {
    ReadScore: function (){
        try{
            this.CreateDefaultScore();
            this._curChPos = 0;
            this._currentDuration = AlphaTab.Model.Duration.Quarter;
            this.NextChar();
            this.NewSy();
            this.Score();
            this._score.Finish();
            return this._score;
        }
        catch($$e3){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
    },
    Error: function (nonterm, expected, symbolError){
        if (symbolError){
            throw $CreateException(new AlphaTab.Importer.AlphaTexException(this._curChPos, nonterm, expected, this._sy, null), new Error());
        }
        throw $CreateException(new AlphaTab.Importer.AlphaTexException(this._curChPos, nonterm, expected, expected, (this._syData)), new Error());
    },
    CreateDefaultScore: function (){
        this._score = new AlphaTab.Model.Score();
        this._score.Tempo = 120;
        this._score.TempoLabel = "";
        this._track = new AlphaTab.Model.Track(1);
        this._track.PlaybackInfo.Program = 25;
        this._track.PlaybackInfo.PrimaryChannel = AlphaTab.Importer.AlphaTexImporter.TrackChannels[0];
        this._track.PlaybackInfo.SecondaryChannel = AlphaTab.Importer.AlphaTexImporter.TrackChannels[1];
        this._track.Tuning = AlphaTab.Model.Tuning.GetDefaultTuningFor(6).Tunings;
        this._score.AddTrack(this._track);
    },
    ParseClef: function (str){
        switch (str.toLowerCase()){
            case "g2":
            case "treble":
                return AlphaTab.Model.Clef.G2;
            case "f4":
            case "bass":
                return AlphaTab.Model.Clef.F4;
            case "c3":
            case "tenor":
                return AlphaTab.Model.Clef.C3;
            case "c4":
            case "alto":
                return AlphaTab.Model.Clef.C4;
            case "n":
            case "neutral":
                return AlphaTab.Model.Clef.Neutral;
            default:
                return AlphaTab.Model.Clef.G2;
        }
    },
    ParseKeySignature: function (str){
        switch (str.toLowerCase()){
            case "cb":
                return -7;
            case "gb":
                return -6;
            case "db":
                return -5;
            case "ab":
                return -4;
            case "eb":
                return -3;
            case "bb":
                return -2;
            case "f":
                return -1;
            case "c":
                return 0;
            case "g":
                return 1;
            case "d":
                return 2;
            case "a":
                return 3;
            case "e":
                return 4;
            case "b":
                return 5;
            case "f#":
                return 6;
            case "c#":
                return 7;
            default:
                return 0;
        }
    },
    ParseTuning: function (str){
        var tuning = AlphaTab.Model.TuningParser.GetTuningForText(str);
        if (tuning < 0){
            this.Error("tuning-value", AlphaTab.Importer.AlphaTexSymbols.String, false);
        }
        return tuning;
    },
    NextChar: function (){
        var b = this.Data.ReadByte();
        if (b == -1){
            this._ch = 0;
        }
        else {
            this._ch = b;
            this._curChPos++;
        }
    },
    NewSy: function (){
        this._sy = AlphaTab.Importer.AlphaTexSymbols.No;
        do{
            if (this._ch == 0){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Eof;
            }
            else if (AlphaTab.Platform.Std.IsWhiteSpace(this._ch)){
                // skip whitespaces 
                this.NextChar();
            }
            else if (this._ch == 47){
                this.NextChar();
                if (this._ch == 47){
                    // single line comment
                    while (this._ch != 13 && this._ch != 10 && this._ch != 0){
                        this.NextChar();
                    }
                }
                else if (this._ch == 42){
                    // multiline comment
                    while (this._ch != 0){
                        if (this._ch == 42){
                            this.NextChar();
                            if (this._ch == 47){
                                this.NextChar();
                                break;
                            }
                        }
                        else {
                            this.NextChar();
                        }
                    }
                }
                else {
                    this.Error("symbol", AlphaTab.Importer.AlphaTexSymbols.String, false);
                }
            }
            else if (this._ch == 34 || this._ch == 39){
                this.NextChar();
                var s = new Array();
                this._sy = AlphaTab.Importer.AlphaTexSymbols.String;
                while (this._ch != 34 && this._ch != 39 && this._ch != 0){
                    s.push(String.fromCharCode(this._ch));
                    this.NextChar();
                }
                (this._syData) = s.join('');
                this.NextChar();
            }
            else if (this._ch == 45){
                // is number?
                if (this._allowNegatives && this.IsDigit(this._ch)){
                    var number = this.ReadNumber();
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.Number;
                    (this._syData) = number;
                }
                else {
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.String;
                    (this._syData) = this.ReadName();
                }
            }
            else if (this._ch == 46){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Dot;
                this.NextChar();
            }
            else if (this._ch == 58){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.DoubleDot;
                this.NextChar();
            }
            else if (this._ch == 40){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.LParensis;
                this.NextChar();
            }
            else if (this._ch == 92){
                this.NextChar();
                var name = this.ReadName();
                this._sy = AlphaTab.Importer.AlphaTexSymbols.MetaCommand;
                (this._syData) = name;
            }
            else if (this._ch == 41){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.RParensis;
                this.NextChar();
            }
            else if (this._ch == 123){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.LBrace;
                this.NextChar();
            }
            else if (this._ch == 125){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.RBrace;
                this.NextChar();
            }
            else if (this._ch == 124){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Pipe;
                this.NextChar();
            }
            else if (this._ch == 42){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Multiply;
                this.NextChar();
            }
            else if (this.IsDigit(this._ch)){
                var number = this.ReadNumber();
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Number;
                (this._syData) = number;
            }
            else if (AlphaTab.Importer.AlphaTexImporter.IsLetter(this._ch)){
                var name = this.ReadName();
                if (AlphaTab.Model.TuningParser.IsTuning(name)){
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.Tuning;
                    (this._syData) = name.toLowerCase();
                }
                else {
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.String;
                    (this._syData) = name;
                }
            }
            else {
                this.Error("symbol", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
        }
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.No)
    },
    IsDigit: function (code){
        return (code >= 48 && code <= 57) || (code == 45 && this._allowNegatives);
        // allow - if negatives
    },
    ReadName: function (){
        var str = new Array();
        do{
            str.push(String.fromCharCode(this._ch));
            this.NextChar();
        }
        while (AlphaTab.Importer.AlphaTexImporter.IsLetter(this._ch) || this.IsDigit(this._ch))
        return str.join('');
    },
    ReadNumber: function (){
        var str = new Array();
        do{
            str.push(String.fromCharCode(this._ch));
            this.NextChar();
        }
        while (this.IsDigit(this._ch))
        return AlphaTab.Platform.Std.ParseInt(str.join(''));
    },
    Score: function (){
        this.MetaData();
        this.Bars();
    },
    MetaData: function (){
        var anyMeta = false;
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.MetaCommand){
            var syData = (this._syData).toString().toLowerCase();
            if (syData == "title"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Title = (this._syData).toString();
                }
                else {
                    this.Error("title", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "subtitle"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.SubTitle = (this._syData).toString();
                }
                else {
                    this.Error("subtitle", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "artist"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Artist = (this._syData).toString();
                }
                else {
                    this.Error("artist", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "album"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Album = (this._syData).toString();
                }
                else {
                    this.Error("album", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "words"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Words = (this._syData).toString();
                }
                else {
                    this.Error("words", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "music"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Music = (this._syData).toString();
                }
                else {
                    this.Error("music", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "copyright"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Copyright = (this._syData).toString();
                }
                else {
                    this.Error("copyright", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "tempo"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    this._score.Tempo = (this._syData);
                }
                else {
                    this.Error("tempo", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "capo"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    this._track.Capo = (this._syData);
                }
                else {
                    this.Error("capo", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "tuning"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Tuning){
                    var tuning = [];
                    do{
                        tuning.push(this.ParseTuning((this._syData).toString().toLowerCase()));
                        this.NewSy();
                    }
                    while (this._sy == AlphaTab.Importer.AlphaTexSymbols.Tuning)
                    this._track.Tuning = tuning.slice(0);
                }
                else {
                    this.Error("tuning", AlphaTab.Importer.AlphaTexSymbols.Tuning, true);
                }
                anyMeta = true;
            }
            else if (syData == "instrument"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    var instrument = (this._syData);
                    if (instrument >= 0 && instrument <= 128){
                        this._track.PlaybackInfo.Program = (this._syData);
                    }
                    else {
                        this.Error("instrument", AlphaTab.Importer.AlphaTexSymbols.Number, false);
                    }
                }
                else if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    var instrumentName = (this._syData).toString().toLowerCase();
                    this._track.PlaybackInfo.Program = AlphaTab.Audio.GeneralMidi.GetValue(instrumentName);
                }
                else {
                    this.Error("instrument", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (anyMeta){
                this.Error("metaDataTags", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
            else {
                // fall forward to bar meta if unknown score meta was found
                break;
            }
        }
        if (anyMeta){
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Dot){
                this.Error("song", AlphaTab.Importer.AlphaTexSymbols.Dot, true);
            }
            this.NewSy();
        }
        else if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Dot){
            this.NewSy();
        }
    },
    Bars: function (){
        this.Bar();
        while (this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
            // read pipe from last bar
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Pipe){
                this.Error("bar", AlphaTab.Importer.AlphaTexSymbols.Pipe, true);
            }
            this.NewSy();
            this.Bar();
        }
    },
    Bar: function (){
        var master = new AlphaTab.Model.MasterBar();
        this._score.AddMasterBar(master);
        var bar = new AlphaTab.Model.Bar();
        this._track.AddBarToStaff(0, bar);
        if (master.Index > 0){
            master.KeySignature = master.PreviousMasterBar.KeySignature;
            master.TimeSignatureDenominator = master.PreviousMasterBar.TimeSignatureDenominator;
            master.TimeSignatureNumerator = master.PreviousMasterBar.TimeSignatureNumerator;
            bar.Clef = bar.PreviousBar.Clef;
        }
        this.BarMeta(bar);
        var voice = new AlphaTab.Model.Voice();
        bar.AddVoice(voice);
        while (this._sy != AlphaTab.Importer.AlphaTexSymbols.Pipe && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
            this.Beat(voice);
        }
        if (voice.Beats.length == 0){
            var emptyBeat = new AlphaTab.Model.Beat();
            emptyBeat.IsEmpty = true;
            voice.AddBeat(emptyBeat);
        }
    },
    Beat: function (voice){
        // duration specifier?
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.DoubleDot){
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            var duration = (this._syData);
            switch (duration){
                case 1:
                case 2:
                case 4:
                case 8:
                case 16:
                case 32:
                case 64:
                    this._currentDuration = this.ParseDuration((this._syData));
                    break;
                default:
                    this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, false);
                    break;
            }
            this.NewSy();
            return;
        }
        var beat = new AlphaTab.Model.Beat();
        voice.AddBeat(beat);
        if (voice.Bar.get_MasterBar().TempoAutomation != null && voice.Beats.length == 1){
            beat.Automations.push(voice.Bar.get_MasterBar().TempoAutomation);
        }
        // notes
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.LParensis){
            this.NewSy();
            this.Note(beat);
            while (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
                this.Note(beat);
            }
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis){
                this.Error("note-list", AlphaTab.Importer.AlphaTexSymbols.RParensis, true);
            }
            this.NewSy();
        }
        else if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String && (this._syData).toString().toLowerCase() == "r"){
            // rest voice -> no notes 
            this.NewSy();
        }
        else {
            this.Note(beat);
        }
        // new duration
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Dot){
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            var duration = (this._syData);
            switch (duration){
                case 1:
                case 2:
                case 4:
                case 8:
                case 16:
                case 32:
                case 64:
                    this._currentDuration = this.ParseDuration((this._syData));
                    break;
                default:
                    this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, false);
                    break;
            }
            this.NewSy();
        }
        beat.Duration = this._currentDuration;
        // beat multiplier (repeat beat n times)
        var beatRepeat = 1;
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Multiply){
            this.NewSy();
            // multiplier count
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("multiplier", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            else {
                beatRepeat = (this._syData);
            }
            this.NewSy();
        }
        this.BeatEffects(beat);
        for (var i = 0; i < beatRepeat - 1; i++){
            voice.AddBeat(beat.Clone());
        }
    },
    BeatEffects: function (beat){
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LBrace){
            return;
        }
        this.NewSy();
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
            (this._syData) = (this._syData).toString().toLowerCase();
            if (!this.ApplyBeatEffect(beat)){
                this.Error("beat-effects", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
        }
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RBrace){
            this.Error("beat-effects", AlphaTab.Importer.AlphaTexSymbols.RBrace, true);
        }
        this.NewSy();
    },
    ApplyBeatEffect: function (beat){
        var syData = (this._syData).toString().toLowerCase();
        if (syData == "f"){
            beat.FadeIn = true;
            this.NewSy();
            return true;
        }
        if (syData == "v"){
            beat.Vibrato = AlphaTab.Model.VibratoType.Slight;
            this.NewSy();
            return true;
        }
        if (syData == "s"){
            beat.Slap = true;
            this.NewSy();
            return true;
        }
        if (syData == "p"){
            beat.Pop = true;
            this.NewSy();
            return true;
        }
        if (syData == "dd"){
            beat.Dots = 2;
            this.NewSy();
            return true;
        }
        if (syData == "d"){
            beat.Dots = 1;
            this.NewSy();
            return true;
        }
        if (syData == "su"){
            beat.PickStroke = AlphaTab.Model.PickStrokeType.Up;
            this.NewSy();
            return true;
        }
        if (syData == "sd"){
            beat.PickStroke = AlphaTab.Model.PickStrokeType.Down;
            this.NewSy();
            return true;
        }
        if (syData == "tu"){
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("tuplet", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                return false;
            }
            var tuplet = (this._syData);
            switch (tuplet){
                case 3:
                    beat.TupletNumerator = 3;
                    beat.TupletDenominator = 2;
                    break;
                case 5:
                    beat.TupletNumerator = 5;
                    beat.TupletDenominator = 4;
                    break;
                case 6:
                    beat.TupletNumerator = 6;
                    beat.TupletDenominator = 4;
                    break;
                case 7:
                    beat.TupletNumerator = 7;
                    beat.TupletDenominator = 4;
                    break;
                case 9:
                    beat.TupletNumerator = 9;
                    beat.TupletDenominator = 8;
                    break;
                case 10:
                    beat.TupletNumerator = 10;
                    beat.TupletDenominator = 8;
                    break;
                case 11:
                    beat.TupletNumerator = 11;
                    beat.TupletDenominator = 8;
                    break;
                case 12:
                    beat.TupletNumerator = 12;
                    beat.TupletNumerator = 8;
                    beat.TupletDenominator = 8;
                    break;
            }
            this.NewSy();
            return true;
        }
        if (syData == "tb" || syData == "tbe"){
            var exact = syData == "tbe";
            // read points
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LParensis){
                this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.LParensis, true);
                return false;
            }
            this._allowNegatives = true;
            this.NewSy();
            while (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
                var offset;
                var value;
                if (exact){
                    if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                        this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        return false;
                    }
                    offset = (this._syData);
                    this.NewSy();
                    if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                        this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        return false;
                    }
                    value = (this._syData);
                }
                else {
                    if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                        this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        return false;
                    }
                    offset = 0;
                    value = (this._syData);
                }
                beat.AddWhammyBarPoint(new AlphaTab.Model.BendPoint(offset, value));
                this.NewSy();
            }
            while (beat.WhammyBarPoints.length > 60){
                beat.RemoveWhammyBarPoint(beat.WhammyBarPoints.length - 1);
            }
            // set positions
            if (!exact){
                var count = beat.WhammyBarPoints.length;
                var step = ((60 / count) | 0);
                var i = 0;
                while (i < count){
                    beat.WhammyBarPoints[i].Offset = Math.min(60, (i * step));
                    i++;
                }
            }
            else {
                beat.WhammyBarPoints.sort($CreateAnonymousDelegate(this, function (a, b){
    return a.Offset - b.Offset;
}));
            }
            this._allowNegatives = false;
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis){
                this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.RParensis, true);
                return false;
            }
            this.NewSy();
            return true;
        }
        if (syData == "gr"){
            this.NewSy();
            if ((this._syData).toString().toLowerCase() == "ob"){
                beat.GraceType = AlphaTab.Model.GraceType.OnBeat;
                this.NewSy();
            }
            else {
                beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
            }
            return true;
        }
        if (syData == "tp"){
            this.NewSy();
            var duration = AlphaTab.Model.Duration.Eighth;
            if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                switch ((this._syData)){
                    case 8:
                        duration = AlphaTab.Model.Duration.Eighth;
                        break;
                    case 16:
                        duration = AlphaTab.Model.Duration.Sixteenth;
                        break;
                    case 32:
                        duration = AlphaTab.Model.Duration.ThirtySecond;
                        break;
                    default:
                        duration = AlphaTab.Model.Duration.Eighth;
                        break;
                }
                this.NewSy();
            }
            beat.TremoloSpeed = duration;
            return true;
        }
        return false;
    },
    Note: function (beat){
        // fret.string
        var syData = (this._syData).toString().toLowerCase();
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number && !(this._sy == AlphaTab.Importer.AlphaTexSymbols.String && (syData == "x" || syData == "-"))){
            this.Error("note-fret", AlphaTab.Importer.AlphaTexSymbols.Number, true);
        }
        var isDead = syData == "x";
        var isTie = syData == "-";
        var fret = (isDead || isTie ? 0 : (this._syData));
        this.NewSy();
        // Fret done
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Dot){
            this.Error("note", AlphaTab.Importer.AlphaTexSymbols.Dot, true);
        }
        this.NewSy();
        // dot done
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
            this.Error("note-string", AlphaTab.Importer.AlphaTexSymbols.Number, true);
        }
        var string = (this._syData);
        if (string < 1 || string > this._track.Tuning.length){
            this.Error("note-string", AlphaTab.Importer.AlphaTexSymbols.Number, false);
        }
        this.NewSy();
        // string done
        // read effects
        var note = new AlphaTab.Model.Note();
        beat.AddNote(note);
        note.String = this._track.Tuning.length - (string - 1);
        note.IsDead = isDead;
        note.IsTieDestination = isTie;
        if (!isTie){
            note.Fret = fret;
        }
        this.NoteEffects(note);
    },
    NoteEffects: function (note){
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LBrace){
            return;
        }
        this.NewSy();
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
            var syData = (this._syData).toString().toLowerCase();
            (this._syData) = syData;
            if (syData == "b" || syData == "be"){
                var exact = (this._syData) == "be";
                // read points
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LParensis){
                    this.Error("bend-effect", AlphaTab.Importer.AlphaTexSymbols.LParensis, true);
                }
                this.NewSy();
                while (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
                    var offset = 0;
                    var value = 0;
                    if (exact){
                        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                            this.Error("bend-effect-value", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        }
                        offset = (this._syData);
                        this.NewSy();
                        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                            this.Error("bend-effect-value", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        }
                        value = (this._syData);
                    }
                    else {
                        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                            this.Error("bend-effect-value", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        }
                        value = (this._syData);
                    }
                    note.AddBendPoint(new AlphaTab.Model.BendPoint(offset, value));
                    this.NewSy();
                }
                while (note.BendPoints.length > 60){
                    note.BendPoints.splice(note.BendPoints.length - 1,1);
                }
                // set positions
                if (exact){
                    note.BendPoints.sort($CreateAnonymousDelegate(this, function (a, b){
    return a.Offset - b.Offset;
}));
                }
                else {
                    var count = note.BendPoints.length;
                    var step = (60 / (count - 1)) | 0;
                    var i = 0;
                    while (i < count){
                        note.BendPoints[i].Offset = Math.min(60, (i * step));
                        i++;
                    }
                }
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis){
                    this.Error("bend-effect", AlphaTab.Importer.AlphaTexSymbols.RParensis, true);
                }
                this.NewSy();
            }
            else if (syData == "nh"){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                this.NewSy();
            }
            else if (syData == "ah"){
                // todo: Artificial Key
                note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                this.NewSy();
            }
            else if (syData == "th"){
                // todo: store tapped fret in data
                note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                this.NewSy();
            }
            else if (syData == "ph"){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                this.NewSy();
            }
            else if (syData == "sh"){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                this.NewSy();
            }
            else if (syData == "tr"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("trill-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                var fret = (this._syData);
                this.NewSy();
                var duration = AlphaTab.Model.Duration.Sixteenth;
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    switch ((this._syData)){
                        case 16:
                            duration = AlphaTab.Model.Duration.Sixteenth;
                            break;
                        case 32:
                            duration = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                        case 64:
                            duration = AlphaTab.Model.Duration.SixtyFourth;
                            break;
                        default:
                            duration = AlphaTab.Model.Duration.Sixteenth;
                            break;
                    }
                    this.NewSy();
                }
                note.TrillValue = fret + note.get_StringTuning();
                note.TrillSpeed = duration;
            }
            else if (syData == "v"){
                this.NewSy();
                note.Vibrato = AlphaTab.Model.VibratoType.Slight;
            }
            else if (syData == "sl"){
                this.NewSy();
                note.SlideType = AlphaTab.Model.SlideType.Legato;
            }
            else if (syData == "ss"){
                this.NewSy();
                note.SlideType = AlphaTab.Model.SlideType.Shift;
            }
            else if (syData == "h"){
                this.NewSy();
                note.IsHammerPullOrigin = true;
            }
            else if (syData == "g"){
                this.NewSy();
                note.IsGhost = true;
            }
            else if (syData == "ac"){
                this.NewSy();
                note.Accentuated = AlphaTab.Model.AccentuationType.Normal;
            }
            else if (syData == "hac"){
                this.NewSy();
                note.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
            }
            else if (syData == "pm"){
                this.NewSy();
                note.IsPalmMute = true;
            }
            else if (syData == "st"){
                this.NewSy();
                note.IsStaccato = true;
            }
            else if (syData == "lr"){
                this.NewSy();
                note.IsLetRing = true;
            }
            else if (syData == "x"){
                this.NewSy();
                note.Fret = 0;
                note.IsDead = true;
            }
            else if (syData == "lf"){
                this.NewSy();
                var finger = AlphaTab.Model.Fingers.Thumb;
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    finger = this.ToFinger((this._syData));
                    this.NewSy();
                }
                note.LeftHandFinger = finger;
            }
            else if (syData == "rf"){
                this.NewSy();
                var finger = AlphaTab.Model.Fingers.Thumb;
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    finger = this.ToFinger((this._syData));
                    this.NewSy();
                }
                note.RightHandFinger = finger;
            }
            else if (this.ApplyBeatEffect(note.Beat)){
                // Success
            }
            else {
                this.Error(syData, AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
        }
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RBrace){
            this.Error("note-effect", AlphaTab.Importer.AlphaTexSymbols.RBrace, false);
        }
        this.NewSy();
    },
    ToFinger: function (syData){
        switch (syData){
            case 1:
                return AlphaTab.Model.Fingers.Thumb;
            case 2:
                return AlphaTab.Model.Fingers.IndexFinger;
            case 3:
                return AlphaTab.Model.Fingers.MiddleFinger;
            case 4:
                return AlphaTab.Model.Fingers.AnnularFinger;
            case 5:
                return AlphaTab.Model.Fingers.LittleFinger;
        }
        return AlphaTab.Model.Fingers.Thumb;
    },
    ParseDuration: function (duration){
        switch (duration){
            case 1:
                return AlphaTab.Model.Duration.Whole;
            case 2:
                return AlphaTab.Model.Duration.Half;
            case 4:
                return AlphaTab.Model.Duration.Quarter;
            case 8:
                return AlphaTab.Model.Duration.Eighth;
            case 16:
                return AlphaTab.Model.Duration.Sixteenth;
            case 32:
                return AlphaTab.Model.Duration.ThirtySecond;
            case 64:
                return AlphaTab.Model.Duration.SixtyFourth;
            default:
                return AlphaTab.Model.Duration.Quarter;
        }
    },
    BarMeta: function (bar){
        var master = bar.get_MasterBar();
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.MetaCommand){
            var syData = (this._syData).toString().toLowerCase();
            if (syData == "ts"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("timesignature-numerator", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                master.TimeSignatureNumerator = (this._syData);
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("timesignature-denominator", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                master.TimeSignatureDenominator = (this._syData);
            }
            else if (syData == "ro"){
                master.IsRepeatStart = true;
            }
            else if (syData == "rc"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("repeatclose", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                master.RepeatCount = (this._syData) - 1;
            }
            else if (syData == "ks"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.String){
                    this.Error("keysignature", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                master.KeySignature = this.ParseKeySignature((this._syData).toString().toLowerCase());
            }
            else if (syData == "clef"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.String && this._sy != AlphaTab.Importer.AlphaTexSymbols.Tuning){
                    this.Error("clef", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                bar.Clef = this.ParseClef((this._syData).toString().toLowerCase());
            }
            else if (syData == "tempo"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("tempo", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                var tempoAutomation = new AlphaTab.Model.Automation();
                tempoAutomation.IsLinear = true;
                tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
                tempoAutomation.Value = (this._syData);
                master.TempoAutomation = tempoAutomation;
            }
            else {
                this.Error("measure-effects", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
            this.NewSy();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.AlphaTexImporter.Eof = 0;
    AlphaTab.Importer.AlphaTexImporter.TrackChannels = new Int32Array([0, 1]);
});
AlphaTab.Importer.AlphaTexImporter.IsLetter = function (code){
    // no control characters, whitespaces, numbers or dots
    return !AlphaTab.Importer.AlphaTexImporter.IsTerminal(code) && ((code >= 33 && code <= 47) || (code >= 58 && code <= 126) || (code > 128));
    /* Unicode Symbols */
};
AlphaTab.Importer.AlphaTexImporter.IsTerminal = function (ch){
    return ch == 46 || ch == 123 || ch == 125 || ch == 91 || ch == 93 || ch == 40 || ch == 41 || ch == 124 || ch == 39 || ch == 34 || ch == 92;
};
$Inherit(AlphaTab.Importer.AlphaTexImporter, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.AlphaTexSymbols = {
    No: 0,
    Eof: 1,
    Number: 2,
    DoubleDot: 3,
    Dot: 4,
    String: 5,
    Tuning: 6,
    LParensis: 7,
    RParensis: 8,
    LBrace: 9,
    RBrace: 10,
    Pipe: 11,
    MetaCommand: 12,
    Multiply: 13
};
AlphaTab.Importer.Gp3To5Importer = function (){
    this._versionNumber = 0;
    this._score = null;
    this._globalTripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    this._lyricsIndex = null;
    this._lyrics = null;
    this._barCount = 0;
    this._trackCount = 0;
    this._playbackInfos = null;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.Gp3To5Importer.prototype = {
    ReadScore: function (){
        this.ReadVersion();
        this._score = new AlphaTab.Model.Score();
        // basic song info
        this.ReadScoreInformation();
        // triplet feel before Gp5
        if (this._versionNumber < 500){
            this._globalTripletFeel = this.ReadBool() ? AlphaTab.Model.TripletFeel.Triplet8th : AlphaTab.Model.TripletFeel.NoTripletFeel;
        }
        // beat lyrics
        if (this._versionNumber >= 400){
            this.ReadLyrics();
        }
        // rse master settings since GP5.1
        if (this._versionNumber >= 510){
            // master volume (4)
            // master effect (4)
            // master equalizer (10)
            // master equalizer preset (1)
            this.Data.Skip(19);
        }
        // page setup since GP5
        if (this._versionNumber >= 500){
            this.ReadPageSetup();
            this._score.TempoLabel = this.ReadStringIntByte();
        }
        // tempo stuff
        this._score.Tempo = this.ReadInt32();
        if (this._versionNumber >= 510){
            this.ReadBool();
            // hide tempo?
        }
        // keysignature and octave
        /* var keySignature = */
        this.ReadInt32();
        if (this._versionNumber >= 400){
            /* octave = */
            this.Data.ReadByte();
        }
        this.ReadPlaybackInfos();
        // repetition stuff
        if (this._versionNumber >= 500){
            // "Coda" bar index (2)
            // "Double Coda" bar index (2)
            // "Segno" bar index (2)
            // "Segno Segno" bar index (2)
            // "Fine" bar index (2)
            // "Da Capo" bar index (2)
            // "Da Capo al Coda" bar index (2)
            // "Da Capo al Double Coda" bar index (2)
            // "Da Capo al Fine" bar index (2)
            // "Da Segno" bar index (2)
            // "Da Segno al Coda" bar index (2)
            // "Da Segno al Double Coda" bar index (2)
            // "Da Segno al Fine "bar index (2)
            // "Da Segno Segno" bar index (2)
            // "Da Segno Segno al Coda" bar index (2)
            // "Da Segno Segno al Double Coda" bar index (2)
            // "Da Segno Segno al Fine" bar index (2)
            // "Da Coda" bar index (2)
            // "Da Double Coda" bar index (2)
            this.Data.Skip(38);
            // unknown (4)
            this.Data.Skip(4);
        }
        // contents
        this._barCount = this.ReadInt32();
        this._trackCount = this.ReadInt32();
        this.ReadMasterBars();
        this.ReadTracks();
        this.ReadBars();
        this._score.Finish();
        return this._score;
    },
    ReadVersion: function (){
        var version = this.ReadStringByteLength(30);
        if (!version.indexOf("FICHIER GUITAR PRO ")==0){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        version = version.substr("FICHIER GUITAR PRO ".length + 1);
        var dot = version.indexOf(".");
        this._versionNumber = (100 * AlphaTab.Platform.Std.ParseInt(version.substr(0, dot))) + AlphaTab.Platform.Std.ParseInt(version.substr(dot + 1));
    },
    ReadScoreInformation: function (){
        this._score.Title = this.ReadStringIntUnused();
        this._score.SubTitle = this.ReadStringIntUnused();
        this._score.Artist = this.ReadStringIntUnused();
        this._score.Album = this.ReadStringIntUnused();
        this._score.Words = this.ReadStringIntUnused();
        this._score.Music = (this._versionNumber >= 500) ? this.ReadStringIntUnused() : this._score.Words;
        this._score.Copyright = this.ReadStringIntUnused();
        this._score.Tab = this.ReadStringIntUnused();
        this._score.Instructions = this.ReadStringIntUnused();
        var noticeLines = this.ReadInt32();
        var notice = new Array();
        for (var i = 0; i < noticeLines; i++){
            if (i > 0)
                notice.push(""+'\r\n');
            notice.push(this.ReadStringIntUnused());
        }
        this._score.Notices = notice.join('');
    },
    ReadLyrics: function (){
        this._lyrics = [];
        this._lyricsIndex = [];
        this.ReadInt32();
        for (var i = 0; i < 5; i++){
            this._lyricsIndex.push(this.ReadInt32() - 1);
            this._lyrics.push(this.ReadStringInt());
        }
    },
    ReadPageSetup: function (){
        // Page Width (4)
        // Page Heigth (4)
        // Padding Left (4)
        // Padding Right (4)
        // Padding Top (4)
        // Padding Bottom (4)
        // Size Proportion(4)
        // Header and Footer display flags (2)
        this.Data.Skip(30);
        // title format
        // subtitle format
        // artist format
        // album format
        // words format
        // music format
        // words and music format
        // copyright format
        // pagpublic enumber format
        for (var i = 0; i < 10; i++){
            this.ReadStringIntByte();
        }
    },
    ReadPlaybackInfos: function (){
        this._playbackInfos = [];
        for (var i = 0; i < 64; i++){
            var info = new AlphaTab.Model.PlaybackInformation();
            info.PrimaryChannel = i;
            info.SecondaryChannel = i;
            info.Program = this.ReadInt32();
            info.Volume = this.Data.ReadByte();
            info.Balance = this.Data.ReadByte();
            this.Data.Skip(6);
            this._playbackInfos.push(info);
        }
    },
    ReadMasterBars: function (){
        for (var i = 0; i < this._barCount; i++){
            this.ReadMasterBar();
        }
    },
    ReadMasterBar: function (){
        var previousMasterBar = null;
        if (this._score.MasterBars.length > 0){
            previousMasterBar = this._score.MasterBars[this._score.MasterBars.length - 1];
        }
        var newMasterBar = new AlphaTab.Model.MasterBar();
        var flags = this.Data.ReadByte();
        // time signature
        if ((flags & 1) != 0){
            newMasterBar.TimeSignatureNumerator = this.Data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.TimeSignatureNumerator = previousMasterBar.TimeSignatureNumerator;
        }
        if ((flags & 2) != 0){
            newMasterBar.TimeSignatureDenominator = this.Data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.TimeSignatureDenominator = previousMasterBar.TimeSignatureDenominator;
        }
        // repeatings
        newMasterBar.IsRepeatStart = (flags & 4) != 0;
        if ((flags & 8) != 0){
            newMasterBar.RepeatCount = this.Data.ReadByte() + (this._versionNumber >= 500 ? 0 : 1);
        }
        // alternate endings
        if ((flags & 16) != 0){
            if (this._versionNumber < 500){
                var currentMasterBar = previousMasterBar;
                // get the already existing alternatives to ignore them 
                var existentAlternatives = 0;
                while (currentMasterBar != null){
                    // found another repeat ending?
                    if (currentMasterBar.get_IsRepeatEnd() && currentMasterBar != previousMasterBar)
                        break;
                    // found the opening?
                    if (currentMasterBar.IsRepeatStart)
                        break;
                    existentAlternatives |= currentMasterBar.AlternateEndings;
                    currentMasterBar = currentMasterBar.PreviousMasterBar;
                }
                // now calculate the alternative for this bar
                var repeatAlternative = 0;
                var repeatMask = this.Data.ReadByte();
                for (var i = 0; i < 8; i++){
                    // only add the repeating if it is not existing
                    var repeating = (1 << i);
                    if (repeatMask > i && (existentAlternatives & repeating) == 0){
                        repeatAlternative |= repeating;
                    }
                }
                newMasterBar.AlternateEndings = repeatAlternative;
            }
            else {
                newMasterBar.AlternateEndings = this.Data.ReadByte();
            }
        }
        // marker
        if ((flags & 32) != 0){
            var section = new AlphaTab.Model.Section();
            section.Text = this.ReadStringIntByte();
            section.Marker = "";
            this.ReadColor();
            newMasterBar.Section = section;
        }
        // keysignature
        if ((flags & 64) != 0){
            newMasterBar.KeySignature = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newMasterBar.KeySignatureType = this.Data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.KeySignature = previousMasterBar.KeySignature;
            newMasterBar.KeySignatureType = previousMasterBar.KeySignatureType;
        }
        if ((this._versionNumber >= 500) && ((flags & 3) != 0)){
            this.Data.Skip(4);
        }
        // better alternate ending mask in GP5
        if ((this._versionNumber >= 500) && ((flags & 16) == 0)){
            newMasterBar.AlternateEndings = this.Data.ReadByte();
        }
        // tripletfeel
        if (this._versionNumber >= 500){
            var tripletFeel = this.Data.ReadByte();
            switch (tripletFeel){
                case 1:
                    newMasterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet8th;
                    break;
                case 2:
                    newMasterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet16th;
                    break;
            }
            this.Data.ReadByte();
        }
        else {
            newMasterBar.TripletFeel = this._globalTripletFeel;
        }
        newMasterBar.IsDoubleBar = (flags & 128) != 0;
        this._score.AddMasterBar(newMasterBar);
    },
    ReadTracks: function (){
        for (var i = 0; i < this._trackCount; i++){
            this.ReadTrack();
        }
    },
    ReadTrack: function (){
        var newTrack = new AlphaTab.Model.Track(1);
        this._score.AddTrack(newTrack);
        var flags = this.Data.ReadByte();
        newTrack.Name = this.ReadStringByteLength(40);
        newTrack.IsPercussion = (flags & 1) != 0;
        var stringCount = this.ReadInt32();
        var tuning = [];
        for (var i = 0; i < 7; i++){
            var stringTuning = this.ReadInt32();
            if (stringCount > i){
                tuning.push(stringTuning);
            }
        }
        newTrack.Tuning = tuning.slice(0);
        var port = this.ReadInt32();
        var index = this.ReadInt32() - 1;
        var effectChannel = this.ReadInt32() - 1;
        this.Data.Skip(4);
        // Fretcount
        if (index >= 0 && index < this._playbackInfos.length){
            var info = this._playbackInfos[index];
            info.Port = port;
            info.IsSolo = (flags & 16) != 0;
            info.IsMute = (flags & 32) != 0;
            info.SecondaryChannel = effectChannel;
            newTrack.PlaybackInfo = info;
        }
        newTrack.Capo = this.ReadInt32();
        newTrack.Color = this.ReadColor();
        if (this._versionNumber >= 500){
            // flags for 
            //  0x01 -> show tablature
            //  0x02 -> show standard notation
            this.Data.ReadByte();
            // flags for
            //  0x02 -> auto let ring
            //  0x04 -> auto brush
            this.Data.ReadByte();
            // unknown
            this.Data.Skip(43);
        }
        // unknown
        if (this._versionNumber >= 510){
            this.Data.Skip(4);
            this.ReadStringIntByte();
            this.ReadStringIntByte();
        }
    },
    ReadBars: function (){
        for (var i = 0; i < this._barCount; i++){
            for (var t = 0; t < this._trackCount; t++){
                this.ReadBar(this._score.Tracks[t]);
            }
        }
    },
    ReadBar: function (track){
        var newBar = new AlphaTab.Model.Bar();
        if (track.IsPercussion){
            newBar.Clef = AlphaTab.Model.Clef.Neutral;
        }
        track.AddBarToStaff(0, newBar);
        var voiceCount = 1;
        if (this._versionNumber >= 500){
            this.Data.ReadByte();
            voiceCount = 2;
        }
        for (var v = 0; v < voiceCount; v++){
            this.ReadVoice(track, newBar);
        }
    },
    ReadVoice: function (track, bar){
        var beatCount = this.ReadInt32();
        if (beatCount == 0){
            return;
        }
        var newVoice = new AlphaTab.Model.Voice();
        bar.AddVoice(newVoice);
        for (var i = 0; i < beatCount; i++){
            this.ReadBeat(track, bar, newVoice);
        }
    },
    ReadBeat: function (track, bar, voice){
        var newBeat = new AlphaTab.Model.Beat();
        var flags = this.Data.ReadByte();
        if ((flags & 1) != 0){
            newBeat.Dots = 1;
        }
        if ((flags & 64) != 0){
            var type = this.Data.ReadByte();
            newBeat.IsEmpty = (type & 2) == 0;
        }
        voice.AddBeat(newBeat);
        var duration = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        switch (duration){
            case -2:
                newBeat.Duration = AlphaTab.Model.Duration.Whole;
                break;
            case -1:
                newBeat.Duration = AlphaTab.Model.Duration.Half;
                break;
            case 0:
                newBeat.Duration = AlphaTab.Model.Duration.Quarter;
                break;
            case 1:
                newBeat.Duration = AlphaTab.Model.Duration.Eighth;
                break;
            case 2:
                newBeat.Duration = AlphaTab.Model.Duration.Sixteenth;
                break;
            case 3:
                newBeat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                break;
            case 4:
                newBeat.Duration = AlphaTab.Model.Duration.SixtyFourth;
                break;
            default:
                newBeat.Duration = AlphaTab.Model.Duration.Quarter;
                break;
        }
        if ((flags & 32) != 0){
            newBeat.TupletNumerator = this.ReadInt32();
            switch (newBeat.TupletNumerator){
                case 1:
                    newBeat.TupletDenominator = 1;
                    break;
                case 3:
                    newBeat.TupletDenominator = 2;
                    break;
                case 5:
                case 6:
                case 7:
                    newBeat.TupletDenominator = 4;
                    break;
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    newBeat.TupletDenominator = 8;
                    break;
                case 2:
                case 4:
                case 8:
                    break;
                default:
                    newBeat.TupletNumerator = 1;
                    newBeat.TupletDenominator = 1;
                    break;
            }
        }
        if ((flags & 2) != 0){
            this.ReadChord(newBeat);
        }
        if ((flags & 4) != 0){
            newBeat.Text = this.ReadStringIntUnused();
        }
        if ((flags & 8) != 0){
            this.ReadBeatEffects(newBeat);
        }
        if ((flags & 16) != 0){
            this.ReadMixTableChange(newBeat);
        }
        var stringFlags = this.Data.ReadByte();
        for (var i = 6; i >= 0; i--){
            if ((stringFlags & (1 << i)) != 0 && (6 - i) < track.Tuning.length){
                this.ReadNote(track, bar, voice, newBeat, (6 - i));
            }
        }
        if (this._versionNumber >= 500){
            this.Data.ReadByte();
            var flag = this.Data.ReadByte();
            if ((flag & 8) != 0){
                this.Data.ReadByte();
            }
        }
    },
    ReadChord: function (beat){
        var chord = new AlphaTab.Model.Chord();
        var chordId = AlphaTab.Platform.Std.NewGuid();
        if (this._versionNumber >= 500){
            this.Data.Skip(17);
            chord.Name = this.ReadStringByteLength(21);
            this.Data.Skip(4);
            chord.FirstFret = this.ReadInt32();
            for (var i = 0; i < 7; i++){
                var fret = this.ReadInt32();
                if (i < chord.Strings.length){
                    chord.Strings.push(fret);
                }
            }
            this.Data.Skip(32);
        }
        else {
            if (this.Data.ReadByte() != 0){
                // gp4
                if (this._versionNumber >= 400){
                    // Sharp (1)
                    // Unused (3)
                    // Root (1)
                    // Major/Minor (1)
                    // Nin,Eleven or Thirteen (1)
                    // Bass (4)
                    // Diminished/Augmented (4)
                    // Add (1)
                    this.Data.Skip(16);
                    chord.Name = (this.ReadStringByteLength(21));
                    // Unused (2)
                    // Fifth (1)
                    // Ninth (1)
                    // Eleventh (1)
                    this.Data.Skip(4);
                    chord.FirstFret = (this.ReadInt32());
                    for (var i = 0; i < 7; i++){
                        var fret = this.ReadInt32();
                        if (i < chord.Strings.length){
                            chord.Strings.push(fret);
                        }
                    }
                    // number of barres (1)
                    // Fret of the barre (5)
                    // Barree end (5)
                    // Omission1,3,5,7,9,11,13 (7)
                    // Unused (1)
                    // Fingering (7)
                    // Show Diagram Fingering (1)
                    // ??
                    this.Data.Skip(32);
                }
                else {
                    // unknown
                    this.Data.Skip(25);
                    chord.Name = this.ReadStringByteLength(34);
                    chord.FirstFret = this.ReadInt32();
                    for (var i = 0; i < 6; i++){
                        var fret = this.ReadInt32();
                        chord.Strings.push(fret);
                    }
                    // unknown
                    this.Data.Skip(36);
                }
            }
            else {
                var strings = this._versionNumber >= 406 ? 7 : 6;
                chord.Name = this.ReadStringIntByte();
                chord.FirstFret = this.ReadInt32();
                if (chord.FirstFret > 0){
                    for (var i = 0; i < strings; i++){
                        var fret = this.ReadInt32();
                        if (i < chord.Strings.length){
                            chord.Strings.push(fret);
                        }
                    }
                }
            }
        }
        if (!((chord.Name==null)||(chord.Name.length==0))){
            beat.ChordId = chordId;
            beat.Voice.Bar.Staff.Track.Chords[beat.ChordId] = chord;
        }
    },
    ReadBeatEffects: function (beat){
        var flags = this.Data.ReadByte();
        var flags2 = 0;
        if (this._versionNumber >= 400){
            flags2 = this.Data.ReadByte();
        }
        beat.FadeIn = (flags & 16) != 0;
        if ((this._versionNumber < 400 && (flags & 1) != 0) || (flags & 2) != 0){
            beat.Vibrato = AlphaTab.Model.VibratoType.Slight;
        }
        beat.HasRasgueado = (flags2 & 1) != 0;
        if ((flags & 32) != 0 && this._versionNumber >= 400){
            var slapPop = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            switch (slapPop){
                case 1:
                    beat.Tap = true;
                    break;
                case 2:
                    beat.Slap = true;
                    break;
                case 3:
                    beat.Pop = true;
                    break;
            }
        }
        else if ((flags & 32) != 0){
            var slapPop = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            switch (slapPop){
                case 1:
                    beat.Tap = true;
                    break;
                case 2:
                    beat.Slap = true;
                    break;
                case 3:
                    beat.Pop = true;
                    break;
            }
            this.Data.Skip(4);
        }
        if ((flags2 & 4) != 0){
            this.ReadTremoloBarEffect(beat);
        }
        if ((flags & 64) != 0){
            var strokeUp;
            var strokeDown;
            if (this._versionNumber < 500){
                strokeDown = this.Data.ReadByte();
                strokeUp = this.Data.ReadByte();
            }
            else {
                strokeUp = this.Data.ReadByte();
                strokeDown = this.Data.ReadByte();
            }
            if (strokeUp > 0){
                beat.BrushType = AlphaTab.Model.BrushType.BrushUp;
                beat.BrushDuration = AlphaTab.Importer.Gp3To5Importer.ToStrokeValue(strokeUp);
            }
            else if (strokeDown > 0){
                beat.BrushType = AlphaTab.Model.BrushType.BrushDown;
                beat.BrushDuration = AlphaTab.Importer.Gp3To5Importer.ToStrokeValue(strokeDown);
            }
        }
        if ((flags2 & 2) != 0){
            switch (AlphaTab.Platform.Std.ReadSignedByte(this.Data)){
                case 0:
                    beat.PickStroke = AlphaTab.Model.PickStrokeType.None;
                    break;
                case 1:
                    beat.PickStroke = AlphaTab.Model.PickStrokeType.Up;
                    break;
                case 2:
                    beat.PickStroke = AlphaTab.Model.PickStrokeType.Down;
                    break;
            }
        }
    },
    ReadTremoloBarEffect: function (beat){
        this.Data.ReadByte();
        // type
        this.ReadInt32();
        // value
        var pointCount = this.ReadInt32();
        if (pointCount > 0){
            for (var i = 0; i < pointCount; i++){
                var point = new AlphaTab.Model.BendPoint(0, 0);
                point.Offset = this.ReadInt32();
                // 0...60
                point.Value = (this.ReadInt32() / 25) | 0;
                // 0..12 (amount of quarters)
                this.ReadBool();
                // vibrato
                beat.AddWhammyBarPoint(point);
            }
        }
    },
    ReadMixTableChange: function (beat){
        var tableChange = new AlphaTab.Importer.MixTableChange();
        tableChange.Instrument = this.Data.ReadByte();
        if (this._versionNumber >= 500){
            this.Data.Skip(16);
            // Rse Info 
        }
        tableChange.Volume = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        tableChange.Balance = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var chorus = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var reverb = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var phaser = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var tremolo = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        if (this._versionNumber >= 500){
            tableChange.TempoName = this.ReadStringIntByte();
        }
        tableChange.Tempo = this.ReadInt32();
        // durations
        if (tableChange.Volume >= 0){
            this.Data.ReadByte();
        }
        if (tableChange.Balance >= 0){
            this.Data.ReadByte();
        }
        if (chorus >= 0){
            this.Data.ReadByte();
        }
        if (reverb >= 0){
            this.Data.ReadByte();
        }
        if (phaser >= 0){
            this.Data.ReadByte();
        }
        if (tremolo >= 0){
            this.Data.ReadByte();
        }
        if (tableChange.Tempo >= 0){
            tableChange.Duration = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            if (this._versionNumber >= 510){
                this.Data.ReadByte();
                // hideTempo (bool)
            }
        }
        if (this._versionNumber >= 400){
            this.Data.ReadByte();
            // all tracks flag
        }
        // unknown
        if (this._versionNumber >= 500){
            this.Data.ReadByte();
        }
        // unknown
        if (this._versionNumber >= 510){
            this.ReadStringIntByte();
            this.ReadStringIntByte();
        }
        if (tableChange.Volume >= 0){
            var volumeAutomation = new AlphaTab.Model.Automation();
            volumeAutomation.IsLinear = true;
            volumeAutomation.Type = AlphaTab.Model.AutomationType.Volume;
            volumeAutomation.Value = tableChange.Volume;
            beat.Automations.push(volumeAutomation);
        }
        if (tableChange.Balance >= 0){
            var balanceAutomation = new AlphaTab.Model.Automation();
            balanceAutomation.IsLinear = true;
            balanceAutomation.Type = AlphaTab.Model.AutomationType.Balance;
            balanceAutomation.Value = tableChange.Balance;
            beat.Automations.push(balanceAutomation);
        }
        if (tableChange.Instrument >= 0){
            var instrumentAutomation = new AlphaTab.Model.Automation();
            instrumentAutomation.IsLinear = true;
            instrumentAutomation.Type = AlphaTab.Model.AutomationType.Instrument;
            instrumentAutomation.Value = tableChange.Instrument;
            beat.Automations.push(instrumentAutomation);
        }
        if (tableChange.Tempo >= 0){
            var tempoAutomation = new AlphaTab.Model.Automation();
            tempoAutomation.IsLinear = true;
            tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
            tempoAutomation.Value = tableChange.Tempo;
            beat.Automations.push(tempoAutomation);
            beat.Voice.Bar.get_MasterBar().TempoAutomation = tempoAutomation;
        }
    },
    ReadNote: function (track, bar, voice, beat, stringIndex){
        var newNote = new AlphaTab.Model.Note();
        newNote.String = track.Tuning.length - stringIndex;
        var flags = this.Data.ReadByte();
        if ((flags & 2) != 0){
            newNote.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
        }
        else if ((flags & 64) != 0){
            newNote.Accentuated = AlphaTab.Model.AccentuationType.Normal;
        }
        newNote.IsGhost = ((flags & 4) != 0);
        if ((flags & 32) != 0){
            var noteType = this.Data.ReadByte();
            if (noteType == 3){
                newNote.IsDead = true;
            }
            else if (noteType == 2){
                newNote.IsTieDestination = true;
            }
        }
        if ((flags & 1) != 0 && this._versionNumber < 500){
            this.Data.ReadByte();
            // duration 
            this.Data.ReadByte();
            // tuplet
        }
        if ((flags & 16) != 0){
            var dynamicNumber = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newNote.Dynamic = this.ToDynamicValue(dynamicNumber);
            beat.Dynamic = newNote.Dynamic;
        }
        if ((flags & 32) != 0){
            newNote.Fret = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        }
        if ((flags & 128) != 0){
            newNote.LeftHandFinger = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newNote.RightHandFinger = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newNote.IsFingering = true;
        }
        if (this._versionNumber >= 500){
            if ((flags & 1) != 0){
                newNote.DurationPercent = this.ReadDouble();
            }
            var flags2 = this.Data.ReadByte();
            newNote.AccidentalMode = (flags2 & 2) != 0 ? AlphaTab.Model.NoteAccidentalMode.SwapAccidentals : AlphaTab.Model.NoteAccidentalMode.Default;
        }
        beat.AddNote(newNote);
        if ((flags & 8) != 0){
            this.ReadNoteEffects(track, voice, beat, newNote);
        }
    },
    ToDynamicValue: function (value){
        switch (value){
            case 1:
                return AlphaTab.Model.DynamicValue.PPP;
            case 2:
                return AlphaTab.Model.DynamicValue.PP;
            case 3:
                return AlphaTab.Model.DynamicValue.P;
            case 4:
                return AlphaTab.Model.DynamicValue.MP;
            case 5:
                return AlphaTab.Model.DynamicValue.MF;
            case 6:
                return AlphaTab.Model.DynamicValue.F;
            case 7:
                return AlphaTab.Model.DynamicValue.FF;
            case 8:
                return AlphaTab.Model.DynamicValue.FFF;
            default:
                return AlphaTab.Model.DynamicValue.F;
        }
    },
    ReadNoteEffects: function (track, voice, beat, note){
        var flags = this.Data.ReadByte();
        var flags2 = 0;
        if (this._versionNumber >= 400){
            flags2 = this.Data.ReadByte();
        }
        if ((flags & 1) != 0){
            this.ReadBend(note);
        }
        if ((flags & 16) != 0){
            this.ReadGrace(voice, note);
        }
        if ((flags2 & 4) != 0){
            this.ReadTremoloPicking(beat);
        }
        if ((flags2 & 8) != 0){
            this.ReadSlide(note);
        }
        else if (this._versionNumber < 400){
            if ((flags & 4) != 0){
                note.SlideType = AlphaTab.Model.SlideType.Shift;
            }
        }
        if ((flags2 & 16) != 0){
            this.ReadArtificialHarmonic(note);
        }
        else if (this._versionNumber < 400){
            if ((flags & 4) != 0){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                note.HarmonicValue = this.DeltaFretToHarmonicValue(note.Fret);
            }
            if ((flags & 8) != 0){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
            }
        }
        if ((flags2 & 32) != 0){
            this.ReadTrill(note);
        }
        note.IsLetRing = (flags & 8) != 0;
        note.IsHammerPullOrigin = (flags & 2) != 0;
        if ((flags2 & 64) != 0){
            note.Vibrato = AlphaTab.Model.VibratoType.Slight;
        }
        note.IsPalmMute = (flags2 & 2) != 0;
        note.IsStaccato = (flags2 & 1) != 0;
    },
    ReadBend: function (note){
        this.Data.ReadByte();
        // type
        this.ReadInt32();
        // value
        var pointCount = this.ReadInt32();
        if (pointCount > 0){
            for (var i = 0; i < pointCount; i++){
                var point = new AlphaTab.Model.BendPoint(0, 0);
                point.Offset = this.ReadInt32();
                // 0...60
                point.Value = (this.ReadInt32() / 25) | 0;
                // 0..12 (amount of quarters)
                this.ReadBool();
                // vibrato
                note.AddBendPoint(point);
            }
        }
    },
    ReadGrace: function (voice, note){
        var graceBeat = new AlphaTab.Model.Beat();
        var graceNote = new AlphaTab.Model.Note();
        graceNote.String = note.String;
        graceNote.Fret = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        graceBeat.Duration = AlphaTab.Model.Duration.ThirtySecond;
        graceBeat.Dynamic = this.ToDynamicValue(AlphaTab.Platform.Std.ReadSignedByte(this.Data));
        var transition = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        switch (transition){
            case 0:
                break;
            case 1:
                graceNote.SlideType = AlphaTab.Model.SlideType.Legato;
                graceNote.SlideTarget = note;
                break;
            case 2:
                break;
            case 3:
                graceNote.IsHammerPullOrigin = true;
                break;
        }
        graceNote.Dynamic = graceBeat.Dynamic;
        this.Data.Skip(1);
        // duration
        if (this._versionNumber < 500){
            graceBeat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
        }
        else {
            var flags = this.Data.ReadByte();
            graceNote.IsDead = (flags & 1) != 0;
            graceBeat.GraceType = (flags & 2) != 0 ? AlphaTab.Model.GraceType.OnBeat : AlphaTab.Model.GraceType.BeforeBeat;
        }
        graceBeat.AddNote(graceNote);
        voice.AddGraceBeat(graceBeat);
    },
    ReadTremoloPicking: function (beat){
        var speed = this.Data.ReadByte();
        switch (speed){
            case 1:
                beat.TremoloSpeed = AlphaTab.Model.Duration.Eighth;
                break;
            case 2:
                beat.TremoloSpeed = AlphaTab.Model.Duration.Sixteenth;
                break;
            case 3:
                beat.TremoloSpeed = AlphaTab.Model.Duration.ThirtySecond;
                break;
        }
    },
    ReadSlide: function (note){
        if (this._versionNumber >= 500){
            var type = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            switch (type){
                case 1:
                    note.SlideType = AlphaTab.Model.SlideType.Shift;
                    break;
                case 2:
                    note.SlideType = AlphaTab.Model.SlideType.Legato;
                    break;
                case 4:
                    note.SlideType = AlphaTab.Model.SlideType.OutDown;
                    break;
                case 8:
                    note.SlideType = AlphaTab.Model.SlideType.OutUp;
                    break;
                case 16:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromBelow;
                    break;
                case 32:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromAbove;
                    break;
                default:
                    note.SlideType = AlphaTab.Model.SlideType.None;
                    break;
            }
        }
        else {
            var type = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            switch (type){
                case 1:
                    note.SlideType = AlphaTab.Model.SlideType.Shift;
                    break;
                case 2:
                    note.SlideType = AlphaTab.Model.SlideType.Legato;
                    break;
                case 3:
                    note.SlideType = AlphaTab.Model.SlideType.OutDown;
                    break;
                case 4:
                    note.SlideType = AlphaTab.Model.SlideType.OutUp;
                    break;
                case -1:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromBelow;
                    break;
                case -2:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromAbove;
                    break;
                default:
                    note.SlideType = AlphaTab.Model.SlideType.None;
                    break;
            }
        }
    },
    ReadArtificialHarmonic: function (note){
        var type = this.Data.ReadByte();
        if (this._versionNumber >= 500){
            switch (type){
                case 1:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                    note.HarmonicValue = this.DeltaFretToHarmonicValue(note.Fret);
                    break;
                case 2:
                    var harmonicTone = this.Data.ReadByte();
                    var harmonicKey = this.Data.ReadByte();
                    var harmonicOctaveOffset = this.Data.ReadByte();
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
                case 3:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                    note.HarmonicValue = this.DeltaFretToHarmonicValue(this.Data.ReadByte());
                    break;
                case 4:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                    note.HarmonicValue = 12;
                    break;
                case 5:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                    note.HarmonicValue = 12;
                    break;
            }
        }
        else if (this._versionNumber >= 400){
            switch (type){
                case 1:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                    break;
                case 3:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                    break;
                case 4:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                    break;
                case 5:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                    break;
                case 15:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
                case 17:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
                case 22:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
            }
        }
    },
    DeltaFretToHarmonicValue: function (deltaFret){
        switch (deltaFret){
            case 2:
                return 2.4;
            case 3:
                return 3.2;
            case 4:
            case 5:
            case 7:
            case 9:
            case 12:
            case 16:
            case 17:
            case 19:
            case 24:
                return deltaFret;
            case 8:
                return 8.2;
            case 10:
                return 9.6;
            case 14:
            case 15:
                return 14.7;
            case 21:
            case 22:
                return 21.7;
            default:
                return 12;
        }
    },
    ReadTrill: function (note){
        note.TrillValue = this.Data.ReadByte() + note.get_StringTuning();
        switch (this.Data.ReadByte()){
            case 1:
                note.TrillSpeed = AlphaTab.Model.Duration.Sixteenth;
                break;
            case 2:
                note.TrillSpeed = AlphaTab.Model.Duration.ThirtySecond;
                break;
            case 3:
                note.TrillSpeed = AlphaTab.Model.Duration.SixtyFourth;
                break;
        }
    },
    ReadDouble: function (){
        var bytes = new Uint8Array(8);
        this.Data.Read(bytes, 0, bytes.length);
        var sign = 1 - ((bytes[0] >> 7) << 1);
        // sign = bit 0
        var exp = (((bytes[0] << 4) & 2047) | (bytes[1] >> 4)) - 1023;
        // exponent = bits 1..11
        var sig = this.GetDoubleSig(bytes);
        if (sig == 0 && exp == -1023)
            return 0;
        return sign * (1 + Math.pow(2, -52) * sig) * Math.pow(2, exp);
    },
    GetDoubleSig: function (bytes){
        return (((((bytes[1] & 15) << 16) | (bytes[2] << 8) | bytes[3]) * 4294967296 + (bytes[4] >> 7) * 2147483648 + (((bytes[4] & 127) << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]))) | 0;
    },
    ReadColor: function (){
        var r = this.Data.ReadByte();
        var g = this.Data.ReadByte();
        var b = this.Data.ReadByte();
        this.Data.Skip(1);
        // alpha?
        return new AlphaTab.Platform.Model.Color(r, g, b, 255);
    },
    ReadBool: function (){
        return this.Data.ReadByte() != 0;
    },
    ReadInt32: function (){
        var bytes = new Uint8Array(4);
        this.Data.Read(bytes, 0, 4);
        return bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24;
    },
    ReadStringIntUnused: function (){
        this.Data.Skip(4);
        return this.ReadString(this.Data.ReadByte());
    },
    ReadStringInt: function (){
        return this.ReadString(this.ReadInt32());
    },
    ReadStringIntByte: function (){
        var length = this.ReadInt32() - 1;
        this.Data.ReadByte();
        return this.ReadString(length);
    },
    ReadString: function (length){
        var b = new Uint8Array(length);
        this.Data.Read(b, 0, b.length);
        return AlphaTab.Platform.Std.ToString(b);
    },
    ReadStringByteLength: function (length){
        var stringLength = this.Data.ReadByte();
        var s = this.ReadString(stringLength);
        if (stringLength < length){
            this.Data.Skip(length - stringLength);
        }
        return s;
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.Gp3To5Importer.VersionString = "FICHIER GUITAR PRO ";
    AlphaTab.Importer.Gp3To5Importer.BendStep = 25;
});
AlphaTab.Importer.Gp3To5Importer.ToStrokeValue = function (value){
    switch (value){
        case 1:
            return 30;
        case 2:
            return 30;
        case 3:
            return 60;
        case 4:
            return 120;
        case 5:
            return 240;
        case 6:
            return 480;
        default:
            return 0;
    }
};
$Inherit(AlphaTab.Importer.Gp3To5Importer, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.GpxFile = function (){
    this.FileName = null;
    this.FileSize = 0;
    this.Data = null;
};
AlphaTab.Importer.GpxFileSystem = function (){
    this.FileFilter = null;
    this.Files = null;
    this.Files = [];
    this.FileFilter = $CreateAnonymousDelegate(this, function (s){
        return true;
    });
};
AlphaTab.Importer.GpxFileSystem.prototype = {
    Load: function (s){
        var src = new AlphaTab.IO.BitReader(s);
        this.ReadBlock(src);
    },
    ReadHeader: function (src){
        return this.GetString(src.ReadBytes(4), 0, 4);
    },
    Decompress: function (src, skipHeader){
        var uncompressed = AlphaTab.IO.ByteBuffer.Empty();
        var buffer;
        var expectedLength = this.GetInteger(src.ReadBytes(4), 0);
        try{
            // as long we reach our expected length we try to decompress, a EOF might occure. 
            while (uncompressed.get_Length() < expectedLength){
                // compression flag
                var flag = src.ReadBits(1);
                if (flag == 1){
                    // get offset and size of the content we need to read.
                    // compressed does mean we already have read the data and need 
                    // to copy it from our uncompressed buffer to the end
                    var wordSize = src.ReadBits(4);
                    var offset = src.ReadBitsReversed(wordSize);
                    var size = src.ReadBitsReversed(wordSize);
                    // the offset is relative to the end
                    var sourcePosition = uncompressed.get_Length() - offset;
                    var toRead = Math.min(offset, size);
                    // get the subbuffer storing the data and add it again to the end
                    buffer = uncompressed.GetBuffer();
                    uncompressed.Write(buffer, sourcePosition | 0, toRead);
                }
                else {
                    // on raw content we need to read the data from the source buffer 
                    var size = src.ReadBitsReversed(2);
                    for (var i = 0; i < size; i++){
                        uncompressed.WriteByte(src.ReadByte());
                    }
                }
            }
        }
        catch($$e4){
        }
        buffer = uncompressed.GetBuffer();
        var resultOffset = skipHeader ? 4 : 0;
        var resultSize = uncompressed.get_Length() - resultOffset;
        var result = new Uint8Array(resultSize | 0);
        result.set(buffer.subarray(resultOffset,resultOffset+resultSize | 0),0);
        return result;
    },
    ReadBlock: function (data){
        var header = this.ReadHeader(data);
        if (header == "BCFZ"){
            // decompress the data and use this 
            // we will skip the header 
            this.ReadUncompressedBlock(this.Decompress(data, true));
        }
        else if (header == "BCFS"){
            this.ReadUncompressedBlock(data.ReadAll());
        }
        else {
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
    },
    ReadUncompressedBlock: function (data){
        // the uncompressed block contains a list of filesystem entires
        // as long we have data we will try to read more entries
        // the first sector (0x1000 bytes) is empty (filled with 0xFF) 
        // so the first sector starts at 0x1000 
        // (we already skipped the 4 byte header so we don't have to take care of this) 
        var sectorSize = 4096;
        var offset = sectorSize;
        // we always need 4 bytes (+3 including offset) to read the type
        while ((offset + 3) < data.length){
            var entryType = this.GetInteger(data, offset);
            if (entryType == 2){
                // file structure: 
                //   offset |   type   |   size   | what
                //  --------+----------+----------+------
                //    0x04  |  string  |  127byte | FileName (zero terminated)
                //    0x83  |    ?     |    9byte | Unknown 
                //    0x8c  |   int    |    4byte | FileSize
                //    0x90  |    ?     |    4byte | Unknown
                //    0x94  |   int[]  |  n*4byte | Indices of the sector containing the data (end is marked with 0)
                // The sectors marked at 0x94 are absolutely positioned ( 1*0x1000 is sector 1, 2*0x1000 is sector 2,...)
                var file = new AlphaTab.Importer.GpxFile();
                file.FileName = this.GetString(data, offset + 4, 127);
                file.FileSize = this.GetInteger(data, offset + 140);
                // store file if needed
                var storeFile = this.FileFilter == null || this.FileFilter(file.FileName);
                if (storeFile){
                    this.Files.push(file);
                }
                // we need to iterate the blocks because we need to move after the last datasector
                var dataPointerOffset = offset + 148;
                var sector = 0;
                // this var is storing the sector index
                var sectorCount = 0;
                // we're keeping count so we can calculate the offset of the array item
                // as long we have data blocks we need to iterate them, 
                var fileData = storeFile ? AlphaTab.IO.ByteBuffer.WithCapactiy(file.FileSize) : null;
                while ((sector = this.GetInteger(data, (dataPointerOffset + (4 * (sectorCount++))))) != 0){
                    // the next file entry starts after the last data sector so we 
                    // move the offset along
                    offset = sector * sectorSize;
                    // write data only if needed
                    if (storeFile){
                        fileData.Write(data, offset, sectorSize);
                    }
                }
                if (storeFile){
                    // trim data to filesize if needed
                    file.Data = new Uint8Array((Math.min(file.FileSize, fileData.get_Length())) | 0);
                    // we can use the getBuffer here because we are intelligent and know not to read the empty data.
                    var raw = fileData.ToArray();
                    file.Data.set(raw.subarray(0,0+file.Data.length),0);
                }
            }
            // let's move to the next sector
            offset += sectorSize;
        }
    },
    GetString: function (data, offset, length){
        var buf = new Array();
        for (var i = 0; i < length; i++){
            var code = data[offset + i] & 255;
            if (code == 0)
                break;
            // zero terminated string
            buf.push(String.fromCharCode(code));
        }
        return buf.join('');
    },
    GetInteger: function (data, offset){
        return (data[offset + 3] << 24) | (data[offset + 2] << 16) | (data[offset + 1] << 8) | data[offset];
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.GpxFileSystem.HeaderBcFs = "BCFS";
    AlphaTab.Importer.GpxFileSystem.HeaderBcFz = "BCFZ";
    AlphaTab.Importer.GpxFileSystem.ScoreGpif = "score.gpif";
});
AlphaTab.Importer.GpxImporter = function (){
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.GpxImporter.prototype = {
    ReadScore: function (){
        // at first we need to load the binary file system 
        // from the GPX container
        var fileSystem = new AlphaTab.Importer.GpxFileSystem();
        fileSystem.FileFilter = $CreateAnonymousDelegate(this, function (s){
            return s == "score.gpif";
        });
        fileSystem.Load(this.Data);
        // convert data to string
        var data = fileSystem.Files[0].Data;
        var xml = AlphaTab.Platform.Std.ToString(data);
        // lets set the fileSystem to null, maybe the garbage collector will come along
        // and kick the fileSystem binary data before we finish parsing
        fileSystem.Files = null;
        fileSystem = null;
        // the score.gpif file within this filesystem stores
        // the score information as XML we need to parse.
        var parser = new AlphaTab.Importer.GpxParser();
        parser.ParseXml(xml);
        parser.Score.Finish();
        return parser.Score;
    }
};
$Inherit(AlphaTab.Importer.GpxImporter, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.GpxRhythm = function (){
    this.Dots = 0;
    this.TupletDenominator = 0;
    this.TupletNumerator = 0;
    this.Value = AlphaTab.Model.Duration.Whole;
    this.TupletDenominator = 1;
    this.TupletNumerator = 1;
    this.Value = AlphaTab.Model.Duration.Quarter;
};
AlphaTab.Importer.GpxParser = function (){
    this._automations = null;
    this._tracksMapping = null;
    this._tracksById = null;
    this._masterBars = null;
    this._barsOfMasterBar = null;
    this._barsById = null;
    this._voicesOfBar = null;
    this._voiceById = null;
    this._beatsOfVoice = null;
    this._rhythmOfBeat = null;
    this._beatById = null;
    this._rhythmById = null;
    this._noteById = null;
    this._notesOfBeat = null;
    this._tappedNotes = null;
    this.Score = null;
};
AlphaTab.Importer.GpxParser.prototype = {
    ParseXml: function (xml){
        this._automations = {};
        this._tracksMapping = new Array(0);
        this._tracksById = {};
        this._masterBars = [];
        this._barsOfMasterBar = [];
        this._voicesOfBar = {};
        this._barsById = {};
        this._voiceById = {};
        this._beatsOfVoice = {};
        this._beatById = {};
        this._rhythmOfBeat = {};
        this._rhythmById = {};
        this._notesOfBeat = {};
        this._noteById = {};
        this._tappedNotes = {};
        this.ParseDom(AlphaTab.Platform.Std.LoadXml(xml));
    },
    ParseDom: function (dom){
        var root = dom.documentElement;
        if (root == null)
            return;
        // the XML uses IDs for referring elements within the 
        // model. Therefore we do the parsing in 2 steps:
        // - at first we read all model elements and store them by ID in a lookup table
        // - after that we need to join up the information. 
        if (root.localName == "GPIF"){
            this.Score = new AlphaTab.Model.Score();
            // parse all children
            AlphaTab.Platform.Std.IterateChildren(root, $CreateAnonymousDelegate(this, function (n){
                if (n.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                    switch (n.localName){
                        case "Score":
                            this.ParseScoreNode(n);
                            break;
                        case "MasterTrack":
                            this.ParseMasterTrackNode(n);
                            break;
                        case "Tracks":
                            this.ParseTracksNode(n);
                            break;
                        case "MasterBars":
                            this.ParseMasterBarsNode(n);
                            break;
                        case "Bars":
                            this.ParseBars(n);
                            break;
                        case "Voices":
                            this.ParseVoices(n);
                            break;
                        case "Beats":
                            this.ParseBeats(n);
                            break;
                        case "Notes":
                            this.ParseNotes(n);
                            break;
                        case "Rhythms":
                            this.ParseRhythms(n);
                            break;
                    }
                }
            }));
        }
        else {
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        this.BuildModel();
    },
    ParseScoreNode: function (element){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Title":
                        this.Score.Title = this.GetValue(c.firstChild);
                        break;
                    case "SubTitle":
                        this.Score.SubTitle = this.GetValue(c.firstChild);
                        break;
                    case "Artist":
                        this.Score.Artist = this.GetValue(c.firstChild);
                        break;
                    case "Album":
                        this.Score.Album = this.GetValue(c.firstChild);
                        break;
                    case "Words":
                        this.Score.Words = this.GetValue(c.firstChild);
                        break;
                    case "Music":
                        this.Score.Music = this.GetValue(c.firstChild);
                        break;
                    case "WordsAndMusic":
                        if (c.firstChild != null && c.firstChild.toString() != ""){
                        var wordsAndMusic = this.GetValue(c.firstChild);
                        if (!((wordsAndMusic==null)||(wordsAndMusic.length==0)) && ((this.Score.Words==null)||(this.Score.Words.length==0))){
                            this.Score.Words = wordsAndMusic;
                        }
                        if (!((wordsAndMusic==null)||(wordsAndMusic.length==0)) && ((this.Score.Music==null)||(this.Score.Music.length==0))){
                            this.Score.Music = wordsAndMusic;
                        }
                    }
                        break;
                    case "Copyright":
                        this.Score.Copyright = this.GetValue(c.firstChild);
                        break;
                    case "Tabber":
                        this.Score.Tab = this.GetValue(c.firstChild);
                        break;
                    case "Instructions":
                        this.Score.Instructions = this.GetValue(c.firstChild);
                        break;
                    case "Notices":
                        this.Score.Notices = this.GetValue(c.firstChild);
                        break;
                }
            }
        }));
    },
    ParseMasterTrackNode: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Automations":
                        this.ParseAutomations(c);
                        break;
                    case "Tracks":
                        this._tracksMapping = this.GetValue(c).split(" ");
                        break;
                }
            }
        }));
    },
    ParseAutomations: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Automation":
                        this.ParseAutomation(c);
                        break;
                }
            }
        }));
    },
    ParseAutomation: function (node){
        var type = null;
        var isLinear = false;
        var barId = null;
        var ratioPosition = 0;
        var value = 0;
        var reference = 0;
        var text = null;
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Type":
                        type = this.GetValue(c);
                        break;
                    case "Linear":
                        isLinear = this.GetValue(c).toLowerCase() == "true";
                        break;
                    case "Bar":
                        barId = this.GetValue(c);
                        break;
                    case "Position":
                        ratioPosition = AlphaTab.Platform.Std.ParseFloat(this.GetValue(c));
                        break;
                    case "Value":
                        var parts = this.GetValue(c).split(" ");
                        value = AlphaTab.Platform.Std.ParseFloat(parts[0]);
                        reference = AlphaTab.Platform.Std.ParseInt(parts[1]);
                        break;
                    case "Text":
                        text = this.GetValue(c);
                        break;
                }
            }
        }));
        if (type == null)
            return;
        var automation = null;
        switch (type){
            case "Tempo":
                automation = AlphaTab.Model.Automation.BuildTempoAutomation(isLinear, ratioPosition, value, reference);
                break;
        }
        if (automation != null){
            automation.Text = text;
        }
        if (barId != null){
            if (!this._automations.hasOwnProperty(barId)){
                this._automations[barId] = [];
            }
            this._automations[barId].push(automation);
        }
    },
    ParseTracksNode: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Track":
                        this.ParseTrack(c);
                        break;
                }
            }
        }));
    },
    ParseTrack: function (node){
        var track = new AlphaTab.Model.Track(1);
        var trackId = node.getAttribute("id");
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Name":
                        track.Name = this.GetValue(c);
                        break;
                    case "Instrument":
                        var instrumentName = c.getAttribute("ref");
                        if ((instrumentName.lastIndexOf("-gs")==(instrumentName.length-"-gs".length)) || (instrumentName.lastIndexOf("GrandStaff")==(instrumentName.length-"GrandStaff".length))){
                        track.EnsureStaveCount(2);
                    }
                        break;
                    case "ShortName":
                        track.ShortName = this.GetValue(c);
                        break;
                    case "Properties":
                        this.ParseTrackProperties(track, c);
                        break;
                    case "GeneralMidi":
                        this.ParseGeneralMidi(track, c);
                        break;
                    case "PlaybackState":
                        var state = this.GetValue(c);
                        track.PlaybackInfo.IsSolo = state == "Solo";
                        track.PlaybackInfo.IsMute = state == "Mute";
                        break;
                }
            }
        }));
        this._tracksById[trackId] = track;
    },
    ParseDiagramCollection: function (track, node){
        var items = this.FindChildElement(node, "Items");
        AlphaTab.Platform.Std.IterateChildren(items, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Item":
                        this.ParseDiagramItem(track, c);
                        break;
                }
            }
        }));
    },
    ParseDiagramItem: function (track, node){
        var chord = new AlphaTab.Model.Chord();
        var chordId = node.getAttribute("id");
        chord.Name = node.getAttribute("name");
        track.Chords[chordId] = chord;
    },
    FindChildElement: function (node, name){
        for (var i = 0; i < node.childNodes.length; i++){
            var c = node.childNodes[i];
            if (c != null && c.nodeType == AlphaTab.Xml.XmlNodeType.Element && c.localName == name){
                return c;
            }
        }
        return null;
    },
    ParseTrackProperties: function (track, node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Property":
                        this.ParseTrackProperty(track, c);
                        break;
                }
            }
        }));
    },
    ParseTrackProperty: function (track, node){
        var propertyName = node.getAttribute("name");
        switch (propertyName){
            case "Tuning":
                var tuningParts = this.GetValue(this.FindChildElement(node, "Pitches")).split(" ");
                var tuning = new Int32Array(tuningParts.length);
                for (var i = 0; i < tuning.length; i++){
                tuning[tuning.length - 1 - i] = AlphaTab.Platform.Std.ParseInt(tuningParts[i]);
            }
                track.Tuning = tuning;
                break;
            case "DiagramCollection":
                this.ParseDiagramCollection(track, node);
                break;
            case "CapoFret":
                track.Capo = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "Fret")));
                break;
        }
    },
    ParseGeneralMidi: function (track, node){
        track.PlaybackInfo.Port = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "Port")));
        track.PlaybackInfo.Program = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "Program")));
        track.PlaybackInfo.PrimaryChannel = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "PrimaryChannel")));
        track.PlaybackInfo.SecondaryChannel = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "SecondaryChannel")));
        track.IsPercussion = node.getAttribute("table") == "Percussion";
    },
    ParseMasterBarsNode: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "MasterBar":
                        this.ParseMasterBar(c);
                        break;
                }
            }
        }));
    },
    ParseMasterBar: function (node){
        var masterBar = new AlphaTab.Model.MasterBar();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Time":
                        var timeParts = this.GetValue(c).split("/");
                        masterBar.TimeSignatureNumerator = AlphaTab.Platform.Std.ParseInt(timeParts[0]);
                        masterBar.TimeSignatureDenominator = AlphaTab.Platform.Std.ParseInt(timeParts[1]);
                        break;
                    case "DoubleBar":
                        masterBar.IsDoubleBar = true;
                        break;
                    case "Section":
                        masterBar.Section = new AlphaTab.Model.Section();
                        masterBar.Section.Marker = this.GetValue(this.FindChildElement(c, "Letter"));
                        masterBar.Section.Text = this.GetValue(this.FindChildElement(c, "Text"));
                        break;
                    case "Repeat":
                        if (c.getAttribute("start").toLowerCase() == "true"){
                        masterBar.IsRepeatStart = true;
                    }
                        if (c.getAttribute("end").toLowerCase() == "true" && c.getAttribute("count") != null){
                        masterBar.RepeatCount = AlphaTab.Platform.Std.ParseInt(c.getAttribute("count"));
                    }
                        break;
                    case "AlternateEndings":
                        var alternateEndings = this.GetValue(c).split(" ");
                        var i = 0;
                        for (var k = 0; k < alternateEndings.length; k++){
                        i |= 1 << (-1 + AlphaTab.Platform.Std.ParseInt(alternateEndings[k]));
                    }
                        masterBar.AlternateEndings = i;
                        break;
                    case "Bars":
                        this._barsOfMasterBar.push(this.GetValue(c).split(" "));
                        break;
                    case "TripletFeel":
                        switch (this.GetValue(c)){
                            case "NoTripletFeel":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
                            break;
                            case "Triplet8th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet8th;
                            break;
                            case "Triplet16th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet16th;
                            break;
                            case "Dotted8th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Dotted8th;
                            break;
                            case "Dotted16th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Dotted16th;
                            break;
                            case "Scottish8th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Scottish8th;
                            break;
                            case "Scottish16th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Scottish16th;
                            break;
                        }
                        break;
                    case "Key":
                        masterBar.KeySignature = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "AccidentalCount")));
                        var mode = this.FindChildElement(c, "Mode");
                        if (mode != null){
                        switch (this.GetValue(mode).toLowerCase()){
                            case "major":
                                masterBar.KeySignatureType = AlphaTab.Model.KeySignatureType.Major;
                                break;
                            case "minor":
                                masterBar.KeySignatureType = AlphaTab.Model.KeySignatureType.Minor;
                                break;
                        }
                    }
                        break;
                }
            }
        }));
        this._masterBars.push(masterBar);
    },
    ParseBars: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Bar":
                        this.ParseBar(c);
                        break;
                }
            }
        }));
    },
    ParseBar: function (node){
        var bar = new AlphaTab.Model.Bar();
        var barId = node.getAttribute("id");
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Voices":
                        this._voicesOfBar[barId] = this.GetValue(c).split(" ");
                        break;
                    case "Clef":
                        switch (this.GetValue(c)){
                            case "Neutral":
                            bar.Clef = AlphaTab.Model.Clef.Neutral;
                            break;
                            case "G2":
                            bar.Clef = AlphaTab.Model.Clef.G2;
                            break;
                            case "F4":
                            bar.Clef = AlphaTab.Model.Clef.F4;
                            break;
                            case "C4":
                            bar.Clef = AlphaTab.Model.Clef.C4;
                            break;
                            case "C3":
                            bar.Clef = AlphaTab.Model.Clef.C3;
                            break;
                        }
                        break;
                }
            }
        }));
        this._barsById[barId] = bar;
    },
    ParseVoices: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Voice":
                        this.ParseVoice(c);
                        break;
                }
            }
        }));
    },
    ParseVoice: function (node){
        var voice = new AlphaTab.Model.Voice();
        var voiceId = node.getAttribute("id");
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Beats":
                        this._beatsOfVoice[voiceId] = this.GetValue(c).split(" ");
                        break;
                }
            }
        }));
        this._voiceById[voiceId] = voice;
    },
    ParseBeats: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Beat":
                        this.ParseBeat(c);
                        break;
                }
            }
        }));
    },
    ParseBeat: function (node){
        var beat = new AlphaTab.Model.Beat();
        var beatId = node.getAttribute("id");
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Notes":
                        this._notesOfBeat[beatId] = this.GetValue(c).split(" ");
                        break;
                    case "Rhythm":
                        this._rhythmOfBeat[beatId] = c.getAttribute("ref");
                        break;
                    case "Fadding":
                        if (this.GetValue(c) == "FadeIn"){
                        beat.FadeIn = true;
                    }
                        break;
                    case "Tremolo":
                        switch (this.GetValue(c)){
                            case "1/2":
                            beat.TremoloSpeed = AlphaTab.Model.Duration.Eighth;
                            break;
                            case "1/4":
                            beat.TremoloSpeed = AlphaTab.Model.Duration.Sixteenth;
                            break;
                            case "1/8":
                            beat.TremoloSpeed = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                        }
                        break;
                    case "Chord":
                        beat.ChordId = this.GetValue(c);
                        break;
                    case "Hairpin":
                        switch (this.GetValue(c)){
                            case "Crescendo":
                            beat.Crescendo = AlphaTab.Model.CrescendoType.Crescendo;
                            break;
                            case "Decrescendo":
                            beat.Crescendo = AlphaTab.Model.CrescendoType.Decrescendo;
                            break;
                        }
                        break;
                    case "Arpeggio":
                        if (this.GetValue(c) == "Up"){
                        beat.BrushType = AlphaTab.Model.BrushType.ArpeggioUp;
                    }
                        else {
                        beat.BrushType = AlphaTab.Model.BrushType.ArpeggioDown;
                    }
                        break;
                    case "Properties":
                        this.ParseBeatProperties(c, beat);
                        break;
                    case "XProperties":
                        this.ParseBeatXProperties(c, beat);
                        break;
                    case "FreeText":
                        beat.Text = this.GetValue(c);
                        break;
                    case "Dynamic":
                        switch (this.GetValue(c)){
                            case "PPP":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.PPP;
                            break;
                            case "PP":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.PP;
                            break;
                            case "P":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.P;
                            break;
                            case "MP":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.MP;
                            break;
                            case "MF":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.MF;
                            break;
                            case "F":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.F;
                            break;
                            case "FF":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.FF;
                            break;
                            case "FFF":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.FFF;
                            break;
                        }
                        break;
                    case "GraceNotes":
                        switch (this.GetValue(c)){
                            case "OnBeat":
                            beat.GraceType = AlphaTab.Model.GraceType.OnBeat;
                            break;
                            case "BeforeBeat":
                            beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
                            break;
                        }
                        break;
                }
            }
        }));
        this._beatById[beatId] = beat;
    },
    ParseBeatXProperties: function (node, beat){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "XProperty":
                        var id = c.getAttribute("id");
                        switch (id){
                            case "1124204545":
                            var val = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Int")));
                            beat.InvertBeamDirection = val == 1;
                            break;
                        }
                        break;
                }
            }
        }));
    },
    ParseBeatProperties: function (node, beat){
        var isWhammy = false;
        var whammyOrigin = null;
        var whammyMiddleValue = null;
        var whammyMiddleOffset1 = null;
        var whammyMiddleOffset2 = null;
        var whammyDestination = null;
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Property":
                        var name = c.getAttribute("name");
                        switch (name){
                            case "Brush":
                            if (this.GetValue(this.FindChildElement(c, "Direction")) == "Up"){
                            beat.BrushType = AlphaTab.Model.BrushType.BrushUp;
                        }
                            else {
                            beat.BrushType = AlphaTab.Model.BrushType.BrushDown;
                        }
                            break;
                            case "PickStroke":
                            if (this.GetValue(this.FindChildElement(c, "Direction")) == "Up"){
                            beat.PickStroke = AlphaTab.Model.PickStrokeType.Up;
                        }
                            else {
                            beat.PickStroke = AlphaTab.Model.PickStrokeType.Down;
                        }
                            break;
                            case "Slapped":
                            if (this.FindChildElement(c, "Enable") != null)
                            beat.Slap = true;
                            break;
                            case "Popped":
                            if (this.FindChildElement(c, "Enable") != null)
                            beat.Pop = true;
                            break;
                            case "VibratoWTremBar":
                            switch (this.GetValue(this.FindChildElement(c, "Strength"))){
                                case "Wide":
                                beat.Vibrato = AlphaTab.Model.VibratoType.Wide;
                                break;
                                case "Slight":
                                beat.Vibrato = AlphaTab.Model.VibratoType.Slight;
                                break;
                            }
                            break;
                            case "WhammyBar":
                            isWhammy = true;
                            break;
                            case "WhammyBarExtend":
                            break;
                            case "WhammyBarOriginValue":
                            if (whammyOrigin == null)
                            whammyOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            whammyOrigin.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarOriginOffset":
                            if (whammyOrigin == null)
                            whammyOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            whammyOrigin.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarMiddleValue":
                            whammyMiddleValue = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarMiddleOffset1":
                            whammyMiddleOffset1 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarMiddleOffset2":
                            whammyMiddleOffset2 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarDestinationValue":
                            if (whammyDestination == null)
                            whammyDestination = new AlphaTab.Model.BendPoint(60, 0);
                            whammyDestination.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarDestinationOffset":
                            if (whammyDestination == null)
                            whammyDestination = new AlphaTab.Model.BendPoint(0, 0);
                            whammyDestination.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                        }
                        break;
                }
            }
        }));
        if (isWhammy){
            if (whammyOrigin == null)
                whammyOrigin = new AlphaTab.Model.BendPoint(0, 0);
            if (whammyDestination == null)
                whammyDestination = new AlphaTab.Model.BendPoint(60, 0);
            var whammy = [];
            whammy.push(whammyOrigin);
            if (whammyMiddleOffset1 != null && whammyMiddleValue != null){
                whammy.push(new AlphaTab.Model.BendPoint(whammyMiddleOffset1, whammyMiddleValue));
            }
            if (whammyMiddleOffset2 != null && whammyMiddleValue != null){
                whammy.push(new AlphaTab.Model.BendPoint(whammyMiddleOffset2, whammyMiddleValue));
            }
            if (whammyMiddleOffset1 == null && whammyMiddleOffset2 == null && whammyMiddleValue != null){
                whammy.push(new AlphaTab.Model.BendPoint(30, whammyMiddleValue));
            }
            whammy.push(whammyDestination);
            beat.WhammyBarPoints = whammy;
        }
    },
    ParseNotes: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Note":
                        this.ParseNote(c);
                        break;
                }
            }
        }));
    },
    ParseNote: function (node){
        var note = new AlphaTab.Model.Note();
        var noteId = node.getAttribute("id");
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Properties":
                        this.ParseNoteProperties(c, note, noteId);
                        break;
                    case "AntiAccent":
                        if (this.GetValue(c).toLowerCase() == "normal"){
                        note.IsGhost = true;
                    }
                        break;
                    case "LetRing":
                        note.IsLetRing = true;
                        break;
                    case "Trill":
                        note.TrillValue = AlphaTab.Platform.Std.ParseInt(this.GetValue(c));
                        note.TrillSpeed = AlphaTab.Model.Duration.Sixteenth;
                        break;
                    case "Accent":
                        var accentFlags = AlphaTab.Platform.Std.ParseInt(this.GetValue(c));
                        if ((accentFlags & 1) != 0)
                        note.IsStaccato = true;
                        if ((accentFlags & 4) != 0)
                        note.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
                        if ((accentFlags & 8) != 0)
                        note.Accentuated = AlphaTab.Model.AccentuationType.Normal;
                        break;
                    case "Tie":
                        if (c.getAttribute("origin").toLowerCase() == "true"){
                        note.IsTieOrigin = true;
                    }
                        if (c.getAttribute("destination").toLowerCase() == "true"){
                        note.IsTieDestination = true;
                    }
                        break;
                    case "Vibrato":
                        switch (this.GetValue(c)){
                            case "Slight":
                            note.Vibrato = AlphaTab.Model.VibratoType.Slight;
                            break;
                            case "Wide":
                            note.Vibrato = AlphaTab.Model.VibratoType.Wide;
                            break;
                        }
                        break;
                    case "LeftFingering":
                        note.IsFingering = true;
                        switch (this.GetValue(c)){
                            case "P":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.Thumb;
                            break;
                            case "I":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.IndexFinger;
                            break;
                            case "M":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.MiddleFinger;
                            break;
                            case "A":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.AnnularFinger;
                            break;
                            case "C":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.LittleFinger;
                            break;
                        }
                        break;
                    case "RightFingering":
                        note.IsFingering = true;
                        switch (this.GetValue(c)){
                            case "P":
                            note.RightHandFinger = AlphaTab.Model.Fingers.Thumb;
                            break;
                            case "I":
                            note.RightHandFinger = AlphaTab.Model.Fingers.IndexFinger;
                            break;
                            case "M":
                            note.RightHandFinger = AlphaTab.Model.Fingers.MiddleFinger;
                            break;
                            case "A":
                            note.RightHandFinger = AlphaTab.Model.Fingers.AnnularFinger;
                            break;
                            case "C":
                            note.RightHandFinger = AlphaTab.Model.Fingers.LittleFinger;
                            break;
                        }
                        break;
                }
            }
        }));
        this._noteById[noteId] = note;
    },
    ParseNoteProperties: function (node, note, noteId){
        var isBended = false;
        var bendOrigin = null;
        var bendMiddleValue = null;
        var bendMiddleOffset1 = null;
        var bendMiddleOffset2 = null;
        var bendDestination = null;
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Property":
                        var name = c.getAttribute("name");
                        switch (name){
                            case "String":
                            note.String = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "String"))) + 1;
                            break;
                            case "Fret":
                            note.Fret = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Fret")));
                            break;
                            case "Element":
                            note.Element = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Element")));
                            break;
                            case "Variation":
                            note.Variation = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Variation")));
                            break;
                            case "Tapped":
                            this._tappedNotes[noteId] = true;
                            break;
                            case "HarmonicType":
                            var htype = this.FindChildElement(c, "HType");
                            if (htype != null){
                            switch (this.GetValue(htype)){
                                case "NoHarmonic":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.None;
                                    break;
                                case "Natural":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                                    break;
                                case "Artificial":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                                    break;
                                case "Pinch":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                                    break;
                                case "Tap":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                                    break;
                                case "Semi":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                                    break;
                                case "Feedback":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Feedback;
                                    break;
                            }
                        }
                            break;
                            case "HarmonicFret":
                            var hfret = this.FindChildElement(c, "HFret");
                            if (hfret != null){
                            note.HarmonicValue = AlphaTab.Platform.Std.ParseFloat(this.GetValue(hfret));
                        }
                            break;
                            case "Muted":
                            if (this.FindChildElement(c, "Enable") != null)
                            note.IsDead = true;
                            break;
                            case "PalmMuted":
                            if (this.FindChildElement(c, "Enable") != null)
                            note.IsPalmMute = true;
                            break;
                            case "Octave":
                            note.Octave = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Number"))) - 1;
                            break;
                            case "Tone":
                            note.Tone = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Step")));
                            break;
                            case "Bended":
                            isBended = true;
                            break;
                            case "BendOriginValue":
                            if (bendOrigin == null)
                            bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            bendOrigin.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendOriginOffset":
                            if (bendOrigin == null)
                            bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            bendOrigin.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendMiddleValue":
                            bendMiddleValue = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendMiddleOffset1":
                            bendMiddleOffset1 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendMiddleOffset2":
                            bendMiddleOffset2 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendDestinationValue":
                            if (bendDestination == null)
                            bendDestination = new AlphaTab.Model.BendPoint(60, 0);
                            bendDestination.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendDestinationOffset":
                            if (bendDestination == null)
                            bendDestination = new AlphaTab.Model.BendPoint(0, 0);
                            bendDestination.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "HopoOrigin":
                            if (this.FindChildElement(c, "Enable") != null)
                            note.IsHammerPullOrigin = true;
                            break;
                            case "HopoDestination":
                            break;
                            case "Slide":
                            var slideFlags = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Flags")));
                            if ((slideFlags & 1) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.Shift;
                            if ((slideFlags & 2) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.Legato;
                            if ((slideFlags & 4) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.OutDown;
                            if ((slideFlags & 8) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.OutUp;
                            if ((slideFlags & 16) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.IntoFromBelow;
                            if ((slideFlags & 32) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.IntoFromAbove;
                            break;
                        }
                        break;
                }
            }
        }));
        if (isBended){
            if (bendOrigin == null)
                bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
            if (bendDestination == null)
                bendDestination = new AlphaTab.Model.BendPoint(60, 0);
            note.AddBendPoint(bendOrigin);
            if (bendMiddleOffset1 != null && bendMiddleValue != null){
                note.AddBendPoint(new AlphaTab.Model.BendPoint(bendMiddleOffset1, bendMiddleValue));
            }
            if (bendMiddleOffset2 != null && bendMiddleValue != null){
                note.AddBendPoint(new AlphaTab.Model.BendPoint(bendMiddleOffset2, bendMiddleValue));
            }
            if (bendMiddleOffset1 == null && bendMiddleOffset2 == null && bendMiddleValue != null){
                note.AddBendPoint(new AlphaTab.Model.BendPoint(30, bendMiddleValue));
            }
            note.AddBendPoint(bendDestination);
        }
    },
    ToBendValue: function (gpxValue){
        // NOTE: strange IEEE behavior here: 
        // (int)(100f * 0.04f) => 3
        // (100f*0.04f) => 4.0f => (int)4.0f => 4
        var converted = gpxValue * 0.04;
        return ((converted)) | 0;
    },
    ToBendOffset: function (gpxOffset){
        var converted = gpxOffset * 0.6;
        return ((converted)) | 0;
    },
    ParseRhythms: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "Rhythm":
                        this.ParseRhythm(c);
                        break;
                }
            }
        }));
    },
    ParseRhythm: function (node){
        var rhythm = new AlphaTab.Importer.GpxRhythm();
        var rhythmId = node.getAttribute("id");
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "NoteValue":
                        switch (this.GetValue(c)){
                            case "Whole":
                            rhythm.Value = AlphaTab.Model.Duration.Whole;
                            break;
                            case "Half":
                            rhythm.Value = AlphaTab.Model.Duration.Half;
                            break;
                            case "Quarter":
                            rhythm.Value = AlphaTab.Model.Duration.Quarter;
                            break;
                            case "Eighth":
                            rhythm.Value = AlphaTab.Model.Duration.Eighth;
                            break;
                            case "16th":
                            rhythm.Value = AlphaTab.Model.Duration.Sixteenth;
                            break;
                            case "32nd":
                            rhythm.Value = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                            case "64th":
                            rhythm.Value = AlphaTab.Model.Duration.SixtyFourth;
                            break;
                        }
                        break;
                    case "PrimaryTuplet":
                        rhythm.TupletNumerator = AlphaTab.Platform.Std.ParseInt(c.getAttribute("num"));
                        rhythm.TupletDenominator = AlphaTab.Platform.Std.ParseInt(c.getAttribute("den"));
                        break;
                    case "AugmentationDot":
                        rhythm.Dots = AlphaTab.Platform.Std.ParseInt(c.getAttribute("count"));
                        break;
                }
            }
        }));
        this._rhythmById[rhythmId] = rhythm;
    },
    GetValue: function (n){
        return AlphaTab.Platform.Std.GetNodeValue(n);
    },
    BuildModel: function (){
        // build score
        for (var i = 0,j = this._masterBars.length; i < j; i++){
            var masterBar = this._masterBars[i];
            this.Score.AddMasterBar(masterBar);
        }
        // add tracks to score
        for (var $i18 = 0,$t18 = this._tracksMapping,$l18 = $t18.length,trackId = $t18[$i18]; $i18 < $l18; $i18++, trackId = $t18[$i18]){
            var track = this._tracksById[trackId];
            this.Score.AddTrack(track);
        }
        // process all masterbars
        for (var masterBarIndex = 0; masterBarIndex < this._barsOfMasterBar.length; masterBarIndex++){
            var barIds = this._barsOfMasterBar[masterBarIndex];
            // add all bars of masterbar vertically to all tracks
            var staveIndex = 0;
            for (var barIndex = 0,trackIndex = 0; barIndex < barIds.length && trackIndex < this.Score.Tracks.length; barIndex++){
                var barId = barIds[barIndex];
                if (barId != "-1"){
                    var bar = this._barsById[barId];
                    var track = this.Score.Tracks[trackIndex];
                    track.AddBarToStaff(staveIndex, bar);
                    // stave is full? -> next track
                    if (staveIndex == track.Staves.length - 1){
                        trackIndex++;
                        staveIndex = 0;
                    }
                    else {
                        staveIndex++;
                    }
                }
                else {
                    // no bar for track
                    trackIndex++;
                }
            }
        }
        // build bars
        for (var $i19 = 0,$t19 = Object.keys(this._barsById),$l19 = $t19.length,barId = $t19[$i19]; $i19 < $l19; $i19++, barId = $t19[$i19]){
            var bar = this._barsById[barId];
            if (this._voicesOfBar.hasOwnProperty(barId)){
                // add voices to bars
                for (var $i20 = 0,$t20 = this._voicesOfBar[barId],$l20 = $t20.length,voiceId = $t20[$i20]; $i20 < $l20; $i20++, voiceId = $t20[$i20]){
                    if (voiceId != "-1"){
                        bar.AddVoice(this._voiceById[voiceId]);
                    }
                    else {
                        // invalid voice -> empty voice
                        var voice = new AlphaTab.Model.Voice();
                        bar.AddVoice(voice);
                        var beat = new AlphaTab.Model.Beat();
                        beat.IsEmpty = true;
                        beat.Duration = AlphaTab.Model.Duration.Quarter;
                        voice.AddBeat(beat);
                    }
                }
            }
        }
        // build beats
        for (var $i21 = 0,$t21 = Object.keys(this._beatById),$l21 = $t21.length,beatId = $t21[$i21]; $i21 < $l21; $i21++, beatId = $t21[$i21]){
            var beat = this._beatById[beatId];
            var rhythmId = this._rhythmOfBeat[beatId];
            var rhythm = this._rhythmById[rhythmId];
            // set beat duration
            beat.Duration = rhythm.Value;
            beat.Dots = rhythm.Dots;
            beat.TupletNumerator = rhythm.TupletNumerator;
            beat.TupletDenominator = rhythm.TupletDenominator;
            // add notes to beat
            if (this._notesOfBeat.hasOwnProperty(beatId)){
                for (var $i22 = 0,$t22 = this._notesOfBeat[beatId],$l22 = $t22.length,noteId = $t22[$i22]; $i22 < $l22; $i22++, noteId = $t22[$i22]){
                    if (noteId != "-1"){
                        beat.AddNote(this._noteById[noteId]);
                        if (this._tappedNotes.hasOwnProperty(noteId)){
                            beat.Tap = true;
                        }
                    }
                }
            }
        }
        // build voices
        for (var $i23 = 0,$t23 = Object.keys(this._voiceById),$l23 = $t23.length,voiceId = $t23[$i23]; $i23 < $l23; $i23++, voiceId = $t23[$i23]){
            var voice = this._voiceById[voiceId];
            if (this._beatsOfVoice.hasOwnProperty(voiceId)){
                // add beats to voices
                for (var $i24 = 0,$t24 = this._beatsOfVoice[voiceId],$l24 = $t24.length,beatId = $t24[$i24]; $i24 < $l24; $i24++, beatId = $t24[$i24]){
                    if (beatId != "-1"){
                        // important! we clone the beat because beats get reused
                        // in gp6, our model needs to have unique beats.
                        voice.AddBeat(this._beatById[beatId].Clone());
                    }
                }
            }
        }
        // build automations
        for (var $i25 = 0,$t25 = Object.keys(this._automations),$l25 = $t25.length,barId = $t25[$i25]; $i25 < $l25; $i25++, barId = $t25[$i25]){
            var bar = this._barsById[barId];
            for (var i = 0,j = bar.Voices.length; i < j; i++){
                var v = bar.Voices[i];
                if (v.Beats.length > 0){
                    for (var k = 0,l = this._automations[barId].length; k < l; k++){
                        var automation = this._automations[barId][k];
                        v.Beats[0].Automations.push(automation);
                    }
                }
            }
        }
        // build automations
        for (var $i26 = 0,$t26 = Object.keys(this._automations),$l26 = $t26.length,barId = $t26[$i26]; $i26 < $l26; $i26++, barId = $t26[$i26]){
            var automations = this._automations[barId];
            var bar = this._barsById[barId];
            for (var i = 0,j = automations.length; i < j; i++){
                var automation = automations[i];
                if (automation.Type == AlphaTab.Model.AutomationType.Tempo){
                    if (barId == "0"){
                        this.Score.Tempo = ((automation.Value)) | 0;
                        this.Score.TempoLabel = automation.Text;
                    }
                    bar.get_MasterBar().TempoAutomation = automation;
                }
            }
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.GpxParser.InvalidId = "-1";
    AlphaTab.Importer.GpxParser.BendPointPositionFactor = 0.6;
    AlphaTab.Importer.GpxParser.BendPointValueFactor = 0.04;
});
AlphaTab.Importer.MixTableChange = function (){
    this.Volume = 0;
    this.Balance = 0;
    this.Instrument = 0;
    this.TempoName = null;
    this.Tempo = 0;
    this.Duration = 0;
    this.Volume = -1;
    this.Balance = -1;
    this.Instrument = -1;
    this.TempoName = null;
    this.Tempo = -1;
    this.Duration = 0;
};
AlphaTab.Importer.MusicXml2Importer = function (){
    this._score = null;
    this._trackById = null;
    this._trackFirstMeasureNumber = 0;
    this._maxVoices = 0;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.MusicXml2Importer.prototype = {
    ReadScore: function (){
        this._trackById = {};
        var xml = AlphaTab.Platform.Std.ToString(this.Data.ReadAll());
        var dom;
        try{
            dom = AlphaTab.Platform.Std.LoadXml(xml);
        }
        catch($$e5){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        this._score = new AlphaTab.Model.Score();
        this._score.Tempo = 120;
        this.ParseDom(dom);
        this._score.Finish();
        return this._score;
    },
    ParseDom: function (dom){
        var root = dom.documentElement;
        if (root == null)
            return;
        switch (root.localName){
            case "score-partwise":
                this.ParsePartwise(root);
                break;
            case "score-timewise":
                break;
            default:
                throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
    },
    ParsePartwise: function (element){
        var version = element.getAttribute("version");
        if (!((version==null)||(version.length==0)) && version != "2.0"){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "movement-title":
                        this._score.Title = AlphaTab.Platform.Std.GetNodeValue(c.firstChild);
                        break;
                    case "identification":
                        this.ParseIdentification(c);
                        break;
                    case "part-list":
                        this.ParsePartList(c);
                        break;
                    case "part":
                        this.ParsePart(c);
                        break;
                }
            }
        }));
    },
    ParsePart: function (element){
        var id = element.getAttribute("id");
        var track = this._trackById[id];
        var isFirstMeasure = true;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "measure":
                        this.ParseMeasure(c, track, isFirstMeasure);
                        isFirstMeasure = false;
                        break;
                }
            }
        }));
    },
    ParseMeasure: function (element, track, isFirstMeasure){
        var barIndex = 0;
        if (isFirstMeasure){
            this._trackFirstMeasureNumber = AlphaTab.Platform.Std.ParseInt(element.getAttribute("number"));
            barIndex = 0;
        }
        else {
            barIndex = AlphaTab.Platform.Std.ParseInt(element.getAttribute("number")) - this._trackFirstMeasureNumber;
        }
        // create empty bars to the current index
        var bar = null;
        var masterBar = null;
        for (var i = track.Staves[0].Bars.length; i <= barIndex; i++){
            bar = new AlphaTab.Model.Bar();
            masterBar = this.GetOrCreateMasterBar(barIndex);
            track.AddBarToStaff(0, bar);
            for (var j = 0; j < this._maxVoices; j++){
                var emptyVoice = new AlphaTab.Model.Voice();
                bar.AddVoice(emptyVoice);
                var emptyBeat = (function (){
                    var $v1 = new AlphaTab.Model.Beat();
                    $v1.IsEmpty = true;
                    return $v1;
                }).call(this);
                emptyVoice.AddBeat(emptyBeat);
            }
        }
        var chord = false;
        var isFirstBeat = true;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "note":
                        chord = this.ParseNoteBeat(c, track, bar, chord, isFirstBeat);
                        isFirstBeat = false;
                        break;
                    case "forward":
                        break;
                    case "direction":
                        this.ParseDirection(c, masterBar);
                        break;
                    case "attributes":
                        this.ParseAttributes(c, bar, masterBar);
                        break;
                    case "harmony":
                        break;
                    case "sound":
                        break;
                    case "barline":
                        break;
                }
            }
        }));
    },
    ParseNoteBeat: function (element, track, bar, chord, isFirstBeat){
        var voiceIndex = 0;
        var voiceNodes = element.getElementsByTagName("voice");
        if (voiceNodes.length > 0){
            voiceIndex = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(voiceNodes[0])) - 1;
        }
        var beat;
        var voice = this.GetOrCreateVoice(bar, voiceIndex);
        if (chord || (isFirstBeat && voice.Beats.length == 1)){
            beat = voice.Beats[voice.Beats.length - 1];
        }
        else {
            beat = new AlphaTab.Model.Beat();
            voice.AddBeat(beat);
        }
        var note = new AlphaTab.Model.Note();
        beat.AddNote(note);
        beat.IsEmpty = false;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "grace":
                        beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
                        beat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                        break;
                    case "duration":
                        beat.Duration = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "tie":
                        AlphaTab.Importer.MusicXml2Importer.ParseTied(c, note);
                        break;
                    case "cue":
                        break;
                    case "instrument":
                        break;
                    case "type":
                        switch (AlphaTab.Platform.Std.GetNodeValue(c)){
                            case "64th":
                            beat.Duration = AlphaTab.Model.Duration.SixtyFourth;
                            break;
                            case "32nd":
                            beat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                            case "16th":
                            beat.Duration = AlphaTab.Model.Duration.Sixteenth;
                            break;
                            case "eighth":
                            beat.Duration = AlphaTab.Model.Duration.Eighth;
                            break;
                            case "quarter":
                            beat.Duration = AlphaTab.Model.Duration.Quarter;
                            break;
                            case "half":
                            beat.Duration = AlphaTab.Model.Duration.Half;
                            break;
                            case "whole":
                            beat.Duration = AlphaTab.Model.Duration.Whole;
                            break;
                        }
                        break;
                    case "dot":
                        note.IsStaccato = true;
                        break;
                    case "accidental":
                        this.ParseAccidental(c, note);
                        break;
                    case "time-modification":
                        this.ParseTimeModification(c, beat);
                        break;
                    case "stem":
                        break;
                    case "notehead":
                        if (c.getAttribute("parentheses") == "yes"){
                        note.IsGhost = true;
                    }
                        break;
                    case "beam":
                        break;
                    case "notations":
                        this.ParseNotations(c, beat, note);
                        break;
                    case "lyric":
                        break;
                    case "chord":
                        chord = true;
                        break;
                    case "pitch":
                        this.ParsePitch(c, track, beat, note);
                        break;
                    case "unpitched":
                        note.String = 0;
                        note.Fret = 0;
                        break;
                    case "rest":
                        beat.IsEmpty = false;
                        break;
                }
            }
        }));
        return chord;
    },
    ParseAccidental: function (element, note){
        switch (AlphaTab.Platform.Std.GetNodeValue(element)){
            case "sharp":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceSharp;
                break;
            case "natural":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceNatural;
                break;
            case "flat":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceFlat;
                break;
        }
    },
    ParseNotations: function (element, beat, note){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "tied":
                        AlphaTab.Importer.MusicXml2Importer.ParseTied(c, note);
                        break;
                    case "slide":
                        if (c.getAttribute("type") == "start"){
                        note.SlideType = AlphaTab.Model.SlideType.Legato;
                    }
                        break;
                    case "dynamics":
                        this.ParseDynamics(c, beat);
                        break;
                }
            }
        }));
    },
    ParseDynamics: function (element, beat){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "p":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.P;
                        break;
                    case "pp":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.PP;
                        break;
                    case "ppp":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.PPP;
                        break;
                    case "f":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.F;
                        break;
                    case "ff":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.FF;
                        break;
                    case "fff":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.FFF;
                        break;
                    case "mp":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.MP;
                        break;
                    case "mf":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.MF;
                        break;
                }
            }
        }));
    },
    ParseTimeModification: function (element, beat){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "actual-notes":
                        beat.TupletNumerator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "normal-notes":
                        beat.TupletDenominator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
    },
    ParsePitch: function (element, track, beat, note){
        var step = null;
        var semitones = 0;
        var octave = 0;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "step":
                        step = AlphaTab.Platform.Std.GetNodeValue(c);
                        break;
                    case "alter":
                        semitones = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "octave":
                        octave = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
        var fullNoteName = step + octave;
        var fullNoteValue = AlphaTab.Model.TuningParser.GetTuningForText(fullNoteName) + semitones;
        this.ApplyNoteStringFrets(track, beat, note, fullNoteValue);
    },
    ApplyNoteStringFrets: function (track, beat, note, fullNoteValue){
        note.String = this.FindStringForValue(track, beat, fullNoteValue);
        note.Fret = fullNoteValue - AlphaTab.Model.Note.GetStringTuning(track, note.String);
    },
    FindStringForValue: function (track, beat, value){
        // find strings which are already taken
        var takenStrings = {};
        for (var i = 0; i < beat.Notes.length; i++){
            var note = beat.Notes[i];
            takenStrings[note.String] = true;
        }
        // find a string where the note matches into 0 to <upperbound>
        // first try to find a string from 0-14 (more handy to play)
        // then try from 0-20 (guitars with high frets)
        // then unlimited 
        var steps = new Int32Array([14, 20, 2147483647]);
        for (var i = 0; i < steps.length; i++){
            for (var j = 0; j < track.Tuning.length; j++){
                if (!takenStrings.hasOwnProperty(j)){
                    var min = track.Tuning[j];
                    var max = track.Tuning[j] + steps[i];
                    if (value >= min && value <= max){
                        return track.Tuning.length - j;
                    }
                }
            }
        }
        // will not happen
        return 1;
    },
    GetOrCreateVoice: function (bar, index){
        if (index < bar.Voices.length){
            return bar.Voices[index];
        }
        for (var i = bar.Voices.length; i <= index; i++){
            bar.AddVoice(new AlphaTab.Model.Voice());
        }
        this._maxVoices = Math.max(this._maxVoices, bar.Voices.length);
        return bar.Voices[index];
    },
    ParseDirection: function (element, masterBar){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "sound":
                        var tempoAutomation = new AlphaTab.Model.Automation();
                        tempoAutomation.IsLinear = true;
                        tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
                        tempoAutomation.Value = AlphaTab.Platform.Std.ParseInt(c.getAttribute("tempo"));
                        masterBar.TempoAutomation = tempoAutomation;
                        break;
                }
            }
        }));
    },
    ParseAttributes: function (element, bar, masterBar){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "key":
                        this.ParseKey(c, masterBar);
                        break;
                    case "time":
                        this.ParseTime(c, masterBar);
                        break;
                    case "clef":
                        this.ParseClef(c, bar);
                        break;
                }
            }
        }));
    },
    ParseClef: function (element, bar){
        var sign = null;
        var line = null;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "sign":
                        sign = AlphaTab.Platform.Std.GetNodeValue(c);
                        break;
                    case "line":
                        line = AlphaTab.Platform.Std.GetNodeValue(c);
                        break;
                }
            }
        }));
        var clef = sign + line;
        switch (clef){
            case "G2":
                bar.Clef = AlphaTab.Model.Clef.G2;
                break;
            case "F4":
                bar.Clef = AlphaTab.Model.Clef.F4;
                break;
            case "C3":
                bar.Clef = AlphaTab.Model.Clef.C3;
                break;
            case "C4":
                bar.Clef = AlphaTab.Model.Clef.C4;
                break;
        }
    },
    ParseTime: function (element, masterBar){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "beats":
                        masterBar.TimeSignatureNumerator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "beats-type":
                        masterBar.TimeSignatureDenominator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
    },
    ParseKey: function (element, masterBar){
        var fifths = -2147483648;
        var keyStep = -2147483648;
        var keyAlter = -2147483648;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "fifths":
                        fifths = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "key-step":
                        keyStep = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "key-alter":
                        keyAlter = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
        if (fifths != -2147483648){
            // TODO: check if this is conrrect
            masterBar.KeySignature = fifths;
        }
        else {
            // TODO: map keyStep/keyAlter to internal keysignature
        }
    },
    GetOrCreateMasterBar: function (index){
        if (index < this._score.MasterBars.length){
            return this._score.MasterBars[index];
        }
        for (var i = this._score.MasterBars.length; i <= index; i++){
            var mb = new AlphaTab.Model.MasterBar();
            this._score.AddMasterBar(mb);
        }
        return this._score.MasterBars[index];
    },
    ParseIdentification: function (element){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "creator":
                        if (c.getAttribute("type") == "composer"){
                        this._score.Music = AlphaTab.Platform.Std.GetNodeValue(c.firstChild);
                    }
                        break;
                    case "rights":
                        this._score.Artist = AlphaTab.Platform.Std.GetNodeValue(c.firstChild);
                        break;
                }
            }
        }));
    },
    ParsePartList: function (element){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "score-part":
                        this.ParseScorePart(c);
                        break;
                }
            }
        }));
    },
    ParseScorePart: function (element){
        var id = element.getAttribute("id");
        var track = new AlphaTab.Model.Track(1);
        this._trackById[id] = track;
        this._score.AddTrack(track);
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "part-name":
                        track.Name = AlphaTab.Platform.Std.GetNodeValue(c.firstChild);
                        break;
                    case "part-abbreviation":
                        track.ShortName = AlphaTab.Platform.Std.GetNodeValue(c.firstChild);
                        break;
                    case "midi-instrument":
                        this.ParseMidiInstrument(c, track);
                        break;
                }
            }
        }));
        if (track.Tuning == null || track.Tuning.length == 0){
            track.Tuning = AlphaTab.Model.Tuning.GetDefaultTuningFor(6).Tunings;
        }
    },
    ParseMidiInstrument: function (element, track){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.nodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.localName){
                    case "midi-channel":
                        track.PlaybackInfo.PrimaryChannel = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c.firstChild));
                        break;
                    case "midi-program":
                        track.PlaybackInfo.Program = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c.firstChild));
                        break;
                    case "midi-volume":
                        track.PlaybackInfo.Volume = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c.firstChild));
                        break;
                }
            }
        }));
    }
};
AlphaTab.Importer.MusicXml2Importer.ParseTied = function (element, note){
    if (element.getAttribute("type") == "start"){
        note.IsTieOrigin = true;
    }
    else {
        note.IsTieDestination = true;
    }
};
$Inherit(AlphaTab.Importer.MusicXml2Importer, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.NoCompatibleReaderFoundException = function (){
};
AlphaTab.Importer.ScoreLoader = function (){
};
AlphaTab.Importer.ScoreLoader.LoadScoreAsync = function (path, success, error){
    var loader = AlphaTab.Environment.FileLoaders["default"]();
    loader.LoadBinaryAsync(path, function (data){
        var score = null;
        try{
            score = AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data);
        }
        catch(e){
            error(e);
        }
        if (score != null){
            success(score);
        }
    }, error);
};
AlphaTab.Importer.ScoreLoader.LoadScore = function (path){
    var loader = AlphaTab.Environment.FileLoaders["default"]();
    var data = loader.LoadBinary(path);
    return AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data);
};
AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes = function (data){
    var importers = AlphaTab.Importer.ScoreImporter.BuildImporters();
    var score = null;
    var bb = AlphaTab.IO.ByteBuffer.FromBuffer(data);
    for (var $i27 = 0,$l27 = importers.length,importer = importers[$i27]; $i27 < $l27; $i27++, importer = importers[$i27]){
        bb.Reset();
        try{
            importer.Init(bb);
            score = importer.ReadScore();
            break;
        }
        catch(e){
            if (!(e.exception instanceof AlphaTab.Importer.UnsupportedFormatException)){
                throw $CreateException(e, new Error());
            }
        }
    }
    if (score != null){
        return score;
    }
    throw $CreateException(new AlphaTab.Importer.NoCompatibleReaderFoundException(), new Error());
};
AlphaTab.Importer.UnsupportedFormatException = function (){
};
AlphaTab.IO = AlphaTab.IO || {};
AlphaTab.IO.BitReader = function (source){
    this._currentByte = 0;
    this._position = 0;
    this._source = null;
    this._source = source;
    this._position = 8;
    // to ensure a byte is read on beginning
};
AlphaTab.IO.BitReader.prototype = {
    ReadByte: function (){
        return this.ReadBits(8);
    },
    ReadBytes: function (count){
        var bytes = new Uint8Array(count);
        for (var i = 0; i < count; i++){
            bytes[i] = this.ReadByte();
        }
        return bytes;
    },
    ReadBits: function (count){
        var bits = 0;
        var i = count - 1;
        while (i >= 0){
            bits |= (this.ReadBit() << i);
            i--;
        }
        return bits;
    },
    ReadBitsReversed: function (count){
        var bits = 0;
        for (var i = 0; i < count; i++){
            bits |= (this.ReadBit() << i);
        }
        return bits;
    },
    ReadBit: function (){
        // need a new byte? 
        if (this._position >= 8){
            this._currentByte = this._source.ReadByte();
            if (this._currentByte == -1)
                throw $CreateException(new AlphaTab.IO.EndOfReaderException(), new Error());
            this._position = 0;
        }
        // shift the desired byte to the least significant bit and  
        // get the value using masking
        var value = (this._currentByte >> (8 - this._position - 1)) & 1;
        this._position++;
        return value;
    },
    ReadAll: function (){
        var all = AlphaTab.IO.ByteBuffer.Empty();
        try{
            while (true){
                all.WriteByte(this.ReadByte());
            }
        }
        catch($$e6){
        }
        return all.ToArray();
    }
};
$StaticConstructor(function (){
    AlphaTab.IO.BitReader.ByteSize = 8;
});
AlphaTab.IO.FileLoadException = function (message){
};
AlphaTab.IO.EndOfReaderException = function (){
};
AlphaTab.IO.ByteBuffer = function (){
    this._buffer = null;
    this._position = 0;
    this._length = 0;
    this._capacity = 0;
};
AlphaTab.IO.ByteBuffer.prototype = {
    get_Length: function (){
        return this._length;
    },
    GetBuffer: function (){
        return this._buffer;
    },
    Reset: function (){
        this._position = 0;
    },
    Skip: function (offset){
        this._position += offset;
    },
    SetCapacity: function (value){
        if (value != this._capacity){
            if (value > 0){
                var newBuffer = new Uint8Array(value);
                if (this._length > 0)
                    newBuffer.set(this._buffer.subarray(0,0+this._length),0);
                this._buffer = newBuffer;
            }
            else {
                this._buffer = null;
            }
            this._capacity = value;
        }
    },
    ReadByte: function (){
        var n = this._length - this._position;
        if (n <= 0)
            return -1;
        return this._buffer[this._position++];
    },
    Read: function (buffer, offset, count){
        var n = this._length - this._position;
        if (n > count)
            n = count;
        if (n <= 0)
            return 0;
        if (n <= 8){
            var byteCount = n;
            while (--byteCount >= 0)
                buffer[offset + byteCount] = this._buffer[this._position + byteCount];
        }
        else
            buffer.set(this._buffer.subarray(this._position,this._position+n),offset);
        this._position += n;
        return n;
    },
    WriteByte: function (value){
        var buffer = new Uint8Array(1);
        buffer[0] = value;
        this.Write(buffer, 0, 1);
    },
    Write: function (buffer, offset, count){
        var i = this._position + count;
        if (i > this._length){
            if (i > this._capacity){
                this.EnsureCapacity(i);
            }
            this._length = i;
        }
        if ((count <= 8) && (buffer != this._buffer)){
            var byteCount = count;
            while (--byteCount >= 0)
                this._buffer[this._position + byteCount] = buffer[offset + byteCount];
        }
        else {
            this._buffer.set(buffer.subarray(offset,offset+Math.min(count, buffer.length - offset)),this._position);
        }
        this._position = i;
    },
    EnsureCapacity: function (value){
        if (value > this._capacity){
            var newCapacity = value;
            if (newCapacity < 256)
                newCapacity = 256;
            if (newCapacity < this._capacity * 2)
                newCapacity = this._capacity * 2;
            this.SetCapacity(newCapacity);
        }
    },
    ReadAll: function (){
        return this.ToArray();
    },
    ToArray: function (){
        var copy = new Uint8Array(this._length);
        copy.set(this._buffer.subarray(0,0+this._length),0);
        return copy;
    }
};
AlphaTab.IO.ByteBuffer.Empty = function (){
    return AlphaTab.IO.ByteBuffer.WithCapactiy(0);
};
AlphaTab.IO.ByteBuffer.WithCapactiy = function (capacity){
    var buffer = new AlphaTab.IO.ByteBuffer();
    buffer._buffer = new Uint8Array(capacity);
    buffer._capacity = capacity;
    return buffer;
};
AlphaTab.IO.ByteBuffer.FromBuffer = function (data){
    var buffer = new AlphaTab.IO.ByteBuffer();
    buffer._buffer = data;
    buffer._capacity = buffer._length = data.length;
    return buffer;
};
AlphaTab.Model.AccentuationType = {
    None: 0,
    Normal: 1,
    Heavy: 2
};
AlphaTab.Model.AccidentalType = {
    None: 0,
    Natural: 1,
    Sharp: 2,
    Flat: 3
};
AlphaTab.Model.Automation = function (){
    this.IsLinear = false;
    this.Type = AlphaTab.Model.AutomationType.Tempo;
    this.Value = 0;
    this.RatioPosition = 0;
    this.Text = null;
};
AlphaTab.Model.Automation.prototype = {
    Clone: function (){
        var a = new AlphaTab.Model.Automation();
        AlphaTab.Model.Automation.CopyTo(this, a);
        return a;
    }
};
AlphaTab.Model.Automation.BuildTempoAutomation = function (isLinear, ratioPosition, value, reference){
    if (reference < 1 || reference > 5)
        reference = 2;
    var references = new Float32Array([1, 0.5, 1, 1.5, 2, 3]);
    var automation = new AlphaTab.Model.Automation();
    automation.Type = AlphaTab.Model.AutomationType.Tempo;
    automation.IsLinear = isLinear;
    automation.RatioPosition = ratioPosition;
    automation.Value = value * references[reference];
    return automation;
};
AlphaTab.Model.Automation.CopyTo = function (src, dst){
    dst.IsLinear = src.IsLinear;
    dst.RatioPosition = src.RatioPosition;
    dst.Text = src.Text;
    dst.Type = src.Type;
    dst.Value = src.Value;
};
AlphaTab.Model.AutomationType = {
    Tempo: 0,
    Volume: 1,
    Instrument: 2,
    Balance: 3
};
AlphaTab.Model.Bar = function (){
    this.Index = 0;
    this.NextBar = null;
    this.PreviousBar = null;
    this.Clef = AlphaTab.Model.Clef.Neutral;
    this.Staff = null;
    this.Voices = null;
    this.Voices = [];
    this.Clef = AlphaTab.Model.Clef.G2;
};
AlphaTab.Model.Bar.prototype = {
    AddVoice: function (voice){
        voice.Bar = this;
        voice.Index = this.Voices.length;
        this.Voices.push(voice);
    },
    get_MasterBar: function (){
        return this.Staff.Track.Score.MasterBars[this.Index];
    },
    get_IsEmpty: function (){
        for (var i = 0,j = this.Voices.length; i < j; i++){
            if (!this.Voices[i].get_IsEmpty()){
                return false;
            }
        }
        return true;
    },
    Finish: function (){
        for (var i = 0,j = this.Voices.length; i < j; i++){
            var voice = this.Voices[i];
            voice.Finish();
        }
    }
};
AlphaTab.Model.Bar.CopyTo = function (src, dst){
    dst.Index = src.Index;
    dst.Clef = src.Clef;
};
AlphaTab.Model.Beat = function (){
    this._minNote = null;
    this._maxNote = null;
    this._maxStringNote = null;
    this._minStringNote = null;
    this.PreviousBeat = null;
    this.NextBeat = null;
    this.Id = 0;
    this.Index = 0;
    this.Voice = null;
    this.Notes = null;
    this.IsEmpty = false;
    this.Duration = AlphaTab.Model.Duration.Whole;
    this.Automations = null;
    this.Dots = 0;
    this.FadeIn = false;
    this.Lyrics = null;
    this.Pop = false;
    this.HasRasgueado = false;
    this.Slap = false;
    this.Tap = false;
    this.Text = null;
    this.BrushType = AlphaTab.Model.BrushType.None;
    this.BrushDuration = 0;
    this.TupletDenominator = 0;
    this.TupletNumerator = 0;
    this.WhammyBarPoints = null;
    this.MaxWhammyPoint = null;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.ChordId = null;
    this.GraceType = AlphaTab.Model.GraceType.None;
    this.PickStroke = AlphaTab.Model.PickStrokeType.None;
    this.TremoloSpeed = null;
    this.Crescendo = AlphaTab.Model.CrescendoType.None;
    this.Start = 0;
    this.Dynamic = AlphaTab.Model.DynamicValue.PPP;
    this.InvertBeamDirection = false;
    this.Id = AlphaTab.Model.Beat.GlobalBeatId++;
    this.WhammyBarPoints = [];
    this.Notes = [];
    this.BrushType = AlphaTab.Model.BrushType.None;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.GraceType = AlphaTab.Model.GraceType.None;
    this.PickStroke = AlphaTab.Model.PickStrokeType.None;
    this.Duration = AlphaTab.Model.Duration.Quarter;
    this.TremoloSpeed = null;
    this.Automations = [];
    this.Dots = 0;
    this.Start = 0;
    this.TupletDenominator = -1;
    this.TupletNumerator = -1;
    this.Dynamic = AlphaTab.Model.DynamicValue.F;
    this.Crescendo = AlphaTab.Model.CrescendoType.None;
    this.InvertBeamDirection = false;
};
AlphaTab.Model.Beat.prototype = {
    get_MinNote: function (){
        if (this._minNote == null){
            this.RefreshNotes();
        }
        return this._minNote;
    },
    get_MaxNote: function (){
        if (this._maxNote == null){
            this.RefreshNotes();
        }
        return this._maxNote;
    },
    get_MaxStringNote: function (){
        if (this._maxStringNote == null){
            this.RefreshNotes();
        }
        return this._maxStringNote;
    },
    get_MinStringNote: function (){
        if (this._minStringNote == null){
            this.RefreshNotes();
        }
        return this._minStringNote;
    },
    get_IsRest: function (){
        return this.Notes.length == 0;
    },
    get_HasTuplet: function (){
        return !(this.TupletDenominator == -1 && this.TupletNumerator == -1) && !(this.TupletDenominator == 1 && this.TupletNumerator == 1);
    },
    get_HasWhammyBar: function (){
        return this.WhammyBarPoints.length > 0;
    },
    get_HasChord: function (){
        return this.ChordId != null;
    },
    get_Chord: function (){
        return this.Voice.Bar.Staff.Track.Chords[this.ChordId];
    },
    get_IsTremolo: function (){
        return this.TremoloSpeed != null;
    },
    get_AbsoluteStart: function (){
        return this.Voice.Bar.get_MasterBar().Start + this.Start;
    },
    Clone: function (){
        var beat = new AlphaTab.Model.Beat();
        for (var i = 0,j = this.WhammyBarPoints.length; i < j; i++){
            beat.AddWhammyBarPoint(this.WhammyBarPoints[i].Clone());
        }
        for (var i = 0,j = this.Notes.length; i < j; i++){
            beat.AddNote(this.Notes[i].Clone());
        }
        AlphaTab.Model.Beat.CopyTo(this, beat);
        for (var i = 0,j = this.Automations.length; i < j; i++){
            beat.Automations.push(this.Automations[i].Clone());
        }
        return beat;
    },
    AddWhammyBarPoint: function (point){
        this.WhammyBarPoints.push(point);
        if (this.MaxWhammyPoint == null || point.Value > this.MaxWhammyPoint.Value){
            this.MaxWhammyPoint = point;
        }
    },
    RemoveWhammyBarPoint: function (index){
        // check index
        if (index < 0 || index >= this.WhammyBarPoints.length)
            return;
        // remove point
        this.WhammyBarPoints.splice(index,1);
        var point = this.WhammyBarPoints[index];
        // update maxWhammy point if required
        if (point != this.MaxWhammyPoint)
            return;
        this.MaxWhammyPoint = null;
        for (var $i28 = 0,$t28 = this.WhammyBarPoints,$l28 = $t28.length,currentPoint = $t28[$i28]; $i28 < $l28; $i28++, currentPoint = $t28[$i28]){
            if (this.MaxWhammyPoint == null || currentPoint.Value > this.MaxWhammyPoint.Value){
                this.MaxWhammyPoint = currentPoint;
            }
        }
    },
    CalculateDuration: function (){
        var ticks = AlphaTab.Audio.MidiUtils.ToTicks(this.Duration);
        if (this.Dots == 2){
            ticks = AlphaTab.Audio.MidiUtils.ApplyDot(ticks, true);
        }
        else if (this.Dots == 1){
            ticks = AlphaTab.Audio.MidiUtils.ApplyDot(ticks, false);
        }
        if (this.TupletDenominator > 0 && this.TupletNumerator >= 0){
            ticks = AlphaTab.Audio.MidiUtils.ApplyTuplet(ticks, this.TupletNumerator, this.TupletDenominator);
        }
        return ticks;
    },
    AddNote: function (note){
        note.Beat = this;
        note.Index = this.Notes.length;
        this.Notes.push(note);
    },
    RefreshNotes: function (){
        for (var i = 0,j = this.Notes.length; i < j; i++){
            var note = this.Notes[i];
            if (this._minNote == null || note.get_RealValue() < this._minNote.get_RealValue()){
                this._minNote = note;
            }
            if (this._maxNote == null || note.get_RealValue() > this._maxNote.get_RealValue()){
                this._maxNote = note;
            }
            if (this._minStringNote == null || note.String < this._minStringNote.String){
                this._minStringNote = note;
            }
            if (this._maxStringNote == null || note.String > this._maxStringNote.String){
                this._maxStringNote = note;
            }
        }
    },
    GetAutomation: function (type){
        for (var i = 0,j = this.Automations.length; i < j; i++){
            var automation = this.Automations[i];
            if (automation.Type == type){
                return automation;
            }
        }
        return null;
    },
    GetNoteOnString: function (string){
        for (var i = 0,j = this.Notes.length; i < j; i++){
            var note = this.Notes[i];
            if (note.String == string){
                return note;
            }
        }
        return null;
    },
    Finish: function (){
        // start
        if (this.Index == 0){
            this.Start = 0;
        }
        else {
            this.Start = this.PreviousBeat.Start + this.PreviousBeat.CalculateDuration();
        }
        for (var i = 0,j = this.Notes.length; i < j; i++){
            this.Notes[i].Finish();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Beat.WhammyBarMaxPosition = 60;
    AlphaTab.Model.Beat.WhammyBarMaxValue = 24;
    AlphaTab.Model.Beat.GlobalBeatId = 0;
});
AlphaTab.Model.Beat.CopyTo = function (src, dst){
    dst.Index = src.Index;
    dst.IsEmpty = src.IsEmpty;
    dst.Duration = src.Duration;
    dst.Dots = src.Dots;
    dst.FadeIn = src.FadeIn;
    dst.Lyrics = src.Lyrics == null ? null : src.Lyrics.slice();
    dst.Pop = src.Pop;
    dst.HasRasgueado = src.HasRasgueado;
    dst.Slap = src.Slap;
    dst.Tap = src.Tap;
    dst.Text = src.Text;
    dst.BrushType = src.BrushType;
    dst.BrushDuration = src.BrushDuration;
    dst.TupletDenominator = src.TupletDenominator;
    dst.TupletNumerator = src.TupletNumerator;
    dst.Vibrato = src.Vibrato;
    dst.ChordId = src.ChordId;
    dst.GraceType = src.GraceType;
    dst.PickStroke = src.PickStroke;
    dst.TremoloSpeed = src.TremoloSpeed;
    dst.Crescendo = src.Crescendo;
    dst.Start = src.Start;
    dst.Dynamic = src.Dynamic;
    dst.InvertBeamDirection = src.InvertBeamDirection;
};
AlphaTab.Model.BendPoint = function (offset, value){
    this.Offset = 0;
    this.Value = 0;
    this.Offset = offset;
    this.Value = value;
};
AlphaTab.Model.BendPoint.prototype = {
    Clone: function (){
        var point = new AlphaTab.Model.BendPoint(0, 0);
        AlphaTab.Model.BendPoint.CopyTo(this, point);
        return point;
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.BendPoint.MaxPosition = 60;
    AlphaTab.Model.BendPoint.MaxValue = 12;
});
AlphaTab.Model.BendPoint.CopyTo = function (src, dst){
    dst.Offset = src.Offset;
    dst.Value = src.Value;
};
AlphaTab.Model.BrushType = {
    None: 0,
    BrushUp: 1,
    BrushDown: 2,
    ArpeggioUp: 3,
    ArpeggioDown: 4
};
AlphaTab.Model.Chord = function (){
    this.Name = null;
    this.FirstFret = 0;
    this.Strings = null;
    this.Strings = [];
};
AlphaTab.Model.Chord.CopyTo = function (src, dst){
    dst.FirstFret = src.FirstFret;
    dst.Name = src.Name;
    dst.Strings = src.Strings.slice();
};
AlphaTab.Model.Clef = {
    Neutral: 0,
    C3: 1,
    C4: 2,
    F4: 3,
    G2: 4
};
AlphaTab.Model.CrescendoType = {
    None: 0,
    Crescendo: 1,
    Decrescendo: 2
};
AlphaTab.Model.Duration = {
    Whole: 1,
    Half: 2,
    Quarter: 4,
    Eighth: 8,
    Sixteenth: 16,
    ThirtySecond: 32,
    SixtyFourth: 64
};
AlphaTab.Model.DynamicValue = {
    PPP: 0,
    PP: 1,
    P: 2,
    MP: 3,
    MF: 4,
    F: 5,
    FF: 6,
    FFF: 7
};
AlphaTab.Model.Fingers = {
    Unknown: -2,
    NoOrDead: -1,
    Thumb: 0,
    IndexFinger: 1,
    MiddleFinger: 2,
    AnnularFinger: 3,
    LittleFinger: 4
};
AlphaTab.Model.GraceType = {
    None: 0,
    OnBeat: 1,
    BeforeBeat: 2
};
AlphaTab.Model.HarmonicType = {
    None: 0,
    Natural: 1,
    Artificial: 2,
    Pinch: 3,
    Tap: 4,
    Semi: 5,
    Feedback: 6
};
AlphaTab.Model.KeySignatureType = {
    Major: 0,
    Minor: 1
};
AlphaTab.Model.MasterBar = function (){
    this.AlternateEndings = 0;
    this.NextMasterBar = null;
    this.PreviousMasterBar = null;
    this.Index = 0;
    this.KeySignature = 0;
    this.KeySignatureType = AlphaTab.Model.KeySignatureType.Major;
    this.IsDoubleBar = false;
    this.IsRepeatStart = false;
    this.RepeatCount = 0;
    this.RepeatGroup = null;
    this.TimeSignatureNumerator = 0;
    this.TimeSignatureDenominator = 0;
    this.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    this.Section = null;
    this.TempoAutomation = null;
    this.VolumeAutomation = null;
    this.Score = null;
    this.Start = 0;
    this.TimeSignatureDenominator = 4;
    this.TimeSignatureNumerator = 4;
    this.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    this.KeySignatureType = AlphaTab.Model.KeySignatureType.Major;
};
AlphaTab.Model.MasterBar.prototype = {
    get_IsRepeatEnd: function (){
        return this.RepeatCount > 0;
    },
    get_IsSectionStart: function (){
        return this.Section != null;
    },
    CalculateDuration: function (){
        return this.TimeSignatureNumerator * AlphaTab.Audio.MidiUtils.ValueToTicks(this.TimeSignatureDenominator);
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.MasterBar.MaxAlternateEndings = 8;
});
AlphaTab.Model.MasterBar.CopyTo = function (src, dst){
    dst.AlternateEndings = src.AlternateEndings;
    dst.Index = src.Index;
    dst.KeySignature = src.KeySignature;
    dst.KeySignatureType = src.KeySignatureType;
    dst.IsDoubleBar = src.IsDoubleBar;
    dst.IsRepeatStart = src.IsRepeatStart;
    dst.RepeatCount = src.RepeatCount;
    dst.TimeSignatureNumerator = src.TimeSignatureNumerator;
    dst.TimeSignatureDenominator = src.TimeSignatureDenominator;
    dst.TripletFeel = src.TripletFeel;
    dst.Start = src.Start;
};
AlphaTab.Model.ModelUtils = function (){
};
AlphaTab.Model.ModelUtils.GetIndex = function (duration){
    var index = 0;
    var value = duration;
    while ((value = (value >> 1)) > 0){
        index++;
    }
    return index;
};
AlphaTab.Model.ModelUtils.KeySignatureIsFlat = function (ks){
    return ks < 0;
};
AlphaTab.Model.ModelUtils.KeySignatureIsNatural = function (ks){
    return ks == 0;
};
AlphaTab.Model.ModelUtils.KeySignatureIsSharp = function (ks){
    return ks > 0;
};
AlphaTab.Model.NoteAccidentalMode = {
    Default: 0,
    SwapAccidentals: 1,
    ForceNatural: 2,
    ForceSharp: 3,
    ForceFlat: 4
};
AlphaTab.Model.Note = function (){
    this.Index = 0;
    this.Accentuated = AlphaTab.Model.AccentuationType.None;
    this.BendPoints = null;
    this.MaxBendPoint = null;
    this.Fret = 0;
    this.String = 0;
    this.Octave = 0;
    this.Tone = 0;
    this.Element = 0;
    this.Variation = 0;
    this.IsHammerPullOrigin = false;
    this.HammerPullOrigin = null;
    this.HammerPullDestination = null;
    this.HarmonicValue = 0;
    this.HarmonicType = AlphaTab.Model.HarmonicType.None;
    this.IsGhost = false;
    this.IsLetRing = false;
    this.IsPalmMute = false;
    this.IsDead = false;
    this.IsStaccato = false;
    this.SlideType = AlphaTab.Model.SlideType.None;
    this.SlideTarget = null;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.TieOrigin = null;
    this.TieDestination = null;
    this.IsTieDestination = false;
    this.IsTieOrigin = false;
    this.LeftHandFinger = AlphaTab.Model.Fingers.Thumb;
    this.RightHandFinger = AlphaTab.Model.Fingers.Thumb;
    this.IsFingering = false;
    this.TrillValue = 0;
    this.TrillSpeed = AlphaTab.Model.Duration.Whole;
    this.DurationPercent = 0;
    this.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.Default;
    this.Beat = null;
    this.Dynamic = AlphaTab.Model.DynamicValue.PPP;
    this.BendPoints = [];
    this.Dynamic = AlphaTab.Model.DynamicValue.F;
    this.Accentuated = AlphaTab.Model.AccentuationType.None;
    this.Fret = -2147483648;
    this.HarmonicType = AlphaTab.Model.HarmonicType.None;
    this.SlideType = AlphaTab.Model.SlideType.None;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.LeftHandFinger = AlphaTab.Model.Fingers.Unknown;
    this.RightHandFinger = AlphaTab.Model.Fingers.Unknown;
    this.TrillValue = -1;
    this.TrillSpeed = AlphaTab.Model.Duration.ThirtySecond;
    this.DurationPercent = 1;
    this.Octave = -1;
    this.Tone = -1;
    this.Fret = -1;
    this.String = -1;
    this.Element = -1;
    this.Variation = -1;
};
AlphaTab.Model.Note.prototype = {
    get_HasBend: function (){
        return this.BendPoints.length > 0;
    },
    get_IsStringed: function (){
        return this.Fret >= 0 && this.String >= 0;
    },
    get_IsPiano: function (){
        return this.Octave >= 0 && this.Tone >= 0;
    },
    get_IsPercussion: function (){
        return this.Element >= 0 && this.Variation >= 0;
    },
    get_IsHarmonic: function (){
        return this.HarmonicType != AlphaTab.Model.HarmonicType.None;
    },
    get_TrillFret: function (){
        return this.TrillValue - this.get_StringTuning();
    },
    get_IsTrill: function (){
        return this.TrillValue >= 0;
    },
    get_StringTuning: function (){
        return this.Beat.Voice.Bar.Staff.Track.Capo + AlphaTab.Model.Note.GetStringTuning(this.Beat.Voice.Bar.Staff.Track, this.String);
    },
    get_RealValue: function (){
        if (this.get_IsPercussion()){
            return AlphaTab.Rendering.Utils.PercussionMapper.MidiFromElementVariation(this);
        }
        if (this.get_IsStringed()){
            return this.Fret + this.get_StringTuning();
        }
        if (this.get_IsPiano()){
            return this.Octave * 12 + this.Tone;
        }
        return 0;
    },
    Clone: function (){
        var n = new AlphaTab.Model.Note();
        AlphaTab.Model.Note.CopyTo(this, n);
        for (var i = 0,j = this.BendPoints.length; i < j; i++){
            n.AddBendPoint(this.BendPoints[i].Clone());
        }
        return n;
    },
    AddBendPoint: function (point){
        this.BendPoints.push(point);
        if (this.MaxBendPoint == null || point.Value > this.MaxBendPoint.Value){
            this.MaxBendPoint = point;
        }
    },
    Finish: function (){
        var nextNoteOnLine = new AlphaTab.Util.Lazy($CreateAnonymousDelegate(this, function (){
            return AlphaTab.Model.Note.NextNoteOnSameLine(this);
        }));
        var prevNoteOnLine = new AlphaTab.Util.Lazy($CreateAnonymousDelegate(this, function (){
            return AlphaTab.Model.Note.PreviousNoteOnSameLine(this);
        }));
        // connect ties
        if (this.IsTieDestination){
            if (prevNoteOnLine.get_Value() == null){
                this.IsTieDestination = false;
            }
            else {
                this.TieOrigin = prevNoteOnLine.get_Value();
                this.TieOrigin.IsTieOrigin = true;
                this.TieOrigin.TieDestination = this;
                this.Fret = this.TieOrigin.Fret;
            }
        }
        // set hammeron/pulloffs
        if (this.IsHammerPullOrigin){
            if (nextNoteOnLine.get_Value() == null){
                this.IsHammerPullOrigin = false;
            }
            else {
                this.HammerPullDestination = nextNoteOnLine.get_Value();
                this.HammerPullDestination.HammerPullOrigin = this;
            }
        }
        // set slides
        if (this.SlideType != AlphaTab.Model.SlideType.None){
            this.SlideTarget = nextNoteOnLine.get_Value();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Note.MaxOffsetForSameLineSearch = 3;
});
AlphaTab.Model.Note.GetStringTuning = function (track, noteString){
    if (track.Tuning.length > 0)
        return track.Tuning[track.Tuning.length - (noteString - 1) - 1];
    return 0;
};
AlphaTab.Model.Note.CopyTo = function (src, dst){
    dst.Accentuated = src.Accentuated;
    dst.Fret = src.Fret;
    dst.String = src.String;
    dst.IsHammerPullOrigin = src.IsHammerPullOrigin;
    dst.HarmonicValue = src.HarmonicValue;
    dst.HarmonicType = src.HarmonicType;
    dst.IsGhost = src.IsGhost;
    dst.IsLetRing = src.IsLetRing;
    dst.IsPalmMute = src.IsPalmMute;
    dst.IsDead = src.IsDead;
    dst.IsStaccato = src.IsStaccato;
    dst.SlideType = src.SlideType;
    dst.Vibrato = src.Vibrato;
    dst.IsTieDestination = src.IsTieDestination;
    dst.LeftHandFinger = src.LeftHandFinger;
    dst.RightHandFinger = src.RightHandFinger;
    dst.IsFingering = src.IsFingering;
    dst.TrillValue = src.TrillValue;
    dst.TrillSpeed = src.TrillSpeed;
    dst.DurationPercent = src.DurationPercent;
    dst.AccidentalMode = src.AccidentalMode;
    dst.Dynamic = src.Dynamic;
    dst.Octave = src.Octave;
    dst.Tone = src.Tone;
    dst.Element = src.Element;
    dst.Variation = src.Variation;
};
AlphaTab.Model.Note.NextNoteOnSameLine = function (note){
    var nextBeat = note.Beat.NextBeat;
    // keep searching in same bar
    while (nextBeat != null && nextBeat.Voice.Bar.Index <= note.Beat.Voice.Bar.Index + 3){
        var noteOnString = nextBeat.GetNoteOnString(note.String);
        if (noteOnString != null){
            return noteOnString;
        }
        else {
            nextBeat = nextBeat.NextBeat;
        }
    }
    return null;
};
AlphaTab.Model.Note.PreviousNoteOnSameLine = function (note){
    var previousBeat = note.Beat.PreviousBeat;
    // keep searching in same bar
    while (previousBeat != null && previousBeat.Voice.Bar.Index >= note.Beat.Voice.Bar.Index - 3){
        var noteOnString = previousBeat.GetNoteOnString(note.String);
        if (noteOnString != null){
            return noteOnString;
        }
        else {
            previousBeat = previousBeat.PreviousBeat;
        }
    }
    return null;
};
AlphaTab.Model.PickStrokeType = {
    None: 0,
    Up: 1,
    Down: 2
};
AlphaTab.Model.PlaybackInformation = function (){
    this.Volume = 0;
    this.Balance = 0;
    this.Port = 0;
    this.Program = 0;
    this.PrimaryChannel = 0;
    this.SecondaryChannel = 0;
    this.IsMute = false;
    this.IsSolo = false;
    this.Volume = 15;
    this.Balance = 8;
    this.Port = 1;
};
AlphaTab.Model.PlaybackInformation.CopyTo = function (src, dst){
    dst.Volume = src.Volume;
    dst.Balance = src.Balance;
    dst.Port = src.Port;
    dst.Program = src.Program;
    dst.PrimaryChannel = src.PrimaryChannel;
    dst.SecondaryChannel = src.SecondaryChannel;
    dst.IsMute = src.IsMute;
    dst.IsSolo = src.IsSolo;
};
AlphaTab.Model.RepeatGroup = function (){
    this.MasterBars = null;
    this.Openings = null;
    this.Closings = null;
    this.IsClosed = false;
    this.MasterBars = [];
    this.Openings = [];
    this.Closings = [];
    this.IsClosed = false;
};
AlphaTab.Model.RepeatGroup.prototype = {
    AddMasterBar: function (masterBar){
        if (this.Openings.length == 0){
            this.Openings.push(masterBar);
        }
        this.MasterBars.push(masterBar);
        masterBar.RepeatGroup = this;
        if (masterBar.get_IsRepeatEnd()){
            this.Closings.push(masterBar);
            this.IsClosed = true;
        }
        else if (this.IsClosed){
            this.IsClosed = false;
            this.Openings.push(masterBar);
        }
    }
};
AlphaTab.Model.Score = function (){
    this._currentRepeatGroup = null;
    this.Album = null;
    this.Artist = null;
    this.Copyright = null;
    this.Instructions = null;
    this.Music = null;
    this.Notices = null;
    this.SubTitle = null;
    this.Title = null;
    this.Words = null;
    this.Tab = null;
    this.Tempo = 0;
    this.TempoLabel = null;
    this.MasterBars = null;
    this.Tracks = null;
    this.MasterBars = [];
    this.Tracks = [];
    this._currentRepeatGroup = new AlphaTab.Model.RepeatGroup();
};
AlphaTab.Model.Score.prototype = {
    AddMasterBar: function (bar){
        bar.Score = this;
        bar.Index = this.MasterBars.length;
        if (this.MasterBars.length != 0){
            bar.PreviousMasterBar = this.MasterBars[this.MasterBars.length - 1];
            bar.PreviousMasterBar.NextMasterBar = bar;
            bar.Start = bar.PreviousMasterBar.Start + bar.PreviousMasterBar.CalculateDuration();
        }
        // if the group is closed only the next upcoming header can
        // reopen the group in case of a repeat alternative, so we 
        // remove the current group 
        if (bar.IsRepeatStart || (this._currentRepeatGroup.IsClosed && bar.AlternateEndings <= 0)){
            this._currentRepeatGroup = new AlphaTab.Model.RepeatGroup();
        }
        this._currentRepeatGroup.AddMasterBar(bar);
        this.MasterBars.push(bar);
    },
    AddTrack: function (track){
        track.Score = this;
        track.Index = this.Tracks.length;
        this.Tracks.push(track);
    },
    Finish: function (){
        for (var i = 0,j = this.Tracks.length; i < j; i++){
            this.Tracks[i].Finish();
        }
    }
};
AlphaTab.Model.Score.CopyTo = function (src, dst){
    dst.Album = src.Album;
    dst.Artist = src.Artist;
    dst.Copyright = src.Copyright;
    dst.Instructions = src.Instructions;
    dst.Music = src.Music;
    dst.Notices = src.Notices;
    dst.SubTitle = src.SubTitle;
    dst.Title = src.Title;
    dst.Words = src.Words;
    dst.Tab = src.Tab;
    dst.Tempo = src.Tempo;
    dst.TempoLabel = src.TempoLabel;
};
AlphaTab.Model.Section = function (){
    this.Marker = null;
    this.Text = null;
};
AlphaTab.Model.Section.CopyTo = function (src, dst){
    dst.Marker = src.Marker;
    dst.Text = src.Text;
};
AlphaTab.Model.SlideType = {
    None: 0,
    Shift: 1,
    Legato: 2,
    IntoFromBelow: 3,
    IntoFromAbove: 4,
    OutUp: 5,
    OutDown: 6
};
AlphaTab.Model.Staff = function (){
    this.Bars = null;
    this.Track = null;
    this.Index = 0;
    this.Bars = [];
};
AlphaTab.Model.Staff.prototype = {
    Finish: function (){
        for (var i = 0,j = this.Bars.length; i < j; i++){
            this.Bars[i].Finish();
        }
    }
};
AlphaTab.Model.Track = function (staveCount){
    this.Capo = 0;
    this.Index = 0;
    this.Name = null;
    this.ShortName = null;
    this.Tuning = null;
    this.TuningName = null;
    this.Color = null;
    this.PlaybackInfo = null;
    this.IsPercussion = false;
    this.Score = null;
    this.Staves = null;
    this.Chords = null;
    this.Name = "";
    this.ShortName = "";
    this.Tuning = new Int32Array(0);
    this.Chords = {};
    this.PlaybackInfo = new AlphaTab.Model.PlaybackInformation();
    this.Color = new AlphaTab.Platform.Model.Color(200, 0, 0, 255);
    this.Staves = [];
    this.EnsureStaveCount(staveCount);
};
AlphaTab.Model.Track.prototype = {
    EnsureStaveCount: function (staveCount){
        while (this.Staves.length < staveCount){
            var staff = new AlphaTab.Model.Staff();
            staff.Index = this.Staves.length;
            staff.Track = this;
            this.Staves.push(staff);
        }
    },
    AddBarToStaff: function (staffIndex, bar){
        var staff = this.Staves[staffIndex];
        var bars = staff.Bars;
        bar.Staff = staff;
        bar.Index = bars.length;
        if (bars.length > 0){
            bar.PreviousBar = bars[bars.length - 1];
            bar.PreviousBar.NextBar = bar;
        }
        bars.push(bar);
    },
    Finish: function (){
        if (((this.ShortName==null)||(this.ShortName.length==0))){
            this.ShortName = this.Name;
            if (this.ShortName.length > 10)
                this.ShortName = this.ShortName.substr(0, 10);
        }
        for (var i = 0,j = this.Staves.length; i < j; i++){
            this.Staves[i].Finish();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Track.ShortNameMaxLength = 10;
});
AlphaTab.Model.Track.CopyTo = function (src, dst){
    dst.Name = src.Name;
    dst.Capo = src.Capo;
    dst.Index = src.Index;
    dst.ShortName = src.ShortName;
    dst.Tuning = new Int32Array(src.Tuning);
    dst.Color.Raw = src.Color.Raw;
    dst.IsPercussion = src.IsPercussion;
};
AlphaTab.Model.TripletFeel = {
    NoTripletFeel: 0,
    Triplet16th: 1,
    Triplet8th: 2,
    Dotted16th: 3,
    Dotted8th: 4,
    Scottish16th: 5,
    Scottish8th: 6
};
AlphaTab.Model.Tuning = function (name, tuning, isStandard){
    this.IsStandard = false;
    this.Name = null;
    this.Tunings = null;
    this.IsStandard = isStandard;
    this.Name = name;
    this.Tunings = tuning;
};
AlphaTab.Model.Tuning.GetTextForTuning = function (tuning, includeOctave){
    var octave = (tuning / 12) | 0;
    var note = tuning % 12;
    var notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    var result = notes[note];
    if (includeOctave){
        result += octave;
    }
    return result;
};
AlphaTab.Model.Tuning.GetDefaultTuningFor = function (stringCount){
    if (AlphaTab.Model.Tuning._defaultTunings.hasOwnProperty(stringCount))
        return AlphaTab.Model.Tuning._defaultTunings[stringCount];
    return null;
};
AlphaTab.Model.Tuning.GetPresetsFor = function (stringCount){
    switch (stringCount){
        case 7:
            return AlphaTab.Model.Tuning._sevenStrings;
        case 6:
            return AlphaTab.Model.Tuning._sixStrings;
        case 5:
            return AlphaTab.Model.Tuning._fiveStrings;
        case 4:
            return AlphaTab.Model.Tuning._fourStrings;
    }
    return [];
};
$StaticConstructor(function (){
    AlphaTab.Model.Tuning._sevenStrings = null;
    AlphaTab.Model.Tuning._sixStrings = null;
    AlphaTab.Model.Tuning._fiveStrings = null;
    AlphaTab.Model.Tuning._fourStrings = null;
    AlphaTab.Model.Tuning._defaultTunings = null;
    AlphaTab.Model.Tuning.Initialize();
});
AlphaTab.Model.Tuning.Initialize = function (){
    AlphaTab.Model.Tuning._sevenStrings = [];
    AlphaTab.Model.Tuning._sixStrings = [];
    AlphaTab.Model.Tuning._fiveStrings = [];
    AlphaTab.Model.Tuning._fourStrings = [];
    AlphaTab.Model.Tuning._defaultTunings = {};
    AlphaTab.Model.Tuning._defaultTunings[7] = new AlphaTab.Model.Tuning("Guitar 7 strings", new Int32Array([64, 59, 55, 50, 45, 40, 35]), true);
    AlphaTab.Model.Tuning._sevenStrings.push(AlphaTab.Model.Tuning._defaultTunings[7]);
    AlphaTab.Model.Tuning._defaultTunings[6] = new AlphaTab.Model.Tuning("Guitar Standard Tuning", new Int32Array([64, 59, 55, 50, 45, 40]), true);
    AlphaTab.Model.Tuning._sixStrings.push(AlphaTab.Model.Tuning._defaultTunings[6]);
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Tune down � step", new Int32Array([63, 58, 54, 49, 44, 39]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Tune down 1 step", new Int32Array([62, 57, 53, 48, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Tune down 2 step", new Int32Array([60, 55, 51, 46, 41, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped D Tuning", new Int32Array([64, 59, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped D Tuning variant", new Int32Array([64, 57, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Double Dropped D Tuning", new Int32Array([62, 59, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped E Tuning", new Int32Array([66, 61, 57, 52, 47, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped C Tuning", new Int32Array([62, 57, 53, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open C Tuning", new Int32Array([64, 60, 55, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Cm Tuning", new Int32Array([63, 60, 55, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open C6 Tuning", new Int32Array([64, 57, 55, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Cmaj7 Tuning", new Int32Array([64, 59, 55, 52, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open D Tuning", new Int32Array([62, 57, 54, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Dm Tuning", new Int32Array([62, 57, 53, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open D5 Tuning", new Int32Array([62, 57, 50, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open D6 Tuning", new Int32Array([62, 59, 54, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Dsus4 Tuning", new Int32Array([62, 57, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open E Tuning", new Int32Array([64, 59, 56, 52, 47, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Em Tuning", new Int32Array([64, 59, 55, 52, 47, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Esus11 Tuning", new Int32Array([64, 59, 55, 52, 45, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open F Tuning", new Int32Array([65, 60, 53, 48, 45, 41]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open G Tuning", new Int32Array([62, 59, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Gm Tuning", new Int32Array([62, 58, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open G6 Tuning", new Int32Array([64, 59, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Gsus4 Tuning", new Int32Array([62, 60, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open A Tuning", new Int32Array([64, 61, 57, 52, 45, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Am Tuning", new Int32Array([64, 60, 57, 52, 45, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Nashville Tuning", new Int32Array([64, 59, 67, 62, 57, 52]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Bass 6 Strings Tuning", new Int32Array([48, 43, 38, 33, 28, 23]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Lute or Vihuela Tuning", new Int32Array([64, 59, 54, 50, 45, 40]), false));
    AlphaTab.Model.Tuning._defaultTunings[5] = new AlphaTab.Model.Tuning("Bass 5 Strings Tuning", new Int32Array([43, 38, 33, 28, 23]), true);
    AlphaTab.Model.Tuning._fiveStrings.push(AlphaTab.Model.Tuning._defaultTunings[5]);
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo Dropped C Tuning", new Int32Array([62, 59, 55, 48, 67]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo Open D Tuning", new Int32Array([62, 57, 54, 50, 69]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo Open G Tuning", new Int32Array([62, 59, 55, 50, 67]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo G Minor Tuning", new Int32Array([62, 58, 55, 50, 67]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo G Modal Tuning", new Int32Array([62, 57, 55, 50, 67]), false));
    AlphaTab.Model.Tuning._defaultTunings[4] = new AlphaTab.Model.Tuning("Bass Standard Tuning", new Int32Array([43, 38, 33, 28]), true);
    AlphaTab.Model.Tuning._fourStrings.push(AlphaTab.Model.Tuning._defaultTunings[4]);
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Tune down � step", new Int32Array([42, 37, 32, 27]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Tune down 1 step", new Int32Array([41, 36, 31, 26]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Tune down 2 step", new Int32Array([39, 34, 29, 24]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Dropped D Tuning", new Int32Array([43, 38, 33, 26]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Ukulele C Tuning", new Int32Array([45, 40, 36, 43]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Ukulele G Tuning", new Int32Array([52, 47, 43, 38]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Mandolin Standard Tuning", new Int32Array([64, 57, 50, 43]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Mandolin or Violin Tuning", new Int32Array([76, 69, 62, 55]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Viola Tuning", new Int32Array([69, 62, 55, 48]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Cello Tuning", new Int32Array([57, 50, 43, 36]), false));
};
AlphaTab.Model.Tuning.FindTuning = function (strings){
    var tunings = AlphaTab.Model.Tuning.GetPresetsFor(strings.length);
    for (var t = 0,tc = tunings.length; t < tc; t++){
        var tuning = tunings[t];
        var equals = true;
        for (var i = 0,j = strings.length; i < j; i++){
            if (strings[i] != tuning.Tunings[i]){
                equals = false;
                break;
            }
        }
        if (equals){
            return tuning;
        }
    }
    return null;
};
AlphaTab.Model.VibratoType = {
    None: 0,
    Slight: 1,
    Wide: 2
};
AlphaTab.Model.Voice = function (){
    this.Index = 0;
    this.Bar = null;
    this.Beats = null;
    this.Beats = [];
};
AlphaTab.Model.Voice.prototype = {
    get_IsEmpty: function (){
        return this.Beats.length == 0 || (this.Beats.length == 1 && this.Beats[0].IsEmpty);
    },
    AddBeat: function (beat){
        // chaining
        beat.Voice = this;
        beat.Index = this.Beats.length;
        this.Beats.push(beat);
    },
    Chain: function (beat){
        if (this.Bar == null)
            return;
        if (this.Bar.Index == 0 && beat.Index == 0){
            // very first beat
            beat.PreviousBeat = null;
        }
        else if (beat.Index == 0){
            // first beat of bar
            var previousVoice = this.Bar.PreviousBar.Voices[this.Index];
            beat.PreviousBeat = previousVoice.Beats[previousVoice.Beats.length - 1];
            beat.PreviousBeat.NextBeat = beat;
        }
        else {
            // other beats of bar
            beat.PreviousBeat = this.Beats[beat.Index - 1];
            beat.PreviousBeat.NextBeat = beat;
        }
    },
    AddGraceBeat: function (beat){
        if (this.Beats.length == 0){
            this.AddBeat(beat);
            return;
        }
        // remove last beat
        var lastBeat = this.Beats[this.Beats.length - 1];
        this.Beats.splice(this.Beats.length - 1,1);
        // insert grace beat
        this.AddBeat(beat);
        // reinsert last beat
        this.AddBeat(lastBeat);
    },
    Finish: function (){
        // TODO: find a proper solution to chain beats without iterating twice
        for (var i = 0,j = this.Beats.length; i < j; i++){
            var beat = this.Beats[i];
            this.Chain(beat);
        }
        for (var i = 0,j = this.Beats.length; i < j; i++){
            var beat = this.Beats[i];
            beat.Finish();
        }
    }
};
AlphaTab.Model.Voice.CopyTo = function (src, dst){
    dst.Index = src.Index;
};
AlphaTab.Platform.Model = AlphaTab.Platform.Model || {};
AlphaTab.Platform.Model.Color = function (r, g, b, a){
    this.Raw = 0;
    this.RGBA = null;
    this.Raw = (a << 24) | (r << 16) | (g << 8) | b;
    this.RGBA = "rgba(" + this.get_R() + "," + this.get_G() + "," + this.get_B() + "," + (this.get_A() / 255) + ")";
};
AlphaTab.Platform.Model.Color.prototype = {
    get_A: function (){
        return ((this.Raw >> 24) & 255);
    },
    get_R: function (){
        return ((this.Raw >> 16) & 255);
    },
    get_G: function (){
        return ((this.Raw >> 8) & 255);
    },
    get_B: function (){
        return (this.Raw & 255);
    }
};
AlphaTab.Platform.Model.FontStyle = {
    Plain: 0,
    Bold: 1,
    Italic: 2
};
AlphaTab.Platform.Model.Font = function (family, size, style){
    this._css = null;
    this.Family = null;
    this.Size = 0;
    this.Style = AlphaTab.Platform.Model.FontStyle.Plain;
    this.Family = family;
    this.Size = size;
    this.Style = style;
    this._css = this.ToCssString(1);
};
AlphaTab.Platform.Model.Font.prototype = {
    get_IsBold: function (){
        return (this.Style & AlphaTab.Platform.Model.FontStyle.Bold) != AlphaTab.Platform.Model.FontStyle.Plain;
    },
    get_IsItalic: function (){
        return (this.Style & AlphaTab.Platform.Model.FontStyle.Italic) != AlphaTab.Platform.Model.FontStyle.Plain;
    },
    Clone: function (){
        return new AlphaTab.Platform.Model.Font(this.Family, this.Size, this.Style);
    },
    ToCssString: function (scale){
        if (this._css != null && scale == 1){
            return this._css;
        }
        var buf = new Array();
        if (this.get_IsBold()){
            buf.push("bold ");
        }
        if (this.get_IsItalic()){
            buf.push("italic ");
        }
        buf.push(this.Size * scale);
        buf.push("px ");
        buf.push("\'");
        buf.push(this.Family);
        buf.push("\'");
        return buf.join('');
    }
};
AlphaTab.Platform.Model.TextAlign = {
    Left: 0,
    Center: 1,
    Right: 2
};
AlphaTab.Platform.Model.TextBaseline = {
    Default: 0,
    Top: 1,
    Middle: 2,
    Bottom: 3
};
AlphaTab.Platform.Svg = AlphaTab.Platform.Svg || {};
AlphaTab.Platform.Svg.FontSizes = function (){
};
$StaticConstructor(function (){
    AlphaTab.Platform.Svg.FontSizes.TimesNewRoman = new Uint8Array([3, 4, 5, 6, 6, 9, 9, 2, 4, 4, 6, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 5, 10, 8, 7, 7, 8, 7, 6, 7, 8, 4, 4, 8, 7, 10, 8, 8, 7, 8, 7, 5, 8, 8, 7, 11, 8, 8, 7, 4, 3, 4, 5, 6, 4, 5, 5, 5, 5, 5, 4, 5, 6, 3, 3, 6, 3, 9, 6, 6, 6, 5, 4, 4, 4, 5, 6, 7, 6, 6, 5, 5, 2, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 6, 6, 6, 6, 2, 5, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 3, 3, 4, 5, 5, 4, 4, 3, 3, 6, 8, 8, 8, 5, 8, 8, 8, 8, 8, 8, 11, 7, 7, 7, 7, 7, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 8, 6, 8, 8, 8, 8, 8, 8, 6, 5, 5, 5, 5, 5, 5, 5, 8, 5, 5, 5, 5, 5, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 6, 6]);
    AlphaTab.Platform.Svg.FontSizes.Arial11Pt = new Uint8Array([3, 3, 4, 6, 6, 10, 7, 2, 4, 4, 4, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 11, 7, 7, 8, 8, 7, 7, 9, 8, 3, 6, 7, 6, 9, 8, 9, 7, 9, 8, 7, 7, 8, 7, 10, 7, 7, 7, 3, 3, 3, 5, 6, 4, 6, 6, 6, 6, 6, 3, 6, 6, 2, 2, 6, 2, 9, 6, 6, 6, 6, 4, 6, 3, 6, 6, 8, 6, 6, 6, 4, 3, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 6, 6, 6, 6, 3, 6, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 4, 4, 4, 6, 6, 4, 4, 4, 4, 6, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 11, 8, 7, 7, 7, 7, 3, 3, 3, 3, 8, 8, 9, 9, 9, 9, 9, 6, 9, 8, 8, 8, 8, 7, 7, 7, 6, 6, 6, 6, 6, 6, 10, 6, 6, 6, 6, 6, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 7, 6, 6, 6, 6, 6, 6]);
    AlphaTab.Platform.Svg.FontSizes.ControlChars = 32;
});
AlphaTab.Platform.Svg.FontSizes.MeasureString = function (s, f, size, style){
    var data;
    var dataSize;
    var factor = 1;
    if ((style & AlphaTab.Platform.Model.FontStyle.Italic) != AlphaTab.Platform.Model.FontStyle.Plain){
        factor *= 1.2;
    }
    if ((style & AlphaTab.Platform.Model.FontStyle.Bold) != AlphaTab.Platform.Model.FontStyle.Plain){
        factor *= 1.2;
    }
    if (f == AlphaTab.Platform.Svg.SupportedFonts.TimesNewRoman){
        data = AlphaTab.Platform.Svg.FontSizes.TimesNewRoman;
        dataSize = 11;
    }
    else if (f == AlphaTab.Platform.Svg.SupportedFonts.Arial){
        data = AlphaTab.Platform.Svg.FontSizes.Arial11Pt;
        dataSize = 11;
    }
    else {
        data = new Uint8Array([8]);
        dataSize = 11;
    }
    var stringSize = 0;
    for (var i = 0; i < s.length; i++){
        var code = Math.min(data.length - 1, s.charCodeAt(i) - 32);
        if (code >= 0){
            stringSize += ((data[code] * size) / dataSize);
        }
    }
    return stringSize * factor;
};
AlphaTab.Platform.Svg.SupportedFonts = {
    TimesNewRoman: 0,
    Arial: 1
};
AlphaTab.Platform.Svg.SvgCanvas = function (){
    this.Buffer = null;
    this._currentPath = null;
    this._currentPathIsEmpty = false;
    this._Color = null;
    this._LineWidth = 0;
    this._Font = null;
    this._TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
    this._TextBaseline = AlphaTab.Platform.Model.TextBaseline.Default;
    this._Resources = null;
    this._currentPath = new Array();
    this._currentPathIsEmpty = true;
    this.set_Color(new AlphaTab.Platform.Model.Color(255, 255, 255, 255));
    this.set_LineWidth(1);
    this.set_Font(new AlphaTab.Platform.Model.Font("Arial", 10, AlphaTab.Platform.Model.FontStyle.Plain));
    this.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
    this.set_TextBaseline(AlphaTab.Platform.Model.TextBaseline.Default);
};
AlphaTab.Platform.Svg.SvgCanvas.prototype = {
    get_Color: function (){
        return this._Color;
    },
    set_Color: function (value){
        this._Color = value;
    },
    get_LineWidth: function (){
        return this._LineWidth;
    },
    set_LineWidth: function (value){
        this._LineWidth = value;
    },
    get_Font: function (){
        return this._Font;
    },
    set_Font: function (value){
        this._Font = value;
    },
    get_TextAlign: function (){
        return this._TextAlign;
    },
    set_TextAlign: function (value){
        this._TextAlign = value;
    },
    get_TextBaseline: function (){
        return this._TextBaseline;
    },
    set_TextBaseline: function (value){
        this._TextBaseline = value;
    },
    get_Resources: function (){
        return this._Resources;
    },
    set_Resources: function (value){
        this._Resources = value;
    },
    BeginRender: function (width, height){
        this.Buffer = new Array();
        this.Buffer.push("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"");
        this.Buffer.push(width);
        this.Buffer.push("px\" height=\"");
        this.Buffer.push(height);
        this.Buffer.push("px\" class=\"alphaTabSurfaceSvg\">\n");
        this._currentPath = new Array();
        this._currentPathIsEmpty = true;
    },
    EndRender: function (){
        this.Buffer.push("</svg>");
        return this.Buffer.join('');
    },
    FillRect: function (x, y, w, h){
        this.Buffer.push("<rect x=\"");
        this.Buffer.push(x - 0.5);
        this.Buffer.push("\" y=\"");
        this.Buffer.push(y - 0.5);
        this.Buffer.push("\" width=\"");
        this.Buffer.push(w);
        this.Buffer.push("\" height=\"");
        this.Buffer.push(h);
        this.Buffer.push("\" style=\"fill:");
        this.Buffer.push(this.get_Color().RGBA);
        this.Buffer.push(";\" />\n");
    },
    StrokeRect: function (x, y, w, h){
        this.Buffer.push("<rect x=\"");
        this.Buffer.push(x - 0.5);
        this.Buffer.push("\" y=\"");
        this.Buffer.push(y - 0.5);
        this.Buffer.push("\" width=\"");
        this.Buffer.push(w);
        this.Buffer.push("\" height=\"");
        this.Buffer.push(h);
        this.Buffer.push("\" style=\"stroke:");
        this.Buffer.push(this.get_Color().RGBA);
        this.Buffer.push("; stroke-width:");
        this.Buffer.push(this.get_LineWidth());
        this.Buffer.push("; fill:transparent");
        this.Buffer.push(";\" />\n");
    },
    BeginPath: function (){
    },
    ClosePath: function (){
        this._currentPath.push(" z");
    },
    MoveTo: function (x, y){
        this._currentPath.push(" M");
        this._currentPath.push(x - 0.5);
        this._currentPath.push(",");
        this._currentPath.push(y - 0.5);
    },
    LineTo: function (x, y){
        this._currentPathIsEmpty = false;
        this._currentPath.push(" L");
        this._currentPath.push(x - 0.5);
        this._currentPath.push(",");
        this._currentPath.push(y - 0.5);
    },
    QuadraticCurveTo: function (cpx, cpy, x, y){
        this._currentPathIsEmpty = false;
        this._currentPath.push(" Q");
        this._currentPath.push(cpx);
        this._currentPath.push(",");
        this._currentPath.push(cpy);
        this._currentPath.push(",");
        this._currentPath.push(x);
        this._currentPath.push(",");
        this._currentPath.push(y);
    },
    BezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y){
        this._currentPathIsEmpty = false;
        this._currentPath.push(" C");
        this._currentPath.push(cp1x);
        this._currentPath.push(",");
        this._currentPath.push(cp1y);
        this._currentPath.push(",");
        this._currentPath.push(cp2x);
        this._currentPath.push(",");
        this._currentPath.push(cp2y);
        this._currentPath.push(",");
        this._currentPath.push(x);
        this._currentPath.push(",");
        this._currentPath.push(y);
    },
    FillCircle: function (x, y, radius){
        this._currentPathIsEmpty = false;
        // 
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        this._currentPath.push(" M");
        this._currentPath.push(x - radius);
        this._currentPath.push(",");
        this._currentPath.push(y);
        this._currentPath.push(" A1,1 0 0,0 ");
        this._currentPath.push(x + radius);
        this._currentPath.push(",");
        this._currentPath.push(y);
        this._currentPath.push(" A1,1 0 0,0 ");
        this._currentPath.push(x - radius);
        this._currentPath.push(",");
        this._currentPath.push(y);
        this._currentPath.push(" z");
        this.Fill();
    },
    Fill: function (){
        if (!this._currentPathIsEmpty){
            this.Buffer.push("<path d=\"");
            this.Buffer.push(this._currentPath.join(''));
            this.Buffer.push("\" style=\"fill:");
            this.Buffer.push(this.get_Color().RGBA);
            this.Buffer.push("\" stroke=\"none\"/>\n");
        }
        this._currentPath = new Array();
        this._currentPathIsEmpty = true;
    },
    Stroke: function (){
        if (!this._currentPathIsEmpty){
            this.Buffer.push("<path d=\"");
            this.Buffer.push(this._currentPath.join(''));
            this.Buffer.push("\" style=\"stroke:");
            this.Buffer.push(this.get_Color().RGBA);
            this.Buffer.push("; stroke-width:");
            this.Buffer.push(this.get_LineWidth());
            this.Buffer.push(";\" fill=\"none\" />\n");
        }
        this._currentPath = new Array();
        this._currentPathIsEmpty = true;
    },
    FillText: function (text, x, y){
        this.Buffer.push("<text x=\"");
        this.Buffer.push(x);
        this.Buffer.push("\" y=\"");
        this.Buffer.push(y + this.GetSvgBaseLineOffset());
        this.Buffer.push("\" style=\"font:");
        this.Buffer.push(this.get_Font().ToCssString(1));
        this.Buffer.push("; fill:");
        this.Buffer.push(this.get_Color().RGBA);
        this.Buffer.push(";\" ");
        this.Buffer.push(" dominant-baseline=\"");
        this.Buffer.push(this.GetSvgBaseLine());
        this.Buffer.push("\" text-anchor=\"");
        this.Buffer.push(this.GetSvgTextAlignment());
        this.Buffer.push("\">\n");
        this.Buffer.push(text);
        this.Buffer.push("</text>\n");
    },
    GetSvgTextAlignment: function (){
        switch (this.get_TextAlign()){
            case AlphaTab.Platform.Model.TextAlign.Left:
                return "start";
            case AlphaTab.Platform.Model.TextAlign.Center:
                return "middle";
            case AlphaTab.Platform.Model.TextAlign.Right:
                return "end";
        }
        return "";
    },
    GetSvgBaseLineOffset: function (){
        switch (this.get_TextBaseline()){
            case AlphaTab.Platform.Model.TextBaseline.Top:
                return 0;
            case AlphaTab.Platform.Model.TextBaseline.Middle:
                return 0;
            case AlphaTab.Platform.Model.TextBaseline.Bottom:
                return 0;
            default:
                return this.get_Font().Size;
        }
    },
    GetSvgBaseLine: function (){
        switch (this.get_TextBaseline()){
            case AlphaTab.Platform.Model.TextBaseline.Top:
                return "top";
            case AlphaTab.Platform.Model.TextBaseline.Middle:
                return "middle";
            case AlphaTab.Platform.Model.TextBaseline.Bottom:
                return "bottom";
            default:
                return "top";
        }
    },
    MeasureText: function (text){
        if (((text==null)||(text.length==0)))
            return 0;
        var font = AlphaTab.Platform.Svg.SupportedFonts.Arial;
        if (this.get_Font().Family.indexOf("Times")!=-1){
            font = AlphaTab.Platform.Svg.SupportedFonts.TimesNewRoman;
        }
        return AlphaTab.Platform.Svg.FontSizes.MeasureString(text, font, this.get_Font().Size, this.get_Font().Style);
    },
    OnPreRender: function (){
        // nothing to do
        return null;
    },
    OnRenderFinished: function (){
        // nothing to do
        return null;
    }
};
$StaticConstructor(function (){
    AlphaTab.Platform.Svg.SvgCanvas.BlurCorrection = 0.5;
});
AlphaTab.Platform.Svg.FontSvgCanvas = function (){
    AlphaTab.Platform.Svg.SvgCanvas.call(this);
};
AlphaTab.Platform.Svg.FontSvgCanvas.prototype = {
    FillMusicFontSymbol: function (x, y, scale, symbol){
        if (symbol == AlphaTab.Rendering.Glyphs.MusicFontSymbol.None){
            return;
        }
        this.Buffer.push("<svg x=\"" + (x - 0.5) + "\" y=\"" + (y - 0.5) + "\" class=\"at\" ><text style=\"fill:" + this.get_Color().RGBA + "; ");
        if (scale != 1){
            this.Buffer.push("font-size: " + (scale * 100) + "%");
        }
        this.Buffer.push("\" text-anchor=\"start\">&#" + symbol + ";</text></svg>");
    }
};
$Inherit(AlphaTab.Platform.Svg.FontSvgCanvas, AlphaTab.Platform.Svg.SvgCanvas);
AlphaTab.Rendering.BarRendererBase = function (bar){
    this._preBeatGlyphs = null;
    this._voiceContainers = null;
    this._postBeatGlyphs = null;
    this.Staff = null;
    this.X = 0;
    this.Y = 0;
    this.Width = 0;
    this.Height = 0;
    this.Index = 0;
    this.IsEmpty = false;
    this.TopOverflow = 0;
    this.BottomOverflow = 0;
    this.Bar = null;
    this.IsLinkedToPrevious = false;
    this.LayoutingInfo = null;
    this.IsFinalized = false;
    this.TopPadding = 0;
    this.BottomPadding = 0;
    this.Bar = bar;
    this.IsEmpty = true;
    this._preBeatGlyphs = new AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup();
    this._preBeatGlyphs.Renderer = this;
    this._voiceContainers = {};
    this._postBeatGlyphs = new AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup();
    this._postBeatGlyphs.Renderer = this;
};
AlphaTab.Rendering.BarRendererBase.prototype = {
    RegisterOverflowTop: function (topOverflow){
        if (topOverflow > this.TopOverflow)
            this.TopOverflow = topOverflow;
    },
    RegisterOverflowBottom: function (bottomOverflow){
        if (bottomOverflow > this.BottomOverflow)
            this.BottomOverflow = bottomOverflow;
    },
    ScaleToWidth: function (width){
        // preBeat and postBeat glyphs do not get resized
        var containerWidth = width - this._preBeatGlyphs.Width - this._postBeatGlyphs.Width;
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            c.ScaleToWidth(containerWidth);
        }
        this._postBeatGlyphs.X = this._preBeatGlyphs.X + this._preBeatGlyphs.Width + containerWidth;
        this.Width = width;
    },
    get_Resources: function (){
        return this.get_Layout().Renderer.RenderingResources;
    },
    get_Layout: function (){
        return this.Staff.StaveGroup.Layout;
    },
    get_Settings: function (){
        return this.get_Layout().Renderer.Settings;
    },
    get_Scale: function (){
        return this.get_Settings().Scale;
    },
    get_IsFirstOfLine: function (){
        return this.Index == 0;
    },
    get_IsLastOfLine: function (){
        return this.Index == this.Staff.BarRenderers.length - 1;
    },
    get_IsLast: function (){
        return this.Bar.Index == this.Staff.BarRenderers.length - 1;
    },
    RegisterLayoutingInfo: function (info){
        this.LayoutingInfo = info;
        var preSize = this._preBeatGlyphs.Width;
        if (info.PreBeatSize < preSize){
            info.PreBeatSize = preSize;
        }
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            c.RegisterLayoutingInfo(info);
        }
        var postSize = this._postBeatGlyphs.Width;
        if (info.PostBeatSize < postSize){
            info.PostBeatSize = postSize;
        }
    },
    ApplyLayoutingInfo: function (){
        // if we need additional space in the preBeat group we simply
        // add a new spacer
        this._preBeatGlyphs.Width = this.LayoutingInfo.PreBeatSize;
        // on beat glyphs we apply the glyph spacing
        var voiceEnd = 0;
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            c.X = this._preBeatGlyphs.X + this._preBeatGlyphs.Width;
            c.ApplyLayoutingInfo(this.LayoutingInfo);
            var newEnd = c.X + c.Width;
            if (voiceEnd < newEnd){
                voiceEnd = newEnd;
            }
        }
        // on the post glyphs we add the spacing before all other glyphs
        this._postBeatGlyphs.X = voiceEnd;
        this._postBeatGlyphs.Width = this.LayoutingInfo.PostBeatSize;
        this.Width = this._postBeatGlyphs.X + this._postBeatGlyphs.Width;
    },
    FinalizeRenderer: function (layout){
        this.IsFinalized = true;
    },
    DoLayout: function (){
        for (var i = 0; i < this.Bar.Voices.length; i++){
            var voice = this.Bar.Voices[i];
            var c = new AlphaTab.Rendering.Glyphs.VoiceContainerGlyph(0, 0, voice);
            c.Renderer = this;
            this._voiceContainers[this.Bar.Voices[i].Index] = c;
        }
        this.CreatePreBeatGlyphs();
        this.CreateBeatGlyphs();
        this.CreatePostBeatGlyphs();
        var postBeatStart = 0;
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            c.X = this.get_BeatGlyphsStart();
            c.DoLayout();
            var x = c.X + c.Width;
            if (postBeatStart < x){
                postBeatStart = x;
            }
        }
        this._postBeatGlyphs.X = postBeatStart;
        this.Width = this._postBeatGlyphs.X + this._postBeatGlyphs.Width;
    },
    AddPreBeatGlyph: function (g){
        this.IsEmpty = false;
        this._preBeatGlyphs.AddGlyph(g);
    },
    AddBeatGlyph: function (g){
        this.GetOrCreateVoiceContainer(g.Beat.Voice).AddGlyph(g);
    },
    GetOrCreateVoiceContainer: function (voice){
        return this._voiceContainers[voice.Index];
    },
    GetBeatContainer: function (beat){
        return this.GetOrCreateVoiceContainer(beat.Voice).BeatGlyphs[beat.Index];
    },
    GetPreNotesGlyphForBeat: function (beat){
        return this.GetBeatContainer(beat).PreNotes;
    },
    GetOnNotesGlyphForBeat: function (beat){
        return this.GetBeatContainer(beat).OnNotes;
    },
    Paint: function (cx, cy, canvas){
        this.PaintBackground(cx, cy, canvas);
        canvas.set_Color(this.get_Resources().MainGlyphColor);
        this._preBeatGlyphs.Paint(cx + this.X, cy + this.Y, canvas);
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            canvas.set_Color(c.Voice.Index == 0 ? this.get_Resources().MainGlyphColor : this.get_Resources().SecondaryGlyphColor);
            c.Paint(cx + this.X, cy + this.Y, canvas);
        }
        canvas.set_Color(this.get_Resources().MainGlyphColor);
        this._postBeatGlyphs.Paint(cx + this.X, cy + this.Y, canvas);
    },
    PaintBackground: function (cx, cy, canvas){
        //var c = new Color((byte)Std.Random(255),
        //      (byte)Std.Random(255),
        //      (byte)Std.Random(255),
        //      100);
        //canvas.Color = c;
        //canvas.FillRect(cx + X, cy + Y, Width, Height);
    },
    BuildBoundingsLookup: function (masterBarBounds, cx, cy){
        var barBounds = new AlphaTab.Rendering.Utils.BarBounds();
        barBounds.Bar = this.Bar;
        barBounds.VisualBounds = {
            X: cx + this.X,
            Y: cy + this.Y + this.TopPadding,
            W: this.Width,
            H: this.Height - this.TopPadding - this.BottomPadding
        };
        barBounds.RealBounds = {
            X: cx + this.X,
            Y: cy + this.Y,
            W: this.Width,
            H: this.Height
        };
        masterBarBounds.AddBar(barBounds);
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            if (!c.Voice.get_IsEmpty()){
                for (var i = 0,j = c.BeatGlyphs.length; i < j; i++){
                    var bc = c.BeatGlyphs[i];
                    var beatBoundings = new AlphaTab.Rendering.Utils.BeatBounds();
                    beatBoundings.Beat = bc.Beat;
                    beatBoundings.VisualBounds = {
                        X: cx + this.X + c.X + bc.X + bc.OnNotes.X,
                        Y: barBounds.VisualBounds.Y,
                        W: bc.OnNotes.Width,
                        H: barBounds.VisualBounds.H
                    };
                    beatBoundings.RealBounds = {
                        X: cx + this.X + c.X + bc.X,
                        Y: barBounds.RealBounds.Y,
                        W: bc.Width,
                        H: barBounds.RealBounds.H
                    };
                    barBounds.AddBeat(beatBoundings);
                }
            }
        }
    },
    AddPostBeatGlyph: function (g){
        this.IsEmpty = false;
        this._postBeatGlyphs.AddGlyph(g);
    },
    CreatePreBeatGlyphs: function (){
    },
    CreateBeatGlyphs: function (){
    },
    CreatePostBeatGlyphs: function (){
    },
    get_BeatGlyphsStart: function (){
        return this._preBeatGlyphs.X + this._preBeatGlyphs.Width;
    },
    GetNoteX: function (note, onEnd){
        return 0;
    },
    GetBeatX: function (beat, requestedPosition){
        var container = this.GetBeatContainer(beat);
        if (container != null){
            switch (requestedPosition){
                case AlphaTab.Rendering.BeatXPosition.PreNotes:
                    return container.VoiceContainer.X + container.X + container.PreNotes.X;
                case AlphaTab.Rendering.BeatXPosition.OnNotes:
                    return container.VoiceContainer.X + container.X + container.OnNotes.X;
                case AlphaTab.Rendering.BeatXPosition.PostNotes:
                    return container.VoiceContainer.X + container.X + container.OnNotes.X + container.OnNotes.Width;
                case AlphaTab.Rendering.BeatXPosition.EndBeat:
                    return container.VoiceContainer.X + container.X + container.Width;
            }
        }
        return 0;
    },
    GetNoteY: function (note){
        return 0;
    }
};
AlphaTab.Rendering.AlternateEndingsBarRenderer = function (bar){
    this._endings = null;
    this._endingsString = null;
    AlphaTab.Rendering.BarRendererBase.call(this, bar);
    var alternateEndings = this.Bar.get_MasterBar().AlternateEndings;
    this._endings = [];
    for (var i = 0; i < 8; i++){
        if ((alternateEndings & (1 << i)) != 0){
            this._endings.push(i);
        }
    }
    this.IsEmpty = this._endings.length == 0;
};
AlphaTab.Rendering.AlternateEndingsBarRenderer.prototype = {
    CreateBeatGlyphs: function (){
        for (var v = 0; v < this.Bar.Voices.length; v++){
            this.CreateVoiceGlyphs(this.Bar.Voices[v]);
        }
    },
    CreateVoiceGlyphs: function (voice){
        for (var i = 0,j = voice.Beats.length; i < j; i++){
            var b = voice.Beats[i];
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new AlphaTab.Rendering.Glyphs.BeatContainerGlyph(b, this.GetOrCreateVoiceContainer(voice), false);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase();
            this.AddBeatGlyph(container);
        }
    },
    DoLayout: function (){
        AlphaTab.Rendering.BarRendererBase.prototype.DoLayout.call(this);
        if (this.Index == 0){
            this.Staff.TopSpacing = 5;
            this.Staff.BottomSpacing = 4;
        }
        this.Height = this.get_Resources().WordsFont.Size;
        var endingsStrings = new Array();
        for (var i = 0,j = this._endings.length; i < j; i++){
            endingsStrings.push(this._endings[i] + 1);
            endingsStrings.push(". ");
        }
        this._endingsString = endingsStrings.join('');
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.Paint.call(this, cx, cy, canvas);
        if (this._endings.length > 0){
            var res = this.get_Resources();
            canvas.set_Font(res.WordsFont);
            canvas.MoveTo(cx + this.X, cy + this.Y + this.Height);
            canvas.LineTo(cx + this.X, cy + this.Y);
            canvas.LineTo(cx + this.X + this.Width, cy + this.Y);
            canvas.Stroke();
            canvas.FillText(this._endingsString, cx + this.X + 3 * this.get_Scale(), cy + this.Y * this.get_Scale());
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.AlternateEndingsBarRenderer.Padding = 3;
});
$Inherit(AlphaTab.Rendering.AlternateEndingsBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.BarRendererFactory = function (){
    this.IsInAccolade = false;
    this.HideOnMultiTrack = false;
    this.HideOnPercussionTrack = false;
    this.IsInAccolade = true;
    this.HideOnMultiTrack = false;
    this.HideOnPercussionTrack = false;
};
AlphaTab.Rendering.BarRendererFactory.prototype = {
    CanCreate: function (track){
        return !this.HideOnPercussionTrack || !track.IsPercussion;
    }
};
AlphaTab.Rendering.AlternateEndingsBarRendererFactory = function (){
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this.IsInAccolade = false;
};
AlphaTab.Rendering.AlternateEndingsBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.AlternateEndingsBarRenderer(bar);
    }
};
$Inherit(AlphaTab.Rendering.AlternateEndingsBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.BeatXPosition = {
    PreNotes: 0,
    OnNotes: 1,
    PostNotes: 2,
    EndBeat: 3
};
AlphaTab.Rendering.EffectBarGlyphSizing = {
    SinglePreBeat: 0,
    SingleOnBeat: 1,
    GroupedOnBeat: 2
};
AlphaTab.Rendering.EffectBarRenderer = function (bar, info){
    this._info = null;
    this._uniqueEffectGlyphs = null;
    this._effectGlyphs = null;
    AlphaTab.Rendering.BarRendererBase.call(this, bar);
    this._info = info;
    this._uniqueEffectGlyphs = [];
    this._effectGlyphs = [];
};
AlphaTab.Rendering.EffectBarRenderer.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.BarRendererBase.prototype.DoLayout.call(this);
        if (this.Index == 0){
            this.Staff.TopSpacing = 5;
            this.Staff.BottomSpacing = 5;
        }
        this.Height = this._info.GetHeight(this);
    },
    FinalizeRenderer: function (layout){
        AlphaTab.Rendering.BarRendererBase.prototype.FinalizeRenderer.call(this, layout);
        // after all layouting and sizing place and size the effect glyphs
        this.IsEmpty = true;
        for (var $i29 = 0,$t29 = this.Bar.Voices,$l29 = $t29.length,voice = $t29[$i29]; $i29 < $l29; $i29++, voice = $t29[$i29]){
            for (var $i30 = 0,$t30 = Object.keys(this._effectGlyphs[voice.Index]),$l30 = $t30.length,key = $t30[$i30]; $i30 < $l30; $i30++, key = $t30[$i30]){
                this.AlignGlyph(this._info.get_SizingMode(), voice.Beats[key]);
                this.IsEmpty = false;
            }
        }
    },
    AlignGlyph: function (sizing, beat){
        var g = this._effectGlyphs[beat.Voice.Index][beat.Index];
        var pos;
        var container = this.GetBeatContainer(beat);
        switch (sizing){
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat:
                pos = container.PreNotes;
                g.X = this.get_BeatGlyphsStart() + pos.X + container.X;
                g.Width = pos.Width;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat:
                pos = container.OnNotes;
                g.X = this.get_BeatGlyphsStart() + pos.X + container.X;
                g.Width = pos.Width;
                break;
        }
    },
    CreatePreBeatGlyphs: function (){
    },
    CreateBeatGlyphs: function (){
        for (var $i31 = 0,$t31 = this.Bar.Voices,$l31 = $t31.length,voice = $t31[$i31]; $i31 < $l31; $i31++, voice = $t31[$i31]){
            this._effectGlyphs.push({});
            this._uniqueEffectGlyphs.push([]);
            this.CreateVoiceGlyphs(voice);
        }
    },
    CreateVoiceGlyphs: function (v){
        for (var $i32 = 0,$t32 = v.Beats,$l32 = $t32.length,b = $t32[$i32]; $i32 < $l32; $i32++, b = $t32[$i32]){
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new AlphaTab.Rendering.Glyphs.BeatContainerGlyph(b, this.GetOrCreateVoiceContainer(v), true);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase();
            this.AddBeatGlyph(container);
            if (this._info.ShouldCreateGlyph(this, b)){
                this.CreateOrResizeGlyph(this._info.get_SizingMode(), b);
            }
        }
    },
    CreateOrResizeGlyph: function (sizing, b){
        switch (sizing){
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat:
                var g = this._info.CreateNewGlyph(this, b);
                g.Renderer = this;
                g.Beat = b;
                g.DoLayout();
                this._effectGlyphs[b.Voice.Index][b.Index] = g;
                this._uniqueEffectGlyphs[b.Voice.Index].push(g);
                return g;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat:
                if (b.Index > 0 || this.Index > 0){
                // check if the previous beat also had this effect
                var prevBeat = b.PreviousBeat;
                if (this._info.ShouldCreateGlyph(this, prevBeat)){
                    // first load the effect bar renderer and glyph
                    var previousRenderer = null;
                    var prevEffect = null;
                    if (b.Index > 0 && this._effectGlyphs[b.Voice.Index].hasOwnProperty(prevBeat.Index)){
                        // load effect from previous beat in the same renderer
                        prevEffect = this._effectGlyphs[b.Voice.Index][prevBeat.Index];
                    }
                    else if (this.Index > 0){
                        // load the effect from the previous renderer if possible. 
                        previousRenderer = this.Staff.BarRenderers[this.Index - 1];
                        var voiceGlyphs = previousRenderer._effectGlyphs[b.Voice.Index];
                        if (voiceGlyphs.hasOwnProperty(prevBeat.Index)){
                            prevEffect = voiceGlyphs[prevBeat.Index];
                        }
                    }
                    // if the effect cannot be expanded, create a new glyph
                    // in case of expansion also create a new glyph, but also link the glyphs together 
                    // so for rendering it might be expanded. 
                    var newGlyph = this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat, b);
                    if (prevEffect != null && this._info.CanExpand(this, prevBeat, b)){
                        // link glyphs 
                        prevEffect.NextGlyph = newGlyph;
                        newGlyph.PreviousGlyph = prevEffect;
                        // mark renderers as linked for consideration when layouting the renderers (line breaking, partial breaking)
                        if (previousRenderer != null){
                            this.IsLinkedToPrevious = true;
                        }
                    }
                    return newGlyph;
                }
                // in case the previous beat did not have the same effect, we simply create a new glyph
                return this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat, b);
            }
                return this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat, b);
        }
        return null;
    },
    CreatePostBeatGlyphs: function (){
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.Paint.call(this, cx, cy, canvas);
        //canvas.Color = new Color(0, 0, 200, 100);
        //canvas.StrokeRect(cx + X, cy + Y, Width, Height);
        for (var i = 0,j = this._uniqueEffectGlyphs.length; i < j; i++){
            var v = this._uniqueEffectGlyphs[i];
            canvas.set_Color(i == 0 ? this.get_Resources().MainGlyphColor : this.get_Resources().SecondaryGlyphColor);
            for (var k = 0,l = v.length; k < l; k++){
                var g = v[k];
                if (g.Renderer == this){
                    g.Paint(cx + this.X, cy + this.Y, canvas);
                }
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.EffectBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.EffectBarRendererFactory = function (info){
    this._info = null;
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this._info = info;
    this.IsInAccolade = false;
    this.HideOnMultiTrack = info.get_HideOnMultiTrack();
};
AlphaTab.Rendering.EffectBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.EffectBarRenderer(bar, this._info);
    }
};
$Inherit(AlphaTab.Rendering.EffectBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.Effects = AlphaTab.Rendering.Effects || {};
AlphaTab.Rendering.Effects.BeatVibratoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.BeatVibratoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return (beat.Vibrato != AlphaTab.Model.VibratoType.None);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    GetHeight: function (renderer){
        return 17 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.VibratoGlyph(0, 5 * renderer.get_Scale(), 1.4);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.ChordsEffectInfo = function (){
};
AlphaTab.Rendering.Effects.ChordsEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.get_HasChord();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.get_Chord().Name, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.CrescendoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.CrescendoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Crescendo != AlphaTab.Model.CrescendoType.None;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    GetHeight: function (renderer){
        return 17 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.CrescendoGlyph(0, 0, beat.Crescendo);
    },
    CanExpand: function (renderer, from, to){
        return from.Crescendo == to.Crescendo;
    }
};
AlphaTab.Rendering.Glyphs = AlphaTab.Rendering.Glyphs || {};
AlphaTab.Rendering.Glyphs.Glyph = function (x, y){
    this.X = 0;
    this.Y = 0;
    this.Width = 0;
    this.Renderer = null;
    this.X = x;
    this.Y = y;
};
AlphaTab.Rendering.Glyphs.Glyph.prototype = {
    get_Scale: function (){
        return this.Renderer.get_Scale();
    },
    DoLayout: function (){
    },
    Paint: function (cx, cy, canvas){
    }
};
AlphaTab.Rendering.Glyphs.EffectGlyph = function (x, y){
    this.Beat = null;
    this.NextGlyph = null;
    this.PreviousGlyph = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
$Inherit(AlphaTab.Rendering.Glyphs.EffectGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Effects.DummyEffectGlyph = function (x, y, s){
    this._s = null;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._s = s;
};
AlphaTab.Rendering.Effects.DummyEffectGlyph.prototype = {
    DoLayout: function (){
        this.Width = 20 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Color(res.MainGlyphColor);
        canvas.StrokeRect(cx + this.X, cy + this.Y, this.Width, 20 * this.get_Scale());
        canvas.set_Font(res.TablatureFont);
        canvas.FillText(this._s, cx + this.X, cy + this.Y);
    }
};
$Inherit(AlphaTab.Rendering.Effects.DummyEffectGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Effects.DynamicsEffectInfo = function (){
};
AlphaTab.Rendering.Effects.DynamicsEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Voice.Index == 0 && ((beat.Index == 0 && beat.Voice.Bar.Index == 0) || (beat.PreviousBeat != null && beat.Dynamic != beat.PreviousBeat.Dynamic));
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    GetHeight: function (renderer){
        return 15 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.DynamicsGlyph(0, this.GetHeight(renderer) / 2, beat.Dynamic);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.FadeInEffectInfo = function (){
};
AlphaTab.Rendering.Effects.FadeInEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.FadeIn;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.FadeInGlyph(0, 0);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.NoteEffectInfoBase = function (){
    this.LastCreateInfo = null;
};
AlphaTab.Rendering.Effects.NoteEffectInfoBase.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        this.LastCreateInfo = [];
        for (var i = 0,j = beat.Notes.length; i < j; i++){
            var n = beat.Notes[i];
            if (this.ShouldCreateGlyphForNote(renderer, n)){
                this.LastCreateInfo.push(n);
            }
        }
        return this.LastCreateInfo.length > 0;
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.HarmonicsEffectInfo = function (){
    this._beat = null;
    this._beatType = AlphaTab.Model.HarmonicType.None;
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.HarmonicsEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        if (!note.get_IsHarmonic())
            return false;
        if (note.Beat != this._beat || note.HarmonicType > this._beatType){
            this._beat = note.Beat;
            this._beatType = note.HarmonicType;
        }
        return true;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, AlphaTab.Rendering.Effects.HarmonicsEffectInfo.HarmonicToString(this._beatType), renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    }
};
AlphaTab.Rendering.Effects.HarmonicsEffectInfo.HarmonicToString = function (type){
    switch (type){
        case AlphaTab.Model.HarmonicType.Natural:
            return "N.H.";
        case AlphaTab.Model.HarmonicType.Artificial:
            return "A.H.";
        case AlphaTab.Model.HarmonicType.Pinch:
            return "P.H.";
        case AlphaTab.Model.HarmonicType.Tap:
            return "T.H.";
        case AlphaTab.Model.HarmonicType.Semi:
            return "S.H.";
        case AlphaTab.Model.HarmonicType.Feedback:
            return "Fdbk.";
    }
    return "";
};
$Inherit(AlphaTab.Rendering.Effects.HarmonicsEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.LetRingEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.LetRingEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.IsLetRing;
    },
    GetHeight: function (renderer){
        return 15 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.LineRangedGlyph("LetRing");
    }
};
$Inherit(AlphaTab.Rendering.Effects.LetRingEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.MarkerEffectInfo = function (){
};
AlphaTab.Rendering.Effects.MarkerEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return true;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Index == 0 && beat.Voice.Bar.get_MasterBar().get_IsSectionStart();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.Voice.Bar.get_MasterBar().Section.Text, renderer.get_Resources().MarkerFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.NoteVibratoEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.NoteVibratoEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.Vibrato != AlphaTab.Model.VibratoType.None || (note.IsTieDestination && note.TieOrigin.Vibrato != AlphaTab.Model.VibratoType.None);
    },
    GetHeight: function (renderer){
        return 15 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.VibratoGlyph(0, 5 * renderer.get_Scale(), 1.2);
    }
};
$Inherit(AlphaTab.Rendering.Effects.NoteVibratoEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.CapoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.CapoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Index == 0 && beat.Voice.Bar.Index == 0 && beat.Voice.Bar.Staff.Track.Capo != 0;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Capo. fret " + beat.Voice.Bar.Staff.Track.Capo, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return false;
    }
};
AlphaTab.Rendering.Effects.PalmMuteEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.PalmMuteEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.IsPalmMute;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.LineRangedGlyph("P.M.");
    }
};
$Inherit(AlphaTab.Rendering.Effects.PalmMuteEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.PickStrokeEffectInfo = function (){
};
AlphaTab.Rendering.Effects.PickStrokeEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.PickStroke != AlphaTab.Model.PickStrokeType.None;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.PickStrokeGlyph(0, 0, beat.PickStroke);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TapEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TapEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return (beat.Slap || beat.Pop || beat.Tap);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        var res = renderer.get_Resources();
        if (beat.Slap){
            return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "S", res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
        }
        if (beat.Pop){
            return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "P", res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
        }
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "T", res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TempoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TempoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return true;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Voice.Index == 0 && beat.Index == 0 && (beat.Voice.Bar.get_MasterBar().TempoAutomation != null || beat.Voice.Bar.Index == 0);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat;
    },
    GetHeight: function (renderer){
        return 25 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        var tempo;
        if (beat.Voice.Bar.get_MasterBar().TempoAutomation != null){
            tempo = ((beat.Voice.Bar.get_MasterBar().TempoAutomation.Value)) | 0;
        }
        else {
            tempo = beat.Voice.Bar.Staff.Track.Score.Tempo;
        }
        return new AlphaTab.Rendering.Glyphs.TempoGlyph(0, 0, tempo);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TextEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TextEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return !AlphaTab.Platform.Std.IsNullOrWhiteSpace(beat.Text);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.Text, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TrillEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.TrillEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.get_IsTrill();
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TrillGlyph(0, 0);
    }
};
$Inherit(AlphaTab.Rendering.Effects.TrillEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.TripletFeelEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TripletFeelEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return true;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Index == 0 && ((beat.Voice.Bar.get_MasterBar().Index == 0 && beat.Voice.Bar.get_MasterBar().TripletFeel != AlphaTab.Model.TripletFeel.NoTripletFeel) || (beat.Voice.Bar.get_MasterBar().Index > 0 && beat.Voice.Bar.get_MasterBar().TripletFeel != beat.Voice.Bar.get_MasterBar().PreviousMasterBar.TripletFeel));
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat;
    },
    GetHeight: function (renderer){
        return 25 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TripletFeelGlyph(beat.Voice.Bar.get_MasterBar().TripletFeel);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Glyphs.MusicFontGlyph = function (x, y, scale, symbol){
    this._scale = 0;
    this._symbol = AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._scale = scale;
    this._symbol = symbol;
};
AlphaTab.Rendering.Glyphs.MusicFontGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        canvas.FillMusicFontSymbol(cx + this.X, cy + this.Y, this._scale * this.get_Scale(), this._symbol);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.MusicFontGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.AccentuationGlyph = function (x, y, accentuation){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.AccentuationGlyph.GetSymbol(accentuation));
};
AlphaTab.Rendering.Glyphs.AccentuationGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * this.get_Scale();
    }
};
AlphaTab.Rendering.Glyphs.AccentuationGlyph.GetSymbol = function (accentuation){
    switch (accentuation){
        case AlphaTab.Model.AccentuationType.None:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
        case AlphaTab.Model.AccentuationType.Normal:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Accentuation;
        case AlphaTab.Model.AccentuationType.Heavy:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.HeavyAccentuation;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.AccentuationGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.GlyphGroup = function (x, y){
    this.Glyphs = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.GlyphGroup.prototype = {
    get_IsEmpty: function (){
        return this.Glyphs == null || this.Glyphs.length == 0;
    },
    DoLayout: function (){
        if (this.Glyphs == null || this.Glyphs.length == 0){
            this.Width = 0;
            return;
        }
        var w = 0;
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.Renderer = this.Renderer;
            g.DoLayout();
            w = Math.max(w, g.Width);
        }
        this.Width = w;
    },
    AddGlyph: function (g){
        if (this.Glyphs == null)
            this.Glyphs = [];
        this.Glyphs.push(g);
    },
    Paint: function (cx, cy, canvas){
        if (this.Glyphs == null || this.Glyphs.length == 0)
            return;
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.Renderer = this.Renderer;
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.GlyphGroup, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph = function (){
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, 0, 0);
};
AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph.prototype = {
    DoLayout: function (){
        if (this.Glyphs == null){
            this.Width = 0;
            return;
        }
        //
        // Determine Columns for accidentals
        //
        this.Glyphs.sort($CreateAnonymousDelegate(this, function (a, b){
    return (a.Y-b.Y);
}));
        // defines the reserved y position of the columns
        var columns = [];
        columns.push(-3000);
        var accidentalSize = 21 * this.get_Scale();
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.Renderer = this.Renderer;
            g.DoLayout();
            // find column where glyph fits into
            // as long the glyph does not fit into the current column
            var gColumn = 0;
            while (columns[gColumn] > g.Y){
                // move to next column
                gColumn++;
                // and create the new column if needed
                if (gColumn == columns.length){
                    columns.push(-3000);
                }
            }
            // temporary save column as X
            g.X = gColumn;
            columns[gColumn] = g.Y + accidentalSize;
        }
        //
        // Place accidentals in columns
        //
        var columnWidth = 8 * this.get_Scale();
        var padding = 2 * this.get_Scale();
        if (this.Glyphs.length == 0){
            this.Width = 0;
        }
        else {
            this.Width = padding + (columnWidth * columns.length);
        }
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.X = padding + (this.Width - ((g.X + 1) * columnWidth));
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph.NonReserved = -3000;
});
$Inherit(AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.BarNumberGlyph = function (x, y, number, hidden){
    this._number = 0;
    this._hidden = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._number = number;
    this._hidden = hidden;
};
AlphaTab.Rendering.Glyphs.BarNumberGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        if (this._hidden){
            return;
        }
        var res = this.Renderer.get_Resources();
        canvas.set_Color(res.BarNumberColor);
        canvas.set_Font(res.BarNumberFont);
        canvas.FillText(this._number.toString(), cx + this.X, cy + this.Y);
        canvas.set_Color(res.MainGlyphColor);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BarNumberGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.BarSeperatorGlyph = function (x, y, isLast){
    this._isLast = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._isLast = isLast;
};
AlphaTab.Rendering.Glyphs.BarSeperatorGlyph.prototype = {
    DoLayout: function (){
        this.Width = (this._isLast ? 8 : 1) * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.TopPadding;
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.BottomPadding;
        var left = ((cx + this.X)) | 0;
        var h = bottom - top;
        // line
        canvas.BeginPath();
        canvas.MoveTo(left, top);
        canvas.LineTo(left, bottom);
        canvas.Stroke();
        if (this._isLast){
            // big bar
            left += (((3 * this.get_Scale()) + 0.5)) | 0;
            canvas.FillRect(left, top, blockWidth, h);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BarSeperatorGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.BeamGlyph = function (x, y, duration, direction, isGrace){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.BeamGlyph.GetSymbol(duration, direction, isGrace));
};
AlphaTab.Rendering.Glyphs.BeamGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    }
};
AlphaTab.Rendering.Glyphs.BeamGlyph.GetSymbol = function (duration, direction, isGrace){
    if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
        if (isGrace){
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
        }
        switch (duration){
            case AlphaTab.Model.Duration.Eighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
            case AlphaTab.Model.Duration.Sixteenth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixteenth;
            case AlphaTab.Model.Duration.ThirtySecond:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpThirtySecond;
            case AlphaTab.Model.Duration.SixtyFourth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixtyFourth;
            default:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
        }
    }
    else {
        if (isGrace){
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
        }
        switch (duration){
            case AlphaTab.Model.Duration.Eighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
            case AlphaTab.Model.Duration.Sixteenth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixteenth;
            case AlphaTab.Model.Duration.ThirtySecond:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownThirtySecond;
            case AlphaTab.Model.Duration.SixtyFourth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixtyFourth;
            default:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeamGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.BeatContainerGlyph = function (beat, voiceContainer, useLayoutingInfo){
    this.VoiceContainer = null;
    this.Beat = null;
    this.PreNotes = null;
    this.OnNotes = null;
    this.Ties = null;
    this.MinWidth = 0;
    this.OnTimeX = 0;
    this.UseLayoutingInfo = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this.Beat = beat;
    this.Ties = [];
    this.VoiceContainer = voiceContainer;
    this.UseLayoutingInfo = useLayoutingInfo;
};
AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype = {
    RegisterLayoutingInfo: function (layoutings){
        var preBeatStretch = this.PreNotes.Width + this.OnNotes.Width / 2;
        var postBeatStretch = this.OnNotes.Width / 2;
        layoutings.AddBeatSpring(this.Beat, this.MinWidth, preBeatStretch, postBeatStretch);
        // store sizes for special renderers like the EffectBarRenderer
        layoutings.SetPreBeatSize(this.Beat, this.PreNotes.Width);
        layoutings.SetOnBeatSize(this.Beat, this.OnNotes.Width);
    },
    ApplyLayoutingInfo: function (info){
        if (this.UseLayoutingInfo){
            this.PreNotes.Width = info.GetPreBeatSize(this.Beat);
            this.OnNotes.Width = info.GetOnBeatSize(this.Beat);
            this.OnNotes.X = this.PreNotes.X + this.PreNotes.Width;
            this.OnTimeX = this.OnNotes.X + this.OnNotes.Width / 2;
        }
    },
    DoLayout: function (){
        this.PreNotes.X = 0;
        this.PreNotes.Renderer = this.Renderer;
        this.PreNotes.Container = this;
        this.PreNotes.DoLayout();
        this.OnNotes.X = this.PreNotes.X + this.PreNotes.Width;
        this.OnNotes.Renderer = this.Renderer;
        this.OnNotes.Container = this;
        this.OnNotes.DoLayout();
        var i = this.Beat.Notes.length - 1;
        while (i >= 0){
            this.CreateTies(this.Beat.Notes[i--]);
        }
        this.MinWidth = this.PreNotes.Width + this.OnNotes.Width;
        this.Width = this.MinWidth;
        this.OnTimeX = this.OnNotes.X + this.OnNotes.Width / 2;
    },
    ScaleToWidth: function (beatWidth){
        this.OnNotes.UpdateBeamingHelper();
        this.Width = beatWidth;
    },
    CreateTies: function (n){
    },
    Paint: function (cx, cy, canvas){
        if (this.Beat.Voice.get_IsEmpty())
            return;
        //canvas.Color = new Color(200, 0, 0, 100);
        //canvas.StrokeRect(cx + X, cy + Y + 15 * Beat.Voice.Index, Width, 10);
        //canvas.Font = new Font("Arial", 10);
        //canvas.Color = new Color(0, 0, 0);
        //canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);
        //if (Beat.Voice.Index == 0)
        //{
        //    canvas.Color = new Color(200, 200, 0, 100);
        //    canvas.StrokeRect(cx + X, cy + Y + PreNotes.Y - 10, Width, 10);
        //}
        this.PreNotes.Paint(cx + this.X, cy + this.Y, canvas);
        //if (Beat.Voice.Index == 0)
        //{
        //    canvas.Color = new Color(200, 0, 0, 100);
        //    canvas.StrokeRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);
        //}
        this.OnNotes.Paint(cx + this.X, cy + this.Y, canvas);
        //if (Beat.Voice.Index == 0)
        //{
        //    canvas.Color = new Color(0, 200, 0, 100);
        //    canvas.StrokeRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);
        //}
        for (var i = 0,j = this.Ties.length; i < j; i++){
            var t = this.Ties[i];
            t.Renderer = this.Renderer;
            t.Paint(cx, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeatContainerGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.BeatGlyphBase = function (){
    this.Container = null;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, 0, 0);
};
AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype = {
    DoLayout: function (){
        // left to right layout
        var w = 0;
        if (this.Glyphs != null){
            for (var i = 0,j = this.Glyphs.length; i < j; i++){
                var g = this.Glyphs[i];
                g.X = w;
                g.Renderer = this.Renderer;
                g.DoLayout();
                w += g.Width;
            }
        }
        this.Width = w;
    },
    NoteLoop: function (action){
        for (var i = this.Container.Beat.Notes.length - 1; i >= 0; i--){
            action(this.Container.Beat.Notes[i]);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeatGlyphBase, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase = function (){
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase.prototype = {
    UpdateBeamingHelper: function (){
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.BendGlyph = function (n, bendValueHeight){
    this._note = null;
    this._bendValueHeight = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._note = n;
    this._bendValueHeight = bendValueHeight;
};
AlphaTab.Rendering.Glyphs.BendGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        // calculate offsets per step
        var dX = this.Width / 60;
        var maxValue = 0;
        for (var i = 0,j = this._note.BendPoints.length; i < j; i++){
            if (this._note.BendPoints[i].Value > maxValue){
                maxValue = this._note.BendPoints[i].Value;
            }
        }
        cx += this.X;
        cy += this.Y;
        canvas.BeginPath();
        for (var i = 0,j = this._note.BendPoints.length - 1; i < j; i++){
            var firstPt = this._note.BendPoints[i];
            var secondPt = this._note.BendPoints[i + 1];
            // draw pre-bend if previous 
            if (i == 0 && firstPt.Value != 0 && !this._note.IsTieDestination){
                this.PaintBend(new AlphaTab.Model.BendPoint(0, 0), firstPt, cx, cy, dX, canvas);
            }
            // don't draw a line if there's no offset and it's the last point
            if (firstPt.Value == secondPt.Value && i == this._note.BendPoints.length - 2)
                continue;
            this.PaintBend(firstPt, secondPt, cx, cy, dX, canvas);
        }
    },
    PaintBend: function (firstPt, secondPt, cx, cy, dX, canvas){
        var r = this.Renderer;
        var res = this.Renderer.get_Resources();
        var overflowOffset = r.get_LineOffset() / 2;
        var x1 = cx + (dX * firstPt.Offset);
        var y1 = cy - (this._bendValueHeight * firstPt.Value);
        if (firstPt.Value == 0){
            y1 += r.GetNoteY(this._note);
        }
        else {
            y1 += overflowOffset;
        }
        var x2 = cx + (dX * secondPt.Offset);
        var y2 = cy - (this._bendValueHeight * secondPt.Value);
        if (secondPt.Value == 0){
            y2 += r.GetNoteY(this._note);
        }
        else {
            y2 += overflowOffset;
        }
        // what type of arrow? (up/down)
        var arrowOffset = 0;
        var arrowSize = 6 * this.get_Scale();
        if (secondPt.Value > firstPt.Value){
            canvas.BeginPath();
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 - arrowSize * 0.5, y2 + arrowSize);
            canvas.LineTo(x2 + arrowSize * 0.5, y2 + arrowSize);
            canvas.ClosePath();
            canvas.Fill();
            arrowOffset = arrowSize;
        }
        else if (secondPt.Value != firstPt.Value){
            canvas.BeginPath();
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 - arrowSize * 0.5, y2 - arrowSize);
            canvas.LineTo(x2 + arrowSize * 0.5, y2 - arrowSize);
            canvas.ClosePath();
            canvas.Fill();
            arrowOffset = -arrowSize;
        }
        canvas.Stroke();
        if (firstPt.Value == secondPt.Value){
            // draw horizontal line
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x2, y2);
            canvas.Stroke();
        }
        else {
            if (x2 > x1){
                // draw bezier lien from first to second point
                canvas.MoveTo(x1, y1);
                canvas.BezierCurveTo(x2, y1, x2, y2 + arrowOffset, x2, y2 + arrowOffset);
                canvas.Stroke();
            }
            else {
                canvas.MoveTo(x1, y1);
                canvas.LineTo(x2, y2);
                canvas.Stroke();
            }
        }
        if (secondPt.Value != 0){
            var dV = secondPt.Value;
            var up = secondPt.Value > firstPt.Value;
            dV = Math.abs(dV);
            // calculate label
            var s = "";
            // Full Steps
            if (dV == 4 && up){
                s = "full";
                dV -= 4;
            }
            else if (dV >= 4){
                var steps = (dV / 4) | 0;
                s += steps;
                // Quaters
                dV -= steps * 4;
            }
            if (dV > 0){
                s += this.GetFractionSign(dV);
            }
            if (s != ""){
                if (!up){
                    s = "-" + s;
                }
                // draw label
                canvas.set_Font(res.TablatureFont);
                var size = canvas.MeasureText(s);
                var y = up ? y2 - res.TablatureFont.Size - (2 * this.get_Scale()) : y2 + (2 * this.get_Scale());
                var x = x2 - size / 2;
                canvas.FillText(s, x, y);
            }
        }
    },
    GetFractionSign: function (steps){
        switch (steps){
            case 1:
                return "¼";
            case 2:
                return "½";
            case 3:
                return "¾";
            default:
                return steps + "/ 4";
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BendGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHarmonic);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.CircleGlyph = function (x, y, size){
    this._size = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._size = size;
};
AlphaTab.Rendering.Glyphs.CircleGlyph.prototype = {
    DoLayout: function (){
        this.Width = this._size + (3 * this.get_Scale());
    },
    Paint: function (cx, cy, canvas){
        canvas.FillCircle(cx + this.X, cy + this.Y, this._size);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.CircleGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ClefGlyph = function (x, y, clef){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.ClefGlyph.GetSymbol(clef));
};
AlphaTab.Rendering.Glyphs.ClefGlyph.prototype = {
    DoLayout: function (){
        this.Width = 28 * this.get_Scale();
    }
};
AlphaTab.Rendering.Glyphs.ClefGlyph.GetSymbol = function (clef){
    switch (clef){
        case AlphaTab.Model.Clef.Neutral:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefNeutral;
        case AlphaTab.Model.Clef.C3:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefC;
        case AlphaTab.Model.Clef.C4:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefC;
        case AlphaTab.Model.Clef.F4:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefF;
        case AlphaTab.Model.Clef.G2:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefG;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ClefGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.GroupedEffectGlyph = function (endPosition){
    this._endPosition = AlphaTab.Rendering.BeatXPosition.PreNotes;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, 0, 0);
    this._endPosition = endPosition;
};
AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.prototype = {
    get_IsLinkedWithPrevious: function (){
        return this.PreviousGlyph != null && this.PreviousGlyph.Renderer.Staff.StaveGroup == this.Renderer.Staff.StaveGroup;
    },
    get_IsLinkedWithNext: function (){
        // we additionally check IsFinalized since the next renderer might not be part of the current partial
        // and therefore not finalized yet. 
        return this.NextGlyph != null && this.NextGlyph.Renderer.IsFinalized && this.NextGlyph.Renderer.Staff.StaveGroup == this.Renderer.Staff.StaveGroup;
    },
    Paint: function (cx, cy, canvas){
        // if we are linked with the previous, the first glyph of the group will also render this one.
        if (this.get_IsLinkedWithPrevious()){
            return;
        }
        // we are not linked with any glyph therefore no expansion is required, we render a simple glyph. 
        if (!this.get_IsLinkedWithNext()){
            this.PaintNonGrouped(cx, cy, canvas);
            return;
        }
        // find last linked glyph that can be  
        var lastLinkedGlyph = this.NextGlyph;
        while (lastLinkedGlyph.get_IsLinkedWithNext()){
            lastLinkedGlyph = lastLinkedGlyph.NextGlyph;
        }
        // calculate end X-position
        var cxRenderer = cx - this.Renderer.X;
        var endRenderer = lastLinkedGlyph.Renderer;
        var endBeatX = endRenderer.GetBeatX(lastLinkedGlyph.Beat, this._endPosition);
        var endX = cxRenderer + endRenderer.X + endBeatX;
        this.PaintGrouped(cx, cy, endX, canvas);
    },
    PaintNonGrouped: function (cx, cy, canvas){
        var endBeatX = this.Renderer.GetBeatX(this.Beat, AlphaTab.Rendering.BeatXPosition.EndBeat);
        var endX = cx + endBeatX;
        this.PaintGrouped(cx, cy, endX, canvas);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.GroupedEffectGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.CrescendoGlyph = function (x, y, crescendo){
    this._crescendo = AlphaTab.Model.CrescendoType.None;
    AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.call(this, AlphaTab.Rendering.BeatXPosition.EndBeat);
    this._crescendo = crescendo;
    this.X = x;
    this.Y = y;
};
AlphaTab.Rendering.Glyphs.CrescendoGlyph.prototype = {
    PaintGrouped: function (cx, cy, endX, canvas){
        var startX = cx + this.X;
        var height = 17 * this.get_Scale();
        canvas.BeginPath();
        if (this._crescendo == AlphaTab.Model.CrescendoType.Crescendo){
            canvas.MoveTo(endX, cy + this.Y);
            canvas.LineTo(startX, cy + this.Y + height / 2);
            canvas.LineTo(endX, cy + this.Y + height);
        }
        else {
            canvas.MoveTo(cx + this.X, cy + this.Y);
            canvas.LineTo(endX, cy + this.Y + (height / 2));
            canvas.LineTo(cx + this.X, cy + this.Y + height);
        }
        canvas.Stroke();
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.CrescendoGlyph.Height = 17;
});
$Inherit(AlphaTab.Rendering.Glyphs.CrescendoGlyph, AlphaTab.Rendering.Glyphs.GroupedEffectGlyph);
AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteDead);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHarmonic);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DigitGlyph = function (x, y, digit){
    this._digit = 0;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.DigitGlyph.GetSymbol(digit));
    this._digit = digit;
};
AlphaTab.Rendering.Glyphs.DigitGlyph.prototype = {
    DoLayout: function (){
        this.Y += 7 * this.get_Scale();
        this.Width = this.GetDigitWidth(this._digit) * this.get_Scale();
    },
    GetDigitWidth: function (digit){
        switch (digit){
            case 0:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                return 14;
            case 1:
                return 10;
            default:
                return 0;
        }
    }
};
AlphaTab.Rendering.Glyphs.DigitGlyph.GetSymbol = function (digit){
    switch (digit){
        case 0:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num0;
        case 1:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num1;
        case 2:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num2;
        case 3:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num3;
        case 4:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num4;
        case 5:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num5;
        case 6:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num6;
        case 7:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num7;
        case 8:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num8;
        case 9:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num9;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DigitGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DrumSticksGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteSideStick);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DrumSticksGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DrumSticksGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DynamicsGlyph = function (x, y, dynamics){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 0.6, AlphaTab.Rendering.Glyphs.DynamicsGlyph.GetSymbol(dynamics));
};
AlphaTab.Rendering.Glyphs.DynamicsGlyph.GetSymbol = function (dynamics){
    switch (dynamics){
        case AlphaTab.Model.DynamicValue.PPP:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicPPP;
        case AlphaTab.Model.DynamicValue.PP:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicPP;
        case AlphaTab.Model.DynamicValue.P:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicP;
        case AlphaTab.Model.DynamicValue.MP:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicMP;
        case AlphaTab.Model.DynamicValue.MF:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicMF;
        case AlphaTab.Model.DynamicValue.F:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicF;
        case AlphaTab.Model.DynamicValue.FF:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicFFF;
        case AlphaTab.Model.DynamicValue.FFF:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicFFF;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DynamicsGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.FadeInGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.FadeInGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var size = 6 * this.get_Scale();
        var width = Math.max(this.Width, 14 * this.get_Scale());
        var offset = this.Renderer.Height / 2;
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X, cy + this.Y + offset);
        canvas.QuadraticCurveTo(cx + this.X + (width / 2), cy + this.Y + offset, cx + this.X + width, cy + this.Y + offset - size);
        canvas.MoveTo(cx + this.X, cy + this.Y + offset);
        canvas.QuadraticCurveTo(cx + this.X + (width / 2), cy + this.Y + offset, cx + this.X + width, cy + this.Y + offset + size);
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.FadeInGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.FlatGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalFlat);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.FlatGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.FlatGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.HiHatGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHiHat);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.HiHatGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.HiHatGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.SvgCommand = function (){
    this.Cmd = null;
    this.Numbers = null;
};
AlphaTab.Rendering.Glyphs.LazySvg = function (raw){
    this._raw = null;
    this._parsed = null;
    this._raw = raw;
};
AlphaTab.Rendering.Glyphs.LazySvg.prototype = {
    get_Commands: function (){
        if (this._parsed == null)
            this.Parse();
        return this._parsed;
    },
    Parse: function (){
        var parser = new AlphaTab.Rendering.Utils.SvgPathParser(this._raw);
        parser.Reset();
        this._parsed = [];
        while (!parser.get_Eof()){
            var command = new AlphaTab.Rendering.Glyphs.SvgCommand();
            this._parsed.push(command);
            command.Cmd = parser.GetString();
            switch (command.Cmd){
                case "M":
                    command.Numbers = [];
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    break;
                case "m":
                    command.Numbers = [];
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    break;
                case "Z":
                case "z":
                    break;
                case "L":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "l":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "V":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "v":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "H":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "h":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "C":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "c":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "S":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "s":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "Q":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "q":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "T":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "t":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
            }
        }
        this._raw = null;
        // not needed anymore.
    }
};
AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup = function (){
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, 0, 0);
    this.Glyphs = [];
};
AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup.prototype = {
    AddGlyph: function (g){
        g.X = this.Glyphs.length == 0 ? 0 : (this.Glyphs[this.Glyphs.length - 1].X + this.Glyphs[this.Glyphs.length - 1].Width);
        g.Renderer = this.Renderer;
        g.DoLayout();
        this.Width = g.X + g.Width;
        AlphaTab.Rendering.Glyphs.GlyphGroup.prototype.AddGlyph.call(this, g);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.LineRangedGlyph = function (label){
    this._label = null;
    AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.call(this, AlphaTab.Rendering.BeatXPosition.PostNotes);
    this._label = label;
};
AlphaTab.Rendering.Glyphs.LineRangedGlyph.prototype = {
    PaintNonGrouped: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.EffectFont);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
        canvas.FillText(this._label, cx + this.X, cy + this.Y);
    },
    PaintGrouped: function (cx, cy, endX, canvas){
        this.PaintNonGrouped(cx, cy, canvas);
        var lineSpacing = 3 * this.get_Scale();
        var textWidth = canvas.MeasureText(this._label);
        var startX = cx + this.X + textWidth + lineSpacing;
        var lineY = cy + this.Y + (8 * this.get_Scale());
        var lineSize = 8 * this.get_Scale();
        if (endX > startX){
            var lineX = startX;
            while (lineX < endX){
                canvas.BeginPath();
                canvas.MoveTo(lineX, lineY | 0);
                canvas.LineTo(Math.min(lineX + lineSize, endX), lineY | 0);
                lineX += lineSize + lineSpacing;
                canvas.Stroke();
            }
            canvas.BeginPath();
            canvas.MoveTo(endX, ((lineY - 6 * this.get_Scale())) | 0);
            canvas.LineTo(endX, ((lineY + 6 * this.get_Scale())) | 0);
            canvas.Stroke();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineSpacing = 3;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineTopPadding = 8;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineTopOffset = 6;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineSize = 8;
});
$Inherit(AlphaTab.Rendering.Glyphs.LineRangedGlyph, AlphaTab.Rendering.Glyphs.GroupedEffectGlyph);
AlphaTab.Rendering.Glyphs.MusicFontSymbol = {
    None: -1,
    ClefG: 57424,
    ClefC: 57436,
    ClefF: 57442,
    ClefNeutral: 57449,
    RestWhole: 58595,
    RestHalf: 58596,
    RestQuarter: 58597,
    RestEighth: 58598,
    RestSixteenth: 58599,
    RestThirtySecond: 58600,
    RestSixtyFourth: 58601,
    GraceUp: 57815,
    GraceDown: 57816,
    Trill: 58726,
    Num0: 57472,
    Num1: 57473,
    Num2: 57474,
    Num3: 57475,
    Num4: 57476,
    Num5: 57477,
    Num6: 57478,
    Num7: 57479,
    Num8: 57480,
    Num9: 57481,
    NoteWhole: 57506,
    NoteHalf: 57507,
    NoteQuarter: 57508,
    NoteDead: 57514,
    NoteHarmonic: 57564,
    NoteRideCymbal: 57566,
    NoteHiHat: 57523,
    NoteSideStick: 57513,
    NoteHiHatHalf: 57591,
    NoteChineseCymbal: 57593,
    FooterUpEighth: 57920,
    FooterDownEighth: 57921,
    FooterUpSixteenth: 57922,
    FooterDownSixteenth: 57923,
    FooterUpThirtySecond: 57924,
    FooterDownThirtySecond: 57925,
    FooterUpSixtyFourth: 57926,
    FooterDownSixtyFourth: 57927,
    DynamicPPP: 58666,
    DynamicPP: 58667,
    DynamicP: 58656,
    DynamicMP: 58668,
    DynamicMF: 58669,
    DynamicF: 58658,
    DynamicFF: 58671,
    DynamicFFF: 58672,
    Accentuation: 58528,
    HeavyAccentuation: 58540,
    WaveHorizontal: 60068,
    PickStrokeDown: 58896,
    PickStrokeUp: 58898,
    TremoloPickingThirtySecond: 57890,
    TremoloPickingSixteenth: 57889,
    TremoloPickingEighth: 57888,
    Tempo: 57813,
    NoteEighth: 57815,
    AccidentalFlat: 57952,
    AccidentalNatural: 57953,
    AccidentalSharp: 57954
};
AlphaTab.Rendering.Glyphs.NaturalizeGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalNatural);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.NaturalizeGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NaturalizeGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.NoteHeadGlyph = function (x, y, duration, isGrace){
    this._isGrace = false;
    this._duration = AlphaTab.Model.Duration.Whole;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GetSymbol(duration));
    this._isGrace = isGrace;
    this._duration = duration;
};
AlphaTab.Rendering.Glyphs.NoteHeadGlyph.prototype = {
    DoLayout: function (){
        switch (this._duration){
            case AlphaTab.Model.Duration.Whole:
                this.Width = 14 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
                break;
            default:
                this.Width = 9 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
                break;
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GraceScale = 0.6;
    AlphaTab.Rendering.Glyphs.NoteHeadGlyph.NoteHeadHeight = 9;
});
AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.Whole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteWhole;
        case AlphaTab.Model.Duration.Half:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHalf;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteQuarter;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.NoteNumberGlyph = function (x, y, n){
    this._noteString = null;
    this._noteStringWidth = 0;
    this._trillNoteString = null;
    this._trillNoteStringWidth = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    if (!n.IsTieDestination){
        this._noteString = n.IsDead ? "x" : n.Fret.toString();
        if (n.IsGhost){
            this._noteString = "(" + this._noteString + ")";
        }
    }
    else if (n.Beat.Index == 0 || n.get_HasBend()){
        this._noteString = "(" + n.TieOrigin.Fret + ")";
    }
    else {
        this._noteString = "";
    }
    if (n.get_IsTrill()){
        this._trillNoteString = "(" + n.get_TrillFret() + ")";
    }
    else {
        this._trillNoteString = "";
    }
};
AlphaTab.Rendering.Glyphs.NoteNumberGlyph.prototype = {
    DoLayout: function (){
        this.Renderer.get_Layout().Renderer.Canvas.set_Font(this.Renderer.get_Resources().TablatureFont);
        this._noteStringWidth = this.Renderer.get_Layout().Renderer.Canvas.MeasureText(this._noteString);
        this._trillNoteStringWidth = this.Renderer.get_Layout().Renderer.Canvas.MeasureText(this._trillNoteString);
        this.Width = this._noteStringWidth + this._trillNoteStringWidth;
    },
    Paint: function (cx, cy, canvas){
        canvas.FillText(this._noteString, cx + this.X, cy + this.Y);
        canvas.FillText(this._trillNoteString, cx + this.X + this._noteStringWidth, cy + this.Y);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NoteNumberGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.NumberGlyph = function (x, y, number){
    this._number = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._number = number;
};
AlphaTab.Rendering.Glyphs.NumberGlyph.prototype = {
    DoLayout: function (){
        var i = this._number;
        while (i > 0){
            var num = i % 10;
            var gl = new AlphaTab.Rendering.Glyphs.DigitGlyph(0, 0, num);
            this.AddGlyph(gl);
            i = (i / 10) | 0;
        }
        this.Glyphs.reverse();
        var cx = 0;
        for (var j = 0,k = this.Glyphs.length; j < k; j++){
            var g = this.Glyphs[j];
            g.X = cx;
            g.Y = 0;
            g.Renderer = this.Renderer;
            g.DoLayout();
            cx += g.Width;
        }
        this.Width = cx;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NumberGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.PickStrokeGlyph = function (x, y, pickStroke){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.PickStrokeGlyph.GetSymbol(pickStroke));
};
AlphaTab.Rendering.Glyphs.PickStrokeGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * this.get_Scale();
    }
};
AlphaTab.Rendering.Glyphs.PickStrokeGlyph.GetSymbol = function (pickStroke){
    switch (pickStroke){
        case AlphaTab.Model.PickStrokeType.Up:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.PickStrokeUp;
        case AlphaTab.Model.PickStrokeType.Down:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.PickStrokeDown;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.PickStrokeGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.RepeatCloseGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.RepeatCloseGlyph.prototype = {
    DoLayout: function (){
        this.Width = (this.Renderer.get_IsLast() ? 11 : 13) * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.TopPadding;
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.BottomPadding;
        var left = cx + this.X;
        var h = bottom - top;
        //circles 
        var circleSize = 1.5 * this.get_Scale();
        var middle = (top + bottom) / 2;
        var dotOffset = 3;
        canvas.FillCircle(left, middle - (circleSize * 3), circleSize);
        canvas.FillCircle(left, middle + (circleSize * 3), circleSize);
        // line
        left += (4 * this.get_Scale());
        canvas.BeginPath();
        canvas.MoveTo(left, top);
        canvas.LineTo(left, bottom);
        canvas.Stroke();
        // big bar
        left += (3 * this.get_Scale()) + 0.5;
        canvas.FillRect(left, top, blockWidth, h);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RepeatCloseGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.RepeatCountGlyph = function (x, y, count){
    this._count = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._count = count;
};
AlphaTab.Rendering.Glyphs.RepeatCountGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.BarNumberFont);
        var s = "x" + this._count;
        var w = canvas.MeasureText(s) / 1.5;
        canvas.FillText(s, cx + this.X - w, cy + this.Y);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RepeatCountGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.RepeatOpenGlyph = function (x, y, circleSize, dotOffset){
    this._dotOffset = 0;
    this._circleSize = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._dotOffset = dotOffset;
    this._circleSize = circleSize;
};
AlphaTab.Rendering.Glyphs.RepeatOpenGlyph.prototype = {
    DoLayout: function (){
        this.Width = 13 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.TopPadding;
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.BottomPadding;
        var left = cx + this.X + 0.5;
        // big bar
        var h = bottom - top;
        canvas.FillRect(left, top, blockWidth, h);
        // line
        left += (blockWidth * 2) - 0.5;
        canvas.BeginPath();
        canvas.MoveTo(left, top);
        canvas.LineTo(left, bottom);
        canvas.Stroke();
        //circles 
        left += 3 * this.get_Scale();
        var circleSize = this._circleSize * this.get_Scale();
        var middle = (top + bottom) / 2;
        canvas.FillCircle(left, middle - (circleSize * this._dotOffset), circleSize);
        canvas.FillCircle(left, middle + (circleSize * this._dotOffset), circleSize);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RepeatOpenGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreRestGlyph = function (x, y, duration){
    this._duration = AlphaTab.Model.Duration.Whole;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSymbol(duration));
    this._duration = duration;
};
AlphaTab.Rendering.Glyphs.ScoreRestGlyph.prototype = {
    DoLayout: function (){
        switch (this._duration){
            case AlphaTab.Model.Duration.Whole:
            case AlphaTab.Model.Duration.Half:
            case AlphaTab.Model.Duration.Quarter:
            case AlphaTab.Model.Duration.Eighth:
            case AlphaTab.Model.Duration.Sixteenth:
                this.Width = 9 * this.get_Scale();
                break;
            case AlphaTab.Model.Duration.ThirtySecond:
                this.Width = 12 * this.get_Scale();
                break;
            case AlphaTab.Model.Duration.SixtyFourth:
                this.Width = 14 * this.get_Scale();
                break;
        }
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this.Width / 2, cx + this.X + this.Width / 2);
        }
    }
};
AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.Whole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestWhole;
        case AlphaTab.Model.Duration.Half:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestHalf;
        case AlphaTab.Model.Duration.Quarter:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestQuarter;
        case AlphaTab.Model.Duration.Eighth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestEighth;
        case AlphaTab.Model.Duration.Sixteenth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestSixteenth;
        case AlphaTab.Model.Duration.ThirtySecond:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestThirtySecond;
        case AlphaTab.Model.Duration.SixtyFourth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestSixtyFourth;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreRestGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.RideCymbalGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteRideCymbal);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.RideCymbalGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RideCymbalGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.ScoreBeatContainerGlyph = function (beat, voiceContainer){
    AlphaTab.Rendering.Glyphs.BeatContainerGlyph.call(this, beat, voiceContainer, false);
};
AlphaTab.Rendering.ScoreBeatContainerGlyph.prototype = {
    CreateTies: function (n){
        // create a tie if any effect requires it
        // NOTE: we create 2 tie glyphs if we have a line break inbetween 
        // the two notes
        if (n.IsTieOrigin){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.TieDestination, this, false);
            this.Ties.push(tie);
        }
        if (n.IsTieDestination){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n.TieOrigin, n, this, true);
            this.Ties.push(tie);
        }
        else if (n.IsHammerPullOrigin){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.HammerPullDestination, this, false);
            this.Ties.push(tie);
        }
        else if (n.SlideType == AlphaTab.Model.SlideType.Legato){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.SlideTarget, this, false);
            this.Ties.push(tie);
        }
        // TODO: depending on the type we have other positioning
        // we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
        if (n.SlideType != AlphaTab.Model.SlideType.None){
            var l = new AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph(n.SlideType, n, this);
            this.Ties.push(l);
        }
    }
};
$Inherit(AlphaTab.Rendering.ScoreBeatContainerGlyph, AlphaTab.Rendering.Glyphs.BeatContainerGlyph);
AlphaTab.Rendering.Glyphs.ScoreBeatGlyph = function (){
    this.NoteHeads = null;
    this.RestGlyph = null;
    AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.prototype = {
    UpdateBeamingHelper: function (){
        if (this.NoteHeads != null){
            this.NoteHeads.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else if (this.RestGlyph != null){
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else if (this.RestGlyph != null){
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
    },
    DoLayout: function (){
        // create glyphs
        var sr = this.Renderer;
        if (!this.Container.Beat.IsEmpty){
            if (!this.Container.Beat.get_IsRest()){
                //
                // Note heads
                //
                this.NoteHeads = new AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph();
                this.NoteHeads.Beat = this.Container.Beat;
                this.NoteHeads.BeamingHelper = this.BeamingHelper;
                for (var $i33 = 0,$t33 = this.Container.Beat.Notes,$l33 = $t33.length,note = $t33[$i33]; $i33 < $l33; $i33++, note = $t33[$i33]){
                    this.CreateNoteGlyph(note);
                }
                this.AddGlyph(this.NoteHeads);
                //
                // Note dots
                //
                if (this.Container.Beat.Dots > 0){
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale(), false));
                    for (var i = 0; i < this.Container.Beat.Dots; i++){
                        var group = new AlphaTab.Rendering.Glyphs.GlyphGroup(0, 0);
                        for (var $i34 = 0,$t34 = this.Container.Beat.Notes,$l34 = $t34.length,note = $t34[$i34]; $i34 < $l34; $i34++, note = $t34[$i34]){
                            this.CreateBeatDot(sr.GetNoteLine(note), group);
                        }
                        this.AddGlyph(group);
                    }
                }
            }
            else {
                var dotLine = 0;
                var line = 0;
                var offset = 0;
                switch (this.Container.Beat.Duration){
                    case AlphaTab.Model.Duration.Whole:
                        line = 4;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Half:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Quarter:
                        line = 6;
                        offset = -2;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Eighth:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Sixteenth:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.ThirtySecond:
                        line = 6;
                        dotLine = 3;
                        break;
                    case AlphaTab.Model.Duration.SixtyFourth:
                        line = 6;
                        dotLine = 3;
                        break;
                }
                var y = sr.GetScoreY(line, offset);
                this.RestGlyph = new AlphaTab.Rendering.Glyphs.ScoreRestGlyph(0, y, this.Container.Beat.Duration);
                this.RestGlyph.Beat = this.Container.Beat;
                this.RestGlyph.BeamingHelper = this.BeamingHelper;
                this.AddGlyph(this.RestGlyph);
                //
                // Note dots
                //
                if (this.Container.Beat.Dots > 0){
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale(), false));
                    for (var i = 0; i < this.Container.Beat.Dots; i++){
                        var group = new AlphaTab.Rendering.Glyphs.GlyphGroup(0, 0);
                        this.CreateBeatDot(dotLine, group);
                        this.AddGlyph(group);
                    }
                }
            }
        }
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    },
    CreateBeatDot: function (line, group){
        var sr = this.Renderer;
        group.AddGlyph(new AlphaTab.Rendering.Glyphs.CircleGlyph(0, sr.GetScoreY(line, 0), 1.5 * this.get_Scale()));
    },
    CreateNoteHeadGlyph: function (n){
        var isGrace = this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None;
        if (n.Beat.Voice.Bar.Staff.Track.IsPercussion){
            var value = n.get_RealValue();
            if (value <= 30 || value >= 67 || AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys.hasOwnProperty(value)){
                return new AlphaTab.Rendering.Glyphs.NoteHeadGlyph(0, 0, AlphaTab.Model.Duration.Quarter, isGrace);
            }
            if (AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys.hasOwnProperty(value)){
                return new AlphaTab.Rendering.Glyphs.DrumSticksGlyph(0, 0, isGrace);
            }
            if (value == 46){
                return new AlphaTab.Rendering.Glyphs.HiHatGlyph(0, 0, isGrace);
            }
            if (value == 49 || value == 57){
                return new AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph(0, 0, isGrace);
            }
            if (value == 52){
                return new AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph(0, 0, isGrace);
            }
            if (value == 51 || value == 53 || value == 59){
                return new AlphaTab.Rendering.Glyphs.RideCymbalGlyph(0, 0, isGrace);
            }
            return new AlphaTab.Rendering.Glyphs.NoteHeadGlyph(0, 0, AlphaTab.Model.Duration.Quarter, isGrace);
        }
        if (n.IsDead){
            return new AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph(0, 0, isGrace);
        }
        if (n.HarmonicType == AlphaTab.Model.HarmonicType.None){
            return new AlphaTab.Rendering.Glyphs.NoteHeadGlyph(0, 0, n.Beat.Duration, isGrace);
        }
        return new AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph(0, 0, isGrace);
    },
    CreateNoteGlyph: function (n){
        var sr = this.Renderer;
        var noteHeadGlyph = this.CreateNoteHeadGlyph(n);
        // calculate y position
        var line = sr.GetNoteLine(n);
        noteHeadGlyph.Y = sr.GetScoreY(line, 0);
        this.NoteHeads.AddNoteGlyph(noteHeadGlyph, n, line);
        if (n.IsStaccato && !this.NoteHeads.BeatEffects.hasOwnProperty("Staccato")){
            this.NoteHeads.BeatEffects["Staccato"] = new AlphaTab.Rendering.Glyphs.CircleGlyph(0, 0, 1.5);
        }
        if (n.Accentuated == AlphaTab.Model.AccentuationType.Normal && !this.NoteHeads.BeatEffects.hasOwnProperty("Accent")){
            this.NoteHeads.BeatEffects["Accent"] = new AlphaTab.Rendering.Glyphs.AccentuationGlyph(0, 0, AlphaTab.Model.AccentuationType.Normal);
        }
        if (n.Accentuated == AlphaTab.Model.AccentuationType.Heavy && !this.NoteHeads.BeatEffects.hasOwnProperty("HAccent")){
            this.NoteHeads.BeatEffects["HAccent"] = new AlphaTab.Rendering.Glyphs.AccentuationGlyph(0, 0, AlphaTab.Model.AccentuationType.Heavy);
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys = null;
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys = null;
    // ReSharper disable ForCanBeConvertedToForeach
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys = {};
    var normalKeyNotes = new Int32Array([32, 34, 35, 36, 38, 39, 40, 41, 43, 45, 47, 48, 50, 55, 56, 58, 60, 61]);
    for (var i = 0; i < normalKeyNotes.length; i++){
        AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys[normalKeyNotes[i]] = true;
    }
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys = {};
    var xKeyNotes = new Int32Array([31, 33, 37, 42, 44, 54, 62, 63, 64, 65, 66]);
    for (var i = 0; i < xKeyNotes.length; i++){
        AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys[xKeyNotes[i]] = true;
    }
    // ReSharper restore ForCanBeConvertedToForeach
});
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBeatGlyph, AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase);
AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph.prototype = {
    DoLayout: function (){
        if (this.Container.Beat.BrushType != AlphaTab.Model.BrushType.None){
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.ScoreBrushGlyph(this.Container.Beat));
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * this.get_Scale(), true));
        }
        if (!this.Container.Beat.get_IsRest()){
            var accidentals = new AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph();
            for (var $i35 = 0,$t35 = this.Container.Beat.Notes,$l35 = $t35.length,note = $t35[$i35]; $i35 < $l35; $i35++, note = $t35[$i35]){
                this.CreateAccidentalGlyph(note, accidentals);
            }
            if (!accidentals.get_IsEmpty()){
                this.AddGlyph(accidentals);
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * (this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None ? 0.6 : 1) * this.get_Scale(), true));
            }
        }
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    },
    CreateAccidentalGlyph: function (n, accidentals){
        var sr = this.Renderer;
        var accidental = sr.AccidentalHelper.ApplyAccidental(n);
        var noteLine = sr.GetNoteLine(n);
        var isGrace = this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None;
        switch (accidental){
            case AlphaTab.Model.AccidentalType.Sharp:
                accidentals.AddGlyph(new AlphaTab.Rendering.Glyphs.SharpGlyph(0, sr.GetScoreY(noteLine, 0), isGrace));
                break;
            case AlphaTab.Model.AccidentalType.Flat:
                accidentals.AddGlyph(new AlphaTab.Rendering.Glyphs.FlatGlyph(0, sr.GetScoreY(noteLine, 0), isGrace));
                break;
            case AlphaTab.Model.AccidentalType.Natural:
                accidentals.AddGlyph(new AlphaTab.Rendering.Glyphs.NaturalizeGlyph(0, sr.GetScoreY(noteLine, 0), isGrace));
                break;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.ScoreBrushGlyph = function (beat){
    this._beat = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._beat = beat;
};
AlphaTab.Rendering.Glyphs.ScoreBrushGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        //TODO: Create webfont version
        var scoreBarRenderer = this.Renderer;
        var lineSize = scoreBarRenderer.get_LineOffset();
        var startY = cy + this.Y + (scoreBarRenderer.GetNoteY(this._beat.get_MaxNote()) - lineSize / 2);
        var endY = cy + this.Y + scoreBarRenderer.GetNoteY(this._beat.get_MinNote()) + lineSize;
        var arrowX = cx + this.X + this.Width / 2;
        var arrowSize = 8 * this.get_Scale();
        if (this._beat.BrushType != AlphaTab.Model.BrushType.None){
            //if (_beat.BrushType == BrushType.ArpeggioUp || _beat.BrushType == BrushType.ArpeggioDown)
            //{
            //    var size = 15 * Scale;
            //    var steps = Math.Abs(endY - startY) / size;
            //    for (var i = 0; i < steps; i++)
            //    {
            //        canvas.FillMusicFontSymbol(cx + X + (3 * Scale), 1, startY + (i * size), MusicFontSymbol.WaveVertical);
            //    }
            //}
            if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, endY);
                canvas.LineTo(arrowX + arrowSize / 2, endY - arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, endY - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
            else if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioDown){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, startY);
                canvas.LineTo(arrowX + arrowSize / 2, startY + arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, startY + arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBrushGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreNoteGlyphInfo = function (glyph, line){
    this.Glyph = null;
    this.Line = 0;
    this.Glyph = glyph;
    this.Line = line;
};
AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph = function (){
    this._infos = null;
    this._noteLookup = null;
    this._tremoloPicking = null;
    this._noteHeadPadding = 0;
    this.MinNote = null;
    this.MaxNote = null;
    this.SpacingChanged = null;
    this.UpLineX = 0;
    this.DownLineX = 0;
    this.BeatEffects = null;
    this.Beat = null;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._infos = [];
    this.BeatEffects = {};
    this._noteLookup = {};
};
AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph.prototype = {
    get_Direction: function (){
        return this.BeamingHelper.Direction;
    },
    GetNoteX: function (note, onEnd){
        if (this._noteLookup.hasOwnProperty(note.String)){
            var n = this._noteLookup[note.String];
            var pos = this.X + n.X;
            if (onEnd){
                pos += n.Width;
            }
            return pos;
        }
        return 0;
    },
    GetNoteY: function (note){
        if (this._noteLookup.hasOwnProperty(note.String)){
            return this.Y + this._noteLookup[note.String].Y;
        }
        return 0;
    },
    AddNoteGlyph: function (noteGlyph, note, noteLine){
        var info = new AlphaTab.Rendering.Glyphs.ScoreNoteGlyphInfo(noteGlyph, noteLine);
        this._infos.push(info);
        this._noteLookup[note.String] = noteGlyph;
        if (this.MinNote == null || this.MinNote.Line > info.Line){
            this.MinNote = info;
        }
        if (this.MaxNote == null || this.MaxNote.Line < info.Line){
            this.MaxNote = info;
        }
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this.UpLineX, cx + this.X + this.DownLineX);
        }
    },
    get_HasTopOverflow: function (){
        return this.MinNote != null && this.MinNote.Line < 0;
    },
    get_HasBottomOverflow: function (){
        return this.MaxNote != null && this.MaxNote.Line > 8;
    },
    DoLayout: function (){
        this._infos.sort($CreateAnonymousDelegate(this, function (a, b){
    return (a.Line-b.Line);
}));
        var padding = 0;
        // Std.int(4 * getScale());
        var displacedX = 0;
        var lastDisplaced = false;
        var lastLine = 0;
        var anyDisplaced = false;
        var direction = this.get_Direction();
        var w = 0;
        for (var i = 0,j = this._infos.length; i < j; i++){
            var g = this._infos[i].Glyph;
            g.Renderer = this.Renderer;
            g.DoLayout();
            var displace = false;
            if (i == 0){
                displacedX = g.Width + 0;
            }
            else {
                // check if note needs to be repositioned
                if (Math.abs(lastLine - this._infos[i].Line) <= 1){
                    // reposition if needed
                    if (!lastDisplaced){
                        displace = true;
                        g.X = displacedX - (this.get_Scale());
                        anyDisplaced = true;
                        lastDisplaced = true;
                        // let next iteration know we are displace now
                    }
                    else {
                        lastDisplaced = false;
                        // let next iteration know that we weren't displaced now
                    }
                }
                else {
                    lastDisplaced = false;
                }
            }
            // for beat direction down we invert the displacement.
            // this means: displaced is on the left side of the stem and not displaced is right
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                g.X = displace ? 0 : displacedX;
            }
            else {
                g.X = displace ? displacedX : 0;
            }
            lastLine = this._infos[i].Line;
            w = Math.max(w, g.X + g.Width);
        }
        if (anyDisplaced){
            this._noteHeadPadding = 0;
            this.UpLineX = displacedX;
            this.DownLineX = displacedX;
        }
        else {
            this._noteHeadPadding = direction == AlphaTab.Rendering.Utils.BeamDirection.Down ? -displacedX : 0;
            w += this._noteHeadPadding;
            this.UpLineX = w;
            this.DownLineX = 0;
        }
        for (var effectKey in this.BeatEffects){
            var effect = this.BeatEffects[effectKey];
            effect.Renderer = this.Renderer;
            effect.DoLayout();
        }
        if (this.Beat.get_IsTremolo()){
            var offset;
            var baseNote = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? this.MinNote : this.MaxNote;
            var tremoloX = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? displacedX : 0;
            var speed = this.Beat.TremoloSpeed;
            switch (speed){
                case AlphaTab.Model.Duration.ThirtySecond:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -15 : 15;
                    break;
                case AlphaTab.Model.Duration.Sixteenth:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -12 : 15;
                    break;
                case AlphaTab.Model.Duration.Eighth:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -10 : 10;
                    break;
                default:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -10 : 15;
                    break;
            }
            this._tremoloPicking = new AlphaTab.Rendering.Glyphs.TremoloPickingGlyph(tremoloX, baseNote.Glyph.Y + offset * (this.get_Scale()), this.Beat.TremoloSpeed);
            this._tremoloPicking.Renderer = this.Renderer;
            this._tremoloPicking.DoLayout();
        }
        this.Width = w + 0;
    },
    Paint: function (cx, cy, canvas){
        var scoreRenderer = this.Renderer;
        //
        // Note Effects only painted once
        //
        var effectY = this.BeamingHelper.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? scoreRenderer.GetScoreY(this.MaxNote.Line, 13.5) : scoreRenderer.GetScoreY(this.MinNote.Line, -9);
        // TODO: take care of actual glyph height
        var effectSpacing = (this.BeamingHelper.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up) ? 7 * (this.get_Scale()) : -7 * (this.get_Scale());
        for (var effectKey in this.BeatEffects){
            var g = this.BeatEffects[effectKey];
            g.Y = effectY;
            g.X = this.Width / 2;
            g.Paint(cx + this.X, cy + this.Y, canvas);
            effectY += effectSpacing;
        }
        canvas.set_Color(this.Renderer.get_Layout().Renderer.RenderingResources.StaveLineColor);
        // TODO: Take care of beateffects in overflow
        var linePadding = 3 * (this.get_Scale());
        if (this.get_HasTopOverflow()){
            var l = -1;
            while (l >= this.MinNote.Line){
                // + 1 Because we want to place the line in the center of the note, not at the top
                var lY = cy + this.Y + scoreRenderer.GetScoreY(l, 0);
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X - linePadding, lY);
                canvas.LineTo(cx + this.X + this.Width + linePadding, lY);
                canvas.Stroke();
                l -= 2;
            }
        }
        if (this.get_HasBottomOverflow()){
            var l = 12;
            while (l <= this.MaxNote.Line){
                var lY = cy + this.Y + scoreRenderer.GetScoreY(l, 0);
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X - linePadding, lY);
                canvas.LineTo(cx + this.X + this.Width + linePadding, lY);
                canvas.Stroke();
                l += 2;
            }
        }
        canvas.set_Color(this.Beat.Voice.Index == 0 ? this.Renderer.get_Layout().Renderer.RenderingResources.MainGlyphColor : this.Renderer.get_Layout().Renderer.RenderingResources.SecondaryGlyphColor);
        if (this._tremoloPicking != null)
            this._tremoloPicking.Paint(cx + this.X, cy + this.Y, canvas);
        for (var i = 0,j = this._infos.length; i < j; i++){
            var g = this._infos[i];
            g.Glyph.Renderer = this.Renderer;
            g.Glyph.Paint(cx + this.X + this._noteHeadPadding, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph = function (type, startNote, parent){
    this._startNote = null;
    this._type = AlphaTab.Model.SlideType.None;
    this._parent = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._type = type;
    this._startNote = startNote;
    this._parent = parent;
};
AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    Paint: function (cx, cy, canvas){
        var r = this.Renderer;
        var sizeX = 12 * this.get_Scale();
        var offsetX = 1 * this.get_Scale();
        var startX;
        var startY;
        var endX;
        var endY;
        switch (this._type){
            case AlphaTab.Model.SlideType.Shift:
            case AlphaTab.Model.SlideType.Legato:
                startX = cx + r.GetNoteX(this._startNote, true) + offsetX;
                startY = cy + r.GetNoteY(this._startNote) + 4.5;
                if (this._startNote.SlideTarget != null){
                endX = cx + r.GetNoteX(this._startNote.SlideTarget, false) - offsetX;
                endY = cy + r.GetNoteY(this._startNote.SlideTarget) + 4.5;
            }
                else {
                endX = cx + this._parent.X;
                endY = startY;
            }
                break;
            case AlphaTab.Model.SlideType.IntoFromBelow:
                endX = cx + r.GetNoteX(this._startNote, false) - offsetX;
                endY = cy + r.GetNoteY(this._startNote) + 4.5;
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote) + 9;
                break;
            case AlphaTab.Model.SlideType.IntoFromAbove:
                endX = cx + r.GetNoteX(this._startNote, false) - offsetX;
                endY = cy + r.GetNoteY(this._startNote) + 4.5;
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote);
                break;
            case AlphaTab.Model.SlideType.OutUp:
                startX = cx + r.GetNoteX(this._startNote, true) + offsetX;
                startY = cy + r.GetNoteY(this._startNote) + 4.5;
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote);
                break;
            case AlphaTab.Model.SlideType.OutDown:
                startX = cx + r.GetNoteX(this._startNote, true) + offsetX;
                startY = cy + r.GetNoteY(this._startNote) + 4.5;
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote) + 9;
                break;
            default:
                return;
        }
        canvas.BeginPath();
        canvas.MoveTo(startX, startY);
        canvas.LineTo(endX, endY);
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TieGlyph = function (startNote, endNote, parent, forEnd){
    this.StartNote = null;
    this.EndNote = null;
    this.Parent = null;
    this.YOffset = 0;
    this._forEnd = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this.StartNote = startNote;
    this.EndNote = endNote;
    this.Parent = parent;
    this._forEnd = forEnd;
};
AlphaTab.Rendering.Glyphs.TieGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    Paint: function (cx, cy, canvas){
        if (this.EndNote == null)
            return;
        var startNoteRenderer = this.Renderer.get_Layout().GetRendererForBar(this.Renderer.Staff.StaveId, this.StartNote.Beat.Voice.Bar);
        var endNoteRenderer = this.Renderer.get_Layout().GetRendererForBar(this.Renderer.Staff.StaveId, this.EndNote.Beat.Voice.Bar);
        var startX = 0;
        var endX = 0;
        var startY = 0;
        var endY = 0;
        var shouldDraw = false;
        var parent = this.Parent;
        // if we are on the tie start, we check if we 
        // either can draw till the end note, or we just can draw till the bar end
        if (!this._forEnd){
            // line break or bar break
            if (startNoteRenderer != endNoteRenderer){
                startX = cx + startNoteRenderer.GetNoteX(this.StartNote, true);
                // line break: to bar end
                if (endNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff){
                    endX = cx + parent.X;
                }
                else {
                    endX = cx + parent.X;
                    endX += endNoteRenderer.GetNoteX(this.EndNote, true);
                }
                startY = cy + startNoteRenderer.GetNoteY(this.StartNote) + this.YOffset;
                endY = startY;
            }
            else {
                startX = cx + startNoteRenderer.GetNoteX(this.StartNote, true);
                endX = cx + endNoteRenderer.GetNoteX(this.EndNote, false);
                startY = cy + startNoteRenderer.GetNoteY(this.StartNote) + this.YOffset;
                endY = cy + endNoteRenderer.GetNoteY(this.EndNote) + this.YOffset;
            }
            shouldDraw = true;
        }
        else if (startNoteRenderer.Staff != endNoteRenderer.Staff){
            startX = cx;
            endX = cx + endNoteRenderer.GetNoteX(this.EndNote, true);
            startY = cy + endNoteRenderer.GetNoteY(this.EndNote) + this.YOffset;
            endY = startY;
            shouldDraw = true;
        }
        if (shouldDraw){
            AlphaTab.Rendering.Glyphs.TieGlyph.PaintTie(canvas, this.get_Scale(), startX, startY, endX, endY, this.GetBeamDirection(this.StartNote, startNoteRenderer) == AlphaTab.Rendering.Utils.BeamDirection.Down);
            canvas.Fill();
        }
    },
    GetBeamDirection: function (note, noteRenderer){
        return AlphaTab.Rendering.Utils.BeamDirection.Down;
    }
};
AlphaTab.Rendering.Glyphs.TieGlyph.PaintTie = function (canvas, scale, x1, y1, x2, y2, down){
    // ensure endX > startX
    if (x2 > x1){
        var t = x1;
        x1 = x2;
        x2 = t;
        t = y1;
        y1 = y2;
        y2 = t;
    }
    //
    // calculate control points 
    //
    var offset = 15 * scale;
    var size = 4 * scale;
    // normal vector
    var normalVectorX = (y2 - y1);
    var normalVectorY = (x2 - x1);
    var length = Math.sqrt((normalVectorX * normalVectorX) + (normalVectorY * normalVectorY));
    if (down)
        normalVectorX *= -1;
    else
        normalVectorY *= -1;
    // make to unit vector
    normalVectorX /= length;
    normalVectorY /= length;
    // center of connection
    var centerX = (x2 + x1) / 2;
    var centerY = (y2 + y1) / 2;
    // control points
    var cp1X = centerX + (offset * normalVectorX);
    var cp1Y = centerY + (offset * normalVectorY);
    var cp2X = centerX + ((offset - size) * normalVectorX);
    var cp2Y = centerY + ((offset - size) * normalVectorY);
    canvas.BeginPath();
    canvas.MoveTo(x1, y1);
    canvas.QuadraticCurveTo(cp1X, cp1Y, x2, y2);
    canvas.QuadraticCurveTo(cp2X, cp2Y, x1, y1);
    canvas.ClosePath();
};
$Inherit(AlphaTab.Rendering.Glyphs.TieGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreTieGlyph = function (startNote, endNote, parent, forEnd){
    AlphaTab.Rendering.Glyphs.TieGlyph.call(this, startNote, endNote, parent, forEnd);
};
AlphaTab.Rendering.Glyphs.ScoreTieGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.TieGlyph.prototype.DoLayout.call(this);
        this.YOffset = (4.5);
    },
    GetBeamDirection: function (note, noteRenderer){
        return (noteRenderer).GetBeatDirection(note.Beat);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreTieGlyph, AlphaTab.Rendering.Glyphs.TieGlyph);
AlphaTab.Rendering.Glyphs.SharpGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.6 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalSharp);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.SharpGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.6 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.SharpGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.SpacingGlyph = function (x, y, width, scaling){
    this._scaling = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._scaling = scaling;
    this.Width = width;
    this._scaling = scaling;
};
$Inherit(AlphaTab.Rendering.Glyphs.SpacingGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph = function (beat, voiceContainer){
    this._bendGlyphs = null;
    AlphaTab.Rendering.Glyphs.BeatContainerGlyph.call(this, beat, voiceContainer, false);
};
AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype.DoLayout.call(this);
        this._bendGlyphs = [];
        for (var i = 0; i < this.Beat.Notes.length; i++){
            var n = this.Beat.Notes[i];
            if (n.get_HasBend()){
                var bendValueHeight = 6;
                var bendHeight = n.MaxBendPoint.Value * bendValueHeight;
                this.Renderer.RegisterOverflowTop(bendHeight);
                var bend = new AlphaTab.Rendering.Glyphs.BendGlyph(n, bendValueHeight);
                bend.X = this.OnNotes.X + this.OnNotes.Width;
                bend.Renderer = this.Renderer;
                this._bendGlyphs.push(bend);
            }
        }
    },
    ScaleToWidth: function (beatWidth){
        AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype.ScaleToWidth.call(this, beatWidth);
        for (var i = 0; i < this._bendGlyphs.length; i++){
            var g = this._bendGlyphs[i];
            g.Width = beatWidth - g.X;
        }
    },
    CreateTies: function (n){
        if (n.IsHammerPullOrigin){
            var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n, n.HammerPullDestination, this, false);
            this.Ties.push(tie);
        }
        else if (n.SlideType == AlphaTab.Model.SlideType.Legato){
            var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n, n.SlideTarget, this, false);
            this.Ties.push(tie);
        }
        if (n.SlideType != AlphaTab.Model.SlideType.None){
            var l = new AlphaTab.Rendering.Glyphs.TabSlideLineGlyph(n.SlideType, n, this);
            this.Ties.push(l);
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype.Paint.call(this, cx, cy, canvas);
        for (var i = 0; i < this._bendGlyphs.length; i++){
            var g = this._bendGlyphs[i];
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph, AlphaTab.Rendering.Glyphs.BeatContainerGlyph);
AlphaTab.Rendering.Glyphs.TabBeatGlyph = function (){
    this.NoteNumbers = null;
    this.RestGlyph = null;
    AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.TabBeatGlyph.prototype = {
    DoLayout: function (){
        // create glyphs
        if (!this.Container.Beat.get_IsRest()){
            //
            // Note numbers
            this.NoteNumbers = new AlphaTab.Rendering.Glyphs.TabNoteChordGlyph(0, 0, this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None);
            this.NoteNumbers.Beat = this.Container.Beat;
            this.NoteNumbers.BeamingHelper = this.BeamingHelper;
            for (var $i36 = 0,$t36 = this.Container.Beat.Notes,$l36 = $t36.length,note = $t36[$i36]; $i36 < $l36; $i36++, note = $t36[$i36]){
                this.CreateNoteGlyph(note);
            }
            this.AddGlyph(this.NoteNumbers);
            //
            // Whammy Bar
            if (this.Container.Beat.get_HasWhammyBar() && !this.NoteNumbers.BeatEffects.hasOwnProperty("Whammy")){
                this.NoteNumbers.BeatEffects["Whammy"] = new AlphaTab.Rendering.Glyphs.WhammyBarGlyph(this.Container.Beat, this.Container);
                var whammyValueHeight = (60 * this.get_Scale()) / 24;
                var whammyHeight = this.Container.Beat.MaxWhammyPoint.Value * whammyValueHeight;
                this.Renderer.RegisterOverflowTop(whammyHeight);
            }
            //
            // Tremolo Picking
            if (this.Container.Beat.get_IsTremolo() && !this.NoteNumbers.BeatEffects.hasOwnProperty("Tremolo")){
                var offset = 0;
                var speed = this.Container.Beat.TremoloSpeed;
                switch (speed){
                    case AlphaTab.Model.Duration.ThirtySecond:
                        offset = 10;
                        break;
                    case AlphaTab.Model.Duration.Sixteenth:
                        offset = 5;
                        break;
                    case AlphaTab.Model.Duration.Eighth:
                        offset = 0;
                        break;
                }
                this.NoteNumbers.BeatEffects["Tremolo"] = new AlphaTab.Rendering.Glyphs.TremoloPickingGlyph(5 * this.get_Scale(), offset * this.get_Scale(), this.Container.Beat.TremoloSpeed);
            }
        }
        else {
            this.RestGlyph = new AlphaTab.Rendering.Glyphs.TabRestGlyph();
            this.RestGlyph.Beat = this.Container.Beat;
            this.RestGlyph.BeamingHelper = this.BeamingHelper;
            this.AddGlyph(this.RestGlyph);
        }
        // left to right layout
        if (this.Glyphs == null)
            return;
        var w = 0;
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.X = w;
            g.Renderer = this.Renderer;
            g.DoLayout();
            w += g.Width;
        }
        this.Width = w;
    },
    UpdateBeamingHelper: function (){
        if (!this.Container.Beat.get_IsRest()){
            this.NoteNumbers.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else {
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
    },
    CreateNoteGlyph: function (n){
        var tr = this.Renderer;
        var noteNumberGlyph = new AlphaTab.Rendering.Glyphs.NoteNumberGlyph(0, 0, n);
        var l = n.Beat.Voice.Bar.Staff.Track.Tuning.length - n.String + 1;
        noteNumberGlyph.Y = tr.GetTabY(l, -2);
        noteNumberGlyph.Renderer = this.Renderer;
        noteNumberGlyph.DoLayout();
        this.NoteNumbers.AddNoteGlyph(noteNumberGlyph, n);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatGlyph, AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase);
AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph.prototype = {
    DoLayout: function (){
        if (this.Container.Beat.BrushType != AlphaTab.Model.BrushType.None){
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.TabBrushGlyph(this.Container.Beat));
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * this.get_Scale(), true));
        }
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.TabBrushGlyph = function (beat){
    this._beat = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._beat = beat;
};
AlphaTab.Rendering.Glyphs.TabBrushGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        // TODO: Create webfont version
        var tabBarRenderer = this.Renderer;
        var res = this.Renderer.get_Resources();
        var startY = cy + this.X + (tabBarRenderer.GetNoteY(this._beat.get_MaxNote()) - res.TablatureFont.Size / 2);
        var endY = cy + this.Y + tabBarRenderer.GetNoteY(this._beat.get_MinNote()) + res.TablatureFont.Size / 2;
        var arrowX = ((cx + this.X + this.Width / 2)) | 0;
        var arrowSize = 8 * this.get_Scale();
        if (this._beat.BrushType != AlphaTab.Model.BrushType.None){
            if (this._beat.BrushType == AlphaTab.Model.BrushType.BrushUp || this._beat.BrushType == AlphaTab.Model.BrushType.BrushDown){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, startY);
                canvas.LineTo(arrowX, endY);
                canvas.Stroke();
            }
            else {
                //var size = 15 * Scale;
                //var steps = Math.Abs(endY - startY) / size;
                //for (var i = 0; i < steps; i++)
                //{
                //    canvas.FillMusicFontSymbol(cx + X + (3 * Scale), 1, startY + (i * size), MusicFontSymbol.WaveVertical);
                //}
            }
            if (this._beat.BrushType == AlphaTab.Model.BrushType.BrushUp || this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, endY);
                canvas.LineTo(arrowX + arrowSize / 2, endY - arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, endY - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
            else {
                canvas.BeginPath();
                canvas.MoveTo(arrowX, startY);
                canvas.LineTo(arrowX + arrowSize / 2, startY + arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, startY + arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBrushGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabClefGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.TabClefGlyph.prototype = {
    DoLayout: function (){
        this.Width = 28 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        //TabBarRenderer tabBarRenderer = (TabBarRenderer)Renderer;
        var track = this.Renderer.Bar.Staff.Track;
        var res = this.Renderer.get_Resources();
        var startY = cy + this.Y + 10 * this.get_Scale() * 0.6;
        //var endY = cy + Y + tabBarRenderer.GetTabY(track.Tuning.Count, -2);
        // TODO: Find a more generic way of calculating the font size but for now this works.
        var fontScale = 1;
        var correction = 0;
        switch (track.Tuning.length){
            case 4:
                fontScale = 0.6;
                break;
            case 5:
                fontScale = 0.8;
                break;
            case 6:
                fontScale = 1.1;
                correction = 1;
                break;
            case 7:
                fontScale = 1.15;
                break;
            case 8:
                fontScale = 1.35;
                break;
        }
        var font = res.TabClefFont.Clone();
        font.Size = font.Size * fontScale;
        canvas.set_Font(font);
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        canvas.FillText("T", cx + this.X + this.Width / 2, startY);
        canvas.FillText("A", cx + this.X + this.Width / 2, startY + font.Size - (correction * this.get_Scale()));
        canvas.FillText("B", cx + this.X + this.Width / 2, startY + (font.Size - (correction * this.get_Scale())) * 2);
        canvas.set_TextAlign(old);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabClefGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabNoteChordGlyph = function (x, y, isGrace){
    this._notes = null;
    this._noteLookup = null;
    this._minNote = null;
    this._isGrace = false;
    this._centerX = 0;
    this.Beat = null;
    this.BeamingHelper = null;
    this.BeatEffects = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._isGrace = isGrace;
    this._notes = [];
    this.BeatEffects = {};
    this._noteLookup = {};
};
AlphaTab.Rendering.Glyphs.TabNoteChordGlyph.prototype = {
    GetNoteX: function (note, onEnd){
        if (this._noteLookup.hasOwnProperty(note.String)){
            var n = this._noteLookup[note.String];
            var pos = this.X + n.X;
            if (onEnd){
                pos += n.Width;
            }
            return pos;
        }
        return 0;
    },
    GetNoteY: function (note){
        if (this._noteLookup.hasOwnProperty(note.String)){
            return this.Y + this._noteLookup[note.String].Y;
        }
        return 0;
    },
    DoLayout: function (){
        var w = 0;
        for (var i = 0,j = this._notes.length; i < j; i++){
            var g = this._notes[i];
            g.Renderer = this.Renderer;
            g.DoLayout();
            if (g.Width > w){
                w = g.Width;
            }
        }
        var tabHeight = this.Renderer.get_Resources().TablatureFont.Size;
        var effectY = this.GetNoteY(this._minNote) + tabHeight / 2;
        // TODO: take care of actual glyph height
        var effectSpacing = 7 * this.get_Scale();
        for (var beatEffectKey in this.BeatEffects){
            var g = this.BeatEffects[beatEffectKey];
            g.Y += effectY;
            g.X += this.Width / 2;
            g.Renderer = this.Renderer;
            effectY += effectSpacing;
            g.DoLayout();
        }
        this._centerX = 0;
        this.Width = w;
    },
    AddNoteGlyph: function (noteGlyph, note){
        this._notes.push(noteGlyph);
        this._noteLookup[note.String] = noteGlyph;
        if (this._minNote == null || note.String < this._minNote.String)
            this._minNote = note;
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        var old = canvas.get_TextBaseline();
        canvas.set_TextBaseline(AlphaTab.Platform.Model.TextBaseline.Middle);
        canvas.set_Font(this._isGrace ? res.GraceFont : res.TablatureFont);
        for (var i = 0,j = this._notes.length; i < j; i++){
            var g = this._notes[i];
            g.Renderer = this.Renderer;
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }
        canvas.set_TextBaseline(old);
        for (var beatEffectKey in this.BeatEffects){
            var g = this.BeatEffects[beatEffectKey];
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null && !this.BeamingHelper.HasBeatLineX(this.Beat)){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this._centerX, cx + this.X + this._centerX);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabNoteChordGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabRestGlyph = function (){
    this.Beat = null;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.SpacingGlyph.call(this, 0, 0, 0, false);
};
AlphaTab.Rendering.Glyphs.TabRestGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this.Width / 2, cx + this.X + this.Width / 2);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabRestGlyph, AlphaTab.Rendering.Glyphs.SpacingGlyph);
AlphaTab.Rendering.Glyphs.TabSlideLineGlyph = function (type, startNote, parent){
    this._startNote = null;
    this._type = AlphaTab.Model.SlideType.None;
    this._parent = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._type = type;
    this._startNote = startNote;
    this._parent = parent;
};
AlphaTab.Rendering.Glyphs.TabSlideLineGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    Paint: function (cx, cy, canvas){
        var r = this.Renderer;
        var sizeX = 12 * this.get_Scale();
        var sizeY = 3 * this.get_Scale();
        var startX;
        var startY;
        var endX;
        var endY;
        switch (this._type){
            case AlphaTab.Model.SlideType.Shift:
            case AlphaTab.Model.SlideType.Legato:
                var startOffsetY;
                var endOffsetY;
                if (this._startNote.SlideTarget == null){
                startOffsetY = 0;
                endOffsetY = 0;
            }
                else if (this._startNote.SlideTarget.Fret > this._startNote.Fret){
                startOffsetY = sizeY;
                endOffsetY = sizeY * -1;
            }
            else {
                startOffsetY = sizeY * -1;
                endOffsetY = sizeY;
            }
                startX = cx + r.GetNoteX(this._startNote, true);
                startY = cy + r.GetNoteY(this._startNote) + startOffsetY;
                if (this._startNote.SlideTarget != null){
                endX = cx + r.GetNoteX(this._startNote.SlideTarget, false);
                endY = cy + r.GetNoteY(this._startNote.SlideTarget) + endOffsetY;
            }
                else {
                endX = cx + this._parent.X;
                endY = startY;
            }
                break;
            case AlphaTab.Model.SlideType.IntoFromBelow:
                endX = cx + r.GetNoteX(this._startNote, false);
                endY = cy + r.GetNoteY(this._startNote);
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote) + sizeY;
                break;
            case AlphaTab.Model.SlideType.IntoFromAbove:
                endX = cx + r.GetNoteX(this._startNote, false);
                endY = cy + r.GetNoteY(this._startNote);
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote) - sizeY;
                break;
            case AlphaTab.Model.SlideType.OutUp:
                startX = cx + r.GetNoteX(this._startNote, true);
                startY = cy + r.GetNoteY(this._startNote);
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote) - sizeY;
                break;
            case AlphaTab.Model.SlideType.OutDown:
                startX = cx + r.GetNoteX(this._startNote, true);
                startY = cy + r.GetNoteY(this._startNote);
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote) + sizeY;
                break;
            default:
                return;
        }
        canvas.BeginPath();
        canvas.MoveTo(startX, startY);
        canvas.LineTo(endX, endY);
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabSlideLineGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabTieGlyph = function (startNote, endNote, parent, forEnd){
    AlphaTab.Rendering.Glyphs.TieGlyph.call(this, startNote, endNote, parent, forEnd);
};
AlphaTab.Rendering.Glyphs.TabTieGlyph.prototype = {
    GetBeamDirection: function (note, noteRenderer){
        return this.StartNote.String > 3 ? AlphaTab.Rendering.Utils.BeamDirection.Down : AlphaTab.Rendering.Utils.BeamDirection.Up;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabTieGlyph, AlphaTab.Rendering.Glyphs.TieGlyph);
AlphaTab.Rendering.Glyphs.TempoGlyph = function (x, y, tempo){
    this._tempo = 0;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._tempo = tempo;
};
AlphaTab.Rendering.Glyphs.TempoGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.MarkerFont);
        canvas.FillMusicFontSymbol(cx + this.X, cy + this.Y + this.Renderer.Height * 0.75, 0.75, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
        canvas.FillText("= " + this._tempo, cx + this.X + (15 * this.get_Scale()), cy + this.Y + canvas.get_Font().Size / 2);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TempoGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TextGlyph = function (x, y, text, font, textAlign){
    this._text = null;
    this.Font = null;
    this.TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._text = text;
    this.Font = font;
    this.TextAlign = textAlign;
};
AlphaTab.Rendering.Glyphs.TextGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        canvas.set_Font(this.Font);
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(this.TextAlign);
        canvas.FillText(this._text, cx + this.X, cy + this.Y);
        canvas.set_TextAlign(old);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TextGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TimeSignatureGlyph = function (x, y, numerator, denominator){
    this._numerator = 0;
    this._denominator = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._numerator = numerator;
    this._denominator = denominator;
};
AlphaTab.Rendering.Glyphs.TimeSignatureGlyph.prototype = {
    DoLayout: function (){
        var numerator = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, 2 * this.get_Scale(), this._numerator);
        var denominator = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, 20 * this.get_Scale(), this._denominator);
        this.AddGlyph(numerator);
        this.AddGlyph(denominator);
        AlphaTab.Rendering.Glyphs.GlyphGroup.prototype.DoLayout.call(this);
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.X = (this.Width - g.Width) / 2;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TimeSignatureGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph = function (x, y, duration){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.GetSymbol(duration));
};
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.prototype = {
    DoLayout: function (){
        this.Width = 12 * this.get_Scale();
    }
};
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.ThirtySecond:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingThirtySecond;
        case AlphaTab.Model.Duration.Sixteenth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingSixteenth;
        case AlphaTab.Model.Duration.Eighth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingEighth;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TremoloPickingGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.TrillGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.TrillGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.MarkerFont);
        var textw = canvas.MeasureText("tr");
        canvas.FillText("tr", cx + this.X, cy + this.Y);
        var startX = textw + 3 * this.get_Scale();
        var endX = this.Width - startX;
        var waveScale = 1.2;
        var step = 11 * this.get_Scale() * waveScale;
        var loops = Math.max(1, ((endX - startX) / step));
        var loopX = startX;
        var loopY = cy + this.Y + this.Renderer.Height;
        for (var i = 0; i < loops; i++){
            canvas.FillMusicFontSymbol(cx + this.X + loopX, loopY, waveScale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveHorizontal);
            loopX += step;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TrillGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TripletFeelGlyph = function (tripletFeel){
    this._tripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, 0, 0);
    this._tripletFeel = tripletFeel;
};
AlphaTab.Rendering.Glyphs.TripletFeelGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        cx += this.X;
        cy += this.Y;
        var noteY = cy + this.Renderer.Height * 0.75;
        canvas.set_Font(this.Renderer.get_Resources().EffectFont);
        canvas.FillText("(", cx, cy + this.Renderer.Height * 0.3);
        var leftNoteX = cx + (10 * this.get_Scale());
        var rightNoteX = cx + (40 * this.get_Scale());
        switch (this._tripletFeel){
            case AlphaTab.Model.TripletFeel.NoTripletFeel:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                break;
            case AlphaTab.Model.TripletFeel.Triplet8th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                canvas.FillMusicFontSymbol(rightNoteX, noteY, 0.4, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
                canvas.FillMusicFontSymbol(rightNoteX + (12 * this.get_Scale()), noteY, 0.4, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteEighth);
                this.RenderTriplet(rightNoteX, cy, canvas);
                break;
            case AlphaTab.Model.TripletFeel.Triplet16th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight]);
                this.RenderTriplet(rightNoteX, cy, canvas);
                break;
            case AlphaTab.Model.TripletFeel.Dotted8th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight]);
                canvas.FillCircle(rightNoteX + (9 * this.get_Scale()), noteY, this.get_Scale());
                break;
            case AlphaTab.Model.TripletFeel.Dotted16th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight]);
                canvas.FillCircle(rightNoteX + (9 * this.get_Scale()), noteY, this.get_Scale());
                break;
            case AlphaTab.Model.TripletFeel.Scottish8th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialLeft]);
                canvas.FillCircle(rightNoteX + (12 * this.get_Scale()) + (8 * this.get_Scale()), noteY, this.get_Scale());
                break;
            case AlphaTab.Model.TripletFeel.Scottish16th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialLeft]);
                canvas.FillCircle(rightNoteX + (12 * this.get_Scale()) + (8 * this.get_Scale()), noteY, this.get_Scale());
                break;
        }
        canvas.FillText("=", cx + (30 * this.get_Scale()), cy + (5 * this.get_Scale()));
        canvas.FillText(")", cx + (65 * this.get_Scale()), cy + this.Renderer.Height * 0.3);
    },
    RenderBarNote: function (cx, noteY, noteScale, canvas, bars){
        canvas.FillMusicFontSymbol(cx, noteY, noteScale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
        var partialBarWidth = (6) * this.get_Scale();
        for (var i = 0; i < bars.length; i++){
            switch (bars[i]){
                case AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full:
                    canvas.FillRect(cx + (4 * this.get_Scale()), noteY - (12 * this.get_Scale()) + (3 * this.get_Scale() * i), 12 * this.get_Scale(), 2 * this.get_Scale());
                    break;
                case AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialLeft:
                    canvas.FillRect(cx + (4 * this.get_Scale()), noteY - (12 * this.get_Scale()) + (3 * this.get_Scale() * i), partialBarWidth, 2 * this.get_Scale());
                    break;
                case AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight:
                    canvas.FillRect(cx + (4 * this.get_Scale()) + partialBarWidth, noteY - (12 * this.get_Scale()) + (3 * this.get_Scale() * i), partialBarWidth, 2 * this.get_Scale());
                    break;
            }
        }
        canvas.FillMusicFontSymbol(cx + (12 * this.get_Scale()), noteY, noteScale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
    },
    RenderTriplet: function (cx, cy, canvas){
        cy += 2 * this.get_Scale();
        var font = this.Renderer.get_Resources().EffectFont;
        canvas.set_Font(new AlphaTab.Platform.Model.Font(font.Family, font.Size * 0.8, font.Style));
        var rightX = cx + 12 * this.get_Scale() + 3 * this.get_Scale();
        canvas.BeginPath();
        canvas.MoveTo(cx, cy + (3 * this.get_Scale()));
        canvas.LineTo(cx, cy);
        canvas.LineTo(cx + (5 * this.get_Scale()), cy);
        canvas.MoveTo(rightX + (5 * this.get_Scale()), cy + (3 * this.get_Scale()));
        canvas.LineTo(rightX + (5 * this.get_Scale()), cy);
        canvas.LineTo(rightX, cy);
        canvas.Stroke();
        canvas.FillText("3", cx + (7 * this.get_Scale()), cy - (10 * this.get_Scale()));
        canvas.set_Font(font);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.NoteScale = 0.4;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.NoteHeight = 12;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.NoteSeparation = 12;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarHeight = 2;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarSeparation = 3;
});
$Inherit(AlphaTab.Rendering.Glyphs.TripletFeelGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TuningGlyph = function (x, y, scale, resources, tuning){
    this._scale = 0;
    this._resources = null;
    this.Height = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._scale = scale;
    this._resources = resources;
    this.CreateGlyphs(tuning);
};
AlphaTab.Rendering.Glyphs.TuningGlyph.prototype = {
    CreateGlyphs: function (tuning){
        // Name
        this.AddGlyph(new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, tuning.Name, this._resources.EffectFont, AlphaTab.Platform.Model.TextAlign.Left));
        this.Height += 15 * this._scale;
        if (!tuning.IsStandard){
            // Strings
            var stringsPerColumn = (Math.ceil(tuning.Tunings.length / 2)) | 0;
            var currentX = 0;
            var currentY = this.Height;
            for (var i = 0,j = tuning.Tunings.length; i < j; i++){
                var str = "(" + (i + 1) + ") = " + AlphaTab.Model.Tuning.GetTextForTuning(tuning.Tunings[i], false);
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.TextGlyph(currentX, currentY, str, this._resources.EffectFont, AlphaTab.Platform.Model.TextAlign.Left));
                currentY += this.Height;
                if (i == stringsPerColumn - 1){
                    currentY = 0;
                    currentX += (43 * this._scale);
                }
            }
            this.Height += (stringsPerColumn * (15 * this._scale));
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TuningGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.VibratoGlyph = function (x, y, scale){
    this._scale = 0;
    AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.call(this, AlphaTab.Rendering.BeatXPosition.EndBeat);
    this._scale = scale;
    this.X = x;
    this.Y = y;
};
AlphaTab.Rendering.Glyphs.VibratoGlyph.prototype = {
    PaintGrouped: function (cx, cy, endX, canvas){
        var startX = cx + this.X;
        var width = endX - startX;
        var step = 9 * this.get_Scale() * this._scale;
        var loops = (Math.max(1, width / step)) | 0;
        var h = this.Renderer.Height;
        var loopX = 0;
        for (var i = 0; i < loops; i++){
            canvas.FillMusicFontSymbol(cx + this.X + loopX, cy + this.Y + h, this._scale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveHorizontal);
            loopX += step;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.VibratoGlyph, AlphaTab.Rendering.Glyphs.GroupedEffectGlyph);
AlphaTab.Rendering.Glyphs.VoiceContainerGlyph = function (x, y, voice){
    this.BeatGlyphs = null;
    this.Voice = null;
    this.MinWidth = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this.Voice = voice;
    this.BeatGlyphs = [];
};
AlphaTab.Rendering.Glyphs.VoiceContainerGlyph.prototype = {
    ScaleToWidth: function (width){
        var force = this.Renderer.LayoutingInfo.SpaceToForce(width);
        this.ScaleToForce(force);
    },
    ScaleToForce: function (force){
        this.Width = this.Renderer.LayoutingInfo.CalculateVoiceWidth(force);
        var positions = this.Renderer.LayoutingInfo.BuildOnTimePositions(force);
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            var time = this.BeatGlyphs[i].Beat.get_AbsoluteStart();
            this.BeatGlyphs[i].X = positions[time] - this.BeatGlyphs[i].OnTimeX;
            // size always previousl glyph after we know the position
            // of the next glyph
            if (i > 0){
                var beatWidth = this.BeatGlyphs[i].X - this.BeatGlyphs[i - 1].X;
                this.BeatGlyphs[i - 1].ScaleToWidth(beatWidth);
            }
            // for the last glyph size based on the full width
            if (i == j - 1){
                var beatWidth = this.Width - this.BeatGlyphs[this.BeatGlyphs.length - 1].X;
                this.BeatGlyphs[i].ScaleToWidth(beatWidth);
            }
        }
    },
    RegisterLayoutingInfo: function (info){
        info.UpdateVoiceSize(this.Width);
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            var b = this.BeatGlyphs[i];
            b.RegisterLayoutingInfo(info);
        }
    },
    ApplyLayoutingInfo: function (info){
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            var b = this.BeatGlyphs[i];
            b.ApplyLayoutingInfo(info);
        }
        this.ScaleToForce(this.Renderer.get_Settings().StretchForce);
    },
    AddGlyph: function (g){
        g.X = this.BeatGlyphs.length == 0 ? 0 : this.BeatGlyphs[this.BeatGlyphs.length - 1].X + this.BeatGlyphs[this.BeatGlyphs.length - 1].Width;
        g.Renderer = this.Renderer;
        g.DoLayout();
        this.BeatGlyphs.push(g);
        this.Width = g.X + g.Width;
    },
    DoLayout: function (){
        this.MinWidth = this.Width;
    },
    Paint: function (cx, cy, canvas){
        //canvas.Color = new Color((byte)Std.Random(255), (byte)Std.Random(255), (byte)Std.Random(255), 80);
        //canvas.FillRect(cx + X, cy + Y, Width, 100);
        //if (Voice.Index == 0)
        //{
        //    PaintSprings(cx + X, cy + Y, canvas);
        //}
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            this.BeatGlyphs[i].Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.VoiceContainerGlyph.KeySizeBeat = "Beat";
});
$Inherit(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.WhammyBarGlyph = function (beat, parent){
    this._beat = null;
    this._parent = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._beat = beat;
    this._parent = parent;
};
AlphaTab.Rendering.Glyphs.WhammyBarGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        // 
        // Calculate the min and max offsets
        var minY = 0;
        var maxY = 0;
        var sizeY = 60 * this.get_Scale();
        if (this._beat.WhammyBarPoints.length >= 2){
            var dy = sizeY / 24;
            for (var i = 0,j = this._beat.WhammyBarPoints.length; i < j; i++){
                var pt = this._beat.WhammyBarPoints[i];
                var ptY = 0 - (dy * pt.Value);
                if (ptY > maxY)
                    maxY = ptY;
                if (ptY < minY)
                    minY = ptY;
            }
        }
        //
        // calculate the overflow 
        var tabBarRenderer = this.Renderer;
        var track = this.Renderer.Bar.Staff.Track;
        var tabTop = tabBarRenderer.GetTabY(0, -2);
        var tabBottom = tabBarRenderer.GetTabY(track.Tuning.length, -2);
        var absMinY = this.Y + minY + tabTop;
        var absMaxY = this.Y + maxY - tabBottom;
        if (absMinY < 0)
            tabBarRenderer.RegisterOverflowTop(Math.abs(absMinY));
        if (absMaxY > 0)
            tabBarRenderer.RegisterOverflowBottom(Math.abs(absMaxY));
    },
    Paint: function (cx, cy, canvas){
        var tabBarRenderer = this.Renderer;
        var res = this.Renderer.get_Resources();
        var startX = cx + this.X + this._parent.OnNotes.Width / 2;
        var endX = this._beat.NextBeat == null || this._beat.Voice != this._beat.NextBeat.Voice ? cx + this.X + this._parent.Width : cx + tabBarRenderer.GetBeatX(this._beat.NextBeat, AlphaTab.Rendering.BeatXPosition.PreNotes);
        var startY = cy + this.X;
        var textOffset = 3 * this.get_Scale();
        var sizeY = 60 * this.get_Scale();
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        if (this._beat.WhammyBarPoints.length >= 2){
            var dx = (endX - startX) / 60;
            var dy = sizeY / 24;
            canvas.BeginPath();
            for (var i = 0,j = this._beat.WhammyBarPoints.length - 1; i < j; i++){
                var pt1 = this._beat.WhammyBarPoints[i];
                var pt2 = this._beat.WhammyBarPoints[i + 1];
                if (pt1.Value == pt2.Value && i == this._beat.WhammyBarPoints.length - 2)
                    continue;
                var pt1X = startX + (dx * pt1.Offset);
                var pt1Y = startY - (dy * pt1.Value);
                var pt2X = startX + (dx * pt2.Offset);
                var pt2Y = startY - (dy * pt2.Value);
                canvas.MoveTo(pt1X, pt1Y);
                canvas.LineTo(pt2X, pt2Y);
                if (pt2.Value != 0){
                    var dv = pt2.Value / 4;
                    var up = (pt2.Value - pt1.Value) >= 0;
                    var s = "";
                    if (dv < 0)
                        s += "-";
                    if (dv >= 1 || dv <= -1)
                        s += Math.abs(dv) + " ";
                    dv -= dv | 0;
                    if (dv == 0.25)
                        s += "1/4";
                    else if (dv == 0.5)
                        s += "1/2";
                    else if (dv == 0.75)
                        s += "3/4";
                    canvas.set_Font(res.GraceFont);
                    //var size = canvas.MeasureText(s);
                    var sy = up ? pt2Y - res.GraceFont.Size - textOffset : pt2Y + textOffset;
                    var sx = pt2X;
                    canvas.FillText(s, sx, sy);
                }
            }
            canvas.Stroke();
        }
        canvas.set_TextAlign(old);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.WhammyBarGlyph.WhammyMaxOffset = 60;
});
$Inherit(AlphaTab.Rendering.Glyphs.WhammyBarGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.RenderFinishedEventArgs = function (){
    this.Width = 0;
    this.Height = 0;
    this.TotalWidth = 0;
    this.TotalHeight = 0;
    this.RenderResult = null;
};
AlphaTab.Rendering.Layout = AlphaTab.Rendering.Layout || {};
AlphaTab.Rendering.Layout.HeaderFooterElements = {
    None: 0,
    Title: 1,
    SubTitle: 2,
    Artist: 4,
    Album: 8,
    Words: 16,
    Music: 32,
    WordsAndMusic: 64,
    Copyright: 128,
    PageNumber: 256,
    All: 511
};
AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo = function (){
    this.Width = 0;
    this.MasterBars = null;
    this.MasterBars = [];
};
AlphaTab.Rendering.Layout.ScoreLayout = function (renderer){
    this._barRendererLookup = null;
    this.ScoreInfoGlyphs = null;
    this.TuningGlyph = null;
    this.Renderer = null;
    this.Width = 0;
    this.Height = 0;
    this.Renderer = renderer;
    this._barRendererLookup = {};
};
AlphaTab.Rendering.Layout.ScoreLayout.prototype = {
    LayoutAndRender: function (){
        this.CreateScoreInfoGlyphs();
        this.DoLayoutAndRender();
    },
    CreateScoreInfoGlyphs: function (){
        var flags = this.Renderer.Settings.Layout.Get("hideInfo", false) ? AlphaTab.Rendering.Layout.HeaderFooterElements.None : AlphaTab.Rendering.Layout.HeaderFooterElements.All;
        var score = this.Renderer.Score;
        var res = this.Renderer.RenderingResources;
        this.ScoreInfoGlyphs = {};
        if (!((score.Title==null)||(score.Title.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Title) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Title] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.Title, res.TitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.SubTitle==null)||(score.SubTitle.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.SubTitle) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.SubTitle] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.SubTitle, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.Artist==null)||(score.Artist.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Artist) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Artist] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.Artist, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.Album==null)||(score.Album.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Album) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Album] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.Album, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.Music==null)||(score.Music.length==0)) && score.Music == score.Words && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.WordsAndMusic) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.WordsAndMusic] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Music and Words by " + score.Words, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        else {
            if (!((score.Music==null)||(score.Music.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Music) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
                this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Music] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Music by " + score.Music, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Right);
            }
            if (!((score.Words==null)||(score.Words.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Words) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
                this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Words] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Words by " + score.Music, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Left);
            }
        }
        // tuning info
        if (this.Renderer.Tracks.length == 1 && !this.Renderer.Tracks[0].IsPercussion){
            var tuning = AlphaTab.Model.Tuning.FindTuning(this.Renderer.Tracks[0].Tuning);
            if (tuning != null){
                this.TuningGlyph = new AlphaTab.Rendering.Glyphs.TuningGlyph(0, 0, this.get_Scale(), this.Renderer.RenderingResources, tuning);
            }
        }
    },
    get_Scale: function (){
        return this.Renderer.Settings.Scale;
    },
    CreateEmptyStaveGroup: function (){
        var group = new AlphaTab.Rendering.Staves.StaveGroup();
        group.Layout = this;
        var isFirstTrack = true;
        for (var trackIndex = 0; trackIndex < this.Renderer.Tracks.length; trackIndex++){
            var track = this.Renderer.Tracks[trackIndex];
            for (var staveIndex = 0; staveIndex < track.Staves.length; staveIndex++){
                for (var renderStaveIndex = 0; renderStaveIndex < this.Renderer.Settings.Staves.length; renderStaveIndex++){
                    var s = this.Renderer.Settings.Staves[renderStaveIndex];
                    if (AlphaTab.Environment.StaveFactories.hasOwnProperty(s.Id)){
                        var factory = AlphaTab.Environment.StaveFactories[s.Id](this);
                        if (factory.CanCreate(track) && (isFirstTrack || !factory.HideOnMultiTrack) && (staveIndex == 0 || !factory.HideOnMultiTrack)){
                            group.AddStave(track, new AlphaTab.Rendering.Staves.Staff(track.Staves[staveIndex], s.Id, factory, s.AdditionalSettings));
                        }
                    }
                }
            }
            isFirstTrack = false;
        }
        return group;
    },
    GetBarRendererId: function (trackId, barId){
        return trackId + "-" + barId;
    },
    RegisterBarRenderer: function (key, renderer){
        if (!this._barRendererLookup.hasOwnProperty(key)){
            this._barRendererLookup[key] = {};
        }
        this._barRendererLookup[key][this.GetBarRendererId(renderer.Bar.Staff.Track.Index, renderer.Bar.Index)] = renderer;
    },
    UnregisterBarRenderer: function (key, renderer){
        if (this._barRendererLookup.hasOwnProperty(key)){
            var lookup = this._barRendererLookup[key];
            delete lookup[this.GetBarRendererId(renderer.Bar.Staff.Track.Index, renderer.Bar.Index)];
        }
    },
    GetRendererForBar: function (key, bar){
        var barRendererId = this.GetBarRendererId(bar.Staff.Track.Index, bar.Index);
        if (this._barRendererLookup.hasOwnProperty(key) && this._barRendererLookup[key].hasOwnProperty(barRendererId)){
            return this._barRendererLookup[key][barRendererId];
        }
        return null;
    },
    RenderAnnotation: function (){
        // attention, you are not allowed to remove change this notice within any version of this library without permission!
        var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
        var canvas = this.Renderer.Canvas;
        var resources = this.Renderer.RenderingResources;
        var height = (resources.CopyrightFont.Size * 2);
        this.Height += height;
        var x = this.Width / 2;
        canvas.BeginRender(this.Width, height);
        canvas.set_Color(resources.MainGlyphColor);
        canvas.set_Font(resources.CopyrightFont);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        canvas.FillText(msg, x, 0);
        var result = canvas.EndRender();
        this.Renderer.OnPartialRenderFinished((function (){
            var $v2 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v2.Width = this.Width;
            $v2.Height = height;
            $v2.RenderResult = result;
            $v2.TotalWidth = this.Width;
            $v2.TotalHeight = this.Height;
            return $v2;
        }).call(this));
    }
};
AlphaTab.Rendering.Layout.HorizontalScreenLayout = function (renderer){
    this._group = null;
    AlphaTab.Rendering.Layout.ScoreLayout.call(this, renderer);
};
AlphaTab.Rendering.Layout.HorizontalScreenLayout.prototype = {
    get_SupportsResize: function (){
        return false;
    },
    Resize: function (){
        // resizing has no effect on this layout
    },
    DoLayoutAndRender: function (){
        if (this.Renderer.Settings.Staves.length == 0)
            return;
        var score = this.Renderer.Score;
        var canvas = this.Renderer.Canvas;
        var startIndex = this.Renderer.Settings.Layout.Get("start", 1);
        startIndex--;
        // map to array index
        startIndex = Math.min(score.MasterBars.length - 1, Math.max(0, startIndex));
        var currentBarIndex = startIndex;
        var endBarIndex = this.Renderer.Settings.Layout.Get("count", score.MasterBars.length);
        if (endBarIndex < 0)
            endBarIndex = score.MasterBars.length;
        endBarIndex = startIndex + endBarIndex - 1;
        // map count to array index
        endBarIndex = Math.min(score.MasterBars.length - 1, Math.max(0, endBarIndex));
        this._group = this.CreateEmptyStaveGroup();
        this._group.X = AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[0];
        this._group.Y = AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[1];
        var countPerPartial = this.Renderer.Settings.Layout.Get("countPerPartial", 10);
        var partials = [];
        var currentPartial = new AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo();
        if (this.Renderer.Settings.Staves.length > 0){
            while (currentBarIndex <= endBarIndex){
                var result = this._group.AddBars(this.Renderer.Tracks, currentBarIndex);
                // if we detect that the new renderer is linked to the previous
                // renderer, we need to put it into the previous partial 
                if (currentPartial.MasterBars.length == 0 && result.IsLinkedToPrevious && partials.length > 0){
                    var previousPartial = partials[partials.length - 1];
                    previousPartial.MasterBars.push(score.MasterBars[currentBarIndex]);
                    previousPartial.Width += result.Width;
                }
                else {
                    currentPartial.MasterBars.push(score.MasterBars[currentBarIndex]);
                    currentPartial.Width += result.Width;
                    // no targetPartial here because previous partials already handled this code
                    if (currentPartial.MasterBars.length >= countPerPartial){
                        if (partials.length == 0){
                            currentPartial.Width += this._group.X + this._group.AccoladeSpacing;
                        }
                        partials.push(currentPartial);
                        currentPartial = new AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo();
                    }
                }
                currentBarIndex++;
            }
            // don't miss the last partial if not empty
            if (currentPartial.MasterBars.length > 0){
                if (partials.length == 0){
                    currentPartial.Width += this._group.X + this._group.AccoladeSpacing;
                }
                partials.push(currentPartial);
            }
        }
        this._group.FinalizeGroup(this);
        this.Height = this._group.Y + this._group.get_Height() + AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[3];
        this.Width = this._group.X + this._group.Width + AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[2];
        // TODO: Find a good way to render the score partwise
        // we need to precalculate the final height somehow
        //canvas.BeginRender(Width, Height);
        //canvas.Color = Renderer.RenderingResources.MainGlyphColor;
        //canvas.TextAlign = TextAlign.Left;
        //_group.Paint(0, 0, Renderer.Canvas);
        //var result = canvas.EndRender();
        //OnPartialRenderFinished(new RenderFinishedEventArgs
        //{
        //    TotalWidth = Width,
        //    TotalHeight = y,
        //    Width = Width,
        //    Height = Height,
        //    RenderResult = result
        //});
        currentBarIndex = 0;
        for (var i = 0; i < partials.length; i++){
            var partial = partials[i];
            canvas.BeginRender(partial.Width, this.Height);
            canvas.set_Color(this.Renderer.RenderingResources.MainGlyphColor);
            canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
            var renderX = this._group.GetBarX(partial.MasterBars[0].Index) + this._group.AccoladeSpacing;
            if (i == 0){
                renderX -= this._group.X + this._group.AccoladeSpacing;
            }
            this._group.PaintPartial(-renderX, this._group.Y, this.Renderer.Canvas, currentBarIndex, partial.MasterBars.length);
            var result = canvas.EndRender();
            this.Renderer.OnPartialRenderFinished((function (){
                var $v3 = new AlphaTab.Rendering.RenderFinishedEventArgs();
                $v3.TotalWidth = this.Width;
                $v3.TotalHeight = this.Height;
                $v3.Width = partial.Width;
                $v3.Height = this.Height;
                $v3.RenderResult = result;
                return $v3;
            }).call(this));
            currentBarIndex += partial.MasterBars.length;
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding = new Float32Array([20, 20, 20, 20]);
    AlphaTab.Rendering.Layout.HorizontalScreenLayout.GroupSpacing = 20;
});
$Inherit(AlphaTab.Rendering.Layout.HorizontalScreenLayout, AlphaTab.Rendering.Layout.ScoreLayout);
AlphaTab.Rendering.Layout.PageViewLayout = function (renderer){
    this._groups = null;
    AlphaTab.Rendering.Layout.ScoreLayout.call(this, renderer);
};
AlphaTab.Rendering.Layout.PageViewLayout.prototype = {
    DoLayoutAndRender: function (){
        var x = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0];
        var y = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[1];
        this.Width = this.Renderer.Settings.Width;
        // 
        // 1. Score Info
        y = this.LayoutAndRenderScoreInfo(x, y);
        //
        // 2. One result per StaveGroup
        y = this.LayoutAndRenderScore(x, y);
        this.Height = y + AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[3];
    },
    get_SupportsResize: function (){
        return true;
    },
    Resize: function (){
        var x = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0];
        var y = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[1];
        this.Width = this.Renderer.Settings.Width;
        // 
        // 1. Score Info
        y = this.LayoutAndRenderScoreInfo(x, y);
        //
        // 2. One result per StaveGroup
        //y = ResizeAndRenderScore(x, y);
        y = this.LayoutAndRenderScore(x, y);
        this.Height = y + AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[3];
    },
    LayoutAndRenderScoreInfo: function (x, y){
        var scale = this.get_Scale();
        var res = this.Renderer.RenderingResources;
        var centeredGlyphs = [AlphaTab.Rendering.Layout.HeaderFooterElements.Title, AlphaTab.Rendering.Layout.HeaderFooterElements.SubTitle, AlphaTab.Rendering.Layout.HeaderFooterElements.Artist, AlphaTab.Rendering.Layout.HeaderFooterElements.Album, AlphaTab.Rendering.Layout.HeaderFooterElements.WordsAndMusic];
        for (var i = 0; i < centeredGlyphs.length; i++){
            if (this.ScoreInfoGlyphs.hasOwnProperty(centeredGlyphs[i])){
                var glyph = this.ScoreInfoGlyphs[centeredGlyphs[i]];
                glyph.X = this.Width / 2;
                glyph.Y = y;
                glyph.TextAlign = AlphaTab.Platform.Model.TextAlign.Center;
                y += glyph.Font.Size;
            }
        }
        var musicOrWords = false;
        var musicOrWordsHeight = 0;
        if (this.ScoreInfoGlyphs.hasOwnProperty(AlphaTab.Rendering.Layout.HeaderFooterElements.Music)){
            var glyph = this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Music];
            glyph.X = this.Width - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[2];
            glyph.Y = y;
            glyph.TextAlign = AlphaTab.Platform.Model.TextAlign.Right;
            musicOrWords = true;
            musicOrWordsHeight = glyph.Font.Size;
        }
        if (this.ScoreInfoGlyphs.hasOwnProperty(AlphaTab.Rendering.Layout.HeaderFooterElements.Words)){
            var glyph = this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Words];
            glyph.X = x;
            glyph.Y = y;
            glyph.TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
            musicOrWords = true;
            musicOrWordsHeight = glyph.Font.Size;
        }
        if (musicOrWords){
            y += musicOrWordsHeight;
        }
        y += 20 * scale;
        if (this.TuningGlyph != null){
            this.TuningGlyph.X = x;
            this.TuningGlyph.Y = y;
        }
        var canvas = this.Renderer.Canvas;
        canvas.BeginRender(this.Width, y);
        canvas.set_Color(res.ScoreInfoColor);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        for (var key in this.ScoreInfoGlyphs){
            this.ScoreInfoGlyphs[key].Paint(0, 0, canvas);
        }
        var result = canvas.EndRender();
        this.Renderer.OnPartialRenderFinished((function (){
            var $v4 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v4.Width = this.Width;
            $v4.Height = y;
            $v4.RenderResult = result;
            $v4.TotalWidth = this.Width;
            $v4.TotalHeight = y;
            return $v4;
        }).call(this));
        return y;
    },
    ResizeAndRenderScore: function (x, y){
        var canvas = this.Renderer.Canvas;
        for (var i = 0; i < this._groups.length; i++){
            var group = this._groups[i];
            this.FitGroup(group);
            group.FinalizeGroup(this);
            y += this.PaintGroup(group, y, canvas);
        }
        return y;
    },
    LayoutAndRenderScore: function (x, y){
        var score = this.Renderer.Score;
        var canvas = this.Renderer.Canvas;
        var startIndex = this.Renderer.Settings.Layout.Get("start", 1);
        startIndex--;
        // map to array index
        startIndex = Math.min(score.MasterBars.length - 1, Math.max(0, startIndex));
        var currentBarIndex = startIndex;
        var endBarIndex = this.Renderer.Settings.Layout.Get("count", score.MasterBars.length);
        if (endBarIndex < 0)
            endBarIndex = score.MasterBars.length;
        endBarIndex = startIndex + endBarIndex - 1;
        // map count to array index
        endBarIndex = Math.min(score.MasterBars.length - 1, Math.max(0, endBarIndex));
        this._groups = [];
        if (this.Renderer.Settings.Staves.length > 0){
            while (currentBarIndex <= endBarIndex){
                // create group and align set proper coordinates
                var group = this.CreateStaveGroup(currentBarIndex, endBarIndex);
                this._groups.push(group);
                group.X = x;
                group.Y = y;
                currentBarIndex = group.get_LastBarIndex() + 1;
                // finalize group (sizing etc).
                this.FitGroup(group);
                group.FinalizeGroup(this);
                y += this.PaintGroup(group, y, canvas);
            }
        }
        return y;
    },
    PaintGroup: function (group, totalHeight, canvas){
        // paint into canvas
        var height = group.get_Height() + (20 * this.get_Scale());
        canvas.BeginRender(this.Width, height);
        this.Renderer.Canvas.set_Color(this.Renderer.RenderingResources.MainGlyphColor);
        this.Renderer.Canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
        // NOTE: we use this negation trick to make the group paint itself to 0/0 coordinates 
        // since we use partial drawing
        group.Paint(0, -group.Y, canvas);
        // calculate coordinates for next group
        totalHeight += height;
        var result = canvas.EndRender();
        this.Renderer.OnPartialRenderFinished((function (){
            var $v5 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v5.TotalWidth = this.Width;
            $v5.TotalHeight = totalHeight;
            $v5.Width = this.Width;
            $v5.Height = height;
            $v5.RenderResult = result;
            return $v5;
        }).call(this));
        return height;
    },
    FitGroup: function (group){
        if (group.IsFull || group.Width > this.get_MaxWidth()){
            group.ScaleToWidth(this.get_MaxWidth());
        }
        this.Width = Math.max(this.Width, group.Width);
    },
    CreateStaveGroup: function (currentBarIndex, endIndex){
        var group = this.CreateEmptyStaveGroup();
        group.Index = this._groups.length;
        var barsPerRow = this.Renderer.Settings.Layout.Get("barsPerRow", -1);
        var maxWidth = this.get_MaxWidth();
        var end = endIndex + 1;
        for (var i = currentBarIndex; i < end; i++){
            group.AddBars(this.Renderer.Tracks, i);
            var groupIsFull = false;
            // can bar placed in this line?
            if (barsPerRow == -1 && ((group.Width) >= maxWidth && group.MasterBars.length != 0)){
                groupIsFull = true;
            }
            else if (group.MasterBars.length == barsPerRow + 1){
                groupIsFull = true;
            }
            if (groupIsFull){
                group.RevertLastBar();
                group.IsFull = true;
                return group;
            }
            group.X = 0;
        }
        return group;
    },
    get_MaxWidth: function (){
        return this.Renderer.Settings.Width - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0] - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[2];
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Layout.PageViewLayout.PagePadding = new Float32Array([40, 40, 40, 40]);
    AlphaTab.Rendering.Layout.PageViewLayout.GroupSpacing = 20;
});
$Inherit(AlphaTab.Rendering.Layout.PageViewLayout, AlphaTab.Rendering.Layout.ScoreLayout);
AlphaTab.Rendering.RenderingResources = function (scale){
    this.CopyrightFont = null;
    this.TitleFont = null;
    this.SubTitleFont = null;
    this.WordsFont = null;
    this.EffectFont = null;
    this.TablatureFont = null;
    this.GraceFont = null;
    this.StaveLineColor = null;
    this.BarSeperatorColor = null;
    this.BarNumberFont = null;
    this.BarNumberColor = null;
    this.MarkerFont = null;
    this.TabClefFont = null;
    this.MainGlyphColor = null;
    this.SecondaryGlyphColor = null;
    this.Scale = 0;
    this.ScoreInfoColor = null;
    this.Init(scale);
};
AlphaTab.Rendering.RenderingResources.prototype = {
    Init: function (scale){
        this.Scale = scale;
        var sansFont = "Arial";
        var serifFont = "Georgia";
        this.EffectFont = new AlphaTab.Platform.Model.Font(serifFont, 12 * scale, AlphaTab.Platform.Model.FontStyle.Italic);
        this.CopyrightFont = new AlphaTab.Platform.Model.Font(sansFont, 12 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.TitleFont = new AlphaTab.Platform.Model.Font(serifFont, 32 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.SubTitleFont = new AlphaTab.Platform.Model.Font(serifFont, 20 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.WordsFont = new AlphaTab.Platform.Model.Font(serifFont, 15 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.TablatureFont = new AlphaTab.Platform.Model.Font(sansFont, 13 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.GraceFont = new AlphaTab.Platform.Model.Font(sansFont, 11 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.StaveLineColor = new AlphaTab.Platform.Model.Color(165, 165, 165, 255);
        this.BarSeperatorColor = new AlphaTab.Platform.Model.Color(34, 34, 17, 255);
        this.BarNumberFont = new AlphaTab.Platform.Model.Font(sansFont, 11 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.BarNumberColor = new AlphaTab.Platform.Model.Color(200, 0, 0, 255);
        this.MarkerFont = new AlphaTab.Platform.Model.Font(serifFont, 14 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.TabClefFont = new AlphaTab.Platform.Model.Font(sansFont, 18 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.ScoreInfoColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
        this.MainGlyphColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
        this.SecondaryGlyphColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 100);
    }
};
AlphaTab.Rendering.RhythmBarRenderer = function (bar, direction){
    this._direction = AlphaTab.Rendering.Utils.BeamDirection.Up;
    this._helpers = null;
    AlphaTab.Rendering.BarRendererBase.call(this, bar);
    this._direction = direction;
};
AlphaTab.Rendering.RhythmBarRenderer.prototype = {
    DoLayout: function (){
        this._helpers = this.Staff.StaveGroup.Helpers.Helpers[this.Bar.Staff.Track.Index][this.Bar.Staff.Index][this.Bar.Index];
        AlphaTab.Rendering.BarRendererBase.prototype.DoLayout.call(this);
        this.Height = this.Staff.GetSetting("rhythm-height", 24) * this.get_Scale();
        this.IsEmpty = false;
    },
    CreateBeatGlyphs: function (){
        for (var v = 0; v < this.Bar.Voices.length; v++){
            this.CreateVoiceGlyphs(this.Bar.Voices[v]);
        }
    },
    CreateVoiceGlyphs: function (voice){
        for (var i = 0,j = voice.Beats.length; i < j; i++){
            var b = voice.Beats[i];
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new AlphaTab.Rendering.Glyphs.BeatContainerGlyph(b, this.GetOrCreateVoiceContainer(voice), false);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase();
            this.AddBeatGlyph(container);
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.Paint.call(this, cx, cy, canvas);
        for (var i = 0,j = this._helpers.BeamHelpers.length; i < j; i++){
            var v = this._helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                this.PaintBeamHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, v[k]);
            }
        }
    },
    PaintBeamHelper: function (cx, cy, canvas, h){
        if (h.Beats[0].GraceType != AlphaTab.Model.GraceType.None)
            return;
        var useBeams = this.Staff.GetSetting("use-beams", false);
        // check if we need to paint simple footer
        if (useBeams && h.Beats.length == 1){
            this.PaintFooter(cx, cy, canvas, h);
        }
        else {
            this.PaintBar(cx, cy, canvas, h);
        }
    },
    PaintBar: function (cx, cy, canvas, h){
        for (var i = 0,j = h.Beats.length; i < j; i++){
            var beat = h.Beats[i];
            if (h.HasBeatLineX(beat)){
                //
                // draw line 
                //
                var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
                var y1 = cy + this.Y;
                var y2 = cy + this.Y + this.Height;
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X + beatLineX, y1);
                canvas.LineTo(cx + this.X + beatLineX, y2);
                canvas.Stroke();
                var brokenBarOffset = (6 * this.get_Scale());
                var barSpacing = (6 * this.get_Scale());
                var barSize = (3 * this.get_Scale());
                var barCount = AlphaTab.Model.ModelUtils.GetIndex(beat.Duration) - 2;
                var barStart = cy + this.Y;
                if (this._direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                    barSpacing = -barSpacing;
                    barStart += this.Height;
                }
                for (var barIndex = 0; barIndex < barCount; barIndex++){
                    var barStartX;
                    var barEndX;
                    var barStartY;
                    var barEndY;
                    var barY = barStart + (barIndex * barSpacing);
                    // 
                    // Broken Bar to Next
                    //
                    if (h.Beats.length == 1){
                        barStartX = beatLineX;
                        barEndX = beatLineX + brokenBarOffset;
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                    else if (i < h.Beats.length - 1){
                        // full bar?
                        if (this.IsFullBarJoin(beat, h.Beats[i + 1], barIndex)){
                            barStartX = beatLineX;
                            barEndX = h.GetBeatLineX(h.Beats[i + 1]) + this.get_Scale();
                        }
                        else if (i == 0 || !this.IsFullBarJoin(h.Beats[i - 1], beat, barIndex)){
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        }
                        else {
                            continue;
                        }
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                    else if (i > 0 && !this.IsFullBarJoin(beat, h.Beats[i - 1], barIndex)){
                        barStartX = beatLineX - brokenBarOffset;
                        barEndX = beatLineX;
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                }
            }
        }
    },
    PaintFooter: function (cx, cy, canvas, h){
        var beat = h.Beats[0];
        if (beat.Duration == AlphaTab.Model.Duration.Whole){
            return;
        }
        //
        // draw line 
        //
        var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
        var topY = 0;
        var bottomY = this.Height;
        var beamY = this._direction == AlphaTab.Rendering.Utils.BeamDirection.Down ? bottomY : topY;
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X + beatLineX, cy + this.Y + topY);
        canvas.LineTo(cx + this.X + beatLineX, cy + this.Y + bottomY);
        canvas.Stroke();
        //
        // Draw beam 
        //
        var glyph = new AlphaTab.Rendering.Glyphs.BeamGlyph(beatLineX, beamY, beat.Duration, this._direction, false);
        glyph.Renderer = this;
        glyph.DoLayout();
        glyph.Paint(cx + this.X, cy + this.Y, canvas);
    },
    IsFullBarJoin: function (a, b, barIndex){
        return (AlphaTab.Model.ModelUtils.GetIndex(a.Duration) - 2 - barIndex > 0) && (AlphaTab.Model.ModelUtils.GetIndex(b.Duration) - 2 - barIndex > 0);
    }
};
AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar = function (canvas, x1, y1, x2, y2, size){
    canvas.BeginPath();
    canvas.MoveTo(x1, y1);
    canvas.LineTo(x2, y2);
    canvas.LineTo(x2, y2 - size);
    canvas.LineTo(x1, y1 - size);
    canvas.ClosePath();
    canvas.Fill();
};
$Inherit(AlphaTab.Rendering.RhythmBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.RhythmBarRendererFactory = function (direction){
    this._direction = AlphaTab.Rendering.Utils.BeamDirection.Up;
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this._direction = direction;
    this.IsInAccolade = false;
    this.HideOnMultiTrack = false;
};
AlphaTab.Rendering.RhythmBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.RhythmBarRenderer(bar, this._direction);
    }
};
$Inherit(AlphaTab.Rendering.RhythmBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.ScoreBarRenderer = function (bar){
    this._helpers = null;
    this._startSpacing = false;
    this.AccidentalHelper = null;
    AlphaTab.Rendering.BarRendererBase.call(this, bar);
    this.AccidentalHelper = new AlphaTab.Rendering.Utils.AccidentalHelper();
};
AlphaTab.Rendering.ScoreBarRenderer.prototype = {
    GetBeatDirection: function (beat){
        var g = this.GetOnNotesGlyphForBeat(beat);
        if (g != null){
            return g.NoteHeads.get_Direction();
        }
        return AlphaTab.Rendering.Utils.BeamDirection.Up;
    },
    GetNoteX: function (note, onEnd){
        var g = this.GetOnNotesGlyphForBeat(note.Beat);
        if (g != null){
            return g.Container.X + g.Container.OnTimeX;
        }
        return 0;
    },
    GetNoteY: function (note){
        var beat = this.GetOnNotesGlyphForBeat(note.Beat);
        if (beat != null){
            return beat.NoteHeads.GetNoteY(note);
        }
        return 0;
    },
    get_LineOffset: function (){
        return ((9) * this.get_Scale());
    },
    DoLayout: function (){
        this._helpers = this.Staff.StaveGroup.Helpers.Helpers[this.Bar.Staff.Track.Index][this.Bar.Staff.Index][this.Bar.Index];
        var res = this.get_Resources();
        var glyphOverflow = (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2);
        this.TopPadding = glyphOverflow;
        this.BottomPadding = glyphOverflow;
        AlphaTab.Rendering.BarRendererBase.prototype.DoLayout.call(this);
        this.Height = (this.get_LineOffset() * 4) + this.TopPadding + this.BottomPadding;
        if (this.Index == 0){
            this.Staff.RegisterStaveTop(this.TopPadding);
            this.Staff.RegisterStaveBottom(this.Height - this.BottomPadding);
        }
        var top = this.GetScoreY(0, 0);
        var bottom = this.GetScoreY(8, 0);
        for (var i = 0,j = this._helpers.BeamHelpers.length; i < j; i++){
            var v = this._helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                //
                // max note (highest) -> top overflow
                // 
                var maxNoteY = this.GetScoreY(this.GetNoteLine(h.MaxNote), 0);
                if (h.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                    maxNoteY -= this.GetStemSize(h.MaxDuration);
                    maxNoteY -= h.FingeringCount * this.get_Resources().GraceFont.Size;
                    if (h.HasTuplet){
                        maxNoteY -= this.get_Resources().EffectFont.Size * 2;
                    }
                }
                if (h.HasTuplet){
                    maxNoteY -= this.get_Resources().EffectFont.Size * 1.5;
                }
                if (maxNoteY < top){
                    this.RegisterOverflowTop(Math.abs(maxNoteY));
                }
                //
                // min note (lowest) -> bottom overflow
                //t
                var minNoteY = this.GetScoreY(this.GetNoteLine(h.MinNote), 0);
                if (h.Direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                    minNoteY += this.GetStemSize(h.MaxDuration);
                    minNoteY += h.FingeringCount * this.get_Resources().GraceFont.Size;
                }
                if (minNoteY > bottom){
                    this.RegisterOverflowBottom(Math.abs(minNoteY) - bottom);
                }
            }
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.Paint.call(this, cx, cy, canvas);
        this.PaintBeams(cx, cy, canvas);
        this.PaintTuplets(cx, cy, canvas);
    },
    PaintTuplets: function (cx, cy, canvas){
        for (var i = 0,j = this._helpers.TupletHelpers.length; i < j; i++){
            var v = this._helpers.TupletHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                this.PaintTupletHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, h);
            }
        }
    },
    PaintBeams: function (cx, cy, canvas){
        for (var i = 0,j = this._helpers.BeamHelpers.length; i < j; i++){
            var v = this._helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                this.PaintBeamHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, h);
            }
        }
    },
    PaintBeamHelper: function (cx, cy, canvas, h){
        canvas.set_Color(h.Voice.Index == 0 ? this.get_Resources().MainGlyphColor : this.get_Resources().SecondaryGlyphColor);
        // check if we need to paint simple footer
        if (h.Beats.length == 1){
            this.PaintFooter(cx, cy, canvas, h);
        }
        else {
            this.PaintBar(cx, cy, canvas, h);
        }
    },
    PaintTupletHelper: function (cx, cy, canvas, h){
        var res = this.get_Resources();
        var oldAlign = canvas.get_TextAlign();
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        // check if we need to paint simple footer
        if (h.Beats.length == 1 || !h.get_IsFull()){
            for (var i = 0,j = h.Beats.length; i < j; i++){
                var beat = h.Beats[i];
                var beamingHelper = this._helpers.BeamHelperLookup[h.VoiceIndex][beat.Index];
                if (beamingHelper == null)
                    continue;
                var direction = beamingHelper.Direction;
                var tupletX = beamingHelper.GetBeatLineX(beat) + this.get_Scale();
                var tupletY = cy + this.Y + this.CalculateBeamY(beamingHelper, tupletX);
                var offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? res.EffectFont.Size * 1.8 : -3 * this.get_Scale();
                canvas.set_Font(res.EffectFont);
                canvas.FillText(h.Tuplet.toString(), cx + this.X + tupletX, tupletY - offset);
            }
        }
        else {
            var firstBeat = h.Beats[0];
            var lastBeat = h.Beats[h.Beats.length - 1];
            var firstBeamingHelper = this._helpers.BeamHelperLookup[h.VoiceIndex][firstBeat.Index];
            var lastBeamingHelper = this._helpers.BeamHelperLookup[h.VoiceIndex][lastBeat.Index];
            if (firstBeamingHelper != null && lastBeamingHelper != null){
                var direction = firstBeamingHelper.Direction;
                // 
                // Calculate the overall area of the tuplet bracket
                var startX = firstBeamingHelper.GetBeatLineX(firstBeat) + this.get_Scale();
                var endX = lastBeamingHelper.GetBeatLineX(lastBeat) + this.get_Scale();
                //
                // Calculate how many space the text will need
                canvas.set_Font(res.EffectFont);
                var s = h.Tuplet.toString();
                var sw = canvas.MeasureText(s);
                var sp = 3 * this.get_Scale();
                // 
                // Calculate the offsets where to break the bracket
                var middleX = (startX + endX) / 2;
                var offset1X = middleX - sw / 2 - sp;
                var offset2X = middleX + sw / 2 + sp;
                //
                // calculate the y positions for our bracket
                var startY = this.CalculateBeamY(firstBeamingHelper, startX);
                var offset1Y = this.CalculateBeamY(firstBeamingHelper, offset1X);
                var middleY = this.CalculateBeamY(firstBeamingHelper, middleX);
                var offset2Y = this.CalculateBeamY(lastBeamingHelper, offset2X);
                var endY = this.CalculateBeamY(lastBeamingHelper, endX);
                var offset = 10 * this.get_Scale();
                var size = 5 * this.get_Scale();
                if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                    offset *= -1;
                    size *= -1;
                }
                //
                // draw the bracket
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X + startX, ((cy + this.Y + startY - offset)) | 0);
                canvas.LineTo(cx + this.X + startX, ((cy + this.Y + startY - offset - size)) | 0);
                canvas.LineTo(cx + this.X + offset1X, ((cy + this.Y + offset1Y - offset - size)) | 0);
                canvas.Stroke();
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X + offset2X, ((cy + this.Y + offset2Y - offset - size)) | 0);
                canvas.LineTo(cx + this.X + endX, ((cy + this.Y + endY - offset - size)) | 0);
                canvas.LineTo(cx + this.X + endX, ((cy + this.Y + endY - offset)) | 0);
                canvas.Stroke();
                //
                // Draw the string
                canvas.FillText(s, cx + this.X + middleX, cy + this.Y + middleY - offset - size - res.EffectFont.Size);
            }
        }
        canvas.set_TextAlign(oldAlign);
    },
    GetStemSize: function (duration){
        var size;
        switch (duration){
            case AlphaTab.Model.Duration.Half:
                size = 6;
                break;
            case AlphaTab.Model.Duration.Quarter:
                size = 6;
                break;
            case AlphaTab.Model.Duration.Eighth:
                size = 6;
                break;
            case AlphaTab.Model.Duration.Sixteenth:
                size = 6;
                break;
            case AlphaTab.Model.Duration.ThirtySecond:
                size = 7;
                break;
            case AlphaTab.Model.Duration.SixtyFourth:
                size = 8;
                break;
            default:
                size = 0;
                break;
        }
        return this.GetScoreY(size, 0);
    },
    CalculateBeamY: function (h, x){
        var stemSize = this.GetStemSize(h.MaxDuration);
        return h.CalculateBeamY(stemSize, this.get_Scale(), x, this.get_Scale(), $CreateAnonymousDelegate(this, function (n){
            return this.GetScoreY(this.GetNoteLine(n), 0);
        }));
    },
    PaintBar: function (cx, cy, canvas, h){
        for (var i = 0,j = h.Beats.length; i < j; i++){
            var beat = h.Beats[i];
            //
            // draw line 
            //
            var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
            var direction = h.Direction;
            var y1 = cy + this.Y + (direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? this.GetScoreY(this.GetNoteLine(beat.get_MinNote()), 0) : this.GetScoreY(this.GetNoteLine(beat.get_MaxNote()), 0));
            var y2 = cy + this.Y + this.CalculateBeamY(h, beatLineX);
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X + beatLineX, y1);
            canvas.LineTo(cx + this.X + beatLineX, y2);
            canvas.Stroke();
            var fingeringY = y2;
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                fingeringY += canvas.get_Font().Size * 2;
            }
            else if (i != 0){
                fingeringY -= canvas.get_Font().Size * 1.5;
            }
            this.PaintFingering(canvas, beat, cx + this.X + beatLineX, direction, fingeringY);
            var brokenBarOffset = 6 * this.get_Scale();
            var barSpacing = 6 * this.get_Scale();
            var barSize = 3 * this.get_Scale();
            var barCount = AlphaTab.Model.ModelUtils.GetIndex(beat.Duration) - 2;
            var barStart = cy + this.Y;
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                barSpacing = -barSpacing;
                barSize = -barSize;
            }
            for (var barIndex = 0; barIndex < barCount; barIndex++){
                var barStartX;
                var barEndX;
                var barStartY;
                var barEndY;
                var barY = barStart + (barIndex * barSpacing);
                // 
                // Bar to Next?
                //
                if (i < h.Beats.length - 1){
                    // full bar?
                    if (this.IsFullBarJoin(beat, h.Beats[i + 1], barIndex)){
                        barStartX = beatLineX;
                        barEndX = h.GetBeatLineX(h.Beats[i + 1]) + this.get_Scale();
                    }
                    else if (i == 0 || !this.IsFullBarJoin(h.Beats[i - 1], beat, barIndex)){
                        barStartX = beatLineX;
                        barEndX = barStartX + brokenBarOffset;
                    }
                    else {
                        continue;
                    }
                    barStartY = barY + this.CalculateBeamY(h, barStartX);
                    barEndY = barY + this.CalculateBeamY(h, barEndX);
                    AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                }
                else if (i > 0 && !this.IsFullBarJoin(beat, h.Beats[i - 1], barIndex)){
                    barStartX = beatLineX - brokenBarOffset;
                    barEndX = beatLineX;
                    barStartY = barY + this.CalculateBeamY(h, barStartX);
                    barEndY = barY + this.CalculateBeamY(h, barEndX);
                    AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                }
            }
        }
    },
    IsFullBarJoin: function (a, b, barIndex){
        return (AlphaTab.Model.ModelUtils.GetIndex(a.Duration) - 2 - barIndex > 0) && (AlphaTab.Model.ModelUtils.GetIndex(b.Duration) - 2 - barIndex > 0);
    },
    PaintFooter: function (cx, cy, canvas, h){
        var beat = h.Beats[0];
        var isGrace = beat.GraceType != AlphaTab.Model.GraceType.None;
        var scaleMod = isGrace ? 0.6 : 1;
        //
        // draw line 
        //
        var stemSize = this.GetStemSize(h.MaxDuration);
        var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
        var direction = h.Direction;
        var topY = this.GetScoreY(this.GetNoteLine(beat.get_MaxNote()), 0);
        var bottomY = this.GetScoreY(this.GetNoteLine(beat.get_MinNote()), 0);
        var beamY;
        var fingeringY;
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
            bottomY += stemSize * scaleMod;
            beamY = bottomY;
            fingeringY = cy + this.Y + bottomY;
        }
        else {
            topY -= stemSize * scaleMod;
            beamY = topY;
            fingeringY = cy + this.Y + topY;
        }
        this.PaintFingering(canvas, beat, cx + this.X + beatLineX, direction, fingeringY);
        if (beat.Duration == AlphaTab.Model.Duration.Whole){
            return;
        }
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X + beatLineX, cy + this.Y + topY);
        canvas.LineTo(cx + this.X + beatLineX, cy + this.Y + bottomY);
        canvas.Stroke();
        if (isGrace){
            var graceSizeY = 15 * this.get_Scale();
            var graceSizeX = 12 * this.get_Scale();
            canvas.BeginPath();
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                canvas.MoveTo(cx + this.X + beatLineX - (graceSizeX / 2), cy + this.Y + bottomY - graceSizeY);
                canvas.LineTo(cx + this.X + beatLineX + (graceSizeX / 2), cy + this.Y + bottomY);
            }
            else {
                canvas.MoveTo(cx + this.X + beatLineX - (graceSizeX / 2), cy + this.Y + topY + graceSizeY);
                canvas.LineTo(cx + this.X + beatLineX + (graceSizeX / 2), cy + this.Y + topY);
            }
            canvas.Stroke();
        }
        //
        // Draw beam 
        //
        if (beat.Duration > AlphaTab.Model.Duration.Quarter){
            var glyph = new AlphaTab.Rendering.Glyphs.BeamGlyph(beatLineX, beamY, beat.Duration, direction, isGrace);
            glyph.Renderer = this;
            glyph.DoLayout();
            glyph.Paint(cx + this.X, cy + this.Y, canvas);
        }
    },
    PaintFingering: function (canvas, beat, beatLineX, direction, topY){
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
            beatLineX -= 10 * this.get_Scale();
        }
        else {
            beatLineX += 3 * this.get_Scale();
        }
        // sort notes ascending in their value to ensure 
        // we are drawing the numbers according to their order on the stave 
        var noteList = beat.Notes.slice();
        noteList.sort($CreateAnonymousDelegate(this, function (a, b){
    return b.get_RealValue() - a.get_RealValue();
}));
        for (var n = 0; n < noteList.length; n++){
            var note = noteList[n];
            var text = null;
            if (note.LeftHandFinger != AlphaTab.Model.Fingers.Unknown){
                text = this.FingerToString(beat, note.LeftHandFinger, true);
            }
            else if (note.RightHandFinger != AlphaTab.Model.Fingers.Unknown){
                text = this.FingerToString(beat, note.RightHandFinger, false);
            }
            if (text == null){
                continue;
            }
            canvas.FillText(text, beatLineX, topY);
            topY -= ((canvas.get_Font().Size)) | 0;
        }
    },
    FingerToString: function (beat, finger, leftHand){
        if (this.get_Settings().ForcePianoFingering || AlphaTab.Audio.GeneralMidi.IsPiano(beat.Voice.Bar.Staff.Track.PlaybackInfo.Program)){
            switch (finger){
                case AlphaTab.Model.Fingers.Unknown:
                case AlphaTab.Model.Fingers.NoOrDead:
                    return null;
                case AlphaTab.Model.Fingers.Thumb:
                    return "1";
                case AlphaTab.Model.Fingers.IndexFinger:
                    return "2";
                case AlphaTab.Model.Fingers.MiddleFinger:
                    return "3";
                case AlphaTab.Model.Fingers.AnnularFinger:
                    return "4";
                case AlphaTab.Model.Fingers.LittleFinger:
                    return "5";
                default:
                    return null;
            }
        }
        else if (leftHand){
            switch (finger){
                case AlphaTab.Model.Fingers.Unknown:
                case AlphaTab.Model.Fingers.NoOrDead:
                    return "0";
                case AlphaTab.Model.Fingers.Thumb:
                    return "T";
                case AlphaTab.Model.Fingers.IndexFinger:
                    return "1";
                case AlphaTab.Model.Fingers.MiddleFinger:
                    return "2";
                case AlphaTab.Model.Fingers.AnnularFinger:
                    return "3";
                case AlphaTab.Model.Fingers.LittleFinger:
                    return "4";
                default:
                    return null;
            }
        }
        else {
            switch (finger){
                case AlphaTab.Model.Fingers.Unknown:
                case AlphaTab.Model.Fingers.NoOrDead:
                    return null;
                case AlphaTab.Model.Fingers.Thumb:
                    return "p";
                case AlphaTab.Model.Fingers.IndexFinger:
                    return "i";
                case AlphaTab.Model.Fingers.MiddleFinger:
                    return "m";
                case AlphaTab.Model.Fingers.AnnularFinger:
                    return "a";
                case AlphaTab.Model.Fingers.LittleFinger:
                    return "c";
                default:
                    return null;
            }
        }
    },
    CreatePreBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().IsRepeatStart){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (this.get_IsFirstOfLine() || this.Bar.Clef != this.Bar.PreviousBar.Clef){
            var offset = 0;
            var correction = 0;
            switch (this.Bar.Clef){
                case AlphaTab.Model.Clef.Neutral:
                    offset = 6;
                    break;
                case AlphaTab.Model.Clef.F4:
                    offset = 4;
                    correction = -1;
                    break;
                case AlphaTab.Model.Clef.C3:
                    offset = 6;
                    break;
                case AlphaTab.Model.Clef.C4:
                    offset = 4;
                    break;
                case AlphaTab.Model.Clef.G2:
                    offset = 8;
                    break;
            }
            this.CreateStartSpacing();
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.ClefGlyph(0, this.GetScoreY(offset, correction), this.Bar.Clef));
        }
        // Key signature
        if ((this.Bar.PreviousBar == null && this.Bar.get_MasterBar().KeySignature != 0) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().KeySignature != this.Bar.PreviousBar.get_MasterBar().KeySignature)){
            this.CreateStartSpacing();
            this.CreateKeySignatureGlyphs();
        }
        // Time Signature
        if ((this.Bar.PreviousBar == null) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureNumerator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureNumerator) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureDenominator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureDenominator)){
            this.CreateStartSpacing();
            this.CreateTimeSignatureGlyphs();
        }
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.BarNumberGlyph(0, this.GetScoreY(-1, -3), this.Bar.Index + 1, !this.Staff.IsFirstInAccolade));
        if (this.Bar.get_IsEmpty()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, (30 * this.get_Scale()), false));
        }
    },
    CreateBeatGlyphs: function (){
        for (var v = 0; v < this.Bar.Voices.length; v++){
            this.CreateVoiceGlyphs(this.Bar.Voices[v]);
        }
    },
    CreatePostBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().get_IsRepeatEnd()){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCloseGlyph(this.X, 0));
            if (this.Bar.get_MasterBar().RepeatCount > 2){
                var line = this.get_IsLast() || this.get_IsLastOfLine() ? -1 : -4;
                this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCountGlyph(0, this.GetScoreY(line, -3), this.Bar.get_MasterBar().RepeatCount));
            }
        }
        else if (this.Bar.get_MasterBar().IsDoubleBar){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 3 * this.get_Scale(), false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
        }
        else if (this.Bar.NextBar == null || !this.Bar.NextBar.get_MasterBar().IsRepeatStart){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, this.get_IsLast()));
        }
    },
    CreateStartSpacing: function (){
        if (this._startSpacing)
            return;
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 2 * this.get_Scale(), true));
        this._startSpacing = true;
    },
    CreateKeySignatureGlyphs: function (){
        var offsetClef = 0;
        var currentKey = this.Bar.get_MasterBar().KeySignature;
        var previousKey = this.Bar.PreviousBar == null ? 0 : this.Bar.PreviousBar.get_MasterBar().KeySignature;
        switch (this.Bar.Clef){
            case AlphaTab.Model.Clef.Neutral:
                offsetClef = 0;
                break;
            case AlphaTab.Model.Clef.G2:
                offsetClef = 1;
                break;
            case AlphaTab.Model.Clef.F4:
                offsetClef = 2;
                break;
            case AlphaTab.Model.Clef.C3:
                offsetClef = -1;
                break;
            case AlphaTab.Model.Clef.C4:
                offsetClef = 1;
                break;
        }
        // naturalize previous key
        // TODO: only naturalize the symbols needed 
        var naturalizeSymbols = Math.abs(previousKey);
        var previousKeyPositions = AlphaTab.Model.ModelUtils.KeySignatureIsSharp(previousKey) ? AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps : AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps;
        for (var i = 0; i < naturalizeSymbols; i++){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.NaturalizeGlyph(0, this.GetScoreY(previousKeyPositions[i] + offsetClef, 0), false));
        }
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        //var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (AlphaTab.Model.ModelUtils.KeySignatureIsSharp(currentKey)){
            for (var i = 0; i < Math.abs(currentKey); i++){
                this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SharpGlyph(0, this.GetScoreY(AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps[i] + offsetClef, 0), false));
            }
        }
        else {
            for (var i = 0; i < Math.abs(currentKey); i++){
                this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.FlatGlyph(0, this.GetScoreY(AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps[i] + offsetClef, 0), false));
            }
        }
    },
    CreateTimeSignatureGlyphs: function (){
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale(), true));
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.TimeSignatureGlyph(0, this.GetScoreY(2, 0), this.Bar.get_MasterBar().TimeSignatureNumerator, this.Bar.get_MasterBar().TimeSignatureDenominator));
    },
    CreateVoiceGlyphs: function (v){
        for (var i = 0,j = v.Beats.length; i < j; i++){
            var b = v.Beats[i];
            var container = new AlphaTab.Rendering.ScoreBeatContainerGlyph(b, this.GetOrCreateVoiceContainer(v));
            container.PreNotes = new AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.ScoreBeatGlyph();
            container.OnNotes.BeamingHelper = this._helpers.BeamHelperLookup[v.Index][b.Index];
            this.AddBeatGlyph(container);
        }
    },
    GetNoteLine: function (n){
        return this.AccidentalHelper.GetNoteLine(n);
    },
    GetScoreY: function (steps, correction){
        return ((this.get_LineOffset() / 2) * steps) + (correction * this.get_Scale());
    },
    PaintBackground: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.PaintBackground.call(this, cx, cy, canvas);
        var res = this.get_Resources();
        //var c = new Color((byte)Std.Random(255),
        //                  (byte)Std.Random(255),
        //                  (byte)Std.Random(255),
        //                  100);
        //canvas.Color = c;
        //canvas.FillRect(cx + X, cy + Y, Width, Height);
        //
        // draw string lines
        //
        canvas.set_Color(res.StaveLineColor);
        var lineY = cy + this.Y + this.TopPadding;
        for (var i = 0; i < 5; i++){
            if (i > 0)
                lineY += this.get_LineOffset();
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X, lineY | 0);
            canvas.LineTo(cx + this.X + this.Width, lineY | 0);
            canvas.Stroke();
        }
        canvas.set_Color(res.MainGlyphColor);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps = new Int32Array([1, 4, 0, 3, 6, 2, 5]);
    AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps = new Int32Array([5, 2, 6, 3, 7, 4, 8]);
    AlphaTab.Rendering.ScoreBarRenderer.LineSpacing = 8;
});
AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar = function (canvas, x1, y1, x2, y2, size){
    canvas.BeginPath();
    canvas.MoveTo(x1, y1);
    canvas.LineTo(x2, y2);
    canvas.LineTo(x2, y2 + size);
    canvas.LineTo(x1, y1 + size);
    canvas.ClosePath();
    canvas.Fill();
};
$Inherit(AlphaTab.Rendering.ScoreBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.ScoreBarRendererFactory = function (){
    AlphaTab.Rendering.BarRendererFactory.call(this);
};
AlphaTab.Rendering.ScoreBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.ScoreBarRenderer(bar);
    }
};
$Inherit(AlphaTab.Rendering.ScoreBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.ScoreRenderer = function (settings){
    this._currentLayoutMode = null;
    this.PreRender = null;
    this.PartialRenderFinished = null;
    this.RenderFinished = null;
    this.PostRenderFinished = null;
    this.Canvas = null;
    this.Score = null;
    this.Tracks = null;
    this.Layout = null;
    this.RenderingResources = null;
    this.Settings = null;
    this.BoundsLookup = null;
    this.Settings = settings;
    this.RenderingResources = new AlphaTab.Rendering.RenderingResources(1);
    if (settings.Engine == null || !AlphaTab.Environment.RenderEngines.hasOwnProperty(settings.Engine)){
        this.Canvas = AlphaTab.Environment.RenderEngines["default"]();
    }
    else {
        this.Canvas = AlphaTab.Environment.RenderEngines[settings.Engine]();
    }
    this.RecreateLayout();
};
AlphaTab.Rendering.ScoreRenderer.prototype = {
    RecreateLayout: function (){
        if (this._currentLayoutMode != this.Settings.Layout.Mode){
            if (this.Settings.Layout == null || !AlphaTab.Environment.LayoutEngines.hasOwnProperty(this.Settings.Layout.Mode)){
                this.Layout = AlphaTab.Environment.LayoutEngines["default"](this);
            }
            else {
                this.Layout = AlphaTab.Environment.LayoutEngines[this.Settings.Layout.Mode](this);
            }
            this._currentLayoutMode = this.Settings.Layout.Mode;
            return true;
        }
        return false;
    },
    Render: function (track){
        this.Score = track.Score;
        this.Tracks = [track];
        this.Invalidate();
    },
    RenderMultiple: function (tracks){
        if (tracks.length == 0){
            this.Score = null;
        }
        else {
            this.Score = tracks[0].Score;
        }
        this.Tracks = tracks;
        this.Invalidate();
    },
    UpdateSettings: function (settings){
        this.Settings = settings;
    },
    Invalidate: function (){
        this.BoundsLookup = new AlphaTab.Rendering.Utils.BoundsLookup();
        if (this.Tracks.length == 0)
            return;
        if (this.RenderingResources.Scale != this.Settings.Scale){
            this.RenderingResources.Init(this.Settings.Scale);
            this.Canvas.set_LineWidth(this.Settings.Scale);
        }
        this.Canvas.set_Resources(this.RenderingResources);
        this.OnPreRender();
        this.RecreateLayout();
        this.LayoutAndRender();
    },
    Resize: function (width){
        if (this.RecreateLayout()){
            this.Invalidate();
        }
        else if (this.Layout.get_SupportsResize()){
            this.OnPreRender();
            this.Settings.Width = width;
            this.Layout.Resize();
            this.Layout.RenderAnnotation();
            this.OnRenderFinished();
            this.OnPostRender();
        }
    },
    LayoutAndRender: function (){
        this.Layout.LayoutAndRender();
        this.Layout.RenderAnnotation();
        this.OnRenderFinished();
        this.OnPostRender();
    },
    add_PreRender: function (value){
        this.PreRender = $CombineDelegates(this.PreRender, value);
    },
    remove_PreRender: function (value){
        this.PreRender = $RemoveDelegate(this.PreRender, value);
    },
    OnPreRender: function (){
        var result = this.Canvas.OnPreRender();
        var handler = this.PreRender;
        if (handler != null)
            handler((function (){
                var $v6 = new AlphaTab.Rendering.RenderFinishedEventArgs();
                $v6.TotalWidth = 0;
                $v6.TotalHeight = 0;
                $v6.Width = 0;
                $v6.Height = 0;
                $v6.RenderResult = result;
                return $v6;
            }).call(this));
    },
    add_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $CombineDelegates(this.PartialRenderFinished, value);
    },
    remove_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $RemoveDelegate(this.PartialRenderFinished, value);
    },
    OnPartialRenderFinished: function (e){
        var handler = this.PartialRenderFinished;
        if (handler != null)
            handler(e);
    },
    add_RenderFinished: function (value){
        this.RenderFinished = $CombineDelegates(this.RenderFinished, value);
    },
    remove_RenderFinished: function (value){
        this.RenderFinished = $RemoveDelegate(this.RenderFinished, value);
    },
    OnRenderFinished: function (){
        var result = this.Canvas.OnRenderFinished();
        var handler = this.RenderFinished;
        if (handler != null)
            handler((function (){
                var $v7 = new AlphaTab.Rendering.RenderFinishedEventArgs();
                $v7.RenderResult = result;
                $v7.TotalHeight = this.Layout.Height;
                $v7.TotalWidth = this.Layout.Width;
                return $v7;
            }).call(this));
    },
    add_PostRenderFinished: function (value){
        this.PostRenderFinished = $CombineDelegates(this.PostRenderFinished, value);
    },
    remove_PostRenderFinished: function (value){
        this.PostRenderFinished = $RemoveDelegate(this.PostRenderFinished, value);
    },
    OnPostRender: function (){
        var handler = this.PostRenderFinished;
        if (handler != null)
            handler();
    }
};
AlphaTab.Rendering.Staves = AlphaTab.Rendering.Staves || {};
AlphaTab.Rendering.Staves.BarLayoutingInfo = function (){
    this._timeSortedSprings = null;
    this._xMin = 0;
    this._onTimePositionsForce = 0;
    this._onTimePositions = null;
    this.PreBeatSizes = null;
    this.OnBeatSizes = null;
    this.PreBeatSize = 0;
    this.PostBeatSize = 0;
    this.VoiceSize = 0;
    this.MinStretchForce = 0;
    this.TotalSpringConstant = 0;
    this.Springs = null;
    this.SmallestDuration = 0;
    this.PreBeatSizes = {};
    this.OnBeatSizes = {};
    this.VoiceSize = 0;
    this.Springs = {};
};
AlphaTab.Rendering.Staves.BarLayoutingInfo.prototype = {
    UpdateVoiceSize: function (size){
        if (size > this.VoiceSize){
            this.VoiceSize = size;
        }
    },
    SetPreBeatSize: function (beat, size){
        if (!this.PreBeatSizes.hasOwnProperty(beat.Index) || this.PreBeatSizes[beat.Index] < size){
            this.PreBeatSizes[beat.Index] = size;
        }
    },
    GetPreBeatSize: function (beat){
        if (this.PreBeatSizes.hasOwnProperty(beat.Index)){
            return this.PreBeatSizes[beat.Index];
        }
        return 0;
    },
    SetOnBeatSize: function (beat, size){
        if (!this.OnBeatSizes.hasOwnProperty(beat.Index) || this.OnBeatSizes[beat.Index] < size){
            this.OnBeatSizes[beat.Index] = size;
        }
    },
    GetOnBeatSize: function (beat){
        if (this.OnBeatSizes.hasOwnProperty(beat.Index)){
            return this.OnBeatSizes[beat.Index];
        }
        return 0;
    },
    UpdateMinStretchForce: function (force){
        if (this.MinStretchForce < force){
            this.MinStretchForce = force;
        }
    },
    AddSpring: function (start, duration, springSize, preSpringSize, postSpringSize){
        var spring;
        if (!this.Springs.hasOwnProperty(start)){
            spring = new AlphaTab.Rendering.Staves.Spring();
            spring.TimePosition = start;
            spring.SmallestDuration = duration;
            spring.LongestDuration = duration;
            spring.SpringWidth = springSize;
            spring.PreSpringWidth = preSpringSize;
            spring.PostSpringWidth = postSpringSize;
            this.Springs[start] = spring;
        }
        else {
            spring = this.Springs[start];
            if (spring.SpringWidth < springSize){
                spring.SpringWidth = springSize;
            }
            if (spring.PreSpringWidth < preSpringSize){
                spring.PreSpringWidth = preSpringSize;
            }
            if (spring.PostSpringWidth < postSpringSize){
                spring.PostSpringWidth = postSpringSize;
            }
            if (duration < spring.SmallestDuration){
                spring.SmallestDuration = duration;
            }
            if (duration > spring.LongestDuration){
                spring.LongestDuration = duration;
            }
        }
        if (duration < this.SmallestDuration){
            this.SmallestDuration = duration;
        }
        return spring;
    },
    AddBeatSpring: function (beat, beatSize, preBeatSize, postBeatSize){
        return this.AddSpring(beat.get_AbsoluteStart(), beat.CalculateDuration(), beatSize, preBeatSize, postBeatSize);
    },
    Finish: function (){
        this.CalculateSpringConstants();
    },
    CalculateSpringConstants: function (){
        var sortedSprings = this._timeSortedSprings = [];
        this._xMin = 0;
        for (var time in this.Springs){
            var spring = this.Springs[time];
            sortedSprings.push(spring);
            if (spring.SpringWidth < this._xMin){
                this._xMin = spring.SpringWidth;
            }
        }
        sortedSprings.sort($CreateAnonymousDelegate(this, function (a, b){
    if (a.TimePosition < b.TimePosition){
        return -1;
    }
    if (a.TimePosition > b.TimePosition){
        return 1;
    }
    return 0;
}));
        var totalSpringConstant = 0;
        for (var i = 0; i < sortedSprings.length; i++){
            var currentSpring = sortedSprings[i];
            var duration;
            if (i == sortedSprings.length - 1){
                duration = currentSpring.LongestDuration;
            }
            else {
                var nextSpring = sortedSprings[i + 1];
                duration = nextSpring.TimePosition - currentSpring.TimePosition;
            }
            currentSpring.SpringConstant = this.CalculateSpringConstant(currentSpring, duration);
            totalSpringConstant += 1 / currentSpring.SpringConstant;
        }
        this.TotalSpringConstant = 1 / totalSpringConstant;
    },
    CalculateSpringConstant: function (spring, duration){
        var minDuration = spring.SmallestDuration;
        if (spring.SmallestDuration == 0){
            minDuration = duration;
        }
        var phi = 1 + 0.6 * Math.log2(duration / 30);
        return (minDuration / duration) * 1 / (phi * 10);
    },
    SpaceToForce: function (space){
        return space * this.TotalSpringConstant;
    },
    CalculateVoiceWidth: function (force){
        return this.CalculateWidth(force, this.TotalSpringConstant);
    },
    CalculateWidth: function (force, springConstant){
        return force / springConstant;
    },
    BuildOnTimePositions: function (force){
        if (Math.abs(this._onTimePositionsForce - force) < 1E-05 && this._onTimePositions != null){
            return this._onTimePositions;
        }
        this._onTimePositionsForce = force;
        var positions = this._onTimePositions = {};
        var sortedSprings = this._timeSortedSprings;
        if (sortedSprings.length == 0){
            return positions;
        }
        var springX = sortedSprings[0].PreSpringWidth;
        for (var i = 0; i < sortedSprings.length; i++){
            positions[sortedSprings[i].TimePosition] = springX;
            springX += this.CalculateWidth(force, sortedSprings[i].SpringConstant);
        }
        return positions;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Staves.BarLayoutingInfo.MinDuration = 30;
    AlphaTab.Rendering.Staves.BarLayoutingInfo.MinDurationWidth = 10;
});
AlphaTab.Rendering.Staves.Spring = function (){
    this.TimePosition = 0;
    this.LongestDuration = 0;
    this.SmallestDuration = 0;
    this.Force = 0;
    this.Width = 0;
    this.SpringConstant = 0;
    this.SpringWidth = 0;
    this.PreSpringWidth = 0;
    this.PostSpringWidth = 0;
};
AlphaTab.Rendering.Staves.Staff = function (staff, staveId, factory, settings){
    this._factory = null;
    this._settings = null;
    this._barRendererLookup = null;
    this.StaveTrackGroup = null;
    this.StaveGroup = null;
    this.BarRenderers = null;
    this.X = 0;
    this.Y = 0;
    this.Height = 0;
    this.Index = 0;
    this.StaffIndex = 0;
    this.ModelStaff = null;
    this.StaveId = null;
    this.StaveTop = 0;
    this.TopSpacing = 0;
    this.BottomSpacing = 0;
    this.StaveBottom = 0;
    this.IsFirstInAccolade = false;
    this.IsLastInAccolade = false;
    this.BarRenderers = [];
    this._barRendererLookup = {};
    this.ModelStaff = staff;
    this.StaveId = staveId;
    this._factory = factory;
    this._settings = settings;
    this.TopSpacing = 10;
    this.BottomSpacing = 10;
    this.StaveTop = 0;
    this.StaveBottom = 0;
};
AlphaTab.Rendering.Staves.Staff.prototype = {
    GetSetting: function (key, def){
        if (this._settings.hasOwnProperty(key)){
            return (this._settings[key]);
        }
        return def;
    },
    get_IsInAccolade: function (){
        return this._factory.IsInAccolade;
    },
    RegisterStaveTop: function (offset){
        this.StaveTop = offset;
    },
    RegisterStaveBottom: function (offset){
        this.StaveBottom = offset;
    },
    AddBar: function (bar){
        var renderer;
        if (bar == null){
            renderer = new AlphaTab.Rendering.BarRendererBase(bar);
        }
        else {
            renderer = this._factory.Create(bar);
        }
        renderer.Staff = this;
        renderer.Index = this.BarRenderers.length;
        renderer.DoLayout();
        this.BarRenderers.push(renderer);
        if (bar != null){
            this.StaveGroup.Layout.RegisterBarRenderer(this.StaveId, renderer);
        }
    },
    RevertLastBar: function (){
        var lastBar = this.BarRenderers[this.BarRenderers.length - 1];
        this.BarRenderers.splice(this.BarRenderers.length - 1,1);
        this.StaveGroup.Layout.UnregisterBarRenderer(this.StaveId, lastBar);
    },
    ScaleToWidth: function (width){
        // Note: here we could do some "intelligent" distribution of 
        // the space over the bar renderers, for now we evenly apply the space to all bars
        var difference = width - this.StaveGroup.Width;
        var spacePerBar = difference / this.BarRenderers.length;
        for (var i = 0,j = this.BarRenderers.length; i < j; i++){
            this.BarRenderers[i].ScaleToWidth(this.BarRenderers[i].Width + spacePerBar);
        }
    },
    get_TopOverflow: function (){
        var m = 0;
        for (var i = 0,j = this.BarRenderers.length; i < j; i++){
            var r = this.BarRenderers[i];
            if (r.TopOverflow > m){
                m = r.TopOverflow;
            }
        }
        return m;
    },
    get_BottomOverflow: function (){
        var m = 0;
        for (var i = 0,j = this.BarRenderers.length; i < j; i++){
            var r = this.BarRenderers[i];
            if (r.BottomOverflow > m){
                m = r.BottomOverflow;
            }
        }
        return m;
    },
    FinalizeStave: function (layout){
        var x = 0;
        this.Height = 0;
        var topOverflow = this.get_TopOverflow();
        var bottomOverflow = this.get_BottomOverflow();
        var isEmpty = true;
        for (var i = 0; i < this.BarRenderers.length; i++){
            this.BarRenderers[i].X = x;
            this.BarRenderers[i].Y = this.TopSpacing + topOverflow;
            this.Height = Math.max(this.Height, this.BarRenderers[i].Height);
            this.BarRenderers[i].FinalizeRenderer(layout);
            x += this.BarRenderers[i].Width;
            if (!this.BarRenderers[i].IsEmpty){
                isEmpty = false;
            }
        }
        if (!isEmpty){
            this.Height += this.TopSpacing + topOverflow + bottomOverflow + this.BottomSpacing;
        }
        else {
            this.Height = 0;
        }
    },
    Paint: function (cx, cy, canvas, startIndex, count){
        if (this.Height == 0 || count == 0)
            return;
        for (var i = startIndex,j = Math.min(startIndex + count, this.BarRenderers.length); i < j; i++){
            this.BarRenderers[i].Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
AlphaTab.Rendering.Staves.StaveTrackGroup = function (staveGroup, track){
    this.Track = null;
    this.StaveGroup = null;
    this.Staves = null;
    this.FirstStaffInAccolade = null;
    this.LastStaffInAccolade = null;
    this.StaveGroup = staveGroup;
    this.Track = track;
    this.Staves = [];
};
AlphaTab.Rendering.Staves.AddBarsToStaveGroupResult = function (){
    this.Width = 0;
    this.IsLinkedToPrevious = false;
    this.Renderer = null;
};
AlphaTab.Rendering.Staves.StaveGroup = function (){
    this._firstStaffInAccolade = null;
    this._lastStaffInAccolade = null;
    this._accoladeSpacingCalculated = false;
    this._allStaves = null;
    this.X = 0;
    this.Y = 0;
    this.Index = 0;
    this.AccoladeSpacing = 0;
    this.IsFull = false;
    this.Width = 0;
    this.MasterBars = null;
    this.Staves = null;
    this.Layout = null;
    this.Helpers = null;
    this.MasterBars = [];
    this.Staves = [];
    this._allStaves = [];
    this.Width = 0;
    this.Index = 0;
    this._accoladeSpacingCalculated = false;
    this.AccoladeSpacing = 0;
    this.Helpers = new AlphaTab.Rendering.Utils.BarHelpersGroup();
};
AlphaTab.Rendering.Staves.StaveGroup.prototype = {
    get_LastBarIndex: function (){
        return this.MasterBars[this.MasterBars.length - 1].Index;
    },
    AddBars: function (tracks, barIndex){
        if (tracks.length == 0)
            return null;
        var result = new AlphaTab.Rendering.Staves.AddBarsToStaveGroupResult();
        var score = tracks[0].Score;
        var masterBar = score.MasterBars[barIndex];
        this.MasterBars.push(masterBar);
        this.Helpers.BuildHelpers(tracks, barIndex);
        if (!this._accoladeSpacingCalculated && this.Index == 0){
            this._accoladeSpacingCalculated = true;
            var canvas = this.Layout.Renderer.Canvas;
            var res = this.Layout.Renderer.RenderingResources.EffectFont;
            canvas.set_Font(res);
            for (var i = 0; i < tracks.length; i++){
                this.AccoladeSpacing = Math.max(this.AccoladeSpacing, canvas.MeasureText(tracks[i].ShortName));
            }
            this.AccoladeSpacing += (20);
            this.Width += this.AccoladeSpacing;
        }
        // add renderers
        var maxSizes = new AlphaTab.Rendering.Staves.BarLayoutingInfo();
        for (var i = 0,j = this.Staves.length; i < j; i++){
            var g = this.Staves[i];
            for (var k = 0,l = g.Staves.length; k < l; k++){
                var s = g.Staves[k];
                s.AddBar(g.Track.Staves[s.ModelStaff.Index].Bars[barIndex]);
                s.BarRenderers[s.BarRenderers.length - 1].RegisterLayoutingInfo(maxSizes);
                if (s.BarRenderers[s.BarRenderers.length - 1].IsLinkedToPrevious){
                    result.IsLinkedToPrevious = true;
                }
            }
        }
        maxSizes.Finish();
        // ensure same widths of new renderer
        var realWidth = 0;
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            var s = this._allStaves[i];
            s.BarRenderers[s.BarRenderers.length - 1].ApplyLayoutingInfo();
            if (s.BarRenderers[s.BarRenderers.length - 1].Width > realWidth){
                realWidth = s.BarRenderers[s.BarRenderers.length - 1].Width;
            }
        }
        this.Width += realWidth;
        result.Width = realWidth;
        return result;
    },
    GetStaveTrackGroup: function (track){
        for (var i = 0,j = this.Staves.length; i < j; i++){
            var g = this.Staves[i];
            if (g.Track == track){
                return g;
            }
        }
        return null;
    },
    AddStave: function (track, staff){
        var group = this.GetStaveTrackGroup(track);
        if (group == null){
            group = new AlphaTab.Rendering.Staves.StaveTrackGroup(this, track);
            this.Staves.push(group);
        }
        staff.StaveTrackGroup = group;
        staff.StaveGroup = this;
        staff.Index = this._allStaves.length;
        this._allStaves.push(staff);
        group.Staves.push(staff);
        if (staff.get_IsInAccolade()){
            if (this._firstStaffInAccolade == null){
                this._firstStaffInAccolade = staff;
                staff.IsFirstInAccolade = true;
            }
            if (group.FirstStaffInAccolade == null){
                group.FirstStaffInAccolade = staff;
            }
            if (this._lastStaffInAccolade == null){
                this._lastStaffInAccolade = staff;
                staff.IsLastInAccolade = true;
            }
            if (this._lastStaffInAccolade != null){
                this._lastStaffInAccolade.IsLastInAccolade = false;
            }
            this._lastStaffInAccolade = staff;
            this._lastStaffInAccolade.IsLastInAccolade = true;
            group.LastStaffInAccolade = staff;
        }
    },
    get_Height: function (){
        return this._allStaves[this._allStaves.length - 1].Y + this._allStaves[this._allStaves.length - 1].Height;
    },
    RevertLastBar: function (){
        if (this.MasterBars.length > 1){
            this.MasterBars.splice(this.MasterBars.length - 1,1);
            var w = 0;
            for (var i = 0,j = this._allStaves.length; i < j; i++){
                var s = this._allStaves[i];
                w = Math.max(w, s.BarRenderers[s.BarRenderers.length - 1].Width);
                s.RevertLastBar();
            }
            this.Width -= w;
        }
    },
    ScaleToWidth: function (width){
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].ScaleToWidth(width);
        }
        this.Width = width;
    },
    Paint: function (cx, cy, canvas){
        this.PaintPartial(cx + this.X, cy + this.Y, canvas, 0, this.MasterBars.length);
    },
    PaintPartial: function (cx, cy, canvas, startIndex, count){
        this.BuildBoundingsLookup(cx, cy);
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].Paint(cx, cy, canvas, startIndex, count);
        }
        var res = this.Layout.Renderer.RenderingResources;
        if (this.Staves.length > 0 && startIndex == 0){
            //
            // Draw start grouping
            // 
            if (this._firstStaffInAccolade != null && this._lastStaffInAccolade != null){
                //
                // draw grouping line for all staves
                //
                var firstStart = cy + this._firstStaffInAccolade.Y + this._firstStaffInAccolade.StaveTop + this._firstStaffInAccolade.TopSpacing + this._firstStaffInAccolade.get_TopOverflow();
                var lastEnd = cy + this._lastStaffInAccolade.Y + this._lastStaffInAccolade.TopSpacing + this._lastStaffInAccolade.get_TopOverflow() + this._lastStaffInAccolade.StaveBottom;
                var acooladeX = cx + this._firstStaffInAccolade.X;
                canvas.set_Color(res.BarSeperatorColor);
                canvas.BeginPath();
                canvas.MoveTo(acooladeX, firstStart);
                canvas.LineTo(acooladeX, lastEnd);
                canvas.Stroke();
            }
            //
            // Draw accolade for each track group
            // 
            canvas.set_Font(res.EffectFont);
            for (var i = 0,j = this.Staves.length; i < j; i++){
                var g = this.Staves[i];
                if (g.FirstStaffInAccolade != null && g.LastStaffInAccolade != null){
                    var firstStart = cy + g.FirstStaffInAccolade.Y + g.FirstStaffInAccolade.StaveTop + g.FirstStaffInAccolade.TopSpacing + g.FirstStaffInAccolade.get_TopOverflow();
                    var lastEnd = cy + g.LastStaffInAccolade.Y + g.LastStaffInAccolade.TopSpacing + g.LastStaffInAccolade.get_TopOverflow() + g.LastStaffInAccolade.StaveBottom;
                    var acooladeX = cx + g.FirstStaffInAccolade.X;
                    var barSize = (3 * this.Layout.Renderer.Settings.Scale);
                    var barOffset = barSize;
                    var accoladeStart = firstStart - (barSize * 4);
                    var accoladeEnd = lastEnd + (barSize * 4);
                    // text
                    if (this.Index == 0){
                        canvas.FillText(g.Track.ShortName, cx + (10 * this.Layout.get_Scale()), firstStart);
                    }
                    // rect
                    canvas.FillRect(acooladeX - barOffset - barSize, accoladeStart, barSize, accoladeEnd - accoladeStart);
                    var spikeStartX = acooladeX - barOffset - barSize;
                    var spikeEndX = acooladeX + barSize * 2;
                    // top spike
                    canvas.BeginPath();
                    canvas.MoveTo(spikeStartX, accoladeStart);
                    canvas.BezierCurveTo(spikeStartX, accoladeStart, spikeStartX, accoladeStart, spikeEndX, accoladeStart - barSize);
                    canvas.BezierCurveTo(acooladeX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize);
                    canvas.ClosePath();
                    canvas.Fill();
                    // bottom spike 
                    canvas.BeginPath();
                    canvas.MoveTo(spikeStartX, accoladeEnd);
                    canvas.BezierCurveTo(spikeStartX, accoladeEnd, acooladeX, accoladeEnd, spikeEndX, accoladeEnd + barSize);
                    canvas.BezierCurveTo(acooladeX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
            }
        }
    },
    FinalizeGroup: function (scoreLayout){
        var currentY = 0;
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].X = this.AccoladeSpacing;
            this._allStaves[i].Y = (currentY);
            this._allStaves[i].FinalizeStave(scoreLayout);
            currentY += this._allStaves[i].Height;
        }
    },
    BuildBoundingsLookup: function (cx, cy){
        if (this.Layout.Renderer.BoundsLookup.IsFinished)
            return;
        if (this._firstStaffInAccolade == null || this._lastStaffInAccolade == null)
            return;
        var visualTop = cy + this.Y + this._firstStaffInAccolade.Y;
        var visualBottom = cy + this.Y + this._lastStaffInAccolade.Y + this._lastStaffInAccolade.Height;
        var realTop = cy + this.Y + this._allStaves[0].Y;
        var realBottom = cy + this.Y + this._allStaves[this._allStaves.length - 1].Y + this._allStaves[this._allStaves.length - 1].Height;
        var visualHeight = visualBottom - visualTop;
        var realHeight = realBottom - realTop;
        var x = this.X + this._firstStaffInAccolade.X;
        var staveGroupBounds = new AlphaTab.Rendering.Utils.StaveGroupBounds();
        staveGroupBounds.VisualBounds = {
            X: cx,
            Y: cy + this.Y,
            W: this.Width,
            H: this.get_Height()
        };
        staveGroupBounds.RealBounds = {
            X: cx,
            Y: cy + this.Y,
            W: this.Width,
            H: this.get_Height()
        };
        this.Layout.Renderer.BoundsLookup.AddStaveGroup(staveGroupBounds);
        var masterBarBoundsLookup = [];
        for (var i = 0; i < this.Staves.length; i++){
            for (var j = 0,k = this.Staves[i].FirstStaffInAccolade.BarRenderers.length; j < k; j++){
                var renderer = this.Staves[i].FirstStaffInAccolade.BarRenderers[j];
                if (i == 0){
                    var masterBarBounds = new AlphaTab.Rendering.Utils.MasterBarBounds();
                    masterBarBounds.IsFirstOfLine = renderer.get_IsFirstOfLine();
                    masterBarBounds.RealBounds = {
                        X: x + renderer.X,
                        Y: realTop,
                        W: renderer.Width,
                        H: realHeight
                    };
                    masterBarBounds.VisualBounds = {
                        X: x + renderer.X,
                        Y: visualTop,
                        W: renderer.Width,
                        H: visualHeight
                    };
                    this.Layout.Renderer.BoundsLookup.AddMasterBar(masterBarBounds);
                    masterBarBoundsLookup.push(masterBarBounds);
                }
                renderer.BuildBoundingsLookup(masterBarBoundsLookup[j], x, cy + this.Y + this._firstStaffInAccolade.Y);
            }
        }
    },
    GetBarX: function (index){
        if (this._firstStaffInAccolade == null || this.Layout.Renderer.Tracks.length == 0){
            return 0;
        }
        var bar = this.Layout.Renderer.Tracks[0].Staves[0].Bars[index];
        var renderer = this.Layout.GetRendererForBar(this._firstStaffInAccolade.StaveId, bar);
        return renderer.X;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Staves.StaveGroup.AccoladeLabelSpacing = 10;
});
AlphaTab.Rendering.TabBarRenderer = function (bar){
    this._helpers = null;
    AlphaTab.Rendering.BarRendererBase.call(this, bar);
};
AlphaTab.Rendering.TabBarRenderer.prototype = {
    get_LineOffset: function (){
        return ((11) * this.get_Scale());
    },
    GetNoteX: function (note, onEnd){
        var beat = this.GetOnNotesGlyphForBeat(note.Beat);
        if (beat != null){
            return beat.Container.X + beat.X + beat.NoteNumbers.GetNoteX(note, onEnd);
        }
        return 0;
    },
    GetNoteY: function (note){
        var beat = this.GetOnNotesGlyphForBeat(note.Beat);
        if (beat != null){
            return beat.NoteNumbers.GetNoteY(note);
        }
        return 0;
    },
    DoLayout: function (){
        this._helpers = this.Staff.StaveGroup.Helpers.Helpers[this.Bar.Staff.Track.Index][this.Bar.Staff.Index][this.Bar.Index];
        var res = this.get_Resources();
        var numberOverflow = (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2);
        this.TopPadding = numberOverflow;
        this.BottomPadding = numberOverflow;
        AlphaTab.Rendering.BarRendererBase.prototype.DoLayout.call(this);
        this.Height = this.get_LineOffset() * (this.Bar.Staff.Track.Tuning.length - 1) + (numberOverflow * 2);
        if (this.Index == 0){
            this.Staff.RegisterStaveTop(this.TopOverflow);
            this.Staff.RegisterStaveBottom(this.Height - this.BottomOverflow);
        }
    },
    CreatePreBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().IsRepeatStart){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (this.get_IsFirstOfLine()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.TabClefGlyph(0, 0));
        }
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.BarNumberGlyph(0, this.GetTabY(-1, -3), this.Bar.Index + 1, !this.Staff.IsFirstInAccolade));
        if (this.Bar.get_IsEmpty()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 30 * this.get_Scale(), false));
        }
    },
    CreateBeatGlyphs: function (){
        for (var v = 0; v < this.Bar.Voices.length; v++){
            this.CreateVoiceGlyphs(this.Bar.Voices[v]);
        }
    },
    CreateVoiceGlyphs: function (v){
        for (var i = 0,j = v.Beats.length; i < j; i++){
            var b = v.Beats[i];
            var container = new AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph(b, this.GetOrCreateVoiceContainer(v));
            container.PreNotes = new AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.TabBeatGlyph();
            container.OnNotes.Renderer = this;
            container.OnNotes.BeamingHelper = this._helpers.BeamHelperLookup[v.Index][b.Index];
            this.AddBeatGlyph(container);
        }
    },
    CreatePostBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().get_IsRepeatEnd()){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCloseGlyph(this.X, 0));
            if (this.Bar.get_MasterBar().RepeatCount > 2){
                var line = this.get_IsLast() || this.get_IsLastOfLine() ? -1 : -4;
                this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCountGlyph(0, this.GetTabY(line, -3), this.Bar.get_MasterBar().RepeatCount));
            }
        }
        else if (this.Bar.get_MasterBar().IsDoubleBar){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 3 * this.get_Scale(), false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
        }
        else if (this.Bar.NextBar == null || !this.Bar.NextBar.get_MasterBar().IsRepeatStart){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, this.get_IsLast()));
        }
    },
    GetTabY: function (line, correction){
        return (this.get_LineOffset() * line) + (correction * this.get_Scale());
    },
    PaintBackground: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.PaintBackground.call(this, cx, cy, canvas);
        var res = this.get_Resources();
        //
        // draw string lines
        //
        canvas.set_Color(res.StaveLineColor);
        var lineY = cy + this.Y + this.TopPadding;
        for (var i = 0,j = this.Bar.Staff.Track.Tuning.length; i < j; i++){
            if (i > 0)
                lineY += this.get_LineOffset();
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X, lineY | 0);
            canvas.LineTo(cx + this.X + this.Width, lineY | 0);
            canvas.Stroke();
        }
        canvas.set_Color(res.MainGlyphColor);
        // Info guides for debugging
        //DrawInfoGuide(canvas, cx, cy, 0, new Color(255, 0, 0)); // top
        //DrawInfoGuide(canvas, cx, cy, stave.StaveTop, new Color(0, 255, 0)); // stavetop
        //DrawInfoGuide(canvas, cx, cy, stave.StaveBottom, new Color(0,255,0)); // stavebottom
        //DrawInfoGuide(canvas, cx, cy, Height, new Color(255, 0, 0)); // bottom
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.TabBarRenderer.LineSpacing = 10;
});
$Inherit(AlphaTab.Rendering.TabBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.TabBarRendererFactory = function (){
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this.HideOnPercussionTrack = true;
};
AlphaTab.Rendering.TabBarRendererFactory.prototype = {
    CanCreate: function (track){
        return track.Tuning.length > 0 && AlphaTab.Rendering.BarRendererFactory.prototype.CanCreate.call(this, track);
    },
    Create: function (bar){
        return new AlphaTab.Rendering.TabBarRenderer(bar);
    }
};
$Inherit(AlphaTab.Rendering.TabBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.Utils.AccidentalHelper = function (){
    this._registeredAccidentals = null;
    this._appliedScoreLines = null;
    this._registeredAccidentals = {};
    this._appliedScoreLines = {};
};
AlphaTab.Rendering.Utils.AccidentalHelper.prototype = {
    GetNoteId: function (n){
        return n.Beat.Index + "-" + n.Beat.Voice.Index + "-" + n.Index;
    },
    ApplyAccidental: function (note){
        var noteValue = note.get_RealValue();
        var ks = note.Beat.Voice.Bar.get_MasterBar().KeySignature;
        var ksi = (ks + 7);
        var index = (noteValue % 12);
        var accidentalToSet = AlphaTab.Model.AccidentalType.None;
        var line = this.RegisterNoteLine(note);
        if (!note.Beat.Voice.Bar.Staff.Track.IsPercussion){
            // the key signature symbol required according to 
            var keySignatureAccidental = ksi < 7 ? AlphaTab.Model.AccidentalType.Flat : AlphaTab.Model.AccidentalType.Sharp;
            // determine whether the current note requires an accidental according to the key signature
            var hasNoteAccidentalForKeySignature = AlphaTab.Rendering.Utils.AccidentalHelper.KeySignatureLookup[ksi][index];
            var isAccidentalNote = AlphaTab.Rendering.Utils.AccidentalHelper.AccidentalNotes[index];
            var isAccidentalRegistered = this._registeredAccidentals.hasOwnProperty(line);
            if (hasNoteAccidentalForKeySignature != isAccidentalNote && !isAccidentalRegistered){
                this._registeredAccidentals[line] = true;
                accidentalToSet = isAccidentalNote ? keySignatureAccidental : AlphaTab.Model.AccidentalType.Natural;
            }
            else if (hasNoteAccidentalForKeySignature == isAccidentalNote && isAccidentalRegistered){
                delete this._registeredAccidentals[line];
                accidentalToSet = isAccidentalNote ? keySignatureAccidental : AlphaTab.Model.AccidentalType.Natural;
            }
        }
        // TODO: change accidentalToSet according to note.AccidentalMode
        return accidentalToSet;
    },
    RegisterNoteLine: function (n){
        var value = n.Beat.Voice.Bar.Staff.Track.IsPercussion ? AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay(n) : n.get_RealValue();
        var ks = n.Beat.Voice.Bar.get_MasterBar().KeySignature;
        var clef = n.Beat.Voice.Bar.Clef;
        var index = value % 12;
        var octave = ((value / 12) | 0);
        // Initial Position
        var steps = AlphaTab.Rendering.Utils.AccidentalHelper.OctaveSteps[clef];
        // Move to Octave
        steps -= (octave * 7);
        // get the step list for the current keySignature
        var stepList = AlphaTab.Model.ModelUtils.KeySignatureIsSharp(ks) || AlphaTab.Model.ModelUtils.KeySignatureIsNatural(ks) ? AlphaTab.Rendering.Utils.AccidentalHelper.SharpNoteSteps : AlphaTab.Rendering.Utils.AccidentalHelper.FlatNoteSteps;
        //Add offset for note itself
        var offset = 0;
        switch (n.AccidentalMode){
            case AlphaTab.Model.NoteAccidentalMode.Default:
            case AlphaTab.Model.NoteAccidentalMode.SwapAccidentals:
            case AlphaTab.Model.NoteAccidentalMode.ForceNatural:
            case AlphaTab.Model.NoteAccidentalMode.ForceFlat:
            case AlphaTab.Model.NoteAccidentalMode.ForceSharp:
            default:
                offset = stepList[index];
                break;
        }
        steps -= stepList[index];
        this._appliedScoreLines[this.GetNoteId(n)] = steps;
        return steps;
    },
    GetNoteLine: function (n){
        return this._appliedScoreLines[this.GetNoteId(n)];
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.AccidentalHelper.KeySignatureLookup = [[true, true, true, true, true, true, true, true, true, true, true, true], [true, true, true, true, true, false, true, true, true, true, true, true], [false, true, true, true, true, false, true, true, true, true, true, true], [false, true, true, true, true, false, false, false, true, true, true, true], [false, false, false, true, true, false, false, false, true, true, true, true], [false, false, false, true, true, false, false, false, false, false, true, true], [false, false, false, false, false, false, false, false, false, false, true, true], [false, false, false, false, false, false, false, false, false, false, false, false], [false, false, false, false, false, true, true, false, false, false, false, false], [true, true, false, false, false, true, true, false, false, false, false, false], [true, true, false, false, false, true, true, true, true, false, false, false], [true, true, true, true, false, true, true, true, true, false, false, false], [true, true, true, true, false, true, true, true, true, true, true, false], [true, true, true, true, true, true, true, true, true, true, true, false], [true, true, true, true, true, true, true, true, true, true, true, true]];
    AlphaTab.Rendering.Utils.AccidentalHelper.AccidentalNotes = [false, true, false, true, false, false, true, false, true, false, true, false];
    AlphaTab.Rendering.Utils.AccidentalHelper.StepsPerOctave = 7;
    AlphaTab.Rendering.Utils.AccidentalHelper.OctaveSteps = new Int32Array([40, 34, 32, 28, 40]);
    AlphaTab.Rendering.Utils.AccidentalHelper.SharpNoteSteps = new Int32Array([0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]);
    AlphaTab.Rendering.Utils.AccidentalHelper.FlatNoteSteps = new Int32Array([0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]);
});
AlphaTab.Rendering.Utils.BarHelpers = function (bar){
    this.BeamHelpers = null;
    this.BeamHelperLookup = null;
    this.TupletHelpers = null;
    this.BeamHelpers = [];
    this.BeamHelperLookup = [];
    this.TupletHelpers = [];
    var currentBeamHelper = null;
    var currentTupletHelper = null;
    if (bar != null){
        for (var i = 0,j = bar.Voices.length; i < j; i++){
            var v = bar.Voices[i];
            this.BeamHelpers.push([]);
            this.BeamHelperLookup.push({});
            this.TupletHelpers.push([]);
            for (var k = 0,l = v.Beats.length; k < l; k++){
                var b = v.Beats[k];
                var newBeamingHelper = false;
                // if a new beaming helper was started, we close our tuplet grouping as well
                if (!b.get_IsRest()){
                    // try to fit beam to current beamhelper
                    if (currentBeamHelper == null || !currentBeamHelper.CheckBeat(b)){
                        if (currentBeamHelper != null){
                            currentBeamHelper.Finish();
                        }
                        // if not possible, create the next beaming helper
                        currentBeamHelper = new AlphaTab.Rendering.Utils.BeamingHelper(bar.Staff.Track);
                        currentBeamHelper.CheckBeat(b);
                        this.BeamHelpers[v.Index].push(currentBeamHelper);
                        newBeamingHelper = true;
                    }
                }
                if (b.get_HasTuplet()){
                    // try to fit tuplet to current tuplethelper
                    // TODO: register tuplet overflow
                    var previousBeat = b.PreviousBeat;
                    // don't group if the previous beat isn't in the same voice
                    if (previousBeat != null && previousBeat.Voice != b.Voice)
                        previousBeat = null;
                    // if a new beaming helper was started, we close our tuplet grouping as well
                    if (newBeamingHelper && currentTupletHelper != null){
                        currentTupletHelper.Finish();
                    }
                    if (previousBeat == null || currentTupletHelper == null || !currentTupletHelper.Check(b)){
                        currentTupletHelper = new AlphaTab.Rendering.Utils.TupletHelper(v.Index);
                        currentTupletHelper.Check(b);
                        this.TupletHelpers[v.Index].push(currentTupletHelper);
                    }
                }
                this.BeamHelperLookup[v.Index][b.Index] = currentBeamHelper;
            }
            currentBeamHelper = null;
            currentTupletHelper = null;
        }
    }
};
AlphaTab.Rendering.Utils.BarHelpersGroup = function (){
    this.Helpers = null;
    this.Helpers = {};
};
AlphaTab.Rendering.Utils.BarHelpersGroup.prototype = {
    BuildHelpers: function (tracks, barIndex){
        for (var i = 0; i < tracks.length; i++){
            var t = tracks[i];
            var h;
            if (!this.Helpers.hasOwnProperty(t.Index)){
                h = [];
                for (var s = 0; s < t.Staves.length; s++){
                    h.push({});
                }
                this.Helpers[t.Index] = h;
            }
            else {
                h = this.Helpers[t.Index];
            }
            for (var s = 0; s < t.Staves.length; s++){
                if (!h[s].hasOwnProperty(barIndex)){
                    h[s][barIndex] = new AlphaTab.Rendering.Utils.BarHelpers(t.Staves[s].Bars[barIndex]);
                }
            }
        }
    }
};
AlphaTab.Rendering.Utils.BeamDirection = {
    Up: 0,
    Down: 1
};
AlphaTab.Rendering.Utils.BeamBarType = {
    Full: 0,
    PartLeft: 1,
    PartRight: 2
};
AlphaTab.Rendering.Utils.BeatLinePositions = function (up, down){
    this.Up = 0;
    this.Down = 0;
    this.Up = up;
    this.Down = down;
};
AlphaTab.Rendering.Utils.BeamingHelper = function (track){
    this._lastBeat = null;
    this._track = null;
    this._beatLineXPositions = null;
    this.Voice = null;
    this.Beats = null;
    this.MaxDuration = AlphaTab.Model.Duration.Whole;
    this.FingeringCount = 0;
    this.HasTuplet = false;
    this.FirstMinNote = null;
    this.FirstMaxNote = null;
    this.LastMinNote = null;
    this.LastMaxNote = null;
    this.MinNote = null;
    this.MaxNote = null;
    this.InvertBeamDirection = false;
    this.Direction = AlphaTab.Rendering.Utils.BeamDirection.Up;
    this._track = track;
    this.Beats = [];
    this._beatLineXPositions = {};
    this.MaxDuration = AlphaTab.Model.Duration.Whole;
};
AlphaTab.Rendering.Utils.BeamingHelper.prototype = {
    GetValue: function (n){
        if (this._track.IsPercussion){
            return AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay(n);
        }
        else {
            return n.get_RealValue();
        }
    },
    GetBeatLineX: function (beat){
        if (this.HasBeatLineX(beat)){
            if (this.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                return this._beatLineXPositions[beat.Index].Up;
            }
            return this._beatLineXPositions[beat.Index].Down;
        }
        return 0;
    },
    HasBeatLineX: function (beat){
        return this._beatLineXPositions.hasOwnProperty(beat.Index);
    },
    RegisterBeatLineX: function (beat, up, down){
        this._beatLineXPositions[beat.Index] = new AlphaTab.Rendering.Utils.BeatLinePositions(up, down);
    },
    Finish: function (){
        this.Direction = this.CalculateDirection();
    },
    CalculateDirection: function (){
        // multivoice handling
        if (this.Voice.Index > 0){
            return this.Invert(AlphaTab.Rendering.Utils.BeamDirection.Down);
        }
        if (this.Voice.Bar.Voices.length > 1){
            for (var v = 1; v < this.Voice.Bar.Voices.length; v++){
                if (!this.Voice.Bar.Voices[v].get_IsEmpty()){
                    return this.Invert(AlphaTab.Rendering.Utils.BeamDirection.Up);
                }
            }
        }
        if (this.Beats.length == 1 && this.Beats[0].Duration == AlphaTab.Model.Duration.Whole){
            return this.Invert(AlphaTab.Rendering.Utils.BeamDirection.Up);
        }
        // the average key is used for determination
        //      key lowerequal than middle line -> up
        //      key higher than middle line -> down
        var avg = ((this.GetValue(this.MaxNote) + this.GetValue(this.MinNote)) / 2) | 0;
        return this.Invert(avg <= AlphaTab.Rendering.Utils.BeamingHelper.ScoreMiddleKeys[this._lastBeat.Voice.Bar.Clef] ? AlphaTab.Rendering.Utils.BeamDirection.Up : AlphaTab.Rendering.Utils.BeamDirection.Down);
    },
    Invert: function (direction){
        if (!this.InvertBeamDirection)
            return direction;
        switch (direction){
            case AlphaTab.Rendering.Utils.BeamDirection.Down:
                return AlphaTab.Rendering.Utils.BeamDirection.Up;
            case AlphaTab.Rendering.Utils.BeamDirection.Up:
                return AlphaTab.Rendering.Utils.BeamDirection.Down;
        }
        return AlphaTab.Rendering.Utils.BeamDirection.Up;
    },
    CheckBeat: function (beat){
        if (beat.InvertBeamDirection){
            this.InvertBeamDirection = true;
        }
        if (this.Voice == null){
            this.Voice = beat.Voice;
        }
        // allow adding if there are no beats yet
        var add = false;
        if (this.Beats.length == 0){
            add = true;
        }
        else if (AlphaTab.Rendering.Utils.BeamingHelper.CanJoin(this._lastBeat, beat)){
            add = true;
        }
        if (add){
            this._lastBeat = beat;
            this.Beats.push(beat);
            if (beat.get_HasTuplet()){
                this.HasTuplet = true;
            }
            var fingeringCount = 0;
            for (var n = 0; n < beat.Notes.length; n++){
                var note = beat.Notes[n];
                if (note.LeftHandFinger != AlphaTab.Model.Fingers.Unknown || note.RightHandFinger != AlphaTab.Model.Fingers.Unknown){
                    fingeringCount++;
                }
            }
            if (fingeringCount > this.FingeringCount){
                this.FingeringCount = fingeringCount;
            }
            this.CheckNote(beat.get_MinNote());
            this.CheckNote(beat.get_MaxNote());
            if (this.MaxDuration < beat.Duration){
                this.MaxDuration = beat.Duration;
            }
            if (beat.get_HasTuplet()){
                this.HasTuplet = true;
            }
        }
        return add;
    },
    CheckNote: function (note){
        var value = this.GetValue(note);
        // detect the smallest note which is at the beginning of this group
        if (this.FirstMinNote == null || note.Beat.Start < this.FirstMinNote.Beat.Start){
            this.FirstMinNote = note;
        }
        else if (note.Beat.Start == this.FirstMinNote.Beat.Start){
            if (value < this.GetValue(this.FirstMinNote)){
                this.FirstMinNote = note;
            }
        }
        // detect the biggest note which is at the beginning of this group
        if (this.FirstMaxNote == null || note.Beat.Start < this.FirstMaxNote.Beat.Start){
            this.FirstMaxNote = note;
        }
        else if (note.Beat.Start == this.FirstMaxNote.Beat.Start){
            if (value > this.GetValue(this.FirstMaxNote)){
                this.FirstMaxNote = note;
            }
        }
        // detect the smallest note which is at the end of this group
        if (this.LastMinNote == null || note.Beat.Start > this.LastMinNote.Beat.Start){
            this.LastMinNote = note;
        }
        else if (note.Beat.Start == this.LastMinNote.Beat.Start){
            if (value < this.GetValue(this.LastMinNote)){
                this.LastMinNote = note;
            }
        }
        // detect the biggest note which is at the end of this group
        if (this.LastMaxNote == null || note.Beat.Start > this.LastMaxNote.Beat.Start){
            this.LastMaxNote = note;
        }
        else if (note.Beat.Start == this.LastMaxNote.Beat.Start){
            if (value > this.GetValue(this.LastMaxNote)){
                this.LastMaxNote = note;
            }
        }
        if (this.MaxNote == null || value > this.GetValue(this.MaxNote)){
            this.MaxNote = note;
        }
        if (this.MinNote == null || value < this.GetValue(this.MinNote)){
            this.MinNote = note;
        }
    },
    CalculateBeamY: function (stemSize, xCorrection, xPosition, scale, yPosition){
        // create a line between the min and max note of the group
        var direction = this.Direction;
        if (this.Beats.length == 1){
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                return yPosition(this.MaxNote) - stemSize;
            }
            return yPosition(this.MinNote) + stemSize;
        }
        // we use the min/max notes to place the beam along their real position        
        // we only want a maximum of 10 offset for their gradient
        var maxDistance = (10 * scale);
        // if the min note is not first or last, we can align notes directly to the position
        // of the min note
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down && this.MinNote != this.FirstMinNote && this.MinNote != this.LastMinNote){
            return yPosition(this.MinNote) + stemSize;
        }
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up && this.MaxNote != this.FirstMaxNote && this.MaxNote != this.LastMaxNote){
            return yPosition(this.MaxNote) - stemSize;
        }
        var startX = this.GetBeatLineX(this.FirstMinNote.Beat) + xCorrection;
        var startY = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? yPosition(this.FirstMaxNote) - stemSize : yPosition(this.FirstMinNote) + stemSize;
        var endX = this.GetBeatLineX(this.LastMaxNote.Beat) + xCorrection;
        var endY = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? yPosition(this.LastMaxNote) - stemSize : yPosition(this.LastMinNote) + stemSize;
        // ensure the maxDistance
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down && startY > endY && (startY - endY) > maxDistance)
            endY = (startY - maxDistance);
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down && endY > startY && (endY - startY) > maxDistance)
            startY = (endY - maxDistance);
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up && startY < endY && (endY - startY) > maxDistance)
            endY = (startY + maxDistance);
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up && endY < startY && (startY - endY) > maxDistance)
            startY = (endY + maxDistance);
        // get the y position of the given beat on this curve
        if (startX == endX)
            return startY;
        // y(x)  = ( (y2 - y1) / (x2 - x1) )  * (x - x1) + y1;
        return ((endY - startY) / (endX - startX)) * (xPosition - startX) + startY;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.BeamingHelper.ScoreMiddleKeys = new Int32Array([48, 48, 45, 38, 59]);
});
AlphaTab.Rendering.Utils.BeamingHelper.CanJoin = function (b1, b2){
    // is this a voice we can join with?
    if (b1 == null || b2 == null || b1.get_IsRest() || b2.get_IsRest() || b1.GraceType != AlphaTab.Model.GraceType.None || b2.GraceType != AlphaTab.Model.GraceType.None){
        return false;
    }
    var m1 = b1.Voice.Bar;
    var m2 = b1.Voice.Bar;
    // only join on same measure
    if (m1 != m2)
        return false;
    // get times of those voices and check if the times 
    // are in the same division
    var start1 = b1.Start;
    var start2 = b2.Start;
    // we can only join 8th, 16th, 32th and 64th voices
    if (!AlphaTab.Rendering.Utils.BeamingHelper.CanJoinDuration(b1.Duration) || !AlphaTab.Rendering.Utils.BeamingHelper.CanJoinDuration(b2.Duration)){
        return start1 == start2;
    }
    // TODO: create more rules for automatic beaming
    var divisionLength = 960;
    switch (m1.get_MasterBar().TimeSignatureDenominator){
        case 8:
            if (m1.get_MasterBar().TimeSignatureNumerator % 3 == 0){
            divisionLength += 480;
        }
            break;
    }
    // check if they are on the same division 
    var division1 = (((divisionLength + start1) / divisionLength) | 0) | 0;
    var division2 = (((divisionLength + start2) / divisionLength) | 0) | 0;
    return division1 == division2;
};
AlphaTab.Rendering.Utils.BeamingHelper.CanJoinDuration = function (d){
    switch (d){
        case AlphaTab.Model.Duration.Whole:
        case AlphaTab.Model.Duration.Half:
        case AlphaTab.Model.Duration.Quarter:
            return false;
        default:
            return true;
    }
};
AlphaTab.Rendering.Utils.StaveGroupBounds = function (){
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Bars = null;
    this.BoundsLookup = null;
    this.Bars = [];
};
AlphaTab.Rendering.Utils.StaveGroupBounds.prototype = {
    Finish: function (){
        for (var i = 0; i < this.Bars.length; i++){
            this.Bars[i].Finish();
        }
    },
    AddBar: function (bounds){
        bounds.StaveGroupBounds = this;
        this.Bars.push(bounds);
    },
    FindBarAtPos: function (x){
        var b = null;
        // move from left to right as long we find bars that start before the clicked position
        for (var i = 0; i < this.Bars.length; i++){
            if (b == null || this.Bars[i].RealBounds.X < x){
                b = this.Bars[i];
            }
            else if (x > this.Bars[i].RealBounds.X + this.Bars[i].RealBounds.W){
                break;
            }
        }
        return b;
    }
};
AlphaTab.Rendering.Utils.MasterBarBounds = function (){
    this.IsFirstOfLine = false;
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Bars = null;
    this.StaveGroupBounds = null;
    this.Bars = [];
};
AlphaTab.Rendering.Utils.MasterBarBounds.prototype = {
    AddBar: function (bounds){
        bounds.MasterBarBounds = this;
        this.Bars.push(bounds);
    },
    FindBeatAtPos: function (x, y){
        var beat = null;
        for (var i = 0; i < this.Bars.length; i++){
            var b = this.Bars[i].FindBeatAtPos(x);
            if (b != null && (beat == null || beat.RealBounds.X < b.RealBounds.X)){
                beat = b;
            }
        }
        return beat == null ? null : beat.Beat;
    },
    Finish: function (){
        this.Bars.sort($CreateAnonymousDelegate(this, function (a, b){
    if (a.RealBounds.Y < b.RealBounds.Y){
        return -1;
    }
    if (a.RealBounds.Y > b.RealBounds.Y){
        return 1;
    }
    if (a.RealBounds.X < b.RealBounds.X){
        return -1;
    }
    if (a.RealBounds.X > b.RealBounds.X){
        return 1;
    }
    return 0;
}));
    },
    AddBeat: function (bounds){
        this.StaveGroupBounds.BoundsLookup.AddBeat(bounds);
    }
};
AlphaTab.Rendering.Utils.BarBounds = function (){
    this.MasterBarBounds = null;
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Bar = null;
    this.Beats = null;
    this.Beats = [];
};
AlphaTab.Rendering.Utils.BarBounds.prototype = {
    AddBeat: function (bounds){
        bounds.BarBounds = this;
        this.Beats.push(bounds);
        this.MasterBarBounds.AddBeat(bounds);
    },
    FindBeatAtPos: function (x){
        var beat = null;
        for (var i = 0; i < this.Beats.length; i++){
            if (beat == null || this.Beats[i].RealBounds.X < x){
                beat = this.Beats[i];
            }
            else if (this.Beats[i].RealBounds.X > x){
                break;
            }
        }
        return beat;
    }
};
AlphaTab.Rendering.Utils.BeatBounds = function (){
    this.BarBounds = null;
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Beat = null;
};
AlphaTab.Rendering.Utils.PercussionMapper = function (){
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.PercussionMapper.ElementVariationToMidi = [new Int32Array([35, 35, 35]), new Int32Array([38, 38, 37]), new Int32Array([56, 56, 56]), new Int32Array([56, 56, 56]), new Int32Array([56, 56, 56]), new Int32Array([41, 41, 41]), new Int32Array([43, 43, 43]), new Int32Array([45, 45, 45]), new Int32Array([47, 47, 47]), new Int32Array([48, 48, 48]), new Int32Array([42, 46, 46]), new Int32Array([44, 44, 44]), new Int32Array([49, 49, 49]), new Int32Array([57, 57, 57]), new Int32Array([55, 55, 55]), new Int32Array([51, 59, 53]), new Int32Array([52, 52, 52])];
});
AlphaTab.Rendering.Utils.PercussionMapper.MidiFromElementVariation = function (note){
    return AlphaTab.Rendering.Utils.PercussionMapper.ElementVariationToMidi[note.Element][note.Variation];
};
AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay = function (note){
    var value = note.get_RealValue();
    if (value == 61 || value == 66){
        return 50;
    }
    else if (value == 60 || value == 65){
        return 52;
    }
    else if ((value >= 35 && value <= 36) || value == 44){
        return 53;
    }
    else if (value == 41 || value == 64){
        return 55;
    }
    else if (value == 43 || value == 62){
        return 57;
    }
    else if (value == 45 || value == 63){
        return 59;
    }
    else if (value == 47 || value == 54){
        return 62;
    }
    else if (value == 48 || value == 56){
        return 64;
    }
    else if (value == 50){
        return 65;
    }
    else if (value == 42 || value == 46 || (value >= 49 && value <= 53) || value == 57 || value == 59){
        return 67;
    }
    return 60;
};
AlphaTab.Rendering.Utils.SvgPathParser = function (svg){
    this._currentIndex = 0;
    this.Svg = null;
    this.LastCommand = null;
    this.CurrentToken = null;
    this.Svg = svg;
};
AlphaTab.Rendering.Utils.SvgPathParser.prototype = {
    Reset: function (){
        this._currentIndex = 0;
        this.NextToken();
    },
    get_Eof: function (){
        return this._currentIndex >= this.Svg.length;
    },
    GetString: function (){
        var t = this.CurrentToken;
        this.NextToken();
        return t;
    },
    GetNumber: function (){
        return AlphaTab.Platform.Std.ParseFloat(this.GetString());
    },
    get_CurrentTokenIsNumber: function (){
        return AlphaTab.Platform.Std.IsStringNumber(this.CurrentToken, true);
    },
    NextChar: function (){
        if (this.get_Eof())
            return 0;
        return this.Svg.charCodeAt(this._currentIndex++);
    },
    PeekChar: function (){
        if (this.get_Eof())
            return 0;
        return this.Svg.charCodeAt(this._currentIndex);
    },
    NextToken: function (){
        var token = new Array();
        var c;
        var skipChar;
        // skip leading spaces and separators
        do{
            c = this.NextChar();
            skipChar = AlphaTab.Platform.Std.IsWhiteSpace(c) || c == 32;
        }
        while (!this.get_Eof() && skipChar)
        // read token itself 
        if (!this.get_Eof() || !skipChar){
            token.push(String.fromCharCode(c));
            if (AlphaTab.Platform.Std.IsCharNumber(c, true)){
                c = this.PeekChar();
                // get first upcoming character
                while (!this.get_Eof() && (AlphaTab.Platform.Std.IsCharNumber(c, false) || c == 46)){
                    token.push(String.fromCharCode(this.NextChar()));
                    // peek next character for check
                    c = this.PeekChar();
                }
            }
            else {
                this.LastCommand = token.join('');
            }
        }
        this.CurrentToken = token.join('');
    }
};
AlphaTab.Rendering.Utils.SvgRenderer = function (svg, xScale, yScale){
    this._svg = null;
    this._lastCmd = null;
    this._currentX = 0;
    this._currentY = 0;
    this._xScale = 0;
    this._yScale = 0;
    this._xGlyphScale = 0;
    this._yGlyphScale = 0;
    this._lastControlX = 0;
    this._lastControlY = 0;
    this._svg = svg;
    this._xGlyphScale = xScale * 0.0099;
    this._yGlyphScale = yScale * 0.0099;
};
AlphaTab.Rendering.Utils.SvgRenderer.prototype = {
    Paint: function (x, y, canvas){
        if (this._svg == null)
            return;
        this._xScale = this._xGlyphScale;
        this._yScale = this._yGlyphScale;
        var startX = x;
        var startY = y;
        this._currentX = startX;
        this._currentY = startY;
        canvas.BeginPath();
        for (var i = 0,j = this._svg.get_Commands().length; i < j; i++){
            this.ParseCommand(startX, startY, canvas, this._svg.get_Commands()[i]);
        }
        canvas.Fill();
    },
    ParseCommand: function (cx, cy, canvas, cmd){
        var canContinue;
        // reusable flag for shorthand curves
        var i;
        switch (cmd.Cmd){
            case "M":
                this._currentX = (cx + cmd.Numbers[0] * this._xScale);
                this._currentY = (cy + cmd.Numbers[1] * this._yScale);
                canvas.MoveTo(this._currentX, this._currentY);
                break;
            case "m":
                this._currentX += (cmd.Numbers[0] * this._xScale);
                this._currentY += (cmd.Numbers[1] * this._yScale);
                canvas.MoveTo(this._currentX, this._currentY);
                break;
            case "Z":
            case "z":
                canvas.ClosePath();
                break;
            case "L":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX = (cx + cmd.Numbers[i++] * this._xScale);
                this._currentY = (cy + cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "l":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX += (cmd.Numbers[i++] * this._xScale);
                this._currentY += (cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "V":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentY = (cy + cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "v":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentY += (cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "H":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX = (cx + cmd.Numbers[i++] * this._xScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "h":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX += (cmd.Numbers[i++] * this._xScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "C":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                var x2 = (cx + cmd.Numbers[i++] * this._xScale);
                var y2 = (cy + cmd.Numbers[i++] * this._yScale);
                var x3 = (cx + cmd.Numbers[i++] * this._xScale);
                var y3 = (cy + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "c":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                var x2 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y2 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                var x3 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y3 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "S":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "c" || this._lastCmd == "C" || this._lastCmd == "S" || this._lastCmd == "s";
                var x2 = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var y2 = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                var x3 = (cx + cmd.Numbers[i++] * this._xScale);
                var y3 = (cy + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "s":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "c" || this._lastCmd == "C" || this._lastCmd == "S" || this._lastCmd == "s";
                var x2 = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var y2 = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                var x3 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y3 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "Q":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                var x2 = (cx + cmd.Numbers[i++] * this._xScale);
                var y2 = (cy + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x1;
                this._lastControlY = y1;
                this._currentX = x2;
                this._currentY = y2;
                canvas.QuadraticCurveTo(x1, y1, x2, y2);
            }
                break;
            case "q":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                var x2 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y2 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x1;
                this._lastControlY = y1;
                this._currentX = x2;
                this._currentY = y2;
                canvas.QuadraticCurveTo(x1, y1, x2, y2);
            }
                break;
            case "T":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "q" || this._lastCmd == "Q" || this._lastCmd == "t" || this._lastCmd == "T";
                var cpx = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var cpy = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                this._currentX = x1;
                this._currentY = y1;
                this._lastControlX = cpx;
                this._lastControlY = cpy;
                canvas.QuadraticCurveTo(cpx, cpy, x1, y1);
            }
                break;
            case "t":
                i = 0;
                while (i < cmd.Numbers.length){
                // TODO: buggy/incomplete
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "q" || this._lastCmd == "Q" || this._lastCmd == "t" || this._lastCmd == "T";
                var cpx = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var cpy = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                this._lastControlX = cpx;
                this._lastControlY = cpy;
                canvas.QuadraticCurveTo(cpx, cpy, x1, y1);
            }
                break;
        }
        this._lastCmd = cmd.Cmd;
    }
};
AlphaTab.Rendering.Utils.TupletHelper = function (voice){
    this._isFinished = false;
    this.Beats = null;
    this.VoiceIndex = 0;
    this.Tuplet = 0;
    this.VoiceIndex = voice;
    this.Beats = [];
};
AlphaTab.Rendering.Utils.TupletHelper.prototype = {
    get_IsFull: function (){
        return this.Beats.length == this.Tuplet;
    },
    Finish: function (){
        this._isFinished = true;
    },
    Check: function (beat){
        if (this.Beats.length == 0){
            this.Tuplet = beat.TupletNumerator;
        }
        else if (beat.Voice.Index != this.VoiceIndex || beat.TupletNumerator != this.Tuplet || this.get_IsFull() || this._isFinished){
            return false;
        }
        this.Beats.push(beat);
        return true;
    }
};
AlphaTab.LayoutSettings = function (){
    this.Mode = null;
    this.AdditionalSettings = null;
    this.AdditionalSettings = {};
};
AlphaTab.LayoutSettings.prototype = {
    Get: function (key, def){
        if (this.AdditionalSettings.hasOwnProperty(key)){
            return (this.AdditionalSettings[key]);
        }
        return def;
    }
};
AlphaTab.LayoutSettings.get_Defaults = function (){
    var settings = new AlphaTab.LayoutSettings();
    settings.Mode = "page";
    return settings;
};
AlphaTab.StaveSettings = function (id){
    this.Id = null;
    this.AdditionalSettings = null;
    this.Id = id;
    this.AdditionalSettings = {};
};
AlphaTab.Util = AlphaTab.Util || {};
AlphaTab.Util.Lazy = function (factory){
    this._factory = null;
    this._created = false;
    this._value = null;
    this._factory = factory;
};
AlphaTab.Util.Lazy.prototype = {
    get_Value: function (){
        if (!this._created){
            this._value = this._factory();
            this._created = true;
        }
        return this._value;
    }
};
AlphaTab.Xml = AlphaTab.Xml || {};
AlphaTab.Xml.XmlNodeType = {
    None: 0,
    Element: 1,
    Attribute: 2,
    Text: 3,
    CDATA: 4,
    EntityReference: 5,
    Entity: 6,
    ProcessingInstruction: 7,
    Comment: 8,
    Document: 9,
    DocumentType: 10,
    DocumentFragment: 11,
    Notation: 12,
    Whitespace: 13,
    SignificantWhitespace: 14,
    EndElement: 15,
    EndEntity: 16,
    XmlDeclaration: 17
};
AlphaTab.Rendering.Glyphs.TripletFeelGlyph = AlphaTab.Rendering.Glyphs.TripletFeelGlyph || {};
AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType = {
    Full: 0,
    PartialLeft: 1,
    PartialRight: 2
};

for(var i = 0; i < $StaticConstructors.length; i++) {
    $StaticConstructors[i]();
}


