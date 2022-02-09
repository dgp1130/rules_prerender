extern crate futures;
#[macro_use]
extern crate html5ever;
extern crate markup5ever_rcdom as rcdom;
extern crate tokio;

use std::cell::RefCell;
use std::error::Error;
use std::future::Future;
use std::pin::Pin;
use std::rc::Rc;
use html5ever::{Attribute, QualName, parse_document, serialize};
use html5ever::tendril::{Tendril, TendrilSink};
use rcdom::{Node, NodeData, RcDom, SerializableHandle};
use config::{InjectorAction, InjectorConfig};
use tokio::fs;

pub fn inject(html: String, config: InjectorConfig) -> Pin<Box<dyn Future<Output = Result<String, Box<dyn Error>>>>> {
    Box::pin(async move {
        // Parse input as HTML.
        let dom = parse_document(RcDom::default(), Default::default())
            .from_utf8()
            .read_from(&mut html.as_bytes())?;

        // Find the `<head />` element.
        let head = if let Some(value) = get_head(Rc::clone(&dom.document)) {
            value
        } else {
            // TODO: Inject `<head />` if not present.
            todo!()
        };

        // Inject the requested resources.
        for action in config {
            match action {
                InjectorAction::Script { path } => {
                    inject_script(&head, &path);
                },
                InjectorAction::Style { path } => {
                    inject_style(&head, &path).await?;
                },
            };
        }
    
        // Serialize the document for output.
        let mut bytes = vec![];
        let serializable_document: SerializableHandle = Rc::clone(&dom.document).into();
        serialize(&mut bytes, &serializable_document, Default::default())?;
        let serialized = String::from_utf8(bytes)?;
        Ok(serialized)
    })
}

fn inject_script(head: &Rc<Node>, path: &str) {
    head.children.borrow_mut().push(Node::new(NodeData::Element {
        name: QualName::new(None /* prefix */, ns!(), local_name!("script")),
        attrs: RefCell::new(vec![
            Attribute {
                name: QualName::new(None /* prefix */, ns!(), local_name!("src")),
                value: Tendril::from_slice(path),
            },
            Attribute {
                name: QualName::new(None /* prefix */, ns!(), local_name!("async")),
                value: Tendril::from_slice(""),
            },
            Attribute {
                name: QualName::new(None /* prefix */, ns!(), local_name!("defer")),
                value: Tendril::from_slice(""),
            },
        ]),
        template_contents: None,
        mathml_annotation_xml_integration_point: false,
    }));
}

async fn inject_style(head: &Rc<Node>, path: &str) -> Result<(), Box<dyn Error>> {
    // Read the contents of the CSS file.
    let css = fs::read_to_string(&path).await?;

    // Create a `<style />` tag with the CSS contents inlined.
    let style = Node::new(NodeData::Element {
        name: QualName::new(None /* prefix */, ns!(), local_name!("style")),
        attrs: RefCell::new(vec![]),
        mathml_annotation_xml_integration_point: false,
        template_contents: None,
    });
    style.children.borrow_mut().push(Node::new(NodeData::Text {
        contents: RefCell::new(Tendril::from(css)),
    }));

    // Append the `<style />` tag to the `<head />` tag.
    head.children.borrow_mut().push(style);
    Ok(())
}

fn get_head(root: Rc<Node>) -> Option<Rc<Node>> {
    return match &root.data {
        NodeData::Element { name: QualName { local, .. }, .. } => {
            if local.to_string() == "head" {
                Some(root)
            } else {
                get_head_from_children(root)
            }
        },
        _ => get_head_from_children(root),
    };

    fn get_head_from_children(root: Rc<Node>) -> Option<Rc<Node>> {
        for child in root.children.borrow().iter() {
            if let Some(head) = get_head(Rc::clone(&child)) {
                return Some(head);
            }
        }

        None
    }
}
