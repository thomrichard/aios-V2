#!/bin/sh
# Crée .claude/skills et .agents/skills, deux liens vers skills/ (Mac / Linux).
# Sous Windows : mklink /J .claude\skills skills  puis  mklink /J .agents\skills skills
cd "$(dirname "$0")/../.." || exit 1
mkdir -p .claude .agents
[ -e .claude/skills ] || ln -s ../skills .claude/skills
[ -e .agents/skills ] || ln -s ../skills .agents/skills
echo "Liens en place : .claude/skills et .agents/skills pointent vers skills/"
