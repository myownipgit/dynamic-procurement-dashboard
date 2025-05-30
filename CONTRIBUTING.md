# 🤝 Contributing to Dynamic Procurement Dashboard

We love your input! We want to make contributing to the Dynamic Procurement Dashboard as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/yourusername/dynamic-procurement-dashboard.git`
3. **Create a branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes**
5. **Test your changes**: `npm test && npm run lint`
6. **Commit**: `git commit -m 'Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Submit a Pull Request**

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Recognition](#recognition)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Our Pledge

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Focus on what's best** for the community
- **Show empathy** towards other contributors

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git
- Database (SQLite for development, PostgreSQL for production)

### Local Development Environment

```bash
# Clone the repository
git clone https://github.com/myownipgit/dynamic-procurement-dashboard.git
cd dynamic-procurement-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local settings

# Set up the database
npm run db:setup

# Start development server
npm run dev
```

### Project Structure

```
dynamic-procurement-dashboard/
├── src/
│   ├── components/          # React components
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS and styling
│   └── tests/              # Test files
├── data/                   # Database schemas and migrations
├── docs/                   # Documentation
├── server/                 # Backend API server
└── public/                 # Static assets
```

## 🤝 How to Contribute

### Types of Contributions

We welcome several types of contributions:

#### 🐛 Bug Fixes
- Fix existing bugs
- Improve error handling
- Performance optimizations

#### ✨ New Features
- New chart types (line charts, scatter plots, etc.)
- Enhanced filtering capabilities
- Export functionality
- Mobile responsiveness improvements

#### 📚 Documentation
- Improve existing documentation
- Add code examples
- Create tutorials
- Translate documentation

#### 🧪 Testing
- Write unit tests
- Add integration tests
- Improve test coverage
- Performance testing

#### 🎨 Design & UX
- UI/UX improvements
- Accessibility enhancements
- Color scheme options
- Mobile design

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Use the latest version** to see if the bug persists
3. **Test in different browsers** if it's a frontend issue

### Bug Report Template

When reporting a bug, please include:

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS, Windows, Linux]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
- Node.js version: [if applicable]

**Additional Context**
Add any other context about the problem here.
```

### Critical Bugs

For security vulnerabilities or critical bugs that affect production systems:

1. **DO NOT** open a public issue
2. **Email** us directly at security@dynamicprocurement.com
3. **Include** all relevant details
4. **Wait** for our response before public disclosure

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
A clear and concise description of what you want to happen.

**Problem Statement**
Describe the problem this feature would solve.

**Proposed Solution**
Describe the solution you'd like.

**Alternatives Considered**
Describe any alternative solutions you've considered.

**Use Cases**
Provide specific examples of how this feature would be used.

**Additional Context**
Add any other context, mockups, or examples about the feature request here.
```

### Feature Development Process

1. **Discuss first** - Open an issue to discuss the feature
2. **Get approval** - Wait for maintainer feedback
3. **Design** - Create detailed specifications
4. **Implement** - Develop the feature
5. **Test** - Ensure comprehensive testing
6. **Document** - Update relevant documentation

## 📝 Code Style Guidelines

### JavaScript/React Standards

We use ESLint and Prettier for code formatting. Our standards include:

#### General Rules
- Use **ES6+ features** when appropriate
- Prefer **const** over **let**, avoid **var**
- Use **arrow functions** for callbacks
- Use **template literals** instead of string concatenation
- Write **meaningful variable names**

```javascript
// ✅ Good
const getUserData = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// ❌ Bad
var getUserData = function(uid) {
  var response = fetch('/api/users/' + uid);
  return response.json();
}
```

#### React Component Guidelines

```javascript
// ✅ Good: Functional component with hooks
import React, { useState, useEffect } from 'react';

const ChartComponent = ({ chartId, parameters }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData(chartId, parameters)
      .then(setData)
      .finally(() => setLoading(false));
  }, [chartId, parameters]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="chart-container">
      <Chart data={data} />
    </div>
  );
};

export default ChartComponent;
```

#### File Organization
- **One component per file**
- **PascalCase** for component files
- **camelCase** for utility files
- **kebab-case** for CSS files

### CSS/Styling Guidelines

We use Tailwind CSS with custom components:

```css
/* ✅ Good: Use Tailwind utilities */
.chart-container {
  @apply bg-white rounded-lg shadow-lg p-6 border border-gray-200;
}

/* ✅ Good: Custom properties for reusable values */
:root {
  --color-primary: #3498db;
  --color-success: #2ecc71;
  --spacing-unit: 0.25rem;
}

/* ❌ Avoid: Inline styles in components */
<div style={{backgroundColor: 'white', padding: '24px'}}>
```

### Database Guidelines

#### SQL Style
- Use **lowercase** for keywords
- **Snake_case** for table and column names
- **Descriptive names** for tables and columns
- **Comments** for complex queries

```sql
-- ✅ Good
select 
  v.vendor_name,
  sum(st.total_amount) as total_spend,
  count(*) as transaction_count
from spend_transactions st
join vendors v on st.vendor_id = v.vendor_id
where st.transaction_date >= '2024-01-01'
group by v.vendor_id, v.vendor_name
order by total_spend desc;

-- ❌ Bad
SELECT * FROM spend_transactions WHERE total_amount>1000000
```

## 🧪 Testing Guidelines

### Test Requirements

All contributions should include appropriate tests:

#### Unit Tests
- **Components**: Test component rendering and interactions
- **Utils**: Test utility functions with various inputs
- **API**: Test API endpoints and error handling

```javascript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import ChartControls from '../ChartControls';

describe('ChartControls', () => {
  it('should call onParameterChange when input changes', () => {
    const mockOnChange = jest.fn();
    render(
      <ChartControls 
        config={mockConfig} 
        parameters={{}} 
        onParameterChange={mockOnChange} 
      />
    );
    
    const limitInput = screen.getByLabelText('Limit');
    fireEvent.change(limitInput, { target: { value: '20' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('limit', 20);
  });
});
```

#### Integration Tests
- **Chart rendering**: Test full chart rendering pipeline
- **API integration**: Test frontend-backend communication
- **Database queries**: Test dynamic SQL generation

#### Performance Tests
- **Query performance**: Ensure queries execute within acceptable time
- **Memory usage**: Monitor memory leaks in long-running processes
- **Load testing**: Test system under expected load

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ChartControls.test.js

# Run integration tests
npm run test:integration
```

## 🔄 Pull Request Process

### Before Submitting

1. **Rebase** your branch on the latest main
2. **Run tests** to ensure nothing is broken
3. **Run linting** to check code style
4. **Update documentation** if needed
5. **Add/update tests** for your changes

```bash
# Pre-submission checklist
git rebase main
npm run lint
npm test
npm run build
```

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Testing** in development environment
4. **Documentation review** if applicable
5. **Final approval** and merge

### Merge Requirements

- ✅ All automated checks pass
- ✅ Code review approval
- ✅ No merge conflicts
- ✅ Branch is up to date with main
- ✅ Documentation updated (if needed)

## 🎯 Development Guidelines

### Adding New Chart Types

When adding a new chart type:

1. **Update the schema** in `data/database-schema.sql`
2. **Add chart configuration** to `ChartAPIService`
3. **Implement rendering** in `DynamicChart.jsx`
4. **Add parameter controls** if needed
5. **Write tests** for the new chart type
6. **Update documentation**

Example for adding a line chart:

```javascript
// 1. Add to chart configs
'monthly_trends_line': {
  chart_id: 'monthly_trends_line',
  chart_name: 'Monthly Trends',
  chart_type: 'line',
  // ... other config
}

// 2. Add rendering logic
if (config.chart_type === 'line') {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Line type="monotone" dataKey="value" stroke="#3498DB" />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Database Migrations

For database changes:

1. **Create migration file** with timestamp
2. **Include both up and down migrations**
3. **Test on sample data**
4. **Update schema documentation**

```sql
-- migrations/20250530_add_chart_categories.sql
-- Up migration
ALTER TABLE dynamic_chart_configs 
ADD COLUMN category TEXT DEFAULT 'general';

-- Down migration  
-- ALTER TABLE dynamic_chart_configs 
-- DROP COLUMN category;
```

### API Endpoint Guidelines

When adding new API endpoints:

1. **Follow RESTful conventions**
2. **Use appropriate HTTP methods**
3. **Include proper error handling**
4. **Add input validation**
5. **Update API documentation**

```javascript
// Example endpoint
app.get('/api/v1/charts/:chartId/export', async (req, res) => {
  try {
    const { chartId } = req.params;
    const { format = 'pdf' } = req.query;
    
    // Validation
    if (!chartId) {
      return res.status(400).json({ error: 'Chart ID required' });
    }
    
    // Implementation
    const exportData = await exportChart(chartId, format);
    
    res.setHeader('Content-Type', `application/${format}`);
    res.send(exportData);
  } catch (error) {
    logger.error('Chart export failed:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});
```

## 🏆 Recognition

We believe in recognizing our contributors:

### Contribution Types

- **Code Contributors**: Listed in README and release notes
- **Documentation Contributors**: Credited in docs
- **Bug Reporters**: Mentioned in issue resolution
- **Feature Requesters**: Credited in feature announcement

### Hall of Fame

Outstanding contributors may be invited to:
- Become project maintainers
- Join the core team
- Speak at conferences about the project
- Write blog posts about their contributions

### Contributor Agreement

By contributing to this project, you agree that:
- Your contributions are your original work
- You grant us the right to use your contributions under the project license
- You have the right to grant this license

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: contact@dynamicprocurement.com for private matters
- **Documentation**: Check existing docs before asking

### Response Times

- **Bug reports**: Within 48 hours
- **Feature requests**: Within 1 week
- **Pull requests**: Within 3-5 business days
- **Security issues**: Within 24 hours

## 🎉 Thank You!

Thank you for contributing to the Dynamic Procurement Dashboard! Your efforts help make this project better for everyone.

**Every contribution matters**, whether it's a:
- 🐛 Bug fix
- ✨ New feature  
- 📚 Documentation improvement
- 🧪 Test addition
- 💡 Feature suggestion
- 🎨 Design enhancement

---

**Happy coding! 🚀**