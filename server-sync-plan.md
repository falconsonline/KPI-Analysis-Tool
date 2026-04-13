# Server-Sync-Support Enhancement Plan

## Overview
Implement a high-performance modular system with separated data collection and web serving services. The Data Collector Daemon rapidly polls KPI files (configurable, default 5 mins), processes data with optimized parsing, monitors for KPI breaches (HWM/LWM alerts), and maintains a shared data store. The Web Server provides instant real-time graph updates and alert notifications via WebSocket. Focus on fast processing, efficient data handling, real-time UI updates, fault isolation, security, and RHEL 7-9 compatibility. All parameters are fully configurable with no hard-coded values.

## Architecture Overview
- **Data Collector Daemon:** High-performance background process that polls KPI files at configurable intervals (default 5 mins), handles rotations with minimal latency, processes data using optimized parsing algorithms, monitors KPI thresholds for HWM/LWM alerts, and updates shared data store with generated graphs and alerts
- **Web Server:** Lightweight HTTP server that serves the KPI-Analysis-Tool UI with instant access to current graph data from shared store, provides real-time WebSocket updates for live graph refreshes and alert notifications
- **Shared Data Store:** Pure file-based storage using JSON files (no external databases or third-party dependencies) for processed KPI data, graph definitions, alerts, and metadata. Uses file locking for concurrent access safety.

## Performance Priorities
- **Fast Processing:** Sub-second poll cycles, optimized CSV parsing, incremental graph updates, real-time alert detection
- **Real-Time Updates:** WebSocket push notifications for UI updates and alerts within seconds of data collection
- **Efficient Data Handling:** Memory-efficient processing, configurable data windows, automatic cleanup
- **Scalable Graph Generation:** Incremental chart updates without full rebuilds, pan/zoom support with background data refresh

## Shared Data Store Details
- **Technology:** Standard JSON files with Python's built-in `json` module and `fcntl`/`msvcrt` for file locking (cross-platform)
- **No Dependencies:** Uses only Python standard library - no SQLite, no external DB licenses
- **Structure:**
  - `metadata.json` - Instance metadata, last update timestamps, configuration checksums
  - `kpi_data.json` - Processed KPI data points with timestamps, values, hostname, instance name
  - `graph_definitions.json` - Chart.js configuration objects for each graph
  - `alerts.json` - Active and historical alerts with HWM/LWM breach details
  - `archive_index.json` - Index of archived data files
- **Concurrency:** File locking ensures safe reads/writes between collector and web server
- **Change Detection:** Timestamp-based versioning in metadata.json for instant web server update detection
- **Size Management:** Automatic cleanup of old data and alerts based on configurable retention window
- **Backup:** Simple file copy operations for snapshots

## Modular Components
1. **Configuration Manager:** Loads and validates all configurable parameters (polling intervals default 5 mins, retention periods, instance names, hostnames, data window duration, HWM/LWM thresholds per KPI) from daemon_config.json, MasterConfig.json, and server settings - no hard-coded values
2. **File Poller:** High-speed local/remote file access, rotation detection, compression support with configurable paths and intervals
3. **Data Processor:** Optimized KPI data parsing, MasterConfig rules application, configurable rolling window management, hostname/instance metadata inclusion
4. **Alert Monitor:** Real-time KPI threshold monitoring for HWM/LWM breaches, configurable alert rules per KPI/instance, alert generation and storage
5. **Graph Generator:** Fast incremental chart creation/updates with pan/zoom enabled, background refresh support during user interaction
6. **Data Store Manager:** High-performance read/write operations to shared JSON files with minimal locking overhead, instance-specific data and alert storage
7. **Web Interface:** Serves HTML/JS with pan/zoom controls, instant WebSocket real-time updates and alert notifications
8. **Monitoring & Logging:** Tracks health, performance metrics, and alerts with configurable logging levels

## Implementation Steps
1. Create optimized shared data store schema (JSON file structures for fast KPI data access, graph definitions, and alerts)
2. Implement high-performance Data Collector Daemon as separate Python script with systemd service
3. Add optimized file polling module with rotation detection, remote file support, and configurable intervals (default 5 mins)
4. Implement fast data processing pipeline with MasterConfig integration and instance metadata handling
5. Create alert monitoring system with configurable HWM/LWM thresholds per KPI and instance
6. Create efficient graph generation module with incremental updates, pan/zoom support, and background refresh
7. Develop lightweight Web Server with instant data store access, real-time WebSocket updates, and alert notifications
8. Add WebSocket support for immediate UI updates and alert pushes triggered by data store changes
9. Implement configurable archiving mechanism for periodic exports (default nightly, configurable duration)
10. Add security measures: path validation, secure remote access, input sanitization
11. Optimize for maximum performance: efficient parsing algorithms, memory management, <1s execution per poll cycle
12. Add monitoring endpoints and structured logging
13. Ensure RHEL compatibility and systemd integration
14. Create installation and configuration scripts with validation

## Relevant Files
- New: `collector_daemon.py` — High-performance data collection, processing, and alert monitoring daemon
- New: `web_server.py` — Lightweight web interface server with real-time updates and alerts
- New: `data_store.py` — Optimized shared JSON storage management with file locking
- New: `alert_monitor.py` — KPI threshold monitoring and alert generation module
- `MasterConfig.json` — App-specific parsing rules and KPI definitions
- New: `daemon_config.json` — Per-application KPI file configurations (includes instance names, hostnames, polling intervals default 5 mins, HWM/LWM thresholds)
- `config.json` — Server and daemon settings (includes data retention window, archive intervals, alert settings)
- `KPI-Analysis-Tool-debug.html` — Updated for instant real-time viewing with pan/zoom, background updates, and alert display
- New: `shared_data/` — Directory for JSON data store files
- New: `archive/` — Directory for configurable periodic exports

## Verification Steps
1. Test separated services startup/shutdown independently
2. Verify data store integrity during concurrent access
3. Confirm file rotation handling and data continuity
4. Measure collector performance (<1s per poll cycle, configurable 5 min intervals)
5. Validate instant web server real-time updates and alert notifications from data store changes
6. Test HWM/LWM alert generation and display for various KPI breaches
7. Test archiving with configurable durations
8. Verify multi-instance support with hostname/instance labels in graphs and alerts
9. Test pan/zoom functionality with seamless background data updates
10. Security audit for file access and network vulnerabilities
11. Load test with multiple applications and instances
12. Verify RHEL 7-9 compatibility and systemd management
13. Confirm all parameters are configurable without code changes

## Key Decisions
- Separate services for fault isolation and scalability
- Pure JSON file-based shared store (no external DB dependencies)
- File locking for concurrency control using Python standard library
- WebSocket for instant UI updates and alert notifications triggered by data store changes
- systemd for service management on RHEL
- JSON for data store format (human-readable, easy backup)
- Incremental graph updates for maximum performance
- Instance metadata (hostname + instance name) included in all data processing and alerts
- Fully configurable system with no hard-coded defaults, polling default 5 mins
- Performance-first design: optimized parsing, fast updates, real-time UI and alerts
- Alert system: Configurable HWM/LWM thresholds per KPI, real-time monitoring and notification

## Further Considerations
1. Remote authentication: SSH keys or API tokens for secure access
2. Compression handling: Efficient gzip support for rotated files
3. Error recovery: Automatic retries and alert notifications
4. Scalability: Design for 10-20 applications with varying rates
5. Backup strategy: Periodic snapshots of data store
6. Configuration validation: Schema-based validation for all config files
7. Alert persistence: Configurable alert history retention
8. Alert actions: Support for email notifications or external system integration (future enhancement)

## Change Log
- Initial plan created: April 8, 2026
- Added separated services architecture
- Incorporated full configurability
- Added multi-instance support with hostname/instance labels
- Included HWM/LWM alert system
- Emphasized performance and real-time updates
