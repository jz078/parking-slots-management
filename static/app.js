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
    const parkedCarClass = slot.status === "OCCUPIED" ? "parked-car visible" : "parked-car";
    const carSvg = `
        <svg viewBox="0 0 160 80" class="car-svg" aria-hidden="true">
            <rect x="30" y="26" width="100" height="28" rx="10" class="car-body"></rect>
            <path d="M52 26 L68 14 H102 L118 26 Z" class="car-roof"></path>
            <rect x="66" y="18" width="18" height="10" rx="3" class="car-window"></rect>
            <rect x="88" y="18" width="18" height="10" rx="3" class="car-window"></rect>
            <circle cx="55" cy="58" r="10" class="car-wheel"></circle>
            <circle cx="105" cy="58" r="10" class="car-wheel"></circle>
            <circle cx="55" cy="58" r="4" class="car-wheel-inner"></circle>
            <circle cx="105" cy="58" r="4" class="car-wheel-inner"></circle>
            <rect x="36" y="34" width="8" height="6" rx="2" class="car-light-front"></rect>
            <rect x="116" y="34" width="8" height="6" rx="2" class="car-light-back"></rect>
        </svg>
    `;
    card.className = `slot-card ${statusClass}`;

    card.innerHTML = `
        <div class="bay-top">
            <span class="bay-line"></span>
            <span class="bay-line"></span>
        </div>
        <div class="${parkedCarClass}" aria-hidden="${slot.status === "OCCUPIED" ? "false" : "true"}">${carSvg}</div>
        <div class="slot-header">
            <div>
                <p class="slot-id">Bay ${slot.id}</p>
                <h2 class="slot-number">${slot.slot_number}</h2>
                <p class="slot-caption">Car Parking Slot</p>
            </div>
            <span class="slot-status ${statusClass}">${slot.status}</span>
        </div>
        <div class="slot-actions">
            <button class="action-button occupy-button" data-id="${slot.id}" data-status="OCCUPIED">Occupy</button>
            <button class="action-button free-button" data-id="${slot.id}" data-status="FREE">Free</button>
            <button class="action-button edit-button" data-id="${slot.id}" data-action="edit">Edit</button>
            <button class="action-button delete-button" data-id="${slot.id}" data-action="delete">Delete</button>
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

async function editSlot(slotId) {
    const slotNumber = prompt("Enter new slot number:");
    if (slotNumber === null) {
        return;
    }

    const status = prompt("Enter status: FREE or OCCUPIED");
    if (status === null) {
        return;
    }

    try {
        const response = await fetch(`/slots/${slotId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                slot_number: slotNumber,
                status: status,
            }),
        });

        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || "Unable to edit slot.");
        }

        setMessage(`Slot ${payload.slot_number} updated successfully.`, "success");
        await loadSlots();
    } catch (error) {
        setMessage(error.message, "error");
    }
}

async function deleteSlot(slotId) {
    const shouldDelete = confirm("Delete this slot?");
    if (!shouldDelete) {
        return;
    }

    try {
        const response = await fetch(`/slots/${slotId}`, {
            method: "DELETE",
        });

        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || "Unable to delete slot.");
        }

        setMessage("Slot deleted successfully.", "success");
        await loadSlots();
    } catch (error) {
        setMessage(error.message, "error");
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

    if (button.dataset.action === "edit") {
        editSlot(button.dataset.id);
        return;
    }

    if (button.dataset.action === "delete") {
        deleteSlot(button.dataset.id);
        return;
    }

    updateSlotStatus(button.dataset.id, button.dataset.status, button);
});

addSlotForm.addEventListener("submit", createSlot);

loadSlots();
