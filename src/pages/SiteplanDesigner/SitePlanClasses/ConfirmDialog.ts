import p5 from "p5";

export class ConfirmDialog {
    p: p5;
    x: number;
    y: number;
    width: number;
    height: number;
    isVisible: boolean;
    confirmCallback: () => void;
    cancelCallback: () => void;

    constructor(p: p5, x: number, y: number, width: number, height: number, confirmCallback: () => void, cancelCallback: () => void) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isVisible = false;
        this.confirmCallback = confirmCallback;
        this.cancelCallback = cancelCallback;
    }

    show() {
        this.isVisible = true;
    }

    hide() {
        this.isVisible = false;
    }

    draw(p: p5) {
        if (!this.isVisible) return;
        p.push();
        p.translate(-this.width / 2, -this.height / 2)
        // p.rectMode(p.CENTER);
        // p.textAlign(p.CENTER)
        // Draw background
        p.fill(255);
        p.noStroke();
        p.strokeWeight(4);
        p.rect(this.x, this.y, this.width, this.height, 10);
        p.cursor('default');
        // Draw text
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);


        p.textSize(16);
        p.text("Are you sure you want to delete this?", this.x + this.width / 2, this.y + this.height / 3);

        // Draw buttons
        let btnWidth = 80;
        let btnHeight = 30;
        let btnY = this.y + this.height - 50;
        let btnSpacing = 20;

        // Confirm button
        p.fill("#c82333");
        p.noStroke();
        p.rect(this.x + this.width / 2 - btnSpacing - btnWidth, btnY, btnWidth, btnHeight, 5);
        p.fill(255);
        p.textSize(16);
        p.text("Confirm", this.x + this.width / 2 - btnSpacing - btnWidth + btnWidth / 2, btnY + btnHeight / 2);

        // Cancel button
        p.fill("#3b82f6");
        p.rect(this.x + this.width / 2 + btnSpacing, btnY, btnWidth, btnHeight, 5);
        p.fill(255);
        p.text("Cancel", this.x + this.width / 2 + btnSpacing + btnWidth / 2, btnY + btnHeight / 2);
        p.pop();
    }

    mousePressed(p: p5) {
        if (!this.isVisible) return true; // Prevent background clicks
        let btnWidth = 80;
        let btnHeight = 30;
        let btnY = this.y + this.height - 50;
        let btnSpacing = 20;

        // Check if confirm button is clicked
        if (
            p.mouseX > this.x + this.width / 2 - btnSpacing - btnWidth - this.width / 2 &&
            p.mouseX < this.x + this.width / 2 - btnSpacing - this.width / 2 &&
            p.mouseY > btnY - this.height / 2 &&
            p.mouseY < btnY + btnHeight - this.height / 2
        ) {
            this.confirmCallback();
            this.hide();
            return false;
        }

        // Check if cancel button is clicked
        if (
            p.mouseX > this.x + this.width / 2 + btnSpacing - this.width / 2 &&
            p.mouseX < this.x + this.width / 2 + btnSpacing + btnWidth - this.width / 2 &&
            p.mouseY > btnY - this.height / 2 &&
            p.mouseY < btnY + btnHeight - this.height / 2
        ) {
            this.cancelCallback();
            this.hide();
            return false;
        }
        return false; // Consume click event
    }
}