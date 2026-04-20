const slotsGrid = document.getElementById("slots-grid");
const messageBox = document.getElementById("message");
const addSlotForm = document.getElementById("add-slot-form");
const freeCount = document.getElementById("free-count");
const occupiedCount = document.getElementById("occupied-count");
const totalCount = document.getElementById("total-count");

function setMessage(text, type = "") {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`.trim();
}

function updateCounters(slots) {
    const freeSlots = slots.filter((slot) => slot.status === "FREE").length;
    const occupiedSlots = slots.filter((slot) => slot.status === "OCCUPIED").length;

    freeCount.textContent = freeSlots;
    occupiedCount.textContent = occupiedSlots;
    totalCount.textContent = slots.length;
}

function createSlotCard(slot) {
    const card = document.createElement("article");
    const statusClass = slot.status === "FREE" ? "free" : "occupied";
    card.className = `slot-card ${statusClass}`;

    card.innerHTML = `
        <div class="slot-header">
            <div>
                <p class="slot-id">Slot ID ${slot.id}</p>
                <h2 class="slot-number">${slot.slot_number}</h2>
            </div>
            <span class="slot-status ${statusClass}">${slot.status}</span>
        </div>
        <div class="slot-actions">
            <button class="action-button occupy-button" data-id="${slot.id}" data-status="OCCUPIED">Occupy</button>
            <button class="action-button free-button" data-id="${slot.id}" data-status="FREE">Free</button>
        </div>
    `;

    return card;
}

function renderSlots(slots) {
    updateCounters(slots);
    slotsGrid.innerHTML = "";

    if (!slots.length) {
        slotsGrid.innerHTML = "<p>No parking slots available yet.</p>";
        return;
    }

    const fragment = document.createDocumentFragment();
    slots.forEach((slot) => fragment.appendChild(createSlotCard(slot)));
    slotsGrid.appendChild(fragment);
}

async function loadSlots() {
    try {
        const response = await fetch("/slots");
        if (!response.ok) {
            throw new Error("Unable to load parking slots.");
        }

        const slots = await response.json();
        renderSlots(slots);
    } catch (error) {
        setMessage(error.message, "error");
    }
}

async function updateSlotStatus(slotId, status, button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Updating...";

    try {
        const response = await fetch(`/slots/${slotId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });

        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || "Unable to update slot status.");
        }

        setMessage(`Slot ${payload.slot_number} is now ${payload.status}.`, "success");
        await loadSlots();
    } catch (error) {
        setMessage(error.message, "error");
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

async function createSlot(event) {
    event.preventDefault();
    const formData = new FormData(addSlotForm);
    const payload = {
        slot_number: formData.get("slot_number"),
        status: formData.get("status"),
    };

    try {
        const response = await fetch("/slots", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Unable to add parking slot.");
        }

        addSlotForm.reset();
        setMessage(`Slot ${result.slot_number} added successfully.`, "success");
        await loadSlots();
    } catch (error) {
        setMessage(error.message, "error");
    }
}

slotsGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) {
        return;
    }

    updateSlotStatus(button.dataset.id, button.dataset.status, button);
});

addSlotForm.addEventListener("submit", createSlot);

loadSlots();
