# Story 2.2: ScannerService Implementation

**Status**: Done
**Epic**: Epic 2 — Core Services
**Estimate**: 5h
**Priority**: Critical

## User Story

As a user, I want my ROM directories scanned automatically so that new games appear in my library without manual entry.

## Acceptance Criteria

- [x] `IScannerService` interface defined
- [x] `addDirectory(path, options?)` — registers directory for scanning
- [x] `removeDirectory(path)` — unregisters directory
- [x] `getDirectories()` — lists registered directories
- [x] `scanDirectory(path)` — async generator yielding `ScanProgress`
- [x] `scanAllDirectories()` — scans all registered directories
- [x] `cancelScan()` — gracefully stops in-progress scan
- [x] Platform detection by file extension (`libs/core/src/utils/fileExtensions.ts`)
- [x] MD5/CRC32 hash calculation (`libs/core/src/utils/hash.ts`)
- [x] Unit tests: `libs/core/src/__tests__/ScannerService.test.ts`

## Technical Notes

- **Architecture ref**: ADR-005 (filesystem via platform adapter)
- **Dependencies**: Story 2.1
- **PRD ref**: US-1.1
- **Constraint**: All file reads through `FilesystemAdapter`, never direct `fs`
- **Performance**: < 5 seconds for 1000 ROMs (NFR-1)
