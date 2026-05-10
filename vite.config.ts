import { defineConfig, type Plugin } from 'vite';
import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

// ────────────────────────────────────────────