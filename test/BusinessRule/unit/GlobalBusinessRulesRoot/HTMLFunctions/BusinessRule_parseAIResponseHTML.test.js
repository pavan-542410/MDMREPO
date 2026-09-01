const { operation0 } = require('../../../../../step-configs/BusinessRule/BusinessRule_parseAIResponseHTML');

function createValue(simpleValue) {
  return {
    getSimpleValue: () => simpleValue
  };
}

function createStep(workflowData) {
  return {
    getLogger: () => ({
      error: jest.fn()
    }),
    getWorkflowManager: () => ({
      getCurrentWorkflowInstance: () => ({
        getVariable: () => workflowData
      })
    })
  };
}

function createNode(options) {
  const values = options.values || {};

  return {
    getID: options.getID,
    getName: options.getName,
    isInWorkflow: () => Boolean(options.isInWorkflow),
    getValue: (attrID) => createValue(values[attrID])
  };
}

describe('BusinessRule_parseAIResponseHTML', () => {
  test('returns error HTML when no JSON data exists on attributes or workflow', () => {
    const html = operation0(
      createStep(null),
      createNode({ values: {}, isInWorkflow: false })
    );

    expect(html).toContain('No JSON data found for this product');
    expect(html).toContain('<h4 style="margin: 0 0 8px 0; color: #991b1b;">Error</h4>');
  });

  test('renders sorted attribute rows from ai_response and escapes HTML content', () => {
    const node = createNode({
      getID: () => 'SKU_123',
      values: {
        ai_response: JSON.stringify([
          {
            attribute_name: 'Care & Origin',
            value: '<Machine wash>',
            confidence_score: 65,
            reasoning: 'Contains cotton & elastane'
          },
          {
            attribute_id: 'color_family',
            value: 'Blue',
            confidence: 95,
            reason: 'Detected navy tone'
          },
          {
            name: 'ignored_missing_value',
            value: null
          }
        ])
      }
    });

    const html = operation0(createStep(null), node);

    expect(html).toContain('Product Code: <strong>SKU_123</strong>');
    expect(html).toContain('<strong>Total Attributes:</strong> 2');
    expect(html).toContain('<strong>High Confidence:</strong> 1');
    expect(html).toContain('<strong>Low Confidence:</strong> 1');
    expect(html.indexOf('color_family')).toBeLessThan(html.indexOf('Care &amp; Origin'));
    expect(html).toContain('&lt;Machine wash&gt;');
    expect(html).toContain('Contains cotton &amp; elastane');
    expect(html).toContain('confidence-high">95%</span>');
    expect(html).toContain('confidence-low">65%</span>');
  });

  test('falls back to ai_suggestions and node name when ID is unavailable', () => {
    const node = createNode({
      getName: () => 'Sample Product',
      values: {
        ai_suggestions: {
          suggestions: [
            {
              attribute_name: 'silhouette',
              value: 'Slim',
              confidence_score: 82,
              explanation: 'Model explanation'
            }
          ]
        }
      }
    });

    const html = operation0(createStep(null), node);

    expect(html).toContain('Product Code: <strong>Sample Product</strong>');
    expect(html).toContain('silhouette');
    expect(html).toContain('Slim');
    expect(html).toContain('Model explanation');
    expect(html).toContain('confidence-medium">82%</span>');
  });

  test('reads workflow variable when no node attributes contain AI output', () => {
    const workflowData = {
      product_code: 'PRD_999',
      shade: {
        value: 'Green',
        confidence_score: 88
      }
    };

    const html = operation0(
      createStep(workflowData),
      createNode({
        isInWorkflow: true,
        values: {
          product_code: 'PRD_999'
        }
      })
    );

    expect(html).toContain('Product Code: <strong>PRD_999</strong>');
    expect(html).toContain('shade');
    expect(html).toContain('Green');
    expect(html).toContain('No reasoning provided');
  });

  test('returns parse error HTML when JSON is invalid', () => {
    const step = createStep(null);
    const logger = step.getLogger();

    step.getLogger = () => logger;

    const html = operation0(
      step,
      createNode({
        values: {
          ai_response: '{invalid-json'
        }
      })
    );

    expect(html).toContain('Error parsing JSON data: Failed to parse JSON:');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error in parseJSONAttributesHTML:'));
  });
});
