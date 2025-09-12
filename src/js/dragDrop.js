/**
 * @fileoverview Implements the native Drag and Drop functionality.
 */
export class DragDrop {
    /**
     * @constructor
     * Finds and initializes all draggable items and drop zones.
     */
    constructor() {
        /** @private {NodeListOf<HTMLElement>} */
        this.items = document.querySelectorAll('.draggable-item');
        /** @private {NodeListOf<HTMLElement>} */
        this.dropZones = document.querySelectorAll('.drop-zone');
        /** @private {HTMLElement | null} */
        this.currentDragItem = null;
    }

    /**
     * @public
     * Initializes all drag and drop event listeners.
     */
    init() {
        this._initDraggableItems();
        this._initDropZones();
    }

    /**
     * @private
     * Sets up event listeners for all draggable items.
     */
    _initDraggableItems() {
        if (!this.items.length) {
            console.warn('No draggable items found.');
            return;
        }

        this.items.forEach(item => {
            item.addEventListener('dragstart', this._handleDragStart.bind(this));
            item.addEventListener('dragend', this._handleDragEnd.bind(this));
        });
    }

    /**
     * @private
     * Handles the 'dragstart' event for a draggable item.
     * @param {DragEvent} e - The drag start event.
     */
    _handleDragStart(e) {
        this.currentDragItem = e.currentTarget;
        // Use setTimeout to allow the browser to capture the current state before adding the class
        setTimeout(() => {
            this.currentDragItem.classList.add('dragging');
        }, 0);
        // Pass the item's ID for retrieval upon drop
        e.dataTransfer.setData('text/plain', this.currentDragItem.id);
        // Set the drag effect (optional)
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * @private
     * Handles the 'dragend' event for a draggable item.
     * @param {DragEvent} e - The drag end event.
     */
    _handleDragEnd(e) {
        if (this.currentDragItem) {
            this.currentDragItem.classList.remove('dragging');
            this.currentDragItem = null;
        }
    }

    /**
     * @private
     * Sets up event listeners for all drop zones.
     */
    _initDropZones() {
        if (!this.dropZones.length) {
            console.warn('No drop zones found.');
            return;
        }

        this.dropZones.forEach(zone => {
            zone.addEventListener('dragover', this._handleDragOver);
            zone.addEventListener('dragenter', this._handleDragEnter);
            zone.addEventListener('dragleave', this._handleDragLeave);
            zone.addEventListener('drop', this._handleDrop.bind(this));
        });
    }

    /**
     * @private
     * Handles the 'dragover' event. Essential for allowing drops.
     * @param {DragEvent} e - The drag over event.
     */
    _handleDragOver(e) {
        e.preventDefault(); // Prevents default handling (e.g., preventing a drop)
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * @private
     * Handles the 'dragenter' event to provide visual feedback.
     * @param {DragEvent} e - The drag enter event.
     */
    _handleDragEnter(e) {
        e.currentTarget.classList.add('drag-over');
    }

    /**
     * @private
     * Handles the 'dragleave' event to remove visual feedback.
     * @param {DragEvent} e - The drag leave event.
     */
    _handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    /**
     * @private
     * Handles the 'drop' event, moving the element.
     * @param {DragEvent} e - The drop event.
     */
    _handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const itemId = e.dataTransfer.getData('text/plain');
        const draggedItem = document.getElementById(itemId);

        if (draggedItem) {
            // Append the actual element to the drop zone
            e.currentTarget.appendChild(draggedItem);
        }
    }
}