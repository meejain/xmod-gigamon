import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-spotlight-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-spotlight-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // Get all child divs after tab label removal
    const divs = [...tabpanel.querySelectorAll(':scope > div')];

    // Content div is the first remaining div (index 1, after tab)
    if (divs.length > 1) {
      divs[1].className = 'tabs-spotlight-content';
    }

    // Image div is the last div if it contains a picture
    const lastDiv = divs[divs.length - 1];
    if (lastDiv && lastDiv.querySelector('picture')) {
      lastDiv.className = 'tabs-spotlight-image';
    }

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-spotlight-tab';
    button.id = `tab-${id}`;

    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);

  // Pull section heading into block so background image covers it
  const wrapper = block.closest('.tabs-spotlight-wrapper');
  if (wrapper) {
    const prevSibling = wrapper.previousElementSibling;
    if (prevSibling && prevSibling.classList.contains('default-content-wrapper')) {
      const heading = prevSibling.querySelector('h2');
      if (heading) {
        heading.classList.add('tabs-spotlight-heading');
        block.prepend(heading);
        // Remove empty wrapper if no children left
        if (!prevSibling.children.length) {
          prevSibling.remove();
        }
      }
    }
  }
}
