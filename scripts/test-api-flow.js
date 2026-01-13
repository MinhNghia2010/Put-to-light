
const BASE_URL = 'http://localhost:3000/api';

async function testFlow() {
    console.log('🚀 Starting API Flow Test...');

    // 1. Scan Basket
    console.log('\n--- 1. Scanning Basket BASKET-001 ---');
    const scanRes = await fetch(`${BASE_URL}/basket/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basketId: 'BASKET-001', stationId: 'STATION-01' })
    });
    const scanData = await scanRes.json();
    console.log('Scan Status:', scanRes.status);
    console.log('Scan Success:', scanData.success);

    if (!scanData.success) {
        console.error('Failed to scan basket:', scanData);
        return;
    }

    const updates = scanData.distributions.map(d => ({
        slotId: d.slotId,
        orderId: d.orderId,
        lightColor: d.lightColor,
        currentItem: d.items.length > 0 ? {
            sku: d.items[0].sku,
            name: d.items[0].name,
            requiredQuantity: d.items.reduce((s, i) => s + i.quantity, 0),
            confirmedQuantity: 0
        } : undefined
    }));

    // 2. Turn on lights (Client calls this after scan)
    console.log('\n--- 2. Updating Slot Lights ---');
    const lightRes = await fetch(`${BASE_URL}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
    });
    const lightData = await lightRes.json();
    console.log('Light Update Success:', lightData.success);

    // 3. Verify Lights via GET /api/slots
    console.log('\n--- 3. Verifying Lights (GET /api/slots) ---');
    const slotsRes1 = await fetch(`${BASE_URL}/slots`);
    const slotsData1 = await slotsRes1.json();
    const slotA01_1 = slotsData1.slots.find(s => s.slotId === 'A-01');
    console.log('Slot A-01 Light Status:', slotA01_1?.lightStatus);
    console.log('Slot A-01 Filled:', slotA01_1?.filled);

    // 4. Put Item into A-01
    console.log('\n--- 4. Putting Item into A-01 (PUT /api/slots/A-01) ---');
    const putRes = await fetch(`${BASE_URL}/slots/A-01`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sku: 'PRO-AUDIO-X7',
            quantity: 2,
            action: 'add'
        })
    });
    const putData = await putRes.json();
    console.log('Put Success:', putData.success);
    console.log('Put Response Slot Filled:', putData.slot?.filled);

    // 5. Verify State Persistence via GET /api/slots
    console.log('\n--- 5. Verifying Persistence (GET /api/slots) ---');
    const slotsRes2 = await fetch(`${BASE_URL}/slots`);
    const slotsData2 = await slotsRes2.json();
    const slotA01_2 = slotsData2.slots.find(s => s.slotId === 'A-01');

    console.log('Slot A-01 Filled (from GET):', slotA01_2?.filled);

    if (slotA01_2?.filled !== 2) {
        console.error('❌ BUG DETECTED: Slot state mismatch!');
        console.error('Expected filled: 2');
        console.error('Actual filled:', slotA01_2?.filled);
        console.error('Reason: In-memory state is not shared between /api/slots and /api/slots/[slotId]');
    } else {
        console.log('✅ SUCCESS: State is shared correctly.');
    }
}

testFlow();
