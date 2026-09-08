import { expect, test } from '@playwright/test';

test.describe('WebGL Canvas Mount Stability & Zero Context Loss', () => {
  test('persists 3D Globe & Sector canvases across rapid 8-10 filter toggles with exactly 1 mount count', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const contextLossEvents: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
      if (text.includes('Context Lost') || text.includes('contextlost')) {
        contextLossEvents.push(text);
      }
    });

    // 1. Load the dashboard fresh
    await page.goto('/');

    // Wait for the main title and canvases to initialize
    await expect(page.locator('h1')).toContainText('Global Signals Intelligence');

    // Wait for 3D Globe and Sector canvas elements to attach
    const globeCanvas = page.locator('canvas[data-testid="globe-canvas"]');
    const sectorCanvas = page.locator('canvas[data-testid="sector-canvas"]');

    await expect(globeCanvas).toBeAttached({ timeout: 15_000 });
    await expect(sectorCanvas).toBeAttached({ timeout: 15_000 });

    // Verify initial mount counts equal 1
    const initialMounts = await page.evaluate(() => window.__CANVAS_MOUNTS__);
    expect(initialMounts?.globe, 'Initial Globe canvas mount count').toBe(1);
    expect(initialMounts?.sector, 'Initial Sector canvas mount count').toBe(1);

    const assertMountsStayOne = async (stepDesc: string) => {
      const counts = await page.evaluate(() => ({
        mounts: window.__CANVAS_MOUNTS__,
        globe: window.__globeCanvasMountCount,
        sector: window.__sectorCanvasMountCount,
      }));

      expect(counts.mounts?.globe, `[${stepDesc}] Globe canvas remounted`).toBe(1);
      expect(counts.mounts?.sector, `[${stepDesc}] Sector canvas remounted`).toBe(1);
      expect(counts.globe, `[${stepDesc}] __globeCanvasMountCount > 1`).toBe(1);
      expect(counts.sector, `[${stepDesc}] __sectorCanvasMountCount > 1`).toBe(1);
    };

    // Helper: Select option in a SearchableSelect dropdown
    const selectFilterOption = async (
      selectName: 'country' | 'region' | 'sector',
      optionValue: string,
    ) => {
      const trigger = page.locator(`button[data-testid="select-${selectName}"]`);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await page.waitForTimeout(100);

      if (optionValue === 'all') {
        const allOption = page.locator(`button[data-testid="option-all-${selectName}"]`);
        await allOption.click();
      } else {
        const searchInput = page.locator(`input[data-testid="search-input-${selectName}"]`);
        if (await searchInput.isVisible()) {
          await searchInput.fill(optionValue);
          await page.waitForTimeout(100);
        }
        const option = page.locator(`button[data-testid="option-${optionValue}"]`);
        await option.click();
      }
      await page.waitForTimeout(150);
    };

    // Helper: Clear all filters
    const clearAll = async () => {
      const clearBtn = page.locator('button[data-testid="clear-all-filters-btn"]');
      if (await clearBtn.isEnabled()) {
        await clearBtn.click();
        await page.waitForTimeout(150);
      }
    };

    // --- Rapid Sequence of 8-10 Filter Toggles ---

    // 1. Select Country: Belize
    await selectFilterOption('country', 'Belize');
    await assertMountsStayOne('Step 1: Country -> Belize');

    // 2. Select Region: Central America
    await selectFilterOption('region', 'Central America');
    await assertMountsStayOne('Step 2: Region -> Central America');

    // 3. Toggle Region: All Regions
    await selectFilterOption('region', 'all');
    await assertMountsStayOne('Step 3: Region -> All Regions');

    // 4. Toggle Country: United States of America
    await selectFilterOption('country', 'United States of America');
    await assertMountsStayOne('Step 4: Country -> United States of America');

    // 5. Toggle Country: All Countries
    await selectFilterOption('country', 'all');
    await assertMountsStayOne('Step 5: Country -> All Countries');

    // 6. Toggle Region: Central America
    await selectFilterOption('region', 'Central America');
    await assertMountsStayOne('Step 6: Region -> Central America');

    // 7. Clear All Filters
    await clearAll();
    await assertMountsStayOne('Step 7: Clear All Filters');

    // 8. Select Country: Belize (produces 0/sparse sector records)
    await selectFilterOption('country', 'Belize');
    await assertMountsStayOne('Step 8: Country -> Belize');

    // 9. Toggle Country: United States of America
    await selectFilterOption('country', 'United States of America');
    await assertMountsStayOne('Step 9: Country -> United States of America');

    // 10. Clear All Filters Final
    await clearAll();
    await assertMountsStayOne('Step 10: Clear All Filters Final');

    // Verify final state: mount count remains strictly 1 across whole sequence
    const finalMounts = await page.evaluate(() => window.__CANVAS_MOUNTS__);
    expect(finalMounts?.globe, 'Final Globe canvas mount count').toBe(1);
    expect(finalMounts?.sector, 'Final Sector canvas mount count').toBe(1);

    // Verify DOM data-mount-count attributes on both canvases
    const globeMountAttr = await globeCanvas.getAttribute('data-mount-count');
    const sectorMountAttr = await sectorCanvas.getAttribute('data-mount-count');
    expect(globeMountAttr).toBe('1');
    expect(sectorMountAttr).toBe('1');

    // Verify zero unexpected runtime console errors or context loss
    expect(contextLossEvents.filter((msg) => !msg.includes('handled successfully'))).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
