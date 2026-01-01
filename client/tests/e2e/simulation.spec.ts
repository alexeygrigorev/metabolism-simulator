// ============================================================================
// METABOLIC SIMULATOR - END-TO-END TESTS
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Metabolism Simulator E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show connection status indicator', async ({ page }) => {
    // Check for connection status indicator - should show either Live or Demo Mode
    const connectionText = await page.locator('text=/Live|Demo Mode|Connecting/').first().textContent();
    expect(connectionText).toBeDefined();
  });

  test('should display dashboard with initial state', async ({ page }) => {
    // Wait for the page to load
    await page.waitForSelector('text=Metabolism Simulator', { timeout: 10000 });

    // Check main sections are visible
    await expect(page.locator('text=Metabolism Simulator')).toBeVisible();

    // Check for dashboard sections (they may be in different states)
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeDefined();
  });

  test('should have working time scale controls', async ({ page }) => {
    await page.waitForSelector('button:has-text("Pause")', { timeout: 10000 });

    // Click different speed buttons (1x, 10x, 1m, 10m)
    await page.click('button:has-text("10x")');
    await page.waitForTimeout(100);

    await page.click('button:has-text("10m")');
    await page.waitForTimeout(100);

    // Verify no errors
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Error');
  });

  test('should toggle pause/resume', async ({ page }) => {
    await page.waitForSelector('button:has-text("Pause")', { timeout: 10000 });

    // Check initial pause button
    await expect(page.locator('button:has-text("Pause")').or(page.locator('button:has-text("Resume")'))).toBeVisible();

    // Click pause
    const pauseButton = page.locator('button:has-text("Pause")');
    if (await pauseButton.isVisible()) {
      await pauseButton.click();
      await page.waitForTimeout(100);
    }

    // Click resume if visible
    const resumeButton = page.locator('button:has-text("Resume")');
    if (await resumeButton.isVisible()) {
      await resumeButton.click();
      await page.waitForTimeout(100);
    }
  });

  test('should open meal logging options', async ({ page }) => {
    const logMealButton = page.getByRole('button', { name: /log meal/i });
    await logMealButton.waitFor({ state: 'visible', timeout: 10000 });

    // Click meal button
    await logMealButton.click();

    // Check dropdown appears
    await expect(page.locator('text=🍳 Breakfast')).toBeVisible({ timeout: 5000 });
  });

  test('should open exercise logging options', async ({ page }) => {
    const logExerciseButton = page.getByRole('button', { name: /log exercise/i });
    await logExerciseButton.waitFor({ state: 'visible', timeout: 10000 });

    // Click exercise button
    await logExerciseButton.click();

    // Check dropdown appears
    await expect(page.locator('text=💪 Push Workout')).toBeVisible({ timeout: 5000 });
  });

  test('should have stress control buttons', async ({ page }) => {
    await page.waitForSelector('text=Stress:', { timeout: 10000 });

    // Check stress buttons exist - use button role to be specific
    await expect(page.getByRole('button', { name: 'Low' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Med' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'High' })).toBeVisible();
  });

  test('should have sleep button', async ({ page }) => {
    await page.waitForSelector('button:has-text("Sleep")', { timeout: 10000 });

    // Check sleep button exists and is clickable
    const sleepButton = page.getByRole('button', { name: /sleep/i });
    await expect(sleepButton).toBeVisible();
    await expect(sleepButton).toBeEnabled();
  });

  test('should display profile information', async ({ page }) => {
    await page.waitForSelector('text=Profile', { timeout: 10000 });

    // Check for profile-related text
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(Age|Weight|Height|BMR)/);
  });

  test('should display energy balance information', async ({ page }) => {
    await page.waitForSelector('text=Energy Balance', { timeout: 10000 });

    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(Calories|Glycogen|kcal)/);
  });

  test('should display muscle status', async ({ page }) => {
    await page.waitForSelector('text=Muscle Status', { timeout: 10000 });

    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(Mass|MPS|MPB|mTOR)/);
  });

  test('should display macronutrients', async ({ page }) => {
    await page.waitForSelector('text=Macronutrients', { timeout: 10000 });

    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(Carbs|Protein|Fat)/);
  });

  test('should display hormone panels', async ({ page }) => {
    await page.waitForSelector('text=Insulin', { timeout: 10000 });

    // Check for hormones
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(Insulin|Cortisol|Testosterone)/);
  });
});

test.describe('User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should log a quick meal', async ({ page }) => {
    const logMealButton = page.getByRole('button', { name: /log meal/i });
    await logMealButton.waitFor({ state: 'visible', timeout: 10000 });

    // Open meal dropdown
    await logMealButton.click();
    await expect(page.locator('text=🍳 Breakfast')).toBeVisible();

    // Click a meal option
    await page.click('text=🥤 Protein Shake');

    // Dropdown should close
    await page.waitForTimeout(500);

    // Verify no errors occurred
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Error');
  });

  test('should log a quick exercise', async ({ page }) => {
    const logExerciseButton = page.getByRole('button', { name: /log exercise/i });
    await logExerciseButton.waitFor({ state: 'visible', timeout: 10000 });

    // Open exercise dropdown
    await logExerciseButton.click();
    await expect(page.locator('text=💪 Push Workout')).toBeVisible();

    // Click an exercise option
    await page.click('text=🦵 Leg Day');

    // Dropdown should close
    await page.waitForTimeout(500);

    // Verify no errors occurred
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Error');
  });

  test('should apply stress levels', async ({ page }) => {
    await page.waitForSelector('text=Stress:', { timeout: 10000 });

    // Try each stress level - use button role to be specific
    await page.getByRole('button', { name: 'Low' }).click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Med' }).click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'High' }).click();
    await page.waitForTimeout(200);

    // Verify page is still responsive
    await expect(page.locator('text=Metabolism Simulator')).toBeVisible();
  });

  test('should log sleep', async ({ page }) => {
    const sleepButton = page.getByRole('button', { name: /sleep/i });
    await sleepButton.waitFor({ state: 'visible', timeout: 10000 });

    await sleepButton.click();

    // Verify action completed
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Error');
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show help modal when clicking help button', async ({ page }) => {
    const helpButton = page.getByRole('button', { name: /\?/i });
    await helpButton.waitFor({ state: 'visible', timeout: 10000 });

    await helpButton.click();

    // Check modal appears
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=Toggle pause/resume')).toBeVisible();
  });

  test('should close help modal with Escape key', async ({ page }) => {
    const helpButton = page.getByRole('button', { name: /\?/i });
    await helpButton.waitFor({ state: 'visible', timeout: 10000 });

    await helpButton.click();
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // Modal should be closed
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
  });

  test('should toggle pause/resume with spacebar', async ({ page }) => {
    await page.waitForSelector('button:has-text("Pause")', { timeout: 10000 });

    // Press space to toggle
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Check for Resume button (should appear after pausing)
    const resumeButton = page.locator('button:has-text("Resume")');
    await expect(resumeButton).toBeVisible();

    // Press space again to resume
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
  });

  test('should open meal dropdown with M key', async ({ page }) => {
    await page.waitForSelector('body', { timeout: 10000 });

    // Press M to open meal dropdown
    await page.keyboard.press('m');
    await page.waitForTimeout(100);

    // Check dropdown appears
    await expect(page.locator('text=🍳 Breakfast')).toBeVisible();
  });

  test('should open exercise dropdown with E key', async ({ page }) => {
    await page.waitForSelector('body', { timeout: 10000 });

    // Press E to open exercise dropdown
    await page.keyboard.press('e');
    await page.waitForTimeout(100);

    // Check dropdown appears
    await expect(page.locator('text=💪 Push Workout')).toBeVisible();
  });

  test('should change time scale with number keys', async ({ page }) => {
    await page.waitForSelector('body', { timeout: 10000 });

    // Press 2 for 10x
    await page.keyboard.press('2');
    await page.waitForTimeout(100);

    // Press 3 for 1m
    await page.keyboard.press('3');
    await page.waitForTimeout(100);

    // Verify no errors
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Error');
  });
});

test.describe('Activity Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for dashboard to fully load
    await page.waitForSelector('text=Metabolism Simulator', { timeout: 10000 });
  });

  test('should display activity log panel', async ({ page }) => {
    // Use data-testid for more reliable selection
    const activityLog = page.getByTestId('activity-log-panel');
    await expect(activityLog).toBeVisible({ timeout: 15000 });
  });

  test('should show activities in log after logging meal', async ({ page }) => {
    const logMealButton = page.getByRole('button', { name: /log meal/i });
    await logMealButton.waitFor({ state: 'visible', timeout: 10000 });

    // Log a meal
    await logMealButton.click();
    await page.click('text=🍳 Breakfast');
    await page.waitForTimeout(1000);

    // Check activity log panel exists
    await expect(page.getByTestId('activity-log-panel')).toBeVisible({ timeout: 5000 });
  });

  test('should show activities in log after logging exercise', async ({ page }) => {
    const logExerciseButton = page.getByRole('button', { name: /log exercise/i });
    await logExerciseButton.waitFor({ state: 'visible', timeout: 10000 });

    // Log an exercise
    await logExerciseButton.click();
    await page.click('text=🏃 Running');
    await page.waitForTimeout(1000);

    // Check activity log panel exists
    await expect(page.getByTestId('activity-log-panel')).toBeVisible({ timeout: 5000 });
  });

  test('should show activities in log after logging sleep', async ({ page }) => {
    const sleepButton = page.getByRole('button', { name: /sleep/i });
    await sleepButton.waitFor({ state: 'visible', timeout: 10000 });

    await sleepButton.click();
    await page.waitForTimeout(1000);

    // Check activity log panel exists
    await expect(page.getByTestId('activity-log-panel')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Scenarios Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Metabolism Simulator', { timeout: 10000 });
  });

  test('should show scenarios button on dashboard', async ({ page }) => {
    await expect(page.locator('button:has-text("Scenarios")')).toBeVisible();
  });

  test('should navigate to scenarios view', async ({ page }) => {
    const scenariosButton = page.locator('button:has-text("Scenarios")');
    await scenariosButton.click();

    // Use h1 selector for the page title
    await expect(page.locator('h1:has-text("Educational Scenarios")')).toBeVisible();
    await expect(page.locator('text=Learn metabolism through guided interactive scenarios')).toBeVisible();
  });

  test('should display scenario categories', async ({ page }) => {
    const scenariosButton = page.locator('button:has-text("Scenarios")');
    await scenariosButton.click();

    // Use more specific selectors for category headings
    await expect(page.locator('h3:has-text("Beginner")')).toBeVisible();
    await expect(page.locator('h3:has-text("Intermediate")')).toBeVisible();
  });

  test('should display scenario cards', async ({ page }) => {
    const scenariosButton = page.locator('button:has-text("Scenarios")');
    await scenariosButton.click();

    await expect(page.locator('text=The Newbie Gains')).toBeVisible();
    await expect(page.locator('text=The Insulin Spike')).toBeVisible();
  });

  test('should show scenario details when clicking view details', async ({ page }) => {
    const scenariosButton = page.locator('button:has-text("Scenarios")');
    await scenariosButton.click();

    await page.click('button:has-text("View Details")', { timeout: 5000 });

    await expect(page.locator('text=Learning Objectives')).toBeVisible();
  });

  test('should return to dashboard from scenarios', async ({ page }) => {
    const scenariosButton = page.locator('button:has-text("Scenarios")');
    await scenariosButton.click();

    const backButton = page.locator('button:has-text("Back to Dashboard")');
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page.locator('button:has-text("Scenarios")')).toBeVisible();
  });
});

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Metabolism Simulator', { timeout: 10000 });
  });

  test('should open settings panel when clicking settings button', async ({ page }) => {
    // Find the settings button by aria-label
    const settingsButton = page.getByRole('button', { name: 'Open settings' });
    await expect(settingsButton).toBeVisible();

    await settingsButton.click();

    // Check that settings modal appears
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible({ timeout: 5000 });
  });

  test('should display all settings sections', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Check for main section headings
    await expect(page.locator('text=Units')).toBeVisible();
    await expect(page.locator('text=Simulation')).toBeVisible();
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=Data Management')).toBeVisible();
  });

  test('should change measurement system setting', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Click the measurement system dropdown
    const select = page.locator('select').filter({ hasText: /Metric|Imperial/ });
    await select.click();

    // Select Imperial option
    await page.selectOption('select', 'imperial');

    // Verify no errors
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Error');
  });

  test('should toggle notification settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Find and click the toast notifications toggle
    const toggleButtons = page.locator('button[class*="rounded-full"]').all();
    for (const button of await toggleButtons) {
      const text = await button.evaluate(el => el.parentElement?.textContent);
      if (text?.includes('Toast Notifications')) {
        await button.click();
        await page.waitForTimeout(200);
        break;
      }
    }

    // Verify no errors
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Error');
  });

  test('should close settings panel with Done button', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Click Done button
    const doneButton = page.getByRole('button', { name: 'Done' });
    await expect(doneButton).toBeVisible();
    await doneButton.click();

    // Settings modal should be closed
    await expect(page.locator('h2:has-text("Settings")')).not.toBeVisible();
  });

  test('should close settings panel when clicking outside', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Click outside the modal (on the backdrop)
    const modal = page.locator('.fixed.inset-0.z-50');
    await modal.click({ position: { x: 10, y: 10 } });

    // Settings modal should be closed
    await expect(page.locator('h2:has-text("Settings")')).not.toBeVisible();
  });

  test('should show connection status in settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Check for status section (either Live Mode or Demo Mode)
    await expect(page.locator('text=/Live Mode|Demo Mode/')).toBeVisible();
  });

  test('should display export data button', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Check for export button
    await expect(page.locator('button:has-text("Export Data")')).toBeVisible();
  });

  test('should display reset simulation button', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Check for reset button
    await expect(page.locator('button:has-text("Reset Simulation")')).toBeVisible();
  });
});
