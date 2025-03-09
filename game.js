const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let projectile;
let slingshot;
let targets;
let isAiming = false;
let aimLine;
let scoreText;
let score = 0;

function create() {
    // Create sky (background color)
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB); // Light blue sky

    // Create ground
    const ground = this.add.rectangle(400, 580, 800, 40, 0x8B4513); // Brown ground
    this.physics.add.existing(ground, true);

    // Create slingshot base (purple circle)
    slingshot = this.add.circle(100, 500, 10, 0x4B0082);

    // Create projectile (red circle)
    projectile = this.physics.add.circle(100, 500, 15, 0xFF0000);
    projectile.setCollideWorldBounds(true);

    // Create targets (green circles)
    targets = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
        const target = targets.create(600 + i * 70, 500, 'target');
        target.setCircle(20);
        target.setTint(0x00FF00); // Green color
    }

    // Add colliders
    this.physics.add.collider(projectile, ground);
    this.physics.add.collider(targets, ground);
    this.physics.add.collider(projectile, targets, hitTarget, null, this);

    // Create aiming line (white line)
    aimLine = this.add.line(0, 0, 0, 0, 0, 0, 0xFFFFFF);
    aimLine.setLineWidth(2);

    // Add input listeners for aiming and launching
    this.input.on('pointerdown', startAim.bind(this));
    this.input.on('pointermove', aim.bind(this));
    this.input.on('pointerup', launch.bind(this));

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' }); // Black text
}

function update() {
    if (isAiming) {
        const pointer = this.input.activePointer;
        aimLine.setTo(slingshot.x, slingshot.y, pointer.x, pointer.y);
    }
}

function startAim(pointer) {
    if (projectile.body.velocity.x === 0 && projectile.body.velocity.y === 0) {
        isAiming = true;
        projectile.setPosition(slingshot.x, slingshot.y);
        aimLine.setTo(slingshot.x, slingshot.y, pointer.x, pointer.y);
    }
}

function aim(pointer) {
    if (isAiming) {
        aimLine.setTo(slingshot.x, slingshot.y, pointer.x, pointer.y);
    }
}

function launch(pointer) {
    if (isAiming) {
        isAiming = false;
        const angle = Phaser.Math.Angle.Between(slingshot.x, slingshot.y, pointer.x, pointer.y);
        const velocity = Phaser.Math.Distance.Between(slingshot.x, slingshot.y, pointer.x, pointer.y);
        projectile.setVelocity(Math.cos(angle) * velocity * -2.5, Math.sin(angle) * velocity * -2.5);
        aimLine.setTo(0, 0, 0, 0); // Clear the aiming line after launch
    }
}

function hitTarget(projectile, target) {
    target.disableBody(true, true); // Remove the target when hit
    score += 10; // Increase score by hitting a target
    scoreText.setText('Score: ' + score); // Update score display
}
