"""
Unit tests for the comparison service.
"""

import pytest
from app.services.comparison_service import normalize_skill, compare_skills


class TestNormalizeSkill:
    """Test skill normalization and alias resolution."""

    def test_lowercase(self):
        assert normalize_skill("React") == "react"

    def test_strip_whitespace(self):
        assert normalize_skill("  TypeScript  ") == "typescript"

    def test_alias_js(self):
        assert normalize_skill("JS") == "javascript"

    def test_alias_reactjs(self):
        assert normalize_skill("ReactJS") == "react"

    def test_alias_react_dot_js(self):
        assert normalize_skill("React.js") == "react"

    def test_alias_nodejs(self):
        assert normalize_skill("NodeJS") == "node.js"

    def test_alias_node_dot_js(self):
        assert normalize_skill("Node.js") == "node.js"

    def test_alias_ts(self):
        assert normalize_skill("TS") == "typescript"

    def test_alias_postgres(self):
        assert normalize_skill("Postgres") == "postgresql"

    def test_alias_k8s(self):
        assert normalize_skill("K8s") == "kubernetes"

    def test_alias_aws(self):
        assert normalize_skill("Amazon Web Services") == "aws"

    def test_no_alias_passthrough(self):
        assert normalize_skill("Docker") == "docker"

    def test_csharp(self):
        assert normalize_skill("C#") == "csharp"

    def test_dotnet(self):
        assert normalize_skill(".NET") == ".net"


class TestCompareSkills:
    """Test skill comparison logic."""

    def test_basic_match(self):
        resume = ["React", "JavaScript", "TypeScript", "Redux", "HTML", "CSS"]
        jd = ["React", "TypeScript", "Redux", "AWS", "Docker"]
        result = compare_skills(resume, jd)

        assert set(result.matched_skills) == {"React", "TypeScript", "Redux"}
        assert set(result.missing_skills) == {"AWS", "Docker"}
        assert result.match_percentage == 60.0

    def test_perfect_match(self):
        skills = ["Python", "FastAPI", "Docker"]
        result = compare_skills(skills, skills)

        assert len(result.matched_skills) == 3
        assert len(result.missing_skills) == 0
        assert result.match_percentage == 100.0

    def test_no_match(self):
        resume = ["React", "JavaScript"]
        jd = ["Python", "Django"]
        result = compare_skills(resume, jd)

        assert len(result.matched_skills) == 0
        assert len(result.missing_skills) == 2
        assert result.match_percentage == 0.0

    def test_alias_matching(self):
        resume = ["ReactJS", "JS", "TS"]
        jd = ["React", "JavaScript", "TypeScript"]
        result = compare_skills(resume, jd)

        assert result.match_percentage == 100.0
        assert len(result.missing_skills) == 0

    def test_empty_jd(self):
        resume = ["Python", "Django"]
        jd: list[str] = []
        result = compare_skills(resume, jd)

        assert result.match_percentage == 100.0
        assert len(result.missing_skills) == 0

    def test_empty_resume(self):
        resume: list[str] = []
        jd = ["Python", "Django"]
        result = compare_skills(resume, jd)

        assert result.match_percentage == 0.0
        assert len(result.missing_skills) == 2

    def test_case_insensitive(self):
        resume = ["react", "TYPESCRIPT"]
        jd = ["React", "TypeScript"]
        result = compare_skills(resume, jd)

        assert result.match_percentage == 100.0

    def test_percentage_rounding(self):
        resume = ["A"]
        jd = ["A", "B", "C"]
        result = compare_skills(resume, jd)

        assert result.match_percentage == 33.3
