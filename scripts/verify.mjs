import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const checks = [
	['NeoDB 数据', 'scripts/verify-neodb.mjs', 'fast'],
	['NeoDB 同步逻辑', 'scripts/verify-neodb-sync.mjs', 'fast'],
	['内容模型', 'scripts/verify-content-model.mjs', 'fast'],
	['项目契约', 'scripts/verify-project-contracts.mjs', 'fast'],
	['仓库健康度', 'scripts/verify-repo-health.mjs', 'fast'],
	['地图存储', 'scripts/verify-map-storage.mjs', 'fast'],
	['旅行时间', 'scripts/verify-travel-time.mjs', 'fast'],
	['人生轨迹', 'scripts/verify-travel-journey.mjs', 'fast'],
	['内容样式', 'scripts/verify-content-styles.mjs', 'fast'],
	['构建产物', 'scripts/verify-build.mjs', 'runtime'],
	['Terminal', 'scripts/verify-terminal.mjs', 'runtime'],
	['站点运行时', 'scripts/verify-site-runtime.mjs', 'runtime'],
	['视觉效果', 'scripts/verify-visual-effects.mjs', 'runtime'],
	['地图运行时', 'scripts/verify-map-runtime.mjs', 'runtime'],
];

const requestedMode = process.argv.includes('--fast')
	? 'fast'
	: process.argv.includes('--runtime')
		? 'runtime'
		: 'all';
const selected = checks.filter(([, , mode]) => requestedMode === 'all' || mode === requestedMode);

function run(script) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [script], { stdio: 'inherit' });
		child.once('error', reject);
		child.once('exit', (code, signal) => {
			if (code === 0) resolve();
			else reject(new Error(`${script} ${signal ? `被 ${signal} 中止` : `退出码为 ${code}`}`));
		});
	});
}

const suiteStartedAt = performance.now();
for (const [name, script] of selected) {
	const startedAt = performance.now();
	console.log(`\n▶ ${name}`);
	try {
		await run(script);
		console.log(`✓ ${name} (${((performance.now() - startedAt) / 1000).toFixed(1)}s)`);
	} catch (error) {
		console.error(`✗ ${name}: ${error.message}`);
		process.exit(1);
	}
}

console.log(
	`\n${selected.length} 项验证通过，共 ${((performance.now() - suiteStartedAt) / 1000).toFixed(1)}s。`,
);
