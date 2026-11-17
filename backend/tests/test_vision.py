from app.services.video_analyzer import refine_boundaries


def test_refine_boundaries_uses_nearby_cut():
    start, end = refine_boundaries(1000, 5000, [1200, 4800], margin_ms=200)
    assert start == 1000
    assert end == 5000


def test_refine_boundaries_without_cuts():
    assert refine_boundaries(1000, 5000, []) == (1000, 5000)
