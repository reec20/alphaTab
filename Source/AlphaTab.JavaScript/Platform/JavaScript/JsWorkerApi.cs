﻿using System;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    public class JsWorkerApi : JsApiBase
    {
        public JsWorkerApi(HtmlElement element, object options)
            : base(element, options)
        {
        }

        protected override IScoreRenderer CreateScoreRenderer(Settings settings)
        {
            var renderer = new WorkerScoreRenderer(settings);
            renderer.ScoreLoaded += score =>
            {
                ScoreLoaded(score, false);
            };
            renderer.PostRenderFinished += () =>
            {
                Element.className = Element.className.replace(" loading", "")
                                            .replace(" rendering", "");
            };
            return renderer;
        }

        public override void Load(object data)
        {
            Element.className += " loading";

            if (JsTypeOf(data) == JsTypes.@string)
            {
                var fileLoader = new JsFileLoader();
                fileLoader.LoadBinaryAsync((string)data, b =>
                {
                    Renderer.As<WorkerScoreRenderer>().Load(b, TrackIndexes);
                }, e =>
                {
                    console.error(e);
                });
            }
            else
            {
                Renderer.As<WorkerScoreRenderer>().Load(data, TrackIndexes);
            }
        }

        public override void Render()
        {
            if (Renderer != null)
            {
                Element.className += " rendering";
                Renderer.As<WorkerScoreRenderer>().RenderMultiple(TrackIndexes);
            }
        }

        public override void Tex(string contents)
        {
            Element.className += " loading";
            Renderer.As<WorkerScoreRenderer>().Tex(contents);
        }
    }

    public class JsWorker
    {
        private readonly ScoreRenderer _renderer;
        private SharpKit.Html.workers.WorkerContext _main;
        private int[] _trackIndexes;

        public Score Score { get; set; }

        public Track[] Tracks
        {
            get
            {
                var tracks = new FastList<Track>();

                foreach (var track in _trackIndexes)
                {
                    if (track >= 0 && track < Score.Tracks.Count)
                    {
                        tracks.Add(Score.Tracks[track]);
                    }
                }

                if (tracks.Count == 0 && Score.Tracks.Count > 0)
                {
                    tracks.Add(Score.Tracks[0]);
                }

                return tracks.ToArray();
            }
        }

        public JsWorker(SharpKit.Html.workers.WorkerContext main, object options)
        {
            _main = main;
            _main.addEventListener("message", HandleMessage, false);
            Settings settings = Settings.FromJson(options);
            _renderer = new ScoreRenderer(settings);
            _renderer.PartialRenderFinished += result => PostMessage(new { cmd = "partialRenderFinished", result = result });
            _renderer.RenderFinished += result => PostMessage(new { cmd = "renderFinished", result = result });
            _renderer.PostRenderFinished += () => PostMessage(new { cmd = "postRenderFinished", boundsLookup = _renderer.BoundsLookup.ToJson() });
            _renderer.PreRender += result => PostMessage(new { cmd = "preRender", result = result  });
        }

        private void HandleMessage(DOMEvent e)
        {
            var data = e.As<MessageEvent>().data;
            var cmd = data.Member("cmd").As<string>();
            switch (cmd)
            {
                case "load":
                    Load(data.Member("data"), data.Member("indexes").As<int[]>());
                    break;
                case "invalidate":
                    _renderer.Invalidate();
                    break;
                case "resize":
                    _renderer.Resize(data.Member("width").As<int>());
                    break;
                case "tex":
                    Tex(data.Member("data").As<string>());
                    break;
                case "renderMultiple":
                    RenderMultiple(data.Member("data").As<int[]>());
                    break;
                case "updateSettings":
                    UpdateSettings(data.Member("settings"));
                    break;
            }
        }

        private void UpdateSettings(object settings)
        {
            _renderer.UpdateSettings(Settings.FromJson(settings));
        }

        private void RenderMultiple(int[] trackIndexes)
        {
            _trackIndexes = trackIndexes;
            Render();
        }

        private void Tex(string contents)
        {
            try
            {
                var parser = new AlphaTexImporter();
                var data = ByteBuffer.FromBuffer(Std.StringToByteArray(contents));
                parser.Init(data);
                _trackIndexes = new[] { 0 };
                ScoreLoaded(parser.ReadScore());
            }
            catch (Exception e)
            {
                Error(e);
            }
        }

        private void Load(object data, int[] trackIndexes)
        {
            try
            {
                _trackIndexes = trackIndexes;
                if (Std.InstanceOf<ArrayBuffer>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes(Std.ArrayBufferToByteArray((ArrayBuffer)data)));
                }
                else if (Std.InstanceOf<Uint8Array>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes((byte[])data));
                }
                else if (JsContext.JsTypeOf(data) == JsTypes.@string)
                {
                    ScoreLoader.LoadScoreAsync((string)data, ScoreLoaded, Error);
                }
            }
            catch (Exception e)
            {
                Error(e);
            }
        }

        private void Error(Exception e)
        {
            PostMessage(new { cmd = "error", exception = e });
        }

        private void ScoreLoaded(Score score)
        {
            Score = score;
            var json = new JsonConverter();
            PostMessage(new { cmd = "loaded", score = json.ScoreToJsObject(score) });
            Render();
        }

        private void Render()
        {
            _renderer.RenderMultiple(Tracks);
        }

        [JsMethod(Export = false, InlineCodeExpression = "this._main.postMessage(o)")]
        private void PostMessage(object o)
        {
        }
    }
}