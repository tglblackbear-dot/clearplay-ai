from app.services.subtitle_analyzer import analyze_subtitles
from app.services.subtitle_parser import parse_subtitles

SRT = """1
00:00:01,000 --> 00:00:03,500
Bom dia, como vai?

2
00:00:04,000 --> 00:00:06,000
[gemidos]

3
00:00:06,200 --> 00:00:08,000
Ele se aproximou devagar.

"""

VTT = """WEBVTT

00:01.000 --> 00:03.000
We need to talk.

00:04.000 --> 00:06.000
[gunshot]
"""


def test_parse_srt():
    cues = parse_subtitles(SRT)
    assert len(cues) == 3
    assert cues[0].start_ms == 1000
    assert cues[0].end_ms == 3500
    assert cues[1].text == "[gemidos]"


def test_parse_vtt():
    cues = parse_subtitles(VTT)
    assert len(cues) == 2
    assert cues[0].start_ms == 1000
    assert cues[1].end_ms == 6000


def test_single_keyword_is_not_enough():
    cues = parse_subtitles("1\n00:00:00,000 --> 00:00:02,000\nmerda\n")
    assert analyze_subtitles(cues) == []


def test_sound_cue_creates_candidate():
    cues = parse_subtitles(SRT)
    result = analyze_subtitles(cues)
    assert any(c["category"] == "sex" for c in result)
    assert all(c["start_ms"] < c["end_ms"] for c in result)
