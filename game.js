const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: 0x87CEEB, // Light blue background
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravity for falling objects
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let projectile;
let slingshotBase;
let targets;
let isAiming = false;
let aimLine;
let scoreText;
let score = 0;

function preload() {
    // No external assets required, everything is drawn with shapes
}

function create() {
    // Create ground (brown rectangle)
    const ground = this.add.rectangle(400, 580, 800, 40, 0x8B4513); // Brown ground
    this.physics.add.existing(ground, true); // Static physics body

    // Create slingshot base (purple circle)
    slingshotBase = this.add.circle(150, 500, 15, 0x4B0082); // Purple circle

    // Create projectile (red circle)
    projectile = this.add.circle(150, 500, 10, 0xFF0000); // Red circle
    this.physics.add.existing(projectile);
    projectile.body.setCollideWorldBounds(true);
    projectile.body.setBounce(0.5);

    // Create targets (green circles)
    targets = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
        const target = targets.create(600 + i * 70, 500, 'target');
        target.setCircle(20);
        target.setTint(0x00FF00); // Green color
        target.body.setImmovable(true);
        target.body.allowGravity = false; // Targets don't fall down
    }

    // Add colliders
    this.physics.add.collider(projectile, ground); // Projectile bounces off the ground
    this.physics.add.collider(targets, ground);
    this.physics.add.collider(projectile, targets, hitTarget, null, this);

    // Create aiming line (white line)
    aimLine = this.add.line(0, 0, 0, 0, 0, 0, 0xFFFFFF).setOrigin(0).setLineWidth(2);

    // Add input listeners for aiming and launching
    this.input.on('pointerdown', startAim.bind(this));
    this.input.on('pointermove', aim.bind(this));
    this.input.on('pointerup', launch.bind(this));

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000000' }); // Black text
}

function update() {
    if (isAiming) {
        const pointer = this.input.activePointer;
        aimLine.setTo(slingshotBase.x, slingshotBase.y, pointer.x, pointer.y);
    }
}

function startAim(pointer) {
    if (projectile.body.velocity.x === 0 && projectile.body.velocity.y === 0) {
        isAiming = true;
        aimLine.setTo(slingshotBase.x, slingshotBase.y, pointer.x, pointer.y);
        projectile.body.setPosition(slingshotBase.x, slingshotBase.y);
        projectile.body.setVelocity(0); // Reset velocity when aiming starts
    }
}

function aim(pointer) {
    if (isAiming) {
        aimLine.setTo(slingshotBase.x, slingshotBase.y, pointer.x, pointer.y);
    }
}

function launch(pointer) {
    if (isAiming) {
        isAiming = false;

        const angle = Phaser.Math.Angle.Between(slingshotBase.x, slingshotBase.y, pointer.x, pointer.y);
        const distance = Phaser.Math.Distance.Between(slingshotBase.x, slingshotBase.y, pointer.x, pointer.y);

        const velocityMultiplier = -2; // Adjust multiplier to control speed
        projectile.body.setVelocity(
            Math.cos(angle) * distance * velocityMultiplier,
            Math.sin(angle) * distance * velocityMultiplier
        );

        aimLine.setTo(0, 0, 0, 0); // Clear the aiming line after launch
    }
}

function hitTarget(projectileBody, targetBody) {
    targetBody.disableBody(true, true); // Remove the target when hit

    score += 10; // Increase score by hitting a target
    scoreText.setText('Score: ' + score); // Update score display

    if (targets.countActive(true) === 0) {
        scoreText.setText('You Win! Final Score: ' + score);
        resetGame();
    }
}

function resetGame() {
    setTimeout(() => {
        targets.children.iterate((target) => {
            target.enableBody(false, target.x, target.y - 50, true, true);
        });
        projectile.body.setPosition(slingshotBase.x, slingshotBase.y);
        projectile.body.setVelocity(0);
        score = 0;
        scoreText.setText('Score: ' + score);
    }, 2000); // Restart game after a delay of 2 seconds
}
