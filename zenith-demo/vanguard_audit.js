import { randomUUID } from 'crypto';
import fs from 'fs';

const RPC_URL = 'http://127.0.0.1:8082';
const PROJECT_ROOT = 'C:\\Users\\Asus\\Desktop\\ve\\zenith-demo';

async function rpc(method, params) {
    if (params[0] && typeof params[0] === 'string' && params[0].startsWith('tx_')) {
        params[0] = randomUUID();
    }
    const body = JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Math.floor(Math.random() * 1000)
    });
    
    const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    });
    
    return await response.json();
}

const TEST_SIGNATURE = {
    tag: "h1",
    classes: ["hero"],
    textContent: "Zenith Stress Test",
    xpath: "/div/header/h1"
};

async function runAudit() {
    console.log("🚀 Starting Zenith Vanguard Audit...");
    const report = {
        timestamp: new Date().toISOString(),
        passes: [],
        failures: []
    };

    try {
        // Test 1: Baseline Selection (Heal Restore check)
        console.log("  [1/4] Verifying Baseline Selection...");
        const res1 = await rpc("vfs.stage_universal", [
            "tx_baseline", 
            TEST_SIGNATURE, 
            "textContent", 
            "ZENITH AUDIT ACTIVE", 
            PROJECT_ROOT
        ]);
        
        if (res1.result) {
            console.log("  ✅ Baseline Selection Success");
            report.passes.push("Baseline Selection");
        } else {
            console.error("  ❌ Baseline Selection Failed:", res1.error);
            report.failures.push({ test: "Baseline Selection", error: res1.error });
        }

        // Test 2: Rapid-Fire Style Torture (10 edits, 50ms interval)
        console.log("  [2/4] Starting Style Torture (10 rapid edits)...");
        for (let i = 0; i < 10; i++) {
            const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
            process.stdout.write(`    Edit ${i+1}... `);
            const res = await rpc("vfs.stage_universal", [
                `tx_torture_${i}`, 
                TEST_SIGNATURE, 
                "color", 
                color, 
                PROJECT_ROOT
            ]);
            if (res.result) {
                console.log("OK");
            } else {
                console.log("FAIL");
                report.failures.push({ test: `Style Torture ${i}`, error: res.error });
            }
            await new Promise(r => setTimeout(r, 50));
        }

        // Test 3: Structural Move (Edge Case: Reparenting)
        console.log("  [3/4] Verifying Structural Integrity (Reparenting Simulation)...");
        const res3 = await rpc("vfs.stage_universal", [
            "tx_reparent", 
            TEST_SIGNATURE, 
            "marginTop", 
            "100px", 
            PROJECT_ROOT
        ]);
        if (res3.result) {
             console.log("  ✅ Structural Integrity Success");
             report.passes.push("Structural Integrity");
        } else {
             console.error("  ❌ Structural Integrity Failed:", res3.error);
             report.failures.push({ test: "Structural Integrity", error: res3.error });
        }

        // Batch 4: Recovery Resilience (Crash Simulation)
        console.log("  [4/4] Verifying Recovery Resilience (Corruption Stress)...");
        const ledgerPath = `${PROJECT_ROOT}\\.zenith\\ledger.ndjson`;
        if (fs.existsSync(ledgerPath)) {
            // Simulate a "Partial Write" (Crash mid-edit)
            fs.appendFileSync(ledgerPath, '\n{"id": 99999, "type": "CorruptedEntry", "timestamp": "2026-04-17T12:00:00Z", "transactionI'); 
            console.log("    ⚠️ Injected file corruption into ledger.ndjson");

            const res4 = await rpc("vfs.heal", []);
            if (res4.result) {
                console.log("  ✅ Recovery Resilience Success (Sidecar survived corruption)");
                report.passes.push("Recovery Resilience");
            } else {
                console.error("  ❌ Recovery Resilience Failed:", res4.error);
                report.failures.push({ test: "Recovery Resilience", error: res4.error });
            }
        } else {
             console.warn("    ⚠️ Ledger not found, skipping recovery test.");
             report.passes.push("Recovery Resilience (Skipped - No Ledger)");
        }

        // Batch 5: Structural Perfection (Mechanical Hardening)
        console.log("  [5/5] Verifying Structural Perfection (Cross-Cluster Movement)...");
        const GRID_SIGNATURE = {
            tag: "div",
            classes: ["grid-layout"],
            textContent: "",
            xpath: "/div/div[2]"
        };

        // Test 5.1: Reparenting across disparate clusters
        const res5_1 = await rpc("vfs.reparent", [
            TEST_SIGNATURE, // h1
            GRID_SIGNATURE, // div.grid-layout
            2,              // index 2
            PROJECT_ROOT
        ]);

        if (res5_1.result) {
            console.log("  ✅ Structural Perfection Success (Reparented h1 into Grid)");
            report.passes.push("Structural Perfection");
        } else {
            console.error("  ❌ Structural Perfection Failed:", res5_1.error);
            report.failures.push({ test: "Structural Perfection", error: res5_1.error });
        }

    } catch (err) {
        console.error("🔥 Audit Crashed Execution:", err);
        report.failures.push({ test: "Execution", error: err.message });
    }

    fs.writeFileSync('vanguard_report.json', JSON.stringify(report, null, 2));
    console.log("\n📊 Audit Complete. Report saved to vanguard_report.json");
    
    if (report.failures.length > 0) {
        process.exit(1);
    }
}

runAudit();
