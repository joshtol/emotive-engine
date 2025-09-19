/**
 * Test Runner
 * Core test execution framework for the Emotive Engine
 */

class TestRunner {
    constructor() {
        this.tests = new Map();
        this.results = new Map();
        this.currentCategory = null;
        this.startTime = 0;
        this.totalTime = 0;

        // Test statistics
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            time: 0
        };

        // Engine instance for testing
        this.engine = null;

        // Bind methods
        this.runAll = this.runAll.bind(this);
        this.runCategory = this.runCategory.bind(this);
        this.clearLog = this.clearLog.bind(this);
    }

    /**
     * Register a test
     */
    registerTest(category, name, testFn, options = {}) {
        if (!this.tests.has(category)) {
            this.tests.set(category, new Map());
        }

        this.tests.get(category).set(name, {
            name,
            fn: testFn,
            timeout: options.timeout || 5000,
            skip: options.skip || false,
            only: options.only || false
        });
    }

    /**
     * Run all tests
     */
    async runAll() {
        this.clearResults();
        this.log('info', '🚀 Running all tests...');
        this.startTime = performance.now();

        for (const category of this.tests.keys()) {
            await this.runCategory(category);
        }

        this.totalTime = performance.now() - this.startTime;
        this.updateSummary();
        this.log('success', `✅ All tests completed in ${this.totalTime.toFixed(2)}ms`);
    }

    /**
     * Run tests in a specific category
     */
    async runCategory(category) {
        const categoryTests = this.tests.get(category);
        if (!categoryTests) {
            this.log('error', `Category '${category}' not found`);
            return;
        }

        this.currentCategory = category;
        this.updateCategoryStatus(category, 'running');
        this.log('info', `📁 Running ${category} tests...`);

        const results = [];
        const categoryStartTime = performance.now();

        // Check if any tests have 'only' flag
        const hasOnly = Array.from(categoryTests.values()).some(test => test.only);

        for (const [name, test] of categoryTests) {
            // Skip if not 'only' when others are
            if (hasOnly && !test.only) {
                continue;
            }

            // Skip if marked to skip
            if (test.skip) {
                this.addResult(category, name, 'skipped', 0, 'Test skipped');
                continue;
            }

            const result = await this.runTest(category, name, test);
            results.push(result);
        }

        const categoryTime = performance.now() - categoryStartTime;
        const passed = results.filter(r => r.status === 'passed').length;
        const failed = results.filter(r => r.status === 'failed').length;

        const categoryStatus = failed === 0 ? 'passed' : 'failed';
        this.updateCategoryStatus(category, categoryStatus);

        this.log(
            failed === 0 ? 'success' : 'error',
            `${failed === 0 ? '✅' : '❌'} ${category}: ${passed} passed, ${failed} failed (${categoryTime.toFixed(2)}ms)`
        );
    }

    /**
     * Run a single test
     */
    async runTest(category, name, test) {
        const startTime = performance.now();
        let status = 'passed';
        let error = null;

        try {
            // Create test context
            const context = this.createTestContext();

            // Run test with timeout
            await this.runWithTimeout(test.fn(context), test.timeout);

            this.stats.passed++;
        } catch (err) {
            status = 'failed';
            error = err.message || err.toString();
            this.stats.failed++;
            this.log('error', `❌ ${name}: ${error}`);
        }

        const duration = performance.now() - startTime;
        this.stats.total++;
        this.stats.time += duration;

        const result = { name, status, duration, error };
        this.addResult(category, name, status, duration, error);

        if (status === 'passed') {
            this.log('success', `✅ ${name} (${duration.toFixed(2)}ms)`);
        }

        this.updateProgress();
        return result;
    }

    /**
     * Run with timeout
     */
    async runWithTimeout(promise, timeout) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
            )
        ]);
    }

    /**
     * Create test context with assertion helpers
     */
    createTestContext() {
        const assert = {
            equal: (actual, expected, message) => {
                if (actual !== expected) {
                    throw new Error(message || `Expected ${expected}, got ${actual}`);
                }
            },
            notEqual: (actual, expected, message) => {
                if (actual === expected) {
                    throw new Error(message || `Expected ${actual} to not equal ${expected}`);
                }
            },
            true: (value, message) => {
                if (value !== true) {
                    throw new Error(message || `Expected true, got ${value}`);
                }
            },
            false: (value, message) => {
                if (value !== false) {
                    throw new Error(message || `Expected false, got ${value}`);
                }
            },
            ok: (value, message) => {
                if (!value) {
                    throw new Error(message || `Expected truthy value, got ${value}`);
                }
            },
            throws: async (fn, expectedError, message) => {
                let threw = false;
                try {
                    await fn();
                } catch (err) {
                    threw = true;
                    if (expectedError && !err.message.includes(expectedError)) {
                        throw new Error(message || `Expected error containing "${expectedError}", got "${err.message}"`);
                    }
                }
                if (!threw) {
                    throw new Error(message || 'Expected function to throw');
                }
            },
            doesNotThrow: async (fn, message) => {
                try {
                    await fn();
                } catch (err) {
                    throw new Error(message || `Expected no error, but got: ${err.message}`);
                }
            },
            instanceOf: (object, constructor, message) => {
                if (!(object instanceof constructor)) {
                    throw new Error(message || `Expected instance of ${constructor.name}`);
                }
            },
            typeOf: (value, type, message) => {
                if (typeof value !== type) {
                    throw new Error(message || `Expected type ${type}, got ${typeof value}`);
                }
            },
            includes: (array, item, message) => {
                if (!array.includes(item)) {
                    throw new Error(message || `Expected array to include ${item}`);
                }
            },
            lengthOf: (array, length, message) => {
                if (array.length !== length) {
                    throw new Error(message || `Expected length ${length}, got ${array.length}`);
                }
            }
        };

        return {
            assert,
            engine: this.engine,
            canvas: document.getElementById('test-canvas'),
            log: (message) => this.log('info', message),
            wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
        };
    }

    /**
     * Add test result
     */
    addResult(category, name, status, duration, error) {
        if (!this.results.has(category)) {
            this.results.set(category, []);
        }

        const result = { name, status, duration, error };
        this.results.get(category).push(result);

        // Update UI
        this.renderResult(category, result);
    }

    /**
     * Render test result in UI
     */
    renderResult(category, result) {
        const container = document.getElementById(`${this.getCategoryId(category)}-results`);
        if (!container) return;

        const item = document.createElement('div');
        item.className = `test-item ${result.status}`;

        const nameEl = document.createElement('span');
        nameEl.className = 'test-name';
        nameEl.textContent = result.name;

        const timeEl = document.createElement('span');
        timeEl.className = 'test-time';
        timeEl.textContent = `${result.duration.toFixed(2)}ms`;

        item.appendChild(nameEl);
        item.appendChild(timeEl);

        if (result.error) {
            const errorEl = document.createElement('div');
            errorEl.style.fontSize = '12px';
            errorEl.style.color = 'var(--error)';
            errorEl.style.marginTop = '5px';
            errorEl.textContent = result.error;
            item.appendChild(errorEl);
        }

        container.appendChild(item);
    }

    /**
     * Update category status badge
     */
    updateCategoryStatus(category, status) {
        const badge = document.getElementById(`${this.getCategoryId(category)}-status`);
        if (!badge) return;

        badge.className = `status-badge ${status}`;
        badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }

    /**
     * Get category ID for DOM elements
     */
    getCategoryId(category) {
        const idMap = {
            'api': 'api',
            'performance': 'perf',
            'stress': 'stress'
        };
        return idMap[category] || category;
    }

    /**
     * Update progress bar
     */
    updateProgress() {
        const progress = document.getElementById('progress');
        if (!progress) return;

        const total = Array.from(this.tests.values())
            .reduce((sum, cat) => sum + cat.size, 0);
        const completed = this.stats.total;
        const percentage = (completed / total) * 100;

        progress.style.width = `${percentage}%`;
    }

    /**
     * Update summary statistics
     */
    updateSummary() {
        document.getElementById('total-tests').textContent = this.stats.total;
        document.getElementById('passed-tests').textContent = this.stats.passed;
        document.getElementById('failed-tests').textContent = this.stats.failed;
        document.getElementById('test-time').textContent = `${this.totalTime.toFixed(0)}ms`;
    }

    /**
     * Log message
     */
    log(level, message) {
        const output = document.getElementById('log-output');
        if (!output) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${level}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
    }

    /**
     * Clear log
     */
    clearLog() {
        const output = document.getElementById('log-output');
        if (output) {
            output.innerHTML = '';
        }
    }

    /**
     * Clear results
     */
    clearResults() {
        this.results.clear();
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            time: 0
        };

        // Clear UI
        document.querySelectorAll('.test-results').forEach(el => {
            el.innerHTML = '';
        });

        document.querySelectorAll('.status-badge').forEach(el => {
            el.className = 'status-badge pending';
            el.textContent = 'Pending';
        });

        document.getElementById('progress').style.width = '0%';
        this.updateSummary();
    }

    /**
     * Export test results
     */
    exportResults() {
        const results = {};
        this.results.forEach((categoryResults, category) => {
            results[category] = categoryResults;
        });

        return {
            results,
            stats: this.stats,
            timestamp: new Date().toISOString()
        };
    }
}

// Create global test runner instance
window.testRunner = new TestRunner();

// Export for module use
export default window.testRunner;