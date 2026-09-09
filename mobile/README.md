# Nomi Mobile

Native iOS and Android client for Nomi.

See `../docs/MOBILE_NATIVE_FOUNDATION.md` for the product, architecture, interaction, and milestone contract.

## Bootstrap target

This directory will host an Expo + React Native + TypeScript application with Expo Router, Supabase, and Rive.

The initial implementation must preserve the existing web product and adaptive-learning engine. Do not copy adaptive rules into screen components.

## Primary routes

- Home
- Learn
- Nomi
- Practice
- Progress

## First functioning curriculum slice

Mathematics → Factorisation.

## Companion principle

UI code should communicate semantic Nomi states (`idle`, `curious`, `thinking`, `encouraging`, `supportive`, `challenge`, `reinforcing`, `celebrating`) rather than hard-coding animation timelines. Rive will own the final motion implementation.
